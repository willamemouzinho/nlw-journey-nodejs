import { FastifyInstance } from 'fastify'

export async function createTrip(server: FastifyInstance) {
  server.post('/', async (request, reply) => {})
}
