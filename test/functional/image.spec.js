'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Images')

const Img = use('App/Models/Image')
const Album = use('App/Models/Album')
const Artist = use('App/Models/Artist')
const User = use('App/Models/User')
const Helpers = use('Helpers')
const Drive = use('Drive')
const Database = use('Database')

trait('Test/ApiClient')
trait('Auth/Client')

afterEach(async () => {
  await Img.query().delete()
  await Album.query().delete()
  await Artist.query().delete()
  await User.query().delete()
})

const dataUser = { username: 'Stéferson', email: 'steferson@email.com', password: '123456' }

test('store', async ({ assert, client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: 'Artista' })
  const album = await Album.create({ name: 'Álbum', artist_id: artist.id })

  const response = await client.post('/images')
    .loginVia(user)
    .field('album_id', album.id)
    .attach('images[0]', Helpers.resourcesPath('images/adonis.png'))
    .attach('images[1]', Helpers.resourcesPath('images/javascript.png'))
    .end()

    const images = await Img.all()

  response.assertStatus(201)
  response.assertJSONSubset({ message: 'Salvo com sucesso' })

  for (const image of images.rows) {
    const isExists = await Drive.disk('minio').exists(image.name)
    assert.equal(isExists, true)
    await Drive.disk('minio').delete(image.name)
  }
}).timeout(20000)

test('store - validation', async ({ client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: 'Artista' })
  const album = await Album.create({ name: 'Álbum', artist_id: artist.id })

  // requisição sem login
  let response = await client.post('/images').end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // requisição sem corpo
  response = await client.post('/images').loginVia(user).end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Campo obrigatório',
      field: 'images._files',
      validation: 'required',
    },
    {
      message: 'Campo obrigatório',
      field: 'album_id',
      validation: 'required',
    }
  ])

  // Álbum não existe
  response = await client.post('/images')
    .loginVia(user)
    .field('album_id', album.id + 1)
    .attach('images[0]', Helpers.resourcesPath('images/adonis.png'))
    .attach('images[1]', Helpers.resourcesPath('images/javascript.png'))
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Este álbum não existe',
      field: 'album_id',
      validation: 'exists',
    }
  ])

  // Upload de formato diferente de PNG ou JPG
  response = await client.post('/images')
    .loginVia(user)
    .field('album_id', album.id)
    .attach('images[0]', Helpers.resourcesPath('images/programming.gif'))
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Invalid file extension gif. Only jpg, png are allowed',
      field: 'images._files.0',
      validation: 'fileExt',
    },
    {
      message: 'Invalid file extension gif. Only jpg, png are allowed',
      field: 'images._files.0',
      validation: 'fileSize',
    }
  ])

  // Upload de arquivo com tamanho superior a 2MB
  response = await client.post('/images')
    .loginVia(user)
    .field('album_id', album.id)
    .attach('images[0]', Helpers.resourcesPath('images/wallpaper.png'))
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'File size should be less than 2MB',
      field: 'images._files.0',
      validation: 'fileExt',
    },
    {
      message: 'File size should be less than 2MB',
      field: 'images._files.0',
      validation: 'fileSize',
    }
  ])
})

test('destroy', async ({ assert, client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: "Guns N' Roses" })
  const album = await Album.create({ name: 'Appetite for Destruction', artist_id: artist.id })
  const image = await Img.create({ name: 'test/adonis.png', album_id: album.id })
  await Drive.disk('minio').put(Helpers.resourcesPath('images/adonis.png'), image.name)

  const response = await client.delete(`/images/${image.id}`).loginVia(user).end()
  response.assertStatus(200)
  response.assertJSONSubset({ message: 'Imagem apagada com sucesso' })
  const isExists = await Drive.disk('minio').exists(image.name)
  assert.equal(isExists, false)
}).timeout(15000)

test('destroy - validation', async ({ client }) => {
  const user = await User.create(dataUser)

  // requisição sem login
  let response = await client.delete('/images/1').end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // álbum não existe
  response = await client.delete('/images/1').loginVia(user).end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Esta imagem não existe',
      field: 'id',
      validation: 'exists'
    }
  ])
})
