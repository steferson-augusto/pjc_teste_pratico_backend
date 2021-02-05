'use strict'
const Image = use('App/Models/Image')

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ImageSchema extends Schema {
  async up () {
    try {
      const count = await Image.getCount()
      console.log(`Quantidade de imagens: ${count}`)
    } catch {
      this.create('images', (table) => {
        table.increments()
        table.string('name', 120).notNullable().unique()
        table.integer('album_id').unsigned().references('id').inTable('albums')
        table.timestamps()
      })
    }
  }

  async down () {
    try {
      this.drop('images')
    } catch {
      console.log('Erro ao executar migration (down) de images')
    }
  }
}

module.exports = ImageSchema
