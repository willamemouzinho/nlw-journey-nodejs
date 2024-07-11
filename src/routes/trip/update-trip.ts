import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { dayjs } from '../../lib/dayjs'
import { prisma } from '../../lib/prisma'
import { ClientError } from '../../errors/client-error'

export async function updateTrip(server: FastifyInstance) {
  server.withTypeProvider<ZodTypeProvider>().put(
    '/trips/:tripId',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          destination: z.string().min(3),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { destination, starts_at, ends_at } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      if (
        dayjs(starts_at).isBefore(new Date()) &&
        !dayjs(starts_at).isSame(trip.starts_at, 'day')
      ) {
        throw new ClientError('Invalid trip start date.')
      }
      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new ClientError('Invalid trip end date.')
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: {
          destination,
          starts_at,
          ends_at,
        },
      })

      return reply.code(204).send()
    }
  )
}
