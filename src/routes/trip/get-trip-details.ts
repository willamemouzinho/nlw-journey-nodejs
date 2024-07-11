import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { prisma } from '../../lib/prisma'
import { ClientError } from '../../errors/client-error'

export async function getTripDetails(server: FastifyInstance) {
  server.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        summary: 'get details from a trip',
        tags: ['trips'],
      },
    },
    async (request, reply) => {
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: {
          id: true,
          starts_at: true,
          ends_at: true,
          is_confirmed: true,
        },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      return reply.code(200).send({ trip })
    }
  )
}
