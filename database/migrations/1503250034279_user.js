'use strict'
const User = use('App/Models/User')

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  async up () {
    try {
      const count = await User.getCount()
      console.log(`Quantidade de users: ${count}`)
    } catch {
      this.create('users', (table) => {
        table.increments()
        table.string('name', 80).notNullable()
        table.string('email', 254).notNullable().unique()
        table.string('password', 60).notNullable()
        table.timestamps()
      })
    }
  }

  async down () {
    try {
      this.drop('users')
    } catch {
      console.log('Erro ao executar migration (down) de usuários')
    }
  }
}

module.exports = UserSchema
