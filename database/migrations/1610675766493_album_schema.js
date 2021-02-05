'use strict'
const Album = use('App/Models/Album')

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlbumSchema extends Schema {
  async up () {
    try {
      const count = await Album.getCount()
      console.log(`Quantidade de álbuns: ${count}`)
    } catch {
      this.create('albums', (table) => {
        table.increments()
        table.string('name', 120).notNullable()
        table.integer('artist_id').unsigned().references('id').inTable('artists')
        table.integer('year').nullable()
        table.timestamps()
      })
    }
  }

  async down () {
    try {
      this.drop('albums')
    } catch {
      console.log('Erro ao executar migration (down) de albums')
    }
  }
}

module.exports = AlbumSchema
