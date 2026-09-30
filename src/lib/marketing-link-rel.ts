export function marketingLinkRel(href: string): string {
  try {
    const hostname = new URL(href).hostname;
    if (hostname === "joinvalley.co" || hostname === "www.joinvalley.co") {
      return "noopener sponsored";
    }
  } catch {
    // Relative links are not paid placements.
  }
  return "noopener";
}
