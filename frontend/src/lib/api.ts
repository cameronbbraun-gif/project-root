export function getApiBase(): string {
  const envBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
  if (envBase) {
    return envBase.replace(/\/$/, "");
  }
  return "";
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  if (!base) {
    return path;
  }
  if (!path) {
    return base;
  }
  if (path.startsWith("/")) {
    return `${base}${path}`;
  }
  return `${base}/${path}`;
}
