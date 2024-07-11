import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { prisma } from '../../lib/prisma'
import { ClientError } from '../../errors/client-error'
import { dayjs } from '../../lib/dayjs'

export async function getActivities(server: FastifyInstance) {
  server.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/activities',
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
        include: {
          activities: {
            orderBy: {
              occurs_at: 'asc',
            },
          },
        },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      const differenceInDaysBetweenTripStartAndEnd = dayjs(trip.ends_at).diff(
        trip.starts_at,
        'days'
      )

      const activities = Array.from({
        length: differenceInDaysBetweenTripStartAndEnd + 1,
      }).map((_, index) => {
        const date = dayjs(trip.starts_at).add(index, 'days')

        return {
          date: date.toDate(),
          activities: trip.activities.filter((activity) => {
            return dayjs(activity.occurs_at).isSame(date, 'day')
          }),
        }
      })

      return reply.code(200).send({ activities })
    }
  )
}