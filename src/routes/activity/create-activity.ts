import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { dayjs } from '../../lib/dayjs'
import { prisma } from '../../lib/prisma'
import { ClientError } from '../../errors/client-error'

export async function createActivity(server: FastifyInstance) {
  server.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/activities',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          title: z.string().min(3),
          occurs_at: z.coerce.date(),
        }),
        response: {
          201: z.object({
            activityId: z.string().uuid(),
          }),
        },
        summary: 'create an activity from a trip',
        tags: ['activities'],
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { title, occurs_at } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      if (
        dayjs(occurs_at).isBefore(trip.starts_at) ||
        dayjs(occurs_at).isAfter(trip.ends_at)
      ) {
        throw new ClientError('Invalid activity date.')
      }

      const activity = await prisma.activity.create({
        data: { title, occurs_at, trip_id: tripId },
      })

      return reply.code(201).send({ activityId: activity.id })
    }
  )
}
