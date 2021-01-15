'use strict'

const Schema = use('Schema')

class ArtistSchema extends Schema {
  up () {
    this.create('artists', (table) => {
      table.increments()
      table.string('name', 120).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('artists')
  }
}

module.exports = ArtistSchema
