'use strict'

const Database = use('Database')
const { validateAll } = use('Validator')
const Artist = use('App/Models/Artist')
const Album = use('App/Models/Album')
const { responseError } = use('./Helpers/MessageError')

const select = ['artists.id', 'artists.name']
const rules = { name: 'required|max:120|min:3' }

const messages = {
  required: 'Campo obrigatório',
  min: 'Mínimo de caracteres não atingido',
  max: 'Máximo de caracteres excedido',
  'id.exists': 'Este artista não existe',
  'direction.in': 'O valor deve ser "asc" ou "desc"',
  'columnName.in': 'O valor deve ser "id" ou "name"',
  'page.above': 'O valor mínimo é 0',
  'perPage.above': 'O valor mínimo é 3',
}

class ArtistController {
  async index ({ request, response }) {
    try {
      const data = request.only(['direction', 'columnName', 'page', 'perPage', 'query'])
      const { direction, columnName, page, perPage, query } = data
      const rulesIndex = {
        direction: 'required|in:asc,desc',
        columnName: 'required|in:id,name',
        page: 'required|integer|above:-1',
        perPage: 'required|integer|above:2',
      }
      const validation = await validateAll(data, rulesIndex, messages)
      if (validation.fails()) return response.status(400).send(validation.messages())

      const artists = await Database.table('artists')
        .where(function() {
          if (query) {
            this.where('artists.name', 'ilike', `%${query}%`)
          }
        })
        .select(select)
        .orderBy(`artists.${columnName}`, direction)
        .paginate(Number(page) + 1, perPage)

      return response.status(200).send(artists)
    } catch (error) {
      console.log(error)
      return response.status(500).send(responseError())
    }
  }

  async store ({ request, response }) {
    try {
      const data = request.only(['name'])
      const validation = await validateAll(data, rules, messages)

      if (validation.fails()) return response.status(400).send(validation.messages())

      const artist = await Artist.create(data)

      return response.status(201).send({ artist, message: 'Artista criado com sucesso' })
    } catch {
      return response.status(500).send(responseError())
    }
  }

  async show ({ params, response }) {
    try {
      const rulesShow = { id: "required|exists:artists,id" }
      const { id } = params

      const validation = await validateAll({ id }, rulesShow, messages)

      if (validation.fails()) return response.status(404).send(validation.messages())

      const artist = await Artist.find(params.id)
      await artist.loadMany(['albums', 'albums.images'])

      return artist
    } catch {
      return response.status(500).send(responseError())
    }
  }

  async update ({ params, request, response }) {
    try {
      const rulesUpdate = { ...rules, id: "required|exists:artists,id" }
      const data = request.only(['name'])
      const { id } = params
      const validation = await validateAll({ ...data, id }, rulesUpdate, messages)

      if (validation.fails()) return response.status(400).send(validation.messages())

      const artist = await Artist.find(id)
      artist.merge(data)
      await artist.save()

      return response.status(200).send({ artist, message: 'Artista atualizado com sucesso' })
    } catch {
      return response.status(500).send(responseError())
    }
  }

  async destroy ({ params, response }) {
    try {
      const rulesDestroy = { id: "required|exists:artists,id" }
      const { id } = params

      const validation = await validateAll({ id }, rulesDestroy, messages)

      if (validation.fails()) return response.status(404).send(validation.messages())

      await Album.query().where('artist_id', id).delete()

      const artist = await Artist.find(params.id)
      await artist.delete()

      return response.status(200).send({ message: 'Artista apagado com sucesso' })
    } catch {
      return response.status(500).send(responseError())
    }
  }
}

module.exports = ArtistController
