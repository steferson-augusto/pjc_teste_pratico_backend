'use strict'

const Model = use('Model')

class Artist extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeDelete', async (artistInstance) => {
      try {
        const albums = await artistInstance.albums().fetch()
        for (const album of albums.rows) {
          await album.delete()
        }
      } catch (error) {
        console.log(error)
      }
    })
  }

  static get hidden () {
    return ['created_at', 'updated_at']
  }

  albums () {
    return this.hasMany('App/Models/Album')
  }
}

module.exports = Artist
