'use strict'

const Model = use('Model')
const Drive = use('Drive')

class Album extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeDelete', async (albumInstance) => {
      try {
        const images = await albumInstance.images().fetch()
        for (const image of images.rows) {
          await image.delete()
          await Drive.disk('minio').delete(image.name)
        }
      } catch (error) {
        console.log(error)
      }
    })
  }

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
