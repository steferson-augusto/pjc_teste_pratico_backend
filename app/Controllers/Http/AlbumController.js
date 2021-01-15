'use strict'

const Database = use('Database')
const { validateAll } = use('Validator')
const Album = use('App/Models/Album')
const { responseError } = use('./Helpers/MessageError')

const select = ['albums.id', 'albums.name', 'artists.name as artist', 'albums.year']
const rules = {
  name: 'required|max:120|min:3',
  artist_id: 'required|exists:artists,id',
  year: 'integer|range:1800,2021'
}

const messages = {
  required: 'Campo obrigatório',
  min: 'Mínimo de caracteres não atingido',
  max: 'Máximo de caracteres excedido',
  integer: 'O valor deve ser um inteiro válido',
  range: 'O ano deve estar contido em 1800-2021',
  'artist_id.exists': 'Este artista não existe',
  'id.exists': 'Este álbum não existe',
  'direction.in': 'O valor deve ser "asc" ou "desc"',
  'columnName.in': 'O valor deve ser "id", "name" ou "year"',
  'page.above': 'O valor mínimo é 0',
  'perPage.above': 'O valor mínimo é 3',
}

class AlbumController {
  async index ({ request, response }) {
    try {
      const data = request.only(['direction', 'columnName', 'page', 'perPage', 'query'])
      const { direction, columnName, page, perPage, query } = data
      const rulesIndex = {
        direction: 'required|in:asc,desc',
        columnName: 'required|in:id,name,year',
        page: 'required|integer|above:-1',
        perPage: 'required|integer|above:2',
      }
      const validation = await validateAll(data, rulesIndex, messages)
      if (validation.fails()) return response.status(400).send(validation.messages())

      const albums = await Database.table('albums')
        .where(function() {
          if (query) {
            this.where('albums.name', 'ilike', `%${query}%`)
            this.orWhere('artists.name', 'ilike', `%${query}%`)
          }
        })
        .leftJoin('artists', 'albums.artist_id', 'artists.id')
        .select(select)
        .orderBy(`albums.${columnName}`, direction)
        .paginate(Number(page) + 1, perPage)

      return response.status(200).send(albums)
    } catch {
      return response.status(500).send(responseError())
    }
  }

  async store ({ request, response }) {
    try {
      const data = request.only(['name', 'year', 'artist_id'])

      const validation = await validateAll(data, rules, messages)
      if (validation.fails()) return response.status(400).send(validation.messages())

      const album = await Album.create(data)

      return response.status(201).send({ album, message: 'Álbum criado com sucesso' })
    } catch {
      return response.status(500).send(responseError())
    }
  }

  async show ({ params, response }) {
    try {
      const rulesShow = { id: "required|exists:albums,id" }
      const { id } = params

      const validation = await validateAll({ id }, rulesShow, messages)
      if (validation.fails()) return response.status(404).send(validation.messages())

      const album = await Album.find(params.id)
      await album.loadMany(['artist', 'images'])

      return album
    } catch {
      return response.status(500).send(responseError())
    }
  }

  async update ({ params, request, response }) {
    try {
      const rulesUpdate = { ...rules, id: "required|exists:albums,id" }
      const data = request.only(['name', 'year', 'artist_id'])
      const { id } = params

      const validation = await validateAll({ ...data, id }, rulesUpdate, messages)
      if (validation.fails()) return response.status(400).send(validation.messages())

      const album = await Album.find(id)
      album.merge(data)
      await album.save()

      return response.status(200).send({ album, message: 'Álbum atualizado com sucesso' })
    } catch {
      return response.status(500).send(responseError())
    }
  }

  async destroy ({ params, response }) {
    try {
      const rulesDestroy = { id: "required|exists:albums,id" }
      const { id } = params

      const validation = await validateAll({ id }, rulesDestroy, messages)
      if (validation.fails()) return response.status(404).send(validation.messages())

      const album = await Album.find(params.id)
      await album.delete()

      return response.status(200).send({ message: 'Álbum apagado com sucesso' })
    } catch {
      return response.status(500).send(responseError())
    }
  }
}

module.exports = AlbumController
