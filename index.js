const express = require('express');
const cors = require("cors");
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://visherrsaini11:Vishwas2512@typingspeedtest.pb1hfey.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("connected",() =>{
  console.log("mongoose is connected");
})
// Set up middleware

app.use(express.json());
app.use(cors());
app.use(session({
  secret: 'nothingSpecial', 
  resave: false, 
  saveUninitialized: true,
  //  cookie: {
    //   secure: false,
    //   maxAge: 1000*60*60*24
    //  } 
  }));
  app.use(cookieParser());
  
  app.use((req, res, next) => {
    console.log('req.session.userId:', req.session.userId);
    console.log('req.cookies.loggedIn:', req.cookies.loggedIn);
    res.locals.loggedIn = req.session?.userId || req.cookies?.loggedIn === 'true';
    next();
  });
// Define your user model and schema
const User = mongoose.model('User', {
  username: String,
  password: String,
});

// Check LoggedIn endpoint
app.get('/api/check-login-status', (req, res) => {
  res.json({ loggedIn: !!res.locals.loggedIn });
});


// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.findOne({ username });
    if(user){
        return res.status(401).json({ error: 'User Already Existed' });
    } else {
        await User.create({ username, password: hashedPassword });
        res.status(201).json({ user });
    }
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.userId = user._id;
      res.cookie('loggedIn', 'true', { maxAge: 24 * 60 * 60 * 1000 });
      return res.status(200).json({ user });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});


// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logout successful' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
