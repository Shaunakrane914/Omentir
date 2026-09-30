import { describe, expect, test } from "bun:test";
import JsonLd from "./json-ld";
import { createPageMetadata } from "./seo";

describe("search content integrity", () => {
  test("an article without a valid publication date stays out of search", () => {
    const metadata = createPageMetadata({
      title: "Draft article",
      description: "An unpublished article.",
      path: "/blogs/draft",
      article: { publishedDate: "not-a-date" },
    });
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  test("CMS text cannot close the structured data script and corrupt the page", () => {
    const data = { description: "</script><h1>Injected heading</h1>" };
    const html = JsonLd({ id: "test-jsonld", data }).props.dangerouslySetInnerHTML.__html;
    expect(html).not.toContain("<");
    expect(JSON.parse(html)).toEqual(data);
  });
});
