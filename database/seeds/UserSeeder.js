'use strict'

const User = use('App/Models/User')

class UserSeeder {
  async run () {
    await User.create({
      username: 'Superuser',
      email: 'superuser@email.com',
      password: 'aIJUyry6D7wZleDm'
    })
  }
}

module.exports = UserSeeder
