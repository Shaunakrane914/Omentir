import Link from "next/link";
import type { FeatureNavIcon } from "../feature-nav";
import TopicArt, { type ArtTint } from "../topic-art";

export type BlogCardData = {
  slug: string;
  title: string;
  description?: string;
  category: string;
  date: string;
};

/** Category tiles replace the banner images on cards: a pastel ground and
 *  the category's icon. Unknown categories fall back to the first entry. */
export const CATEGORY_ICON: Record<string, FeatureNavIcon> = {
  Updates: "product",
  Playbooks: "target",
  Outreach: "send",
  Guides: "search",
  "Case Studies": "people",
  Copywriting: "message",
  Automation: "network",
  Comparisons: "shield",
};

/* Most posts share a category, so the ground color comes from the slug:
   stable per post, varied across the grid. */
const GROUNDS: ArtTint[] = ["blue", "lavender", "mint", "lime", "peach"];

function groundFor(slug: string) {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return GROUNDS[hash % GROUNDS.length];
}

/** Calendly-style post card: a category tile, then the category chip, date,
 *  title and summary straight on the page. `featured` is the wide
 *  tile-left row that opens the blog index. */
export default function BlogCard({ post, featured = false }: { post: BlogCardData; featured?: boolean }) {
  const icon = CATEGORY_ICON[post.category] ?? "product";
  const tile = groundFor(post.slug);
  return (
    <Link href={`/blogs/${post.slug}`} className={featured ? "cal-post-featured" : "cal-post-card"}>
      <span className="cal-post-img" aria-hidden="true">
        <TopicArt
          icon={icon}
          id={`post-art-${post.slug}`}
          ground={tile}
          size="fill"
          className="cal-post-tile"
        />
      </span>
      <span className="cal-post-body">
        <span className="cal-post-meta">
          <span className="cal-post-tag">{post.category}</span>
          {post.date}
        </span>
        <strong>{post.title}</strong>
        {post.description ? <span className="cal-post-summary">{post.description}</span> : null}
      </span>
    </Link>
  );
}
