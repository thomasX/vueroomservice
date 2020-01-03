const db = require('../models/index')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const UserGBO = require('../BO/UserGBO')

function generateAccessToken (user) {
  const accessToken = jwt.sign({ email: user.email }, config.authentication.jwtSecret, { expiresIn: config.authentication.jwtLifeTime })
  return accessToken
}

function generateRefreshToken (user) {
  const refreshToken = jwt.sign({ email: user.email }, config.authentication.jwtRefreshSecret, { expiresIn: config.authentication.jwtRefreshLifeTime })
  return refreshToken
}

module.exports = {
  async register (req, res) {
    try {
      const dto = req.body
      const gbo = new UserGBO(db)
      await gbo.createUser(dto)
      res.send({
        email: dto.email
      })
    } catch (err) {
      res.status(400).send({
        error: 'This email account is already in use.'
      })
    }
  },
  async login (req, res) {
    const { email, password } = req.body
    const userGBO = new UserGBO(db)
    const userPair = await userGBO.login(email, password)
    const bokey = userPair.key
    const dto = userPair.value
    delete dto.password
    dto.id = bokey.id
    dto.accessToken = generateAccessToken(dto)
    dto.refreshToken = generateRefreshToken(dto)
    const result = { user: dto }
    res.send(result)
  },
  async activeAdminUserExists (req, res) {
    try {
      const gbo = new UserGBO(db)
      const result = await gbo.activeAdminUserExists()
      if (result === true) {
        res.send(true)
      } else {
        res.send(false)
      }
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to log in'
      })
    }
  }
}
