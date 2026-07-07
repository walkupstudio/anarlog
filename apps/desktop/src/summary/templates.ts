// Meetily's built-in summary templates (standard_meeting.json,
// daily_standup.json) converted to anarlog TemplateSection format.
import { eq, sql, templates } from "@hypr/db";
import type { TemplateSection } from "@hypr/store";

import { db } from "~/db";

export const STANDARD_MEETING_TEMPLATE_ID = "fork-meetily-standard-meeting";
export const DAILY_STANDUP_TEMPLATE_ID = "fork-meetily-daily-standup";

export const STANDARD_MEETING_SECTIONS: TemplateSection[] = [
  {
    title: "Summary",
    description:
      "Provide a brief, one-paragraph executive summary of the entire meeting.",
  },
  {
    title: "Key Decisions",
    description:
      "List the most important decisions made during the meeting as bullet points.",
  },
  {
    title: "Action Items",
    description:
      'List all assigned tasks as a markdown table with header "| Owner | Task | Due | Reference | Timestamp |". For each row give the owner (or "Unassigned"), the task, the due date (or "Not specified"), a short quote of the transcript line the task came from, and its bracketed [MM:SS] or [H:MM:SS] timestamp.',
  },
  {
    title: "Discussion Highlights",
    description:
      "Summarize the main topics of discussion, key arguments, and important insights.",
  },
];

export const DAILY_STANDUP_SECTIONS: TemplateSection[] = [
  { title: "Attendees", description: "List of participants present." },
  {
    title: "Yesterday",
    description:
      'What each person completed, as a markdown table with header "| Owner | Completed Work |".',
  },
  {
    title: "Today",
    description:
      'Planned work for today, as a markdown table with header "| Owner | Planned Work |".',
  },
  {
    title: "Blockers",
    description:
      'Any impediments, as a markdown table with header "| Owner | Blocker | Impact |".',
  },
  {
    title: "Notes",
    description: "Optional quick notes or announcements, as a short paragraph.",
  },
];

export const DEFAULT_SUMMARY_SECTIONS = STANDARD_MEETING_SECTIONS;

const SEED_TEMPLATES = [
  {
    id: STANDARD_MEETING_TEMPLATE_ID,
    title: "Standard Meeting Notes",
    description:
      "Transcript-first notes: summary, decisions, action items with transcript evidence, highlights.",
    sections: STANDARD_MEETING_SECTIONS,
  },
  {
    id: DAILY_STANDUP_TEMPLATE_ID,
    title: "Daily Standup",
    description: "Time-boxed daily updates: yesterday, today, blockers.",
    sections: DAILY_STANDUP_SECTIONS,
  },
];

export async function seedStructuredSummaryTemplates(): Promise<void> {
  for (const template of SEED_TEMPLATES) {
    try {
      const existing = await db
        .select({ id: templates.id })
        .from(templates)
        .where(eq(templates.id, template.id));

      if (existing.length > 0) {
        continue;
      }

      await db.insert(templates).values({
        id: template.id,
        title: template.title,
        description: template.description,
        pinned: false,
        targetsJson: null,
        sectionsJson: template.sections,
        createdAt: sql`strftime('%Y-%m-%dT%H:%M:%SZ', 'now')`,
        updatedAt: sql`strftime('%Y-%m-%dT%H:%M:%SZ', 'now')`,
      });
    } catch (error) {
      console.error(
        "[structured-summary] failed to seed template",
        template.id,
        error,
      );
    }
  }
}
