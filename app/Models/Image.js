'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Drive = use('Drive')

class Image extends Model {
  static boot () {
    super.boot()

    this.addHook('afterFetch', async (imageInstances) => {
      for (const image of imageInstances) {
        image.url = await Drive.disk('minio').getSignedUrl(image.name)
      }
    })
  }

  static get hidden () {
    return ['created_at', 'updated_at']
  }

  album () {
    return this.belongsTo('App/Models/Album')
  }
}

module.exports = Image
