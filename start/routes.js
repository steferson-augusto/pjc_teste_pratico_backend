'use strict'

const Route = use('Route')

Route.get('/', () => {
  return { message: 'Teste Prático PJC - Stéferson Augusto' }
})

Route.post('/login', 'UserController.login')
