import { FastifyInstance } from 'fastify'
import { ClientError } from './errors/client-error'
import { ZodError } from 'zod'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, _request, reply) => {
  console.error(error)

  if (error instanceof ClientError) {
    return reply.code(400).send({ message: error.message })
  }
  if (error instanceof ZodError) {
    return reply.code(400).send({ message: error.flatten().fieldErrors })
  }

  return reply.code(500).send({ message: 'Internal server error.' })
}
