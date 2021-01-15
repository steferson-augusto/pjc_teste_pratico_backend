'use strict'

const Route = use('Route')

Route.get('/', () => {
  return { message: 'Teste Prático PJC (Backend) - Stéferson Augusto' }
})

Route.post('/login', 'UserController.login')

Route.group(() => {
  Route.post('/users', 'UserController.store')

  Route.resource('artists', 'ArtistController').apiOnly()
  Route.resource('albums', 'AlbumController').apiOnly()
}).middleware(['auth'])
