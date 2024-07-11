import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { prisma } from '../../lib/prisma'
import { ClientError } from '../../errors/client-error'

export async function getParticipant(server: FastifyInstance) {
  server.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/participants/:participantId',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
          participantId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId, participantId } = request.params

      const [trip, participant] = await Promise.all([
        prisma.trip.findUnique({
          where: { id: tripId },
        }),
        prisma.participant.findUnique({
          where: { id: participantId },
          select: {
            id: true,
            email: true,
            is_confirmed: true,
          },
        }),
      ])

      if (!trip) {
        throw new ClientError('Trip not found.')
      }
      if (!participant) {
        throw new ClientError('Participant not found.')
      }

      return reply.code(200).send({ participant })
    }
  )
}
