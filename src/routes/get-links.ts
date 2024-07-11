import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../lib/prisma'
import { ClientError } from '../errors/client-error'

export async function getLinks(server: FastifyInstance) {
  server.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/links',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { links: true },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      return reply.code(200).send({ links: trip.links })
    }
  )
}
