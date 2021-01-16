'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Users')

const User = use('App/Models/User')

trait('Test/ApiClient')
trait('Auth/Client')

afterEach(async () => {
  await User.query().delete()
})

const dataUser = { name: 'Stéferson', email: 'steferson@email.com', password: '123456' }

test('index', async ({ client }) => {
  const userAuth = await User.create(dataUser)
  const data = { name: 'Usuário Teste', email: 'email@test.com', password: '12345678' }
  const user = await User.create(data)

  const query = 'direction=asc&columnName=name&page=0&perPage=5'
  const response = await client.get(`/users?${query}`).loginVia(userAuth).end()
  response.assertStatus(200)
  response.assertJSONSubset({
    lastPage: 1,
    page: 1,
    perPage: 5,
    total: "1",
    data: [{
      id: user.id,
      name: 'Usuário Teste',
      email: 'email@test.com'
    }]
  })
})

test('index - validation', async ({ client }) => {
  const userAuth = await User.create(dataUser)
  const data = { name: 'Usuário Teste', email: 'email@test.com', password: '123456' }
  await User.create(data)

  // requisição sem login
  const query = 'direction=asc&columnName=name&page=0&perPage=5'
  let response = await client.get(`/users?${query}`).end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // requisição sem query params
  response = await client.get(`/users`).loginVia(userAuth).end()
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
  response = await client.get(`/users?direction=x&columnName=x&page=-1&perPage=2`).loginVia(userAuth).end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'O valor deve ser "asc" ou "desc"',
      field: 'direction',
      validation: 'in'
    },
    {
      message: 'O valor deve ser "id", "email" ou "name"',
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
  response = await client.get(`/users?direction=asc&columnName=name&page=1.1&perPage=5.5`).loginVia(userAuth).end()
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
  const data = { name: 'Usuário Teste', email: 'email@test.com', password: '12345678' }

  const response = await client.post('/users').loginVia(user).send(data).end()
  response.assertStatus(201)
  response.assertJSONSubset({
    message: 'Usuário criado com sucesso',
    user: { name: 'Usuário Teste', email: 'email@test.com' }
  })
})

test('store - validation', async ({ client }) => {
  const user = await User.create(dataUser)

  // requisição sem login
  let response = await client.post('/users').end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // requisição sem corpo
  response = await client.post('/users').loginVia(user).end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Campo obrigatório',
      field: 'email',
      validation: 'required',
    },
    {
      message: 'Campo obrigatório',
      field: 'name',
      validation: 'required',
    },
    {
      message: 'Campo obrigatório',
      field: 'password',
      validation: 'required',
    }
  ])

  // name com menos de 3 caracteres
  response = await client
    .post('/users')
    .loginVia(user)
    .send({ name: 'Ar', email: 'l@t.co', password: '123' })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Mínimo de caracteres não atingido',
      field: 'email',
      validation: 'min',
    },
    {
      message: 'Mínimo de caracteres não atingido',
      field: 'name',
      validation: 'min',
    },
    {
      message: 'Mínimo de caracteres não atingido',
      field: 'password',
      validation: 'min',
    }
  ])

  // name com mais de 120 caracteres
  response = await client
    .post('/users')
    .loginVia(user)
    .send({
      name: 'Lorem ipsum odio iaculis condimentum accumsan sagittis ad duis tempus nullam fames, hendrerit vivamus sodales per mi eu hendrerit posuere faucibus tristique.',
      email: 'ullamfameshendreritvivamussodalespermieuhendrerit@email.com',
      password: 'Lorem ipsum odio iaculis condimentum accumsan sagittis ad duis tempus nullam fames, hendrerit vivamus sodales per mi eu hendrerit posuere faucibus tristique.',
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Máximo de caracteres excedido',
      field: 'email',
      validation: 'max',
    },
    {
      message: 'Máximo de caracteres excedido',
      field: 'name',
      validation: 'max',
    },
    {
      message: 'Máximo de caracteres excedido',
      field: 'password',
      validation: 'max',
    },
  ])

    // email inválido
    response = await client
    .post('/users')
    .loginVia(user)
    .send({ name: 'Usuário', email: 'emailinvalido', password: '12345678' })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Email inválido',
      field: 'email',
      validation: 'email',
    }
  ])
})

test('show', async ({ client }) => {
  const userAuth = await User.create(dataUser)
  const data = { name: 'Usuário Teste', email: 'email@test.com', password: '12345678' }
  const user = await User.create(data)

  const response = await client.get(`/users/${user.id}`).loginVia(userAuth).end()
  response.assertStatus(200)
  response.assertJSONSubset({ name: 'Usuário Teste', email: 'email@test.com' })
})

test('show - validation', async ({ client }) => {
  const user = await User.create(dataUser)

  // requisição sem login
  let response = await client.get('/users/1').end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // artista não existe
  response = await client.get('/users/1').loginVia(user).end()
  response.assertStatus(404)
  response.assertError([
    {
      message: 'Este usuário não existe',
      field: 'id',
      validation: 'exists'
    }
  ])
})

test('update', async ({ client }) => {
  const userAuth = await User.create(dataUser)
  const data = { name: 'Usuário Teste', email: 'email@test.com' }
  const user = await User.create({ ...data, password: '123456789'})

  const response = await client.put(`/users/${user.id}`).loginVia(userAuth).send({ ...data, name: 'Novo Nome'}).end()
  response.assertStatus(200)
  response.assertJSONSubset({
    user: { id: user.id, name: 'Novo Nome', email: 'email@test.com' },
    message: 'Usuário atualizado com sucesso'
  })
})

test('update - validation', async ({ client }) => {
  const userAuth = await User.create(dataUser)
  const user = await User.create({ name: 'Usuário Teste', email: 'email@test.com', password: '12345678' })

  // requisição sem login
  let response = await client.put(`/users/${user.id}`).end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // requisição sem corpo
  response = await client.put(`/users/${user.id}`).loginVia(userAuth).end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Campo obrigatório',
      field: 'email',
      validation: 'required',
    },
    {
      message: 'Campo obrigatório',
      field: 'name',
      validation: 'required',
    }
  ])

  // name e email com menos de 3 caracteres
  response = await client
    .put(`/users/${user.id}`)
    .loginVia(userAuth)
    .send({ name: 'Ar', email: 'a@b.co' })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Mínimo de caracteres não atingido',
      field: 'email',
      validation: 'min',
    },
    {
      message: 'Mínimo de caracteres não atingido',
      field: 'name',
      validation: 'min',
    }
  ])

  // name e email com mais de 120 caracteres
  response = await client
    .put(`/users/${user.id}`)
    .loginVia(userAuth)
    .send({
      name: 'Lorem ipsum odio iaculis condimentum accumsan sagittis ad duis tempus nullam fames, hendrerit vivamus sodales per mi eu hendrerit posuere faucibus tristique.',
      email: 'Loremipsumodioiaculiscondimentumaccumsanondimentumaccumsan@email.com'
    })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Máximo de caracteres excedido',
      field: 'email',
      validation: 'max',
    },
    {
      message: 'Máximo de caracteres excedido',
      field: 'name',
      validation: 'max',
    }
  ])

  await user.delete()
  // álbum não existe
  response = await client
    .put('/users/100')
    .loginVia(userAuth)
    .send({ name: 'User 2', email: 'email@test.com' })
    .end()
  response.assertStatus(400)
  response.assertError([
    {
      message: 'Este usuário não existe',
      field: 'id',
      validation: 'exists'
    }
  ])
})

test('destroy', async ({ client }) => {
  const userAuth = await User.create(dataUser)
  const user = await User.create({ name: 'Usuário Teste', email: 'email@test.com', password: '12345678' })

  const response = await client.delete(`/users/${user.id}`).loginVia(userAuth).end()
  response.assertStatus(200)
  response.assertJSONSubset({ message: 'Usuário apagado com sucesso' })
})

test('destroy - validation', async ({ client }) => {
  const user = await User.create(dataUser)

  // requisição sem login
  let response = await client.delete('/users/1').end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // álbum não existe
  response = await client.delete('/users/1').loginVia(user).end()
  response.assertStatus(404)
  response.assertError([
    {
      message: 'Este usuário não existe',
      field: 'id',
      validation: 'exists'
    }
  ])
})
