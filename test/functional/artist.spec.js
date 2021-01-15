'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Artists')

const Artist = use('App/Models/Artist')
const User = use('App/Models/User')

trait('Test/ApiClient')
trait('Auth/Client')

afterEach(async () => {
  await Artist.query().delete()
  await User.query().delete()
})

const dataUser = { username: 'Stéferson', email: 'steferson@email.com', password: '123456' }

test('index', async ({ client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: "Guns N' Roses" })

  const query = 'direction=asc&columnName=name&page=0&perPage=5'
  const response = await client.get(`/artists?${query}`).loginVia(user).end()
  response.assertStatus(200)
  response.assertJSONSubset({
    lastPage: 1,
    page: 1,
    perPage: 5,
    total: "1",
    data: [{
      id: artist.id,
      name: "Guns N' Roses",
    }]
  })
})

test('index - validation', async ({ client }) => {
  const user = await User.create(dataUser)
  await Artist.create({ name: "Guns N' Roses" })

  // requisição sem login
  const query = 'direction=asc&columnName=name&page=0&perPage=5'
  let response = await client.get(`/artists?${query}`).end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // requisição sem query params
  response = await client.get(`/artists`).loginVia(user).end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Campo obrigatório',
      field: 'direction',
      validation: 'required'
    },
    {
      message: 'Campo obrigatório',
      field: 'columnName',
      validation: 'required'
    },
    {
      message: 'Campo obrigatório',
      field: 'page',
      validation: 'required'
    },
    {
      message: 'Campo obrigatório',
      field: 'perPage',
      validation: 'required'
    }
  ])

  // requisição com query params inválidos
  response = await client.get(`/artists?direction=x&columnName=x&page=-1&perPage=2`).loginVia(user).end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'O valor deve ser "asc" ou "desc"',
      field: 'direction',
      validation: 'in'
    },
    {
      message: 'O valor deve ser "id" ou "name"',
      field: 'columnName',
      validation: 'in'
    },
    {
      message: 'O valor mínimo é 0',
      field: 'page',
      validation: 'above'
    },
    {
      message: 'O valor mínimo é 3',
      field: 'perPage',
      validation: 'above'
    }
  ])

  // requisição com query params (page e perPage) inválidos
  response = await client.get(`/artists?direction=asc&columnName=name&page=1.1&perPage=5.5`).loginVia(user).end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'O valor deve ser um inteiro válido',
      field: 'page',
      validation: 'integer'
    },
    {
      message: 'O valor deve ser um inteiro válido',
      field: 'perPage',
      validation: 'integer'
    }
  ])
})

test('store', async ({ client }) => {
  const user = await User.create(dataUser)
  const data = { name: "Guns N' Roses" }

  const response = await client.post('/artists').loginVia(user).send(data).end()
  response.assertStatus(201)
  response.assertJSONSubset({
    message: 'Artista criado com sucesso',
    artist: {
      name: "Guns N' Roses"
    }
  })
})

test('store - validation', async ({ client }) => {
  const user = await User.create(dataUser)

  // requisição sem login
  let response = await client.post('/artists').end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // requisição sem corpo
  response = await client.post('/artists').loginVia(user).end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Campo obrigatório',
      field: 'name',
      validation: 'required',
    }
  ])

  // name com menos de 3 caracteres
  response = await client
    .post('/artists')
    .loginVia(user)
    .send({ name: 'Ar' })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Mínimo de caracteres não atingido',
      field: 'name',
      validation: 'min',
    }
  ])

  // name com mais de 120 caracteres
  response = await client
    .post('/artists')
    .loginVia(user)
    .send({
      name: 'Lorem ipsum odio iaculis condimentum accumsan sagittis ad duis tempus nullam fames, hendrerit vivamus sodales per mi eu hendrerit posuere faucibus tristique.'
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Máximo de caracteres excedido',
      field: 'name',
      validation: 'max',
    }
  ])
})

test('show', async ({ client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: "Guns N' Roses" })

  const response = await client.get(`/artists/${artist.id}`).loginVia(user).end()
  response.assertStatus(200)
  response.assertJSONSubset({ name: "Guns N' Roses" })
})

test('show - validation', async ({ client }) => {
  const user = await User.create(dataUser)

  // requisição sem login
  let response = await client.get('/artists/1').end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // artista não existe
  response = await client.get('/artists/1').loginVia(user).end()
  response.assertStatus(404)
  response.assertError([
    {
      message: 'Este artista não existe',
      field: 'id',
      validation: 'exists'
    }
  ])
})

test('update', async ({ client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: "Artista" })
  const data = { name: "Guns N' Roses" }

  const response = await client.put(`/artists/${artist.id}`).loginVia(user).send(data).end()
  response.assertStatus(200)
  response.assertJSONSubset({
    artist: { id: artist.id, name: "Guns N' Roses" },
    message: 'Artista atualizado com sucesso'
  })
})

test('update - validation', async ({ client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: "Guns N' Roses" })

  // requisição sem login
  let response = await client.put(`/artists/${artist.id}`).end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // requisição sem corpo
  response = await client.put(`/artists/${artist.id}`).loginVia(user).end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Campo obrigatório',
      field: 'name',
      validation: 'required',
    }
  ])

  // name com menos de 3 caracteres
  response = await client
    .put(`/artists/${artist.id}`)
    .loginVia(user)
    .send({
      name: 'Ar'
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Mínimo de caracteres não atingido',
      field: 'name',
      validation: 'min',
    }
  ])

  // name com mais de 120 caracteres
  response = await client
    .put(`/artists/${artist.id}`)
    .loginVia(user)
    .send({
      name: 'Lorem ipsum odio iaculis condimentum accumsan sagittis ad duis tempus nullam fames, hendrerit vivamus sodales per mi eu hendrerit posuere faucibus tristique.'
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Máximo de caracteres excedido',
      field: 'name',
      validation: 'max',
    }
  ])

  await artist.delete()
  // álbum não existe
  response = await client
    .put('/artists/1')
    .loginVia(user)
    .send({ name: 'Artista 2' })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Este artista não existe',
      field: 'id',
      validation: 'exists'
    }
  ])
})

test('destroy', async ({ client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: "Guns N' Roses" })

  const response = await client.delete(`/artists/${artist.id}`).loginVia(user).end()
  response.assertStatus(200)
  response.assertJSONSubset({ message: 'Artista apagado com sucesso' })
})

test('destroy - validation', async ({ client }) => {
  const user = await User.create(dataUser)

  // requisição sem login
  let response = await client.delete('/artists/1').end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // álbum não existe
  response = await client.delete('/artists/1').loginVia(user).end()
  response.assertStatus(404)
  response.assertError([
    {
      message: 'Este artista não existe',
      field: 'id',
      validation: 'exists'
    }
  ])
})
