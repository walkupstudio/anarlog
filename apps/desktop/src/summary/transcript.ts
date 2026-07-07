import type { Store as MainStore } from "~/store/tinybase/store/main";
import {
  buildRenderTranscriptRequestFromStore,
  renderTranscriptSegments,
} from "~/stt/render-transcript";

export type TimestampedSegment = {
  speaker_label: string;
  start_ms: number;
  text: string;
};

export function formatTimestamp(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatTimestampedSegments(
  segments: TimestampedSegment[],
): string {
  if (segments.length === 0) {
    return "";
  }

  const base = Math.min(...segments.map((s) => s.start_ms));

  return segments
    .map(
      (s) =>
        `[${formatTimestamp(s.start_ms - base)}] ${s.speaker_label}: ${s.text}`,
    )
    .join("\n");
}

export async function getTimestampedTranscript(
  sessionId: string,
  store: MainStore,
): Promise<string> {
  const transcriptIds: string[] = [];
  store.forEachRow("transcripts", (transcriptId, _forEachCell) => {
    const rowSessionId = store.getCell(
      "transcripts",
      transcriptId,
      "session_id",
    );
    if (rowSessionId === sessionId) {
      transcriptIds.push(transcriptId);
    }
  });

  if (transcriptIds.length === 0) {
    return "";
  }

  const request = buildRenderTranscriptRequestFromStore(store, transcriptIds);
  if (!request) {
    return "";
  }

  const segments = await renderTranscriptSegments(request);

  const nonEmpty: TimestampedSegment[] = segments
    .filter((segment) => segment.words.length > 0)
    .sort((a, b) => a.start_ms - b.start_ms)
    .map((segment) => ({
      speaker_label: segment.speaker_label,
      start_ms: segment.start_ms,
      text: segment.text,
    }));

  return formatTimestampedSegments(nonEmpty);
}
