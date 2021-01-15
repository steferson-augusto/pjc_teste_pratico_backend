'use strict'

const User = use('App/Models/User')

class UserSeeder {
  async run () {
    const cont = await User.getCount()
    if (cont == 0) {
      await User.create({
        name: 'Super User',
        email: 'superuser@email.com',
        password: 'aIJUyry6D7wZleDm'
      })
    }
  }
}

module.exports = UserSeeder
