'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Albums')

const Album = use('App/Models/Album')
const Artist = use('App/Models/Artist')
const User = use('App/Models/User')

trait('Test/ApiClient')
trait('Auth/Client')

afterEach(async () => {
  await Album.query().delete()
  await Artist.query().delete()
  await User.query().delete()
})

const dataUser = { username: 'Stéferson', email: 'steferson@email.com', password: '123456' }

test('index', async ({ client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: "Guns N' Roses" })
  const album = await Album.create({ name: 'Appetite for Destruction', artist_id: artist.id })

  const query = 'direction=asc&columnName=name&page=0&perPage=5'
  const response = await client.get(`/albums?${query}`).loginVia(user).end()
  response.assertStatus(200)
  response.assertJSONSubset({
    lastPage: 1,
    page: 1,
    perPage: 5,
    total: "1",
    data: [{
      id: album.id,
      year: null,
      name: 'Appetite for Destruction',
      artist: "Guns N' Roses"
    }]
  })
})

test('index - validation', async ({ client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: "Guns N' Roses" })
  await Album.create({ name: 'Appetite for Destruction', artist_id: artist.id })

  // requisição sem login
  const query = 'direction=asc&columnName=name&page=0&perPage=5'
  let response = await client.get(`/albums?${query}`).end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // requisição sem query params
  response = await client.get(`/albums`).loginVia(user).end()
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
  response = await client.get(`/albums?direction=x&columnName=x&page=-1&perPage=2`).loginVia(user).end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'O valor deve ser "asc" ou "desc"',
      field: 'direction',
      validation: 'in'
    },
    {
      message: 'O valor deve ser "id", "name" ou "year"',
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
  response = await client.get(`/albums?direction=asc&columnName=name&page=1.1&perPage=5.5`).loginVia(user).end()
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
  const artist = await Artist.create({ name: "Guns N' Roses" })
  const data = { name: 'Appetite for Destruction', artist_id: artist.id, year: 1987 }

  const response = await client.post('/albums').loginVia(user).send(data).end()
  response.assertStatus(201)
  response.assertJSONSubset({
    message: 'Álbum criado com sucesso',
    album: {
      artist_id: artist.id,
      name: 'Appetite for Destruction',
      year: 1987
    }
  })
})

test('store - validation', async ({ client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: "Guns N' Roses" })

  // requisição sem login
  let response = await client.post('/albums').end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // requisição sem corpo
  response = await client.post('/albums').loginVia(user).end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Campo obrigatório',
      field: 'name',
      validation: 'required',
    },
    {
      message: 'Campo obrigatório',
      field: 'artist_id',
      validation: 'required',
    }
  ])

  // name com menos de 3 caracteres
  response = await client
    .post('/albums')
    .loginVia(user)
    .send({
      name: 'Ap',
      artist_id: artist.id
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
    .post('/albums')
    .loginVia(user)
    .send({
      name: 'Lorem ipsum odio iaculis condimentum accumsan sagittis ad duis tempus nullam fames, hendrerit vivamus sodales per mi eu hendrerit posuere faucibus tristique.',
      artist_id: artist.id
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

  // year enviado como texto
  response = await client
    .post('/albums')
    .loginVia(user)
    .send({
      name: 'Appetite for Destruction',
      artist_id: artist.id,
      year: '2 mil'
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'O valor deve ser um inteiro válido',
      field: 'year',
      validation: 'integer'
    },
    {
      message: 'O ano deve estar contido em 1800-2021',
      field: 'year',
      validation: 'range'
    }
  ])

  // year fora do range
  response = await client
    .post('/albums')
    .loginVia(user)
    .send({
      name: 'Appetite for Destruction',
      artist_id: artist.id,
      year: 2022
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'O ano deve estar contido em 1800-2021',
      field: 'year',
      validation: 'range'
    }
  ])

  // year fora do range
  response = await client
    .post('/albums')
    .loginVia(user)
    .send({
      name: 'Appetite for Destruction',
      artist_id: artist.id,
      year: 1799
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'O ano deve estar contido em 1800-2021',
      field: 'year',
      validation: 'range'
    }
  ])

  // year enviado como float
  response = await client
    .post('/albums')
    .loginVia(user)
    .send({
      name: 'Appetite for Destruction',
      artist_id: artist.id,
      year: 2010.5
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'O valor deve ser um inteiro válido',
      field: 'year',
      validation: 'integer'
    }
  ])

  await artist.delete()

  // artist não existe
  response = await client
    .post('/albums')
    .loginVia(user)
    .send({
      name: 'Appetite for Destruction',
      artist_id: 1
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Este artista não existe',
      field: 'artist_id',
      validation: 'exists'
    }
  ])
})

test('show', async ({ client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: "Guns N' Roses" })
  const data = { name: 'Appetite for Destruction', artist_id: artist.id, year: 1987 }
  const album = await Album.create(data)

  const response = await client.get(`/albums/${album.id}`).loginVia(user).end()
  response.assertStatus(200)
  response.assertJSONSubset({ ...data, artist: { name: "Guns N' Roses" } })
})

test('show - validation', async ({ client }) => {
  const user = await User.create(dataUser)

  // requisição sem login
  let response = await client.get('/albums/1').end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // álbum não existe
  response = await client.get('/albums/1').loginVia(user).end()
  response.assertStatus(404)
  response.assertError([
    {
      message: 'Este álbum não existe',
      field: 'id',
      validation: 'exists'
    }
  ])
})

test('update', async ({ client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: "Guns N' Roses" })
  const data = { name: 'Appetite for Destruction', artist_id: artist.id, year: 1987 }
  const album = await Album.create({ name: 'Álbum', artist_id: artist.id })

  const response = await client.put(`/albums/${album.id}`).loginVia(user).send(data).end()
  response.assertStatus(200)
  response.assertJSONSubset({
    album: { id: album.id, ...data },
    message: 'Álbum atualizado com sucesso'
  })
})

test('update - validation', async ({ client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: "Guns N' Roses" })
  const album = await Album.create({ name: 'Álbum', artist_id: artist.id })

  // requisição sem login
  let response = await client.put(`/albums/${album.id}`).end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // requisição sem corpo
  response = await client.put(`/albums/${album.id}`).loginVia(user).end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Campo obrigatório',
      field: 'name',
      validation: 'required',
    },
    {
      message: 'Campo obrigatório',
      field: 'artist_id',
      validation: 'required',
    }
  ])

  // name com menos de 3 caracteres
  response = await client
    .put(`/albums/${album.id}`)
    .loginVia(user)
    .send({
      name: 'Ap',
      artist_id: artist.id
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
    .put(`/albums/${album.id}`)
    .loginVia(user)
    .send({
      name: 'Lorem ipsum odio iaculis condimentum accumsan sagittis ad duis tempus nullam fames, hendrerit vivamus sodales per mi eu hendrerit posuere faucibus tristique.',
      artist_id: artist.id
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

  // year enviado como texto
  response = await client
    .put(`/albums/${album.id}`)
    .loginVia(user)
    .send({
      name: 'Appetite for Destruction',
      artist_id: artist.id,
      year: '2 mil'
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'O valor deve ser um inteiro válido',
      field: 'year',
      validation: 'integer'
    },
    {
      message: 'O ano deve estar contido em 1800-2021',
      field: 'year',
      validation: 'range'
    }
  ])

  // year fora do range
  response = await client
    .put(`/albums/${album.id}`)
    .loginVia(user)
    .send({
      name: 'Appetite for Destruction',
      artist_id: artist.id,
      year: 2022
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'O ano deve estar contido em 1800-2021',
      field: 'year',
      validation: 'range'
    }
  ])

  // year fora do range
  response = await client
    .put(`/albums/${album.id}`)
    .loginVia(user)
    .send({
      name: 'Appetite for Destruction',
      artist_id: artist.id,
      year: 1799
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'O ano deve estar contido em 1800-2021',
      field: 'year',
      validation: 'range'
    }
  ])

  // year enviado como float
  response = await client
    .put(`/albums/${album.id}`)
    .loginVia(user)
    .send({
      name: 'Appetite for Destruction',
      artist_id: artist.id,
      year: 2010.5
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'O valor deve ser um inteiro válido',
      field: 'year',
      validation: 'integer'
    }
  ])

  // artist não existe
  response = await client
    .put(`/albums/${album.id}`)
    .loginVia(user)
    .send({
      name: 'Appetite for Destruction',
      artist_id: artist.id + 10
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Este artista não existe',
      field: 'artist_id',
      validation: 'exists'
    }
  ])

  await album.delete()
  // álbum não existe
  response = await client
    .put('/albums/1')
    .loginVia(user)
    .send({
      name: 'Appetite for Destruction',
      artist_id: artist.id
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Este álbum não existe',
      field: 'id',
      validation: 'exists'
    }
  ])
})

test('destroy', async ({ client }) => {
  const user = await User.create(dataUser)
  const artist = await Artist.create({ name: "Guns N' Roses" })
  const album = await Album.create({ name: 'Appetite for Destruction', artist_id: artist.id, year: 1987 })

  const response = await client.delete(`/albums/${album.id}`).loginVia(user).end()
  response.assertStatus(200)
  response.assertJSONSubset({ message: 'Álbum apagado com sucesso' })
})

test('destroy - validation', async ({ client }) => {
  const user = await User.create(dataUser)

  // requisição sem login
  let response = await client.delete('/albums/1').end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // álbum não existe
  response = await client.delete('/albums/1').loginVia(user).end()
  response.assertStatus(404)
  response.assertError([
    {
      message: 'Este álbum não existe',
      field: 'id',
      validation: 'exists'
    }
  ])
})
