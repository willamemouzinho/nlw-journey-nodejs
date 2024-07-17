import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { prisma } from '../../lib/prisma'
import { ClientError } from '../../errors/client-error'

export async function getParticipants(server: FastifyInstance) {
  server.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/participants',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        summary: 'get participants from a trip',
        tags: ['participants'],
      },
    },
    async (request, reply) => {
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              email: true,
              is_confirmed: true,
              is_owner: true,
            },
          },
        },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      return reply.code(200).send({ participants: trip.participants })
    }
  )
}
