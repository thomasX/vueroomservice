const { User } = require('../models')

module.exports = {
  async getUser (req, res) {
    try {
      const id = req.params.id
      const user = await User.findOne({
        where: {
          id: id
        }
      })
      if ((user) && (user !== null)) {
        const userJSON = user.toJSON()
        res.send(userJSON)
      } else {
        throw new TypeError('undefined User')
      }
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to log in'
      })
    }
  },
  async createUser (req, res) {
    try {
      const user = await User.create(req.body)
      const userJson = user.toJSON()
      res.send({
        user: userJson,
        created: true
      })
    } catch (err) {
      res.status(400).send({
        error: 'This email account is already in use.'
      })
    }
  },
  async updateUser (req, res) {
    try {
      const user = await User.update(req.body)
      const userJson = user.toJSON()
      res.send({
        user: userJson,
        created: true
      })
    } catch (err) {
      res.status(400).send({
        error: 'This email account is already in use.'
      })
    }
  }
}
