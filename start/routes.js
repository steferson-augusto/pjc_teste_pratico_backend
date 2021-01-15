'use strict'

const Route = use('Route')

Route.get('/', () => {
  return { message: 'Teste Prático PJC (Backend) - Stéferson Augusto' }
})

Route.post('/login', 'UserController.login')

Route.group(() => {
  Route.resource('/users', 'UserController').apiOnly()

  Route.resource('artists', 'ArtistController').apiOnly()
  Route.resource('albums', 'AlbumController').apiOnly()
  Route.resource('images', 'ImageController').only(['store', 'destroy'])
}).middleware(['auth'])
