import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import nodemailer from 'nodemailer'

import { dayjs } from '../../lib/dayjs'
import { prisma } from '../../lib/prisma'
import { getMailClient } from '../../lib/mail'
import { ClientError } from '../../errors/client-error'
import { env } from '../../env'

export async function createInvite(server: FastifyInstance) {
  server.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/invites',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          201: z.object({
            participantId: z.string().uuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { email } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { participants: true },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      const participant = await prisma.participant.create({
        data: { email, trip_id: tripId },
      })

      const mail = await getMailClient()
      const formattedStartDate = dayjs(trip.starts_at).format('LL')
      const formattedEndDate = dayjs(trip.ends_at).format('LL')
      const confirmationLink = `${env.API_BASE_URL}/api/v1/participants/${participant.id}/confirm`

      const message = await mail.sendMail({
        from: {
          name: 'Equipe plann.er',
          address: 'equipe@plann.er',
        },
        to: participant.email,
        subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
        html: `
            <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6">
            <p>
            Você foi convidado(a) para participar de uma viagem para
            <strong>${trip.destination}</strong> nas datas de
            <strong>${formattedStartDate}</strong> até
            <strong>${formattedEndDate}</strong>.
            </p>
            <!-- <br /> -->
            <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
            <!-- <br /> -->
            <a href="${confirmationLink}">Confirmar viagem</a>
            <!-- <br /> -->
            <p>
            Caso você não saiba do que se trata esse e-mail, apenas ignore.
            </p>
            </div>
            `.trim(),
      })

      console.log(nodemailer.getTestMessageUrl(message))

      return reply.code(201).send({ participantId: participant.id })
    }
  )
}
