export { getPreferredProviderModel } from "~/stt/model-selection";

// A provider can be persisted while the model value is still empty (the
// select then *displays* a preferred model that was never written back).
// Radix treats clicking the displayed item as a no-op re-selection, so the
// empty value can never self-correct through the UI. Persist the preferred
// model once it is actually usable.
export function resolvePreferredModelToPersist(
  persistedModel: string | undefined,
  displayedModel: string | undefined,
  models: Array<{ id: string; isDownloaded?: boolean }>,
): string | null {
  if (persistedModel || !displayedModel) {
    return null;
  }

  const entry = models.find((model) => model.id === displayedModel);
  return entry?.isDownloaded ? displayedModel : null;
}
