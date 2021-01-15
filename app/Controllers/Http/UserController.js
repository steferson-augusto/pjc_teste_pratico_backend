'use strict'

const User = use('App/Models/User')

class UserController {
  async login ({ request, auth }) {
    const { email, password, refreshToken } = request.all()

    const token = refreshToken
      ? await auth.generateForRefreshToken(refreshToken, true)
      : await auth.withRefreshToken().attempt(email, password)
    return token
  }

  async store({ request, response }) {
    const data = request.only(['email', 'password', 'username'])
    const user = await User.create(data)
    return response.status(201).send(user)
  }
}

module.exports = UserController
