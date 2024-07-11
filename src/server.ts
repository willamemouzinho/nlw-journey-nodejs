import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { createTrip } from './routes/create-trip'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { confirmTrip } from './routes/confirme-trip'
import { env } from './env'
import { errorHandler } from './error-handler'
import { confirmParticipant } from './routes/confirm-participant'
import { getTripDetails } from './routes/get-trip-details'
import { getParticipants } from './routes/get-participants'
import { createActivity } from './routes/create-activity'
import { getActivities } from './routes/get-activities'
import { createLink } from './routes/create-link'
import { getLinks } from './routes/get-links'
import { getParticipant } from './routes/get-participant'

async function main() {
  const server = fastify({ logger: true })

  // configs
  server.register(fastifyCors, {
    origin: 'http://127.0.0.1',
  })
  server.setValidatorCompiler(validatorCompiler)
  server.setSerializerCompiler(serializerCompiler)

  // routes
  server.register(createTrip, { prefix: '/api/v1' })
  server.register(confirmTrip, { prefix: '/api/v1' })
  server.register(confirmParticipant, { prefix: '/api/v1' })
  server.register(getTripDetails, { prefix: '/api/v1' })
  server.register(getParticipants, { prefix: '/api/v1' })
  server.register(createActivity, { prefix: '/api/v1' })
  server.register(getActivities, { prefix: '/api/v1' })
  server.register(createLink, { prefix: '/api/v1' })
  server.register(getLinks, { prefix: '/api/v1' })
  server.register(getParticipant, { prefix: '/api/v1' })

  // handle errors
  server.setErrorHandler(errorHandler)

  // start server
  try {
    await server.listen({ port: env.PORT })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

main()
