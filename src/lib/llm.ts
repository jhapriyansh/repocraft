import Groq from "groq-sdk";

const defaultModel = "llama-3.3-70b-versatile";

const systemPrompt =
  "You are RepoCraft, an expert technical writer that turns GitHub repositories into clean docs, portfolio entries, resume bullets, and LinkedIn posts.";

export async function streamLLM(prompt: string): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const client = new Groq({ apiKey });

  const groqStream = await client.chat.completions.create({
    model: defaultModel,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ]
  });

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      for await (const chunk of groqStream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (!delta) continue;
        await writer.write(encoder.encode(delta));
      }
    } catch (err) {
      console.error("streamLLM error", err);
    } finally {
      await writer.close();
    }
  })();

  return readable;
}
