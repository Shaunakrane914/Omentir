import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, readToken } from "../env.server";

export const client = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  useCdn: false,
  token: readToken || undefined,
  // Local draft preview: SANITY_PREVIEW_DRAFTS=1 in .env.local. Ignored in production builds.
  perspective:
    process.env.NODE_ENV !== "production" && process.env.SANITY_PREVIEW_DRAFTS === "1"
      ? "drafts"
      : "published",
  stega: false,
});
