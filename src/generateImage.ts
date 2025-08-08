import fs from "node:fs";
import path from "node:path";

import "dotenv/config";

const HF_API_KEY = process.env.HF_API_KEY;
if (!HF_API_KEY) throw new Error("Please set HF_API_KEY in your .env file");

const HF_HEADERS = {
  Authorization: `Bearer ${HF_API_KEY}`,
  "Content-Type": "application/json",
};

/**
 * Generate base image at 512x512 using SD v1.5
 */
async function generateBaseImage(prompt: string): Promise<Buffer> {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
    {
      method: "POST",
      headers: HF_HEADERS,
      body: JSON.stringify({
        inputs: prompt,
        parameters: { width: 512, height: 512 },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Generation failed: ${response.status} - ${await response.text()}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Upscale an image buffer to ~1024x1024 using Stability AI x4 upscaler
 */
async function upscaleImage(imageBuffer: Buffer): Promise<Buffer> {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-x4-upscaler",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
      },
      body: imageBuffer, // send binary image directly
    },
  );

  if (!response.ok) {
    throw new Error(
      `Upscaling failed: ${response.status} - ${await response.text()}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  const prompt = "A realistic photograph of a mountain lake at sunrise";

  console.log("🎨 Generating base image...");
  const baseImage = await generateBaseImage(prompt);
  fs.writeFileSync(path.join(process.cwd(), "image_512.png"), baseImage);
  console.log("✅ Base image saved as image_512.png");

  const shouldUpscale = true; // toggle this as needed
  if (shouldUpscale) {
    console.log("🔍 Upscaling image...");
    const upscaledImage = await upscaleImage(baseImage);
    fs.writeFileSync(path.join(process.cwd(), "image_1024.png"), upscaledImage);
    console.log("✅ Upscaled image saved as image_1024.png");
  }
}

main().catch(console.error);
