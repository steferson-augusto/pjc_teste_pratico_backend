'use strict'

const Artist = use('App/Models/Artist')
const Album = use('App/Models/Album')

const data = [
  {
    name: 'Serj Tankian',
    albums: [
      {
        name: 'Harakiri',
        year: 2012
      },
      {
        name: 'Black Blooms',
        year: 2019
      },
      {
        name: 'The Rough Dog',
        year: 2018
      },
    ]
  },
  {
    name: 'Mike Shinoda',
    albums: [
      {
        name: 'The Rising Tied',
        year: 2005
      },
      {
        name: 'Post Traumatic',
        year: 2018
      },
      {
        name: 'Post Traumatic EP',
        year: 2018
      },
      {
        name: "Where'd You Go",
        year: 2006
      },
    ]
  },
  {
    name: 'Michel Teló',
    albums: [
      {
        name: 'Bem Sertanejo',
        year: 2014
      },
      {
        name: 'Bem Sertanejo - O Show (Ao Vivo)',
        year: 2017
      },
      {
        name: 'Bem Sertanejo - (1a Temporada) - EP',
        year: 2014
      },
    ]
  },
  {
    name: "Guns N' Roses",
    albums: [
      {
        name: 'Use Your Illusion I',
        year: 1991
      },
      {
        name: 'Use Your Illusion II',
        year: 2012
      },
      {
        name: 'Greatest Hits',
        year: 2004
      },
    ]
  }
]

class ArtistSeeder {
  async run () {

      const artistsPromises = await data.map(async ({ name, albums }) => {
        try {
          const artist = await Artist.create({ name })
          const albumsPromises = albums.map(async album => {
            try {
              await Album.create({ ...album, artist_id: artist.id })
            } catch (error) {
              console.log(error)
            }
          })
          await Promise.all(albumsPromises)
        } catch (error) {
          console.log(error)
        }
      })

      await Promise.all(artistsPromises)


  }
}

module.exports = ArtistSeeder
