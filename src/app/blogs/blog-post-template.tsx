import { Children, isValidElement, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { LinkedInMark, XMark } from "../brand-marks";
import FaqAccordion from "../faq-accordion";
import JsonLd from "../json-ld";
import { MarketingFooter, MarketingHeader } from "../marketing-shell";
import BlogCard, { type BlogCardData } from "./blog-card";
import { createBlogJsonLd, createBreadcrumbJsonLd, createFAQJsonLd, normalizeDate, siteUrl, absoluteAssetUrl } from "../seo";
import { MarkdownTwinLink } from "../seo-content/shared";

/** Every post is written by the founder unless a post says otherwise. */
export const DEFAULT_BLOG_AUTHOR = { name: "Vansh Yadav", avatarUrl: "/founder.jpg" };

/** "September 20, 2026" → "Sep 20, 2026", the way cursor.com/blog prints dates. */
export function shortBlogDate(date: string) {
  return date.replace(/^([A-Za-z]{3})[A-Za-z]*(\s)/, "$1$2");
}

export interface TocItem {
  id: string;
  label: string;
  level: 1 | 2;
  emoji?: string;
}

export interface BlogPostTemplateProps {
  title: string;
  description: string;
  slug: string;
  author?: {
    name: string;
    avatarUrl: string;
  };
  bannerSrc: string;
  bannerAlt?: string;
  tocItems: readonly TocItem[];
  faqItems?: ReadonlyArray<{ question: string; answer: string }>;
  visibleFaqItems?: ReadonlyArray<{ question: ReactNode; answer: ReactNode }>;
  publishedDate?: string;
  updatedDate?: string;
  category?: string;
  readTime?: string;
  relatedPosts?: ReadonlyArray<BlogCardData>;
  children: React.ReactNode;
}

function hasFaqSection(node: ReactNode): boolean {
  return Children.toArray(node).some((child) => {
    if (!isValidElement(child)) return false;
    const props = child.props as { id?: string; children?: ReactNode };
    if (props.id === "faqs" || props.id === "faq" || props.id === "frequently-asked-questions") {
      return true;
    }
    return props.children ? hasFaqSection(props.children) : false;
  });
}

export default function BlogPostTemplate({
  title,
  description,
  slug,
  author = DEFAULT_BLOG_AUTHOR,
  bannerSrc,
  tocItems,
  faqItems = [],
  visibleFaqItems,
  publishedDate: publishedDateProp,
  updatedDate: updatedDateProp,
  category: categoryProp,
  readTime,
  relatedPosts,
  children,
}: BlogPostTemplateProps) {
  const canonicalTitle = title;
  const canonicalDescription = description;
  const canonicalBannerSrc = bannerSrc;
  const category = categoryProp ?? "Playbooks";
  const publishedDate = publishedDateProp ?? "";
  const updatedDate = updatedDateProp || publishedDate;
  const relatedBlogs = relatedPosts ? relatedPosts.slice(0, 3) : [];
  const pageUrl = encodeURIComponent(`${siteUrl}/blogs/${slug}`);
  const hasVisibleFaqs = hasFaqSection(children);
  const faqTocItem = tocItems.find((item) => item.label.toLowerCase().includes("faq"));
  const faqSectionId = faqTocItem?.id ?? "faqs";
  const renderedFaqItems = visibleFaqItems ?? faqItems;
  const jsonLd = [
    createBlogJsonLd({
      title: canonicalTitle,
      description: canonicalDescription,
      url: `${siteUrl}/blogs/${slug}`,
      publishedDate,
      modifiedDate: updatedDate,
      authorName: author.name,
      section: category,
      images: canonicalBannerSrc ? [absoluteAssetUrl(canonicalBannerSrc)] : [],
    }),
    createBreadcrumbJsonLd([
      { name: "Home", url: siteUrl },
      { name: "Blogs", url: `${siteUrl}/blogs` },
      { name: canonicalTitle, url: `${siteUrl}/blogs/${slug}` },
    ]),
    ...(faqItems.length > 0 ? [createFAQJsonLd(faqItems)] : []),
  ];

  return (
    <>
      <JsonLd id={`blog-jsonld-${slug}`} data={jsonLd} />
      {/* overflow-x-clip, not hidden: hidden makes <main> a scroll box and
          the sticky sidebar would stop sticking. */}
      <main className="blog-post-page site-theme min-h-screen overflow-x-clip">
        <MarketingHeader transparentAtTop />
        {/* calendly.com/blog post layout: cream hero with the title, summary
            and byline; then a sticky sidebar (contents,
            sign-up card, share) beside the article. */}
        <section className="cal-hero cal-page-hero">
          <div className="cal-page-hero-inner">
            <h1 className="cal-page-title">{canonicalTitle}</h1>
            <p className="cal-lead">{canonicalDescription}</p>
            <p className="cal-page-meta">
              <Image
                src={author.avatarUrl}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover"
              />
              {author.name}
              <span aria-hidden="true">&middot;</span>
              <time dateTime={normalizeDate(publishedDate)}>{shortBlogDate(publishedDate)}</time>
              {readTime ? (
                <>
                  <span aria-hidden="true">&middot;</span>
                  {readTime}
                </>
              ) : null}
            </p>
          </div>
        </section>

        <div className="cal-post-layout">
          <aside className="cal-post-aside">
            {tocItems.length > 0 ? (
              <details open className="cal-toc">
                <summary>Table of contents</summary>
                <ol>
                  {tocItems.map((item) => (
                    <li key={item.id} className={item.level === 2 ? "pl-3" : undefined}>
                      <a href={`#${item.id}`}>{item.label}</a>
                    </li>
                  ))}
                </ol>
              </details>
            ) : null}
            <div className="cal-side-cta">
              <p>Run the outreach from your own LinkedIn account</p>
              <Link href="/signup" className="site-btn site-btn-primary mt-4 w-full">
                Try Omentir
              </Link>
            </div>
            <div className="cal-share" aria-label="Share this post">
              <a
                href={`https://twitter.com/intent/tweet?url=${pageUrl}&text=${encodeURIComponent(canonicalTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X"
              >
                <XMark className="h-4 w-4" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
              >
                <LinkedInMark className="h-4 w-4" />
              </a>
            </div>
          </aside>

          <article className="min-w-0">

            <div
              className="blog-article prose prose-zinc max-w-none space-y-6 text-left text-[1.0625rem] leading-8 text-[var(--site-text)]"
              data-blog-link-tone="olive"
            >
              {children}
            </div>


            {faqItems.length > 0 && !hasVisibleFaqs ? (
              <section id={faqSectionId} className="mt-16">
                <h2 className="cal-read-h2">Frequently asked questions</h2>
                <div className="mt-6">
                  <FaqAccordion items={renderedFaqItems} />
                </div>
              </section>
            ) : null}

            <MarkdownTwinLink path={`/blogs/${slug}`} title={canonicalTitle} />
          </article>
        </div>

        {relatedBlogs.length > 0 ? (
          <section id="related" className="cal-read cal-read-wide !pt-0">
            <h2 className="cal-read-h2">Related articles</h2>
            <ul className="cal-post-grid mt-8">
              {relatedBlogs.map((blog) => (
                <li key={blog.slug}>
                  <BlogCard post={blog} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <MarketingFooter />
      </main>
    </>
  );
}
