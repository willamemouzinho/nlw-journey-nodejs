import { FastifyInstance } from 'fastify'
import { ClientError } from './errors/client-error'
import { ZodError } from 'zod'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  console.error(error)
  if (error instanceof ClientError) {
    return reply.code(400).send({ message: 'Internal server error.' })
  }
  if (error instanceof ZodError) {
    return reply.code(400).send({ message: 'Internal server error.' })
  }
  return reply.code(500).send({ message: 'Internal server error.' })
}
