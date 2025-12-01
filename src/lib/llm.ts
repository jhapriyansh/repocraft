import Groq from "groq-sdk";

const defaultModel = "llama-3.3-70b-versatile";

export async function callLLM(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const client = new Groq({ apiKey });

  const completion = await client.chat.completions.create({
    model: defaultModel,
    messages: [
      {
        role: "system",
        content:
          "You are RepoCraft, an expert technical writer for GitHub projects."
      },
      { role: "user", content: prompt }
    ]
  });

  return completion.choices[0]?.message?.content ?? "";
}
