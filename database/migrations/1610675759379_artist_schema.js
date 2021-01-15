'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ArtistSchema extends Schema {
  up () {
    this.create('artists', (table) => {
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('artists')
  }
}

module.exports = ArtistSchema
