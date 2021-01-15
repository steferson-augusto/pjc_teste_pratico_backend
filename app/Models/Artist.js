'use strict'

const Model = use('Model')

class Artist extends Model {
  static get hidden () {
    return ['created_at', 'updated_at']
  }

  albums () {
    return this.hasMany('App/Models/Album')
  }
}

module.exports = Artist
