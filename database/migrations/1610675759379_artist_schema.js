'use strict'
const Artist = use('App/Models/Artist')

const Schema = use('Schema')

class ArtistSchema extends Schema {
  async up () {
    try {
      const count = await Artist.getCount()
      console.log(`Quantidade de artistas: ${count}`)
    } catch {
      this.create('artists', (table) => {
        table.increments()
        table.string('name', 120).notNullable()
        table.timestamps()
      })
    }
  }

  async down () {
    try {
      this.drop('artists')
    } catch {
      console.log('Erro ao executar migration (down) de artists')
    }
  }
}

module.exports = ArtistSchema
