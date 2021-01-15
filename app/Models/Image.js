'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Image extends Model {
  static get hidden () {
    return ['created_at', 'updated_at']
  }

  album () {
    return this.belongsTo('App/Models/Album')
  }
}

module.exports = Image
