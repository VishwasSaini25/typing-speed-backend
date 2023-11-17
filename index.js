require("dotenv").config();
const express = require('express');
const cors = require("cors");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const generateToken = require('./auth');
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("connected",() =>{
  console.log("mongoose is connected");
})
// Set up middleware

app.use(express.json());
app.use(cors());


// Define your user model and schema
const User = mongoose.model('User', {
  username: String,
  password: String,
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
      const token = generateToken(user);
      return res.status(200).json({ user,token });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});


// Logout endpoint
app.post('/api/logout', (req, res) => {
  try{
    return res.status(200).json({ message: 'Logout successful' });
  } catch(error){
    res.status(500).json({ error: 'Logout failed' });
  }
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

