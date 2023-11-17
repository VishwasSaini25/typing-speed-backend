//auth.js
const jwt = require('jsonwebtoken')

const generateToken = (user) => {
    return jwt.sign({ username: user.username, password: user.password }, 'genSecKey', {
        expiresIn: '1d'
    })
}
module.exports = generateToken;