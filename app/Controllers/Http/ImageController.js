'use strict'

const Database = use('Database')
const Drive = use('Drive')
const { validateAll } = use('Validator')
const Image = use('App/Models/Image')
const { responseError } = use('./Helpers/MessageError')

const rules = {
  'images._files': 'required|array|min:1',
  'images._files.*': 'file|file_ext:jpg,png|file_size:2mb',
  album_id: 'required|exists:albums,id',
}

const messages = {
  required: 'Campo obrigatório',
  file: 'Insira um arquivo válido',
  min: 'Insira pelo menos uma imagem',
  fileExt: 'Apenas as extensões PNG e JPG são aceitas',
  fileSize: 'O tamanho máximo da imagem é 2MB',
  fileTypes: 'Insira um arquivo de imagem válido',
  'album_id.exists': 'Este álbum não existe',
  'id.exists': 'Esta imagem não existe'
}

class ImageController {
  async store ({ request, response }) {
    try {
      const { album_id } = request.all()

      const imageList = request.file('images', { types: ['image'], size: '2mb' })
      let images = { _list: [] }
      images._files = imageList._files ? imageList._files : [imageList]

      const validation = await validateAll({ album_id, images }, rules, messages)
      if (validation.fails()) return response.status(400).send(validation.messages())

      let list = []
      for (const image of images._files) {
        const trx = await Database.beginTransaction()
        try {
          const name = `${album_id}/${new Date().getTime()}.${image.subtype}`
          const saved = await Image.create({ name, album_id }, trx)
          await Drive.disk('minio').put(image.tmpPath, name)
          const url = await Drive.disk('minio').getSignedUrl(name)
          const img = saved.toJSON()
          list.push({ ...img, url })
          await trx.commit()
        } catch {
          await trx.rollback()
        }
      }

      return response.status(201).send({ message: 'Salvo com sucesso', images: list })
    } catch {
      return response.status(500).send(responseError())
    }
  }

  async destroy ({ params, response }) {
    try {
      const rulesDelete = { id: 'required|exists:images,id' }
      const validation = await validateAll(params, rulesDelete, messages)
      if (validation.fails()) return response.status(400).send(validation.messages())

      const image = await Image.find(params.id)
      await image.delete()
      await Drive.disk('minio').delete(image.name)

      return { message: 'Imagem apagada com sucesso' }
    } catch {
      return response.status(500).send(responseError())
    }
  }
}

module.exports = ImageController
