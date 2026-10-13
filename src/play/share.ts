// Grid of Guilt — /play/ share helper. Uses the Web Share API when available,
// falling back to copying the link to the clipboard. Never throws to the caller.

export function playUrl(): string {
  try {
    return window.location.origin + window.location.pathname;
  } catch {
    return "";
  }
}

export async function shareOrCopy(text: string, url: string): Promise<"shared" | "copied" | "failed"> {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  try {
    if (nav && typeof nav.share === "function") {
      await nav.share({ text, url });
      return "shared";
    }
  } catch {
    // User cancelled or share failed — fall through to copy.
  }
  try {
    if (nav && nav.clipboard && typeof nav.clipboard.writeText === "function") {
      await nav.clipboard.writeText(`${text} ${url}`.trim());
      return "copied";
    }
  } catch {
    /* ignore */
  }
  return "failed";
}
