import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { dayjs } from '../lib/dayjs'
import nodemailer from 'nodemailer'

import { prisma } from '../lib/prisma'
import { getMailClient } from '../lib/mail'

export async function confirmTrip(server: FastifyInstance) {
  server.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/confirm',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        response: {
          201: z.object({
            tripId: z.string().uuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      return reply.code(200).send({ tripId })
    }
  )
}
