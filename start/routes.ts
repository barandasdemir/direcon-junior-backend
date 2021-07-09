import * as bcrypt from 'bcrypt'
import Route from '@ioc:Adonis/Core/Route'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

import User from '../app/Models/User'
import Event from 'App/Models/Event'

Route.get('/', async () => {
  return { hello: 'world 🌎🌍🌏' }
})

Route.get('/user', async () => {
  const users = await User.all()
  return { users }
})

Route.get('/user/:id', async ({ request, response }) => {
  const { id } = request.params()
  const user = await User.findBy('id', id)
  return user ? user.serialize() : response.badRequest({ error: `Cannot find user '${id}'` })
})

Route.post('/user', async ({ request, response }) => {
  const newUserSchema = schema.create({
    email: schema.string({}, [rules.email()]),
    password: schema.string(),
    events: schema.string.optional(),
  })

  try {
    const payload = await request.validate({
      schema: newUserSchema,
    })
    const { email, password } = payload
    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ email, password: hashed })
    const events = await Event.findMany(JSON.parse(payload.events || '[]'))
    await Promise.all(events.map((e) => Event.updateOrCreate({ id: e.id }, { user_id: user.id })))
    return user.serialize()
  } catch (error) {
    response.badRequest(error.messages)
  }
})

Route.get('/event', async () => {
  const events = await Event.all()
  return { events }
})

Route.post('/event', async ({ request, response }) => {
  const eventSchema = schema.create({
    user: schema.number.optional(),
    event: schema.string(),
  })
  try {
    const payload = await request.validate({
      schema: eventSchema,
    })
    const model = await User.findBy('id', payload.user || -1)
    const createdEvent = await Event.create({
      user_id: model ? model.id : undefined,
      event: payload.event,
      userAgent: request.header('user-agent'),
      ip: request.ip(),
    })
    return createdEvent.serialize()
  } catch (error) {
    response.badRequest(error.messages)
  }
})
