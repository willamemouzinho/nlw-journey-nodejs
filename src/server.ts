import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { env } from './env'
import { errorHandler } from './error-handler'

import { createTrip } from './routes/trip/create-trip'
import { confirmTrip } from './routes/trip/confirme-trip'
import { getTripDetails } from './routes/trip/get-trip-details'
import { updateTrip } from './routes/trip/update-trip'
import { confirmParticipant } from './routes/participant/confirm-participant'
import { createInvite } from './routes/participant/create-invite'
import { getParticipants } from './routes/participant/get-participants'
import { getParticipant } from './routes/participant/get-participant'
import { createActivity } from './routes/activity/create-activity'
import { getActivities } from './routes/activity/get-activities'
import { createLink } from './routes/link/create-link'
import { getLinks } from './routes/link/get-links'

async function main() {
  const server = fastify({ logger: true })

  // config
  server.register(fastifyCors, {
    origin: env.WEB_BASE_URL,
  })
  server.setValidatorCompiler(validatorCompiler)
  server.setSerializerCompiler(serializerCompiler)

  // handle errors
  server.setErrorHandler(errorHandler)

  // routes
  server.register(
    async (instance) => {
      instance.register(createTrip)
      instance.register(confirmTrip)
      instance.register(getTripDetails)
      instance.register(updateTrip)

      instance.register(confirmParticipant)
      instance.register(createInvite)
      instance.register(getParticipants)
      instance.register(getParticipant)

      instance.register(createActivity)
      instance.register(getActivities)

      instance.register(createLink)
      instance.register(getLinks)
    },
    { prefix: '/api/v1' }
  )

  // start server
  try {
    await server.listen({ port: env.PORT })
  } catch (error) {
    server.log.error(error)
    process.exit(1)
  }
}

main()
