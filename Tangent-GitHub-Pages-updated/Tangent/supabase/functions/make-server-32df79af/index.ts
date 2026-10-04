import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

const PREFIX = "/make-server-32df79af";

// Origins allowed to call this function. Override with the ALLOWED_ORIGINS
// secret (comma-separated) if your Pages URL or local dev port changes.
const allowedOrigins = (
  Deno.env.get("ALLOWED_ORIGINS") ??
  "https://jasonhuanggeorgia-cloud.github.io,http://localhost:8443,http://localhost:5173"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-5-5";

const lessonShape = `{
  "title": string, "duration": string, "introduction": string,
  "objectives": string[3],
  "sections": [{"heading": string, "body": string, "formula": optional string, "example": optional string}],
  "interactive": {"title": string, "instruction": string, "type": "map"|"sequence"|"comparison"|"cycle", "nodes": string[4]},
  "exercise": {"prompt": string, "hint": string, "solution": string},
  "quiz": {"question": string, "options": string[3], "correctIndex": number 0-2, "explanation": string},
  "mentorNote": string
}`;

class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Pull the first complete JSON object out of the model's reply. */
function parseJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("The model did not return valid JSON.");
  }
  return JSON.parse(text.slice(start, end + 1));
}

async function ask(system: string, user: string, maxTokens: number) {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("The server has no ANTHROPIC_API_KEY secret set.");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!response.ok) {
    console.error("Anthropic error:", response.status, await response.text());
    throw new Error(`The AI request failed (${response.status}). Please try again.`);
  }

  const data = await response.json();
  const text = (data.content ?? [])
    .map((block: { type: string; text?: string }) => (block.type === "text" ? block.text : ""))
    .join("");
  if (data.stop_reason === "max_tokens") {
    throw new Error("The response was cut off. Please try again.");
  }
  return parseJson(text);
}

function rigorFor(alumMode: unknown) {
  return alumMode !== false
    ? "Use precise terminology, first-principles reasoning, derivations where relevant, challenging practice, and no childish simplification."
    : "Teach accurately with approachable scaffolding.";
}

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

const app = new Hono();

app.use("*", logger(console.log));

app.use(
  "/*",
  cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    maxAge: 600,
  }),
);

app.get(`${PREFIX}/health`, (c) => c.json({ status: "ok" }));

app.post(`${PREFIX}/generate-course`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const request = clean(body.request, 1200);
    if (request.length < 3) {
      throw new HttpError("Please provide a more detailed learning request.");
    }

    const result = await ask(
      `You are Tangent, an expert curriculum designer. ${rigorFor(body.alumMode)} Return only valid JSON, no markdown. Adapt completely to the learner's subject. Root shape:
{"course":{"title":string,"summary":string,"level":string,"goal":string,"estimatedHours":number,"modules":[{"id":string,"title":string,"description":string,"lessons":[{"id":string,"title":string,"duration":string}]}]},"firstLesson":${lessonShape}}
Create exactly 5 coherent modules with exactly 4 sequenced lessons each. Give every lesson a unique id. Fully teach module 1 lesson 1 in firstLesson.`,
      `Learner request: ${request}`,
      8000,
    );

    return c.json({ ...result, courseId: crypto.randomUUID() });
  } catch (error) {
    return fail(c, error);
  }
});

app.post(`${PREFIX}/generate-lesson`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const courseTitle = clean(body.courseTitle, 200);
    const moduleTitle = clean(body.moduleTitle, 200);
    const lessonTitle = clean(body.lessonTitle, 200);
    if (!courseTitle || !moduleTitle || !lessonTitle) {
      throw new HttpError("courseTitle, moduleTitle and lessonTitle are required.");
    }

    const lesson = await ask(
      `You are an expert teacher writing a complete rigorous lesson. ${rigorFor(body.alumMode)} Return only valid JSON, no markdown, matching ${lessonShape}. Every field and visual node must be specific to this lesson.`,
      `Course: ${courseTitle}\nModule: ${moduleTitle}\nLesson: ${lessonTitle}`,
      4500,
    );

    return c.json({ lesson });
  } catch (error) {
    return fail(c, error);
  }
});

// deno-lint-ignore no-explicit-any
function fail(c: any, error: unknown) {
  console.error("Tangent error:", error);
  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof Error ? error.message : "AI generation failed.";
  return c.json({ error: message }, status);
}

Deno.serve(app.fetch);
