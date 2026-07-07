// apps/desktop/src/summary/workflow.ts
// Transcript-first structured summary: chunk -> map -> reduce -> template
// render. Flow ported from meetily; streaming/validation reuses anarlog's
// enhance machinery.
import {
  generateText,
  type LanguageModel,
  streamText,
  type TextStreamPart,
} from "ai";

import { chunkText } from "./chunker";
import {
  buildChunkSummaryPrompt,
  buildCombinePrompt,
  buildFinalSystemPrompt,
  buildFinalUserPrompt,
} from "./prompts";
import { DEFAULT_SUMMARY_SECTIONS } from "./templates";
import { getTimestampedTranscript } from "./transcript";

import { deterministicGenerationSettings } from "~/ai/model-settings";
import type { Store } from "~/store/tinybase/store/main";
import { withEarlyValidationRetry } from "~/store/zustand/ai-task/shared/validate";
import type { TaskArgsMapTransformed } from "~/store/zustand/ai-task/task-configs";
import { createEnhanceValidator } from "~/store/zustand/ai-task/task-configs/enhance-validator";
import { assertCanonicalTemplateSections } from "~/templates/codec";

const MAX_RETRIES = 4;
const CHUNK_SIZE_TOKENS = 8000;
const OVERLAP_TOKENS = 200;
const CHUNK_SUMMARY_MAX_TOKENS = 2048;
const COMBINE_MAX_TOKENS = 4096;
const FINAL_MAX_TOKENS = 8192;

type ProgressStep =
  | { type: "analyzing" }
  | { type: "generating" }
  | { type: "retrying"; attempt: number; reason: string };

export async function* structuredSummaryWorkflow(params: {
  model: LanguageModel;
  args: TaskArgsMapTransformed["enhance"];
  onProgress: (step: ProgressStep) => void;
  signal: AbortSignal;
  store: Store;
}): AsyncIterable<TextStreamPart<any>> {
  const { model, args, onProgress, signal, store } = params;

  if (!args.sessionId) {
    throw new Error("Structured summary requires a session id.");
  }

  onProgress({ type: "analyzing" });

  const transcript = await getTimestampedTranscript(args.sessionId, store);
  if (!transcript.trim()) {
    throw new Error("No transcript available for this meeting.");
  }

  const sections = args.template?.sections?.length
    ? assertCanonicalTemplateSections(
        args.template.sections,
        "structured-summary template.sections",
      )
    : DEFAULT_SUMMARY_SECTIONS;

  const chunks = chunkText(transcript, CHUNK_SIZE_TOKENS, OVERLAP_TOKENS);

  let source: string;
  let sourceKind: "transcript" | "summary";

  if (chunks.length <= 1) {
    source = transcript;
    sourceKind = "transcript";
  } else {
    const chunkSummaries = await summarizeChunks({ model, chunks, signal });
    if (chunkSummaries.length === 0) {
      throw new Error("Failed to summarize any transcript chunk.");
    }

    const combined = await generateText({
      model,
      ...deterministicGenerationSettings(model),
      abortSignal: signal,
      maxRetries: MAX_RETRIES,
      maxOutputTokens: COMBINE_MAX_TOKENS,
      prompt: buildCombinePrompt(chunkSummaries),
    });
    if (!combined.text.trim()) {
      throw new Error("Failed to combine chunk summaries.");
    }
    source = combined.text;
    sourceKind = "summary";
  }

  const system = buildFinalSystemPrompt({
    sections,
    language: args.language ?? null,
  });
  const prompt = buildFinalUserPrompt({
    title: args.session?.title ?? null,
    participants: (args.participants ?? []).map((p) => p.name),
    source,
    sourceKind,
  });

  onProgress({ type: "generating" });

  const validator = createEnhanceValidator({
    title: "",
    description: null,
    sections,
  });

  yield* withEarlyValidationRetry(
    (retrySignal, { previousFeedback }) => {
      const finalPrompt = previousFeedback
        ? `${prompt}\n\nIMPORTANT: Previous attempt failed. ${previousFeedback}`
        : prompt;

      const controller = new AbortController();
      const abort = () => controller.abort();
      signal.addEventListener("abort", abort);
      retrySignal.addEventListener("abort", abort);

      try {
        const result = streamText({
          model,
          system,
          prompt: finalPrompt,
          abortSignal: controller.signal,
          maxRetries: MAX_RETRIES,
          maxOutputTokens: FINAL_MAX_TOKENS,
        });
        return result.fullStream;
      } finally {
        signal.removeEventListener("abort", abort);
        retrySignal.removeEventListener("abort", abort);
      }
    },
    validator,
    {
      minChar: 10,
      maxChar: 30,
      maxRetries: 2,
      onRetry: (attempt, feedback) =>
        onProgress({ type: "retrying", attempt, reason: feedback }),
      onRetrySuccess: () => onProgress({ type: "generating" }),
      onGiveUp: () => onProgress({ type: "generating" }),
    },
  );
}

// Sequential on purpose: local models can't take parallel requests, and
// meetily's engine also processes chunks in order. A failed chunk is
// skipped (meetily behavior), not fatal.
async function summarizeChunks(params: {
  model: LanguageModel;
  chunks: string[];
  signal: AbortSignal;
}): Promise<string[]> {
  const { model, chunks, signal } = params;
  const summaries: string[] = [];

  for (const [index, chunk] of chunks.entries()) {
    if (signal.aborted) {
      throw new Error("Summary generation was cancelled.");
    }

    try {
      const result = await generateText({
        model,
        ...deterministicGenerationSettings(model),
        abortSignal: signal,
        maxRetries: 2,
        maxOutputTokens: CHUNK_SUMMARY_MAX_TOKENS,
        prompt: buildChunkSummaryPrompt(chunk),
      });
      summaries.push(result.text);
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
      console.error(
        `[structured-summary] chunk ${index + 1}/${chunks.length} failed, skipping`,
        error,
      );
    }
  }

  return summaries;
}
