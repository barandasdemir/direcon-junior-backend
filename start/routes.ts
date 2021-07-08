import * as bcrypt from 'bcrypt'
import Route from '@ioc:Adonis/Core/Route'
import { schema } from '@ioc:Adonis/Core/Validator'

import User from '../app/Models/User'
import Event from 'App/Models/Event'

Route.get('/', async () => {
  return { hello: 'world 🌎🌍🌏' }
})

Route.get('/user', async () => {
  const users = await User.all()
  return { events: users }
})

Route.get('/user/:id', async ({ request, response }) => {
  const { id } = request.params()
  const user = await User.findBy('id', id)
  return user ? user.serialize() : response.badRequest({ error: `Cannot find user '${id}'` })
})

Route.post('/user', async ({ request, response }) => {
  const newUserSchema = schema.create({
    email: schema.string(),
    password: schema.string(),
  })

  try {
    const payload = await request.validate({
      schema: newUserSchema,
    })
    const { email, password } = payload
    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ email, password: hashed })
    return user.serialize()
  } catch (error) {
    response.badRequest(error.messages)
  }
})

Route.post('/user/event', async ({ request, response }) => {
  const eventSchema = schema.create({
    user: schema.number(),
    event: schema.string(),
  })

  const payload = await request.validate({
    schema: eventSchema,
  })
  const { user, event } = payload
  const model = await User.findBy('id', user)
  if (model) {
    const createdEvent = await Event.create({ user_id: model.id, event })
    return createdEvent.serialize()
  }
  response.badRequest({ error: 'Could not create new event' })
})

Route.get('/event', async () => {
  const events = await Event.all()
  return { events }
})
