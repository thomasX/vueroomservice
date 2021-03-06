const db = require('../models/index')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const UserGBO = require('../BO/UserGBO')
const UserBO = require('../BO/UserBO')

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
      await db.sequelize.transaction(async function (t) {
        const dto = req.body
        const gbo = new UserGBO(db)
        const activeExists = gbo.activeAdminUserExists()
        if ((activeExists) && (activeExists.id !== 0)) throw new Error('aktiveAdminAccountIsAlreadyCreated')
        await gbo.createUser(dto)
        res.send({
          email: dto.email
        })
      })
    } catch (err) {
      res.status(400).send('ActiveAdminAccountAlreadyExists')
    }
  },
  async login (req, res) {
    try {
      await db.sequelize.transaction(async function (t) {
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
      })
    } catch (err) {
      res.status(403).send('error logon failed')
    }
  },
  async refreshToken (req, res) {
    try {
      await db.sequelize.transaction(async function (t) {
        const bbb = req.body
        const refreshToken = bbb.refreshToken
        const payload = await jwt.verify(refreshToken, config.authentication.jwtRefreshSecret)
        const userGBO = new UserGBO(db)
        const bokey = await userGBO.findByEmail(payload.email)
        const userBO = new UserBO(db, bokey)
        const dto = await userBO.getDTO()
        delete dto.password
        dto.id = bokey.id
        dto.accessToken = generateAccessToken(dto)
        dto.refreshToken = generateRefreshToken(dto)
        const result = { user: dto }
        res.send(result)
      })
    } catch (err) {
      res.status(401).send('An error has occured trying to refresh token')
    }
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
      res.status(500).send('An error has occured trying to log in')
    }
  }
}
