'use strict'

const Model = use('Model')

class Album extends Model {
  static get hidden () {
    return ['created_at', 'updated_at']
  }

  artist () {
    return this.belongsTo('App/Models/Artist')
  }

  images () {
    return this.hasMany('App/Models/Image')
  }
}

module.exports = Album
