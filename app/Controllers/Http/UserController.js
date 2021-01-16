'use strict'

const Database = use('Database')
const { validateAll } = use('Validator')
const User = use('App/Models/User')
const { responseError } = use('./Helpers/MessageError')

const select = ['users.id', 'users.email', 'users.name']
const rules = {
  email: 'required|email|max:120|min:6'
}

const messages = {
  required: 'Campo obrigatório',
  min: 'Mínimo de caracteres não atingido',
  max: 'Máximo de caracteres excedido',
  integer: 'O valor deve ser um inteiro válido',
  'id.exists': 'Este artista não existe',
  'direction.in': 'O valor deve ser "asc" ou "desc"',
  'columnName.in': 'O valor deve ser "id", "email" ou "name"',
  'page.above': 'O valor mínimo é 0',
  'perPage.above': 'O valor mínimo é 3',
}

class UserController {
  async login ({ request, auth, response }) {
    try {
      const { email, password, refreshToken } = request.all()

      const token = refreshToken
        ? await auth.generateForRefreshToken(refreshToken, true)
        : await auth.withRefreshToken().attempt(email, password)
      return token
    } catch {
      return response.status(500).send(responseError())
    }
  }

  async index ({ request, response }) {
    try {
      const data = request.only(['direction', 'columnName', 'page', 'perPage', 'query'])
      const { direction, columnName, page, perPage, query } = data
      const rulesIndex = {
        direction: 'required|in:asc,desc',
        columnName: 'required|in:id,email,name',
        page: 'required|integer|above:-1',
        perPage: 'required|integer|above:2',
      }
      const validation = await validateAll(data, rulesIndex, messages)
      if (validation.fails()) return response.status(400).send(validation.messages())

      const users = await Database.table('users')
        .where(function() {
          if (query) {
            this.where('users.name', 'ilike', `%${query}%`)
          }
        })
        .select(select)
        .orderBy(`users.${columnName}`, direction)
        .paginate(Number(page) + 1, perPage)

      return response.status(200).send(users)
    } catch (error) {
      console.log(error)
      return response.status(500).send(responseError())
    }
  }

  async store ({ request, response }) {
    try {
      const data = request.only(['email', 'password', 'name'])

      const validation = await validateAll(data, rules, messages)
      if (validation.fails()) return response.status(400).send(validation.messages())

      const user = await User.create(data)

      return response.status(201).send({ user, message: 'Usuário criado com sucesso' })
    } catch {
      return response.status(500).send(responseError())
    }
  }

  async show ({ params, response }) {
    try {
      const rulesShow = { id: "required|exists:users,id" }
      const { id } = params

      const validation = await validateAll({ id }, rulesShow, messages)
      if (validation.fails()) return response.status(404).send(validation.messages())

      const user = await User.find(params.id)

      return user
    } catch {
      return response.status(500).send(responseError())
    }
  }

  async update ({ params, request, response }) {
    try {
      const rulesUpdate = { ...rules, id: "required|exists:users,id" }
      const data = request.only(['name'])
      const { id } = params

      const validation = await validateAll({ ...data, id }, rulesUpdate, messages)
      if (validation.fails()) return response.status(400).send(validation.messages())

      const user = await User.find(id)
      user.merge(data)
      await user.save()

      return response.status(200).send({ user, message: 'Usuário atualizado com sucesso' })
    } catch {
      return response.status(500).send(responseError())
    }
  }

  async destroy ({ params, response }) {
    try {
      const rulesDestroy = { id: "required|exists:users,id" }
      const { id } = params

      const validation = await validateAll({ id }, rulesDestroy, messages)
      if (validation.fails()) return response.status(404).send(validation.messages())

      const user = await User.find(params.id)
      await user.delete()

      return response.status(200).send({ message: 'Usuário apagado com sucesso' })
    } catch {
      return response.status(500).send(responseError())
    }
  }
}

module.exports = UserController
