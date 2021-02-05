'use strict'
const Token = use('App/Models/Token')

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TokensSchema extends Schema {
  async up () {
    try {
      const count = await Token.getCount()
      console.log(`Quantidade de tokens: ${count}`)
    } catch {
      this.create('tokens', (table) => {
        table.increments()
        table.integer('user_id').unsigned().references('id').inTable('users')
        table.string('token', 255).notNullable().unique().index()
        table.string('type', 80).notNullable()
        table.boolean('is_revoked').defaultTo(false)
        table.timestamps()
      })
    }
  }

  async down () {
    try {
      this.drop('tokens')
    } catch {
      console.log('Erro ao executar migration (down) de tokens')
    }
  }
}

module.exports = TokensSchema
