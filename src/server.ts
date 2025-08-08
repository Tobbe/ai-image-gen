import Fastify from 'fastify'

import { generateImage } from './fal.ts'

const server = Fastify()

server.get('/generate', async (req, reply) => {
  try {
    const { prompt } = req.query as { prompt: string }

    if (!prompt) {
      return reply.status(400).send({ error: 'Missing prompt' })
    }

    const image = await generateImage(prompt)

    reply.send({ url: image })
  } catch (error) {
    console.error(error)
    reply.status(500).send({ error: 'Image generation failed' })
  }
})

server
  .listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' })
  .then(() => console.log('Server running'))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
