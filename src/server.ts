import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { createTrip } from './routes/create-trip'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { confirmTrip } from './routes/confirme-trip'

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

  // handle errors
  server.setErrorHandler((error, _req, reply) => {
    if (error.validation) {
      return reply.status(400).send(error.validation)
    }
    return reply.send(error)
  })

  // start server
  try {
    await server.listen({ port: 3333 })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

main()
