'use strict'

const { validateAll } = use('Validator')
const User = use('App/Models/User')
const { responseError } = use('./Helpers/MessageError')

const rules = {
  email: 'required|email|max:50|min:7',
  name: 'required|max:120|min:6',
  password: 'required|max:30|min:8'
}

const messages = {
  required: 'Campo obrigatório',
  min: 'Mínimo de caracteres não atingido',
  max: 'Máximo de caracteres excedido',
  integer: 'O valor deve ser um inteiro válido',
  email: 'Email inválido',
  confirmed: 'Confirme a senha corretamente',
  'id.exists': 'Este usuário não existe',
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
      return response.status(500).send(responseError('loginFail'))
    }
  }

  async showAuthenticated ({ auth, response }) {
    try {
      const data = await auth.getUser()
      const user = data.toJSON()
      delete user.password
      delete user.created_at
      delete user.updated_at
      return user
    } catch {
      return response.status(500).send(responseError())
    }
  }

  async update ({ auth, request, response }) {
    try {
      const rulesUpdate = { ...rules }
      delete rulesUpdate.password
      const data = request.only(['name', 'email'])

      const validation = await validateAll(data, rulesUpdate, messages)
      if (validation.fails()) return response.status(400).send(validation.messages())

      const user = await User.find(auth.user.id)
      user.merge(data)
      await user.save()
      const payload = user.toJSON()
      delete payload.password
      delete payload.created_at
      delete payload.updated_at

      return response.status(200).send({ user: payload, message: 'Usuário atualizado com sucesso' })
    } catch (error) {
      console.log(error)
      return response.status(500).send(responseError())
    }
  }

  async updatePassword ({ auth, request, response }) {
    try {
      const rulesUpdate = {
        old_password: 'required|max:30|min:8',
        password: 'required|confirmed|max:30|min:8'
      }

      const data = request.only(['password', 'old_password', 'password_confirmation'])
      const validation = await validateAll(data, rulesUpdate, messages)
      if (validation.fails()) return response.status(400).send(validation.messages())

      try {
        await auth.attempt(auth.user.email, data.old_password)
      } catch {
        return response.status(400).send(responseError(null, [{
          field: 'old_password',
          message: 'Sua senha atual não confere',
          validation: 'confirmed'
        }]))
      }

      const user = await User.find(auth.user.id)
      user.password = data.password
      await user.save()

      return response.status(200).send({ message: 'Senha atualizada com sucesso' })
    } catch (error) {
      console.log(error)
      return response.status(500).send(responseError())
    }
  }
}

module.exports = UserController
