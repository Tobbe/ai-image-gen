import { fal } from '@fal-ai/client'
import 'dotenv/config'

export async function generateImage(prompt: string) {
  const result = await fal.subscribe('fal-ai/fast-sdxl', {
    input: {
      // prompt: 'Beetroot cutlets with garlic sauce and potatoes',
      prompt,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        update.logs.map((log) => log.message).forEach(console.log)
      }
    },
  })

  console.log(result.data)
  console.log(result.requestId)

  return result.data.images[0].url
}
