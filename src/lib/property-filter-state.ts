export type PropertyFilterState = {
  project: string | null;
  type: string | null;
  beds: string | null;
  status: string | null;
  min: string;
  max: string;
};

export function toPropertyFilterState(
  current: Partial<PropertyFilterState>,
): PropertyFilterState {
  return {
    project: current.project ?? null,
    type: current.type ?? null,
    beds: current.beds ?? null,
    status: current.status ?? null,
    min: current.min ?? "",
    max: current.max ?? "",
  };
}

export function propertyFilterQuery(draft: PropertyFilterState): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(draft)) {
    if (value === null) continue;
    const normalized = value.trim();
    if (normalized) params.set(key, normalized);
  }
  return params.toString();
}
