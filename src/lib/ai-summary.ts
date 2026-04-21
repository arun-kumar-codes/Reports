import type { AiSummaryResponse, Report } from "@/types/report";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const MOCK_MODEL = "mock-summarizer-v1";

interface OpenAiChoice {
  message?: { content?: string | null };
}

interface OpenAiChatResponse {
  choices?: OpenAiChoice[];
  model?: string;
}

function buildPrompt(report: Report): string {
  return [
    "You are an analyst assistant.",
    "Summarize the following internal report in 2-3 crisp sentences.",
    "Focus on: the headline result, the key driver, and the recommended next step (if any).",
    "Do not invent numbers that are not in the source.",
    "",
    `Title: ${report.title}`,
    `Author: ${report.author}`,
    `Category: ${report.category}`,
    `Tags: ${report.tags.join(", ")}`,
    "",
    "Content:",
    report.content,
  ].join("\n");
}

async function callOpenAi(
  report: Report,
  apiKey: string,
  model: string,
  signal: AbortSignal,
): Promise<string> {
  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content:
            "You are an analyst assistant that writes concise executive summaries. Never fabricate figures.",
        },
        { role: "user", content: buildPrompt(report) },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `OpenAI request failed with status ${response.status}: ${body.slice(0, 200)}`,
    );
  }

  const data = (await response.json()) as OpenAiChatResponse;
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI response did not contain a summary.");
  }
  return content;
}

function generateMockSummary(report: Report): string {
  const firstSentence = report.content.split(/(?<=[.!?])\s+/)[0] ?? report.summary;
  const tagLine = report.tags.length
    ? ` Key themes: ${report.tags.slice(0, 3).join(", ")}.`
    : "";
  const metricsLine =
    ` Engagement snapshot — ${report.metrics.views.toLocaleString()} views,` +
    ` ${report.metrics.shares} shares, ~${report.metrics.readTimeMinutes} min read.`;
  return `${firstSentence}${tagLine}${metricsLine}`;
}

export async function generateSummary(
  report: Report,
  options: { timeoutMs?: number } = {},
): Promise<AiSummaryResponse> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  const now = new Date().toISOString();

  if (!apiKey) {
    return {
      reportId: report.id,
      model: MOCK_MODEL,
      summary: generateMockSummary(report),
      generatedAt: now,
      source: "mock",
    };
  }

  const timeoutMs = options.timeoutMs ?? 15_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const summary = await callOpenAi(report, apiKey, model, controller.signal);
    return {
      reportId: report.id,
      model,
      summary,
      generatedAt: new Date().toISOString(),
      source: "openai",
    };
  } finally {
    clearTimeout(timer);
  }
}
