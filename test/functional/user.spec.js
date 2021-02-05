'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Users')

const User = use('App/Models/User')

trait('Test/ApiClient')
trait('Auth/Client')

afterEach(async () => {
  await User.query().delete()
})

const dataUser = { name: 'Stéferson', email: 'steferson@email.com', password: '123456' }

// test('index', async ({ client }) => {
//   const userAuth = await User.create(dataUser)
//   const data = { name: 'Usuário Teste', email: 'email@test.com', password: '12345678' }
//   const user = await User.create(data)

//   const query = 'direction=asc&columnName=name&page=0&perPage=5'
//   const response = await client.get(`/users?${query}`).loginVia(userAuth).end()
//   response.assertStatus(200)
//   response.assertJSONSubset({
//     lastPage: 1,
//     page: 1,
//     perPage: 5,
//     total: "1",
//     data: [{
//       id: user.id,
//       name: 'Usuário Teste',
//       email: 'email@test.com'
//     }]
//   })
// })

// test('index - validation', async ({ client }) => {
//   const userAuth = await User.create(dataUser)
//   const data = { name: 'Usuário Teste', email: 'email@test.com', password: '123456' }
//   await User.create(data)

//   // requisição sem login
//   const query = 'direction=asc&columnName=name&page=0&perPage=5'
//   let response = await client.get(`/users?${query}`).end()
//   response.assertStatus(401)
//   response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

//   // requisição sem query params
//   response = await client.get(`/users`).loginVia(userAuth).end()
//   response.assertStatus(400)
//   response.assertError([
//     {
//       message: 'Campo obrigatório',
//       field: 'direction',
//       validation: 'required'
//     },
//     {
//       message: 'Campo obrigatório',
//       field: 'columnName',
//       validation: 'required'
//     },
//     {
//       message: 'Campo obrigatório',
//       field: 'page',
//       validation: 'required'
//     },
//     {
//       message: 'Campo obrigatório',
//       field: 'perPage',
//       validation: 'required'
//     }
//   ])

//   // requisição com query params inválidos
//   response = await client.get(`/users?direction=x&columnName=x&page=-1&perPage=2`).loginVia(userAuth).end()
//   response.assertStatus(400)
//   response.assertError([
//     {
//       message: 'O valor deve ser "asc" ou "desc"',
//       field: 'direction',
//       validation: 'in'
//     },
//     {
//       message: 'O valor deve ser "id", "email" ou "name"',
//       field: 'columnName',
//       validation: 'in'
//     },
//     {
//       message: 'O valor mínimo é 0',
//       field: 'page',
//       validation: 'above'
//     },
//     {
//       message: 'O valor mínimo é 3',
//       field: 'perPage',
//       validation: 'above'
//     }
//   ])

//   // requisição com query params (page e perPage) inválidos
//   response = await client.get(`/users?direction=asc&columnName=name&page=1.1&perPage=5.5`).loginVia(userAuth).end()
//   response.assertStatus(400)
//   response.assertError([
//     {
//       message: 'O valor deve ser um inteiro válido',
//       field: 'page',
//       validation: 'integer'
//     },
//     {
//       message: 'O valor deve ser um inteiro válido',
//       field: 'perPage',
//       validation: 'integer'
//     }
//   ])
// })

// test('store', async ({ client }) => {
//   const user = await User.create(dataUser)
//   const data = { name: 'Usuário Teste', email: 'email@test.com', password: '12345678' }

//   const response = await client.post('/users').loginVia(user).send(data).end()
//   response.assertStatus(201)
//   response.assertJSONSubset({
//     message: 'Usuário criado com sucesso',
//     user: { name: 'Usuário Teste', email: 'email@test.com' }
//   })
// })

// test('store - validation', async ({ client }) => {
//   const user = await User.create(dataUser)

//   // requisição sem login
//   let response = await client.post('/users').end()
//   response.assertStatus(401)
//   response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

//   // requisição sem corpo
//   response = await client.post('/users').loginVia(user).end()
//   response.assertStatus(400)
//   response.assertError([
//     {
//       message: 'Campo obrigatório',
//       field: 'email',
//       validation: 'required',
//     },
//     {
//       message: 'Campo obrigatório',
//       field: 'name',
//       validation: 'required',
//     },
//     {
//       message: 'Campo obrigatório',
//       field: 'password',
//       validation: 'required',
//     }
//   ])

//   // name com menos de 3 caracteres
//   response = await client
//     .post('/users')
//     .loginVia(user)
//     .send({ name: 'Ar', email: 'l@t.co', password: '123' })
//     .end()
//   response.assertStatus(400)
//   response.assertError([
//     {
//       message: 'Mínimo de caracteres não atingido',
//       field: 'email',
//       validation: 'min',
//     },
//     {
//       message: 'Mínimo de caracteres não atingido',
//       field: 'name',
//       validation: 'min',
//     },
//     {
//       message: 'Mínimo de caracteres não atingido',
//       field: 'password',
//       validation: 'min',
//     }
//   ])

//   // name com mais de 120 caracteres
//   response = await client
//     .post('/users')
//     .loginVia(user)
//     .send({
//       name: 'Lorem ipsum odio iaculis condimentum accumsan sagittis ad duis tempus nullam fames, hendrerit vivamus sodales per mi eu hendrerit posuere faucibus tristique.',
//       email: 'ullamfameshendreritvivamussodalespermieuhendrerit@email.com',
//       password: 'Lorem ipsum odio iaculis condimentum accumsan sagittis ad duis tempus nullam fames, hendrerit vivamus sodales per mi eu hendrerit posuere faucibus tristique.',
//     })
//     .end()
//   response.assertStatus(400)
//   response.assertError([
//     {
//       message: 'Máximo de caracteres excedido',
//       field: 'email',
//       validation: 'max',
//     },
//     {
//       message: 'Máximo de caracteres excedido',
//       field: 'name',
//       validation: 'max',
//     },
//     {
//       message: 'Máximo de caracteres excedido',
//       field: 'password',
//       validation: 'max',
//     },
//   ])

//     // email inválido
//     response = await client
//     .post('/users')
//     .loginVia(user)
//     .send({ name: 'Usuário', email: 'emailinvalido', password: '12345678' })
//     .end()
//   response.assertStatus(400)
//   response.assertError([
//     {
//       message: 'Email inválido',
//       field: 'email',
//       validation: 'email',
//     }
//   ])
// })

test('show authenticated', async ({ client }) => {
  const userAuth = await User.create(dataUser)

  const response = await client.get(`/users/authenticated`).loginVia(userAuth).end()
  response.assertStatus(200)
  response.assertJSONSubset({ name: 'Stéferson', email: 'steferson@email.com' })
})

test('update', async ({ client }) => {
  const userAuth = await User.create(dataUser)

  const response = await client.put(`/users/authenticated`)
    .loginVia(userAuth)
    .send({ ...dataUser, name: 'Novo Nome' })
    .end()
  response.assertStatus(200)
  response.assertJSONSubset({
    user: { id: userAuth.id, name: 'Novo Nome', email: 'steferson@email.com' },
    message: 'Usuário atualizado com sucesso'
  })
})

test('update - validation', async ({ client }) => {
  const userAuth = await User.create(dataUser)
  const user = await User.create({ name: 'Usuário Teste', email: 'email@test.com', password: '12345678' })

  // requisição sem login
  let response = await client.put('/users/authenticated').end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // requisição sem corpo
  response = await client.put('/users/authenticated').loginVia(userAuth).end()
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
    .put('/users/authenticated')
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
    .put('/users/authenticated')
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
})

test('change password', async ({ client }) => {
  const userAuth = await User.create({ ...dataUser, password: '12345678' })
  const data = {
    old_password: "12345678",
    password: "aIJUyry6D7wZleDm",
    password_confirmation: "aIJUyry6D7wZleDm"
  }

  const response = await client.put('/users/password').send(data).loginVia(userAuth).end()
  response.assertStatus(200)
  response.assertJSONSubset({ message: 'Senha atualizada com sucesso' })
})

test('change password - validation', async ({ client }) => {
  const userAuth = await User.create({ ...dataUser, password: '12345678' })

  // requisição sem login
  let response = await client.put('/users/password').end()
  response.assertStatus(401)
  response.assertError('InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided')

  // requisição sem corpo
  response = await client.put('/users/password').loginVia(userAuth).end()
  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: "Campo obrigatório",
      field: "old_password",
      validation: "required"
    },
    {
      message: "Campo obrigatório",
      field: "password",
      validation: "required"
    }
  ])

  // requisição com password maior que 30 e diferente da confirmação
  response = await client.put('/users/password').loginVia(userAuth)
    .send({
      old_password: '12345678',
      password: 'amvurndplk hagsuftramchfnvhdpqasd',
      password_confirmation: '65456416486768'
    })
    .end()
  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: "Confirme a senha corretamente",
      field: "password",
      validation: "confirmed"
    },
    {
      message: "Máximo de caracteres excedido",
      field: "password",
      validation: "max"
    }
  ])
  // requisição com password menor que o obrigatório
  response = await client.put('/users/password').loginVia(userAuth)
    .send({
      old_password: '12345678',
      password: 'amvu',
      password_confirmation: 'amvu'
    })
    .end()
  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: "Mínimo de caracteres não atingido",
      field: "password",
      validation: "min"
    }
  ])
})
