'use strict'

const User = use('App/Models/User')
const { responseError } = use('./Helpers/MessageError')

class UserController {
  async login ({ request, auth, response }) {
    try {
      const { email, password, refreshToken } = request.all()

      const token = refreshToken
        ? await auth.generateForRefreshToken(refreshToken, true)
        : await auth.withRefreshToken().attempt(email, password)
      return token
    } catch {
      return response.status(500).send(responseError())
    }
  }

  async store({ request, response }) {
    try {
      const data = request.only(['email', 'password', 'username'])
      const user = await User.create(data)
      return response.status(201).send(user)
    } catch {
      return response.status(500).send(responseError())
    }
  }
}

module.exports = UserController
