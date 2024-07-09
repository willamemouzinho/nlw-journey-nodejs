import fastify from 'fastify'

async function main() {
  const server = fastify({ logger: true })

  // configs

  // middlewares
  // server.decorate('authenticate', ensureAuthenticated)

  // routes
  // server.register(routes, { prefix: '/api/v3' })

  // handle errors
  server.setErrorHandler((error, _req, reply) => {
    if (error.validation) {
      return reply.status(400).send(error.validation)
    }
    return reply.send(error)
  })

  // start server
  try {
    await server.listen({ port: 3333 })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

main()
