export function normalizeHexInput(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const withHash = t.startsWith("#") ? t : `#${t}`;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(withHash) ? withHash : t;
}
