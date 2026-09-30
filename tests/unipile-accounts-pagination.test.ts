/**
 * Tests for cursor pagination in listUnipileLinkedInAccounts (src/lib/server/unipile.ts)
 *
 * Unipile's GET /api/v1/accounts endpoint returns a maximum of 250 accounts per page
 * and uses a cursor for subsequent pages. If pagination is not followed, accounts on
 * page 2+ are missed, causing listVerifiedLinkedInAccounts to treat them as deleted/stale
 * and incorrectly mark them as disconnected in Firestore.
 */

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { listUnipileLinkedInAccounts } from "../src/lib/server/unipile";

describe("listUnipileLinkedInAccounts pagination", () => {
  const originalApiKey = process.env.UNIPILE_API_KEY;
  const originalDsn = process.env.UNIPILE_DSN;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.UNIPILE_API_KEY = "test_api_key";
    process.env.UNIPILE_DSN = "https://api.unipile.test";
  });

  afterEach(() => {
    process.env.UNIPILE_API_KEY = originalApiKey;
    process.env.UNIPILE_DSN = originalDsn;
    globalThis.fetch = originalFetch;
  });

  it("fetches multiple pages using cursors and retrieves accounts beyond the first 250", async () => {
    const requestedUrls: string[] = [];

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = new URL(input.toString());
      requestedUrls.push(url.pathname + url.search);

      const cursor = url.searchParams.get("cursor");

      if (!cursor) {
        // Page 1: 250 accounts and cursor for page 2
        return new Response(
          JSON.stringify({
            object: "AccountList",
            items: Array.from({ length: 250 }, (_, i) => ({
              id: `acc_${i + 1}`,
              type: "LINKEDIN",
              name: `User ${i + 1}`,
              status: "OK",
            })),
            cursor: "cursor_page_2",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (cursor === "cursor_page_2") {
        // Page 2: 1 account on second page, no further cursor
        return new Response(
          JSON.stringify({
            object: "AccountList",
            items: [
              {
                id: "acc_customer_251",
                type: "LINKEDIN",
                name: "Customer On Page Two",
                status: "OK",
              },
            ],
            cursor: null,
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as unknown as typeof fetch;

    const accounts = await listUnipileLinkedInAccounts();

    expect(requestedUrls).toEqual([
      "/api/v1/accounts?limit=250",
      "/api/v1/accounts?limit=250&cursor=cursor_page_2",
    ]);

    expect(accounts.length).toBe(251);
    expect(accounts[0].id).toBe("acc_1");
    expect(accounts[250].id).toBe("acc_customer_251");
    expect(accounts[250].name).toBe("Customer On Page Two");
  });

  it("terminates pagination on single page when cursor is absent", async () => {
    let callCount = 0;

    globalThis.fetch = (async () => {
      callCount += 1;
      return new Response(
        JSON.stringify({
          object: "AccountList",
          items: [
            {
              id: "acc_single_1",
              type: "LINKEDIN",
              name: "Only Account",
              status: "OK",
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as unknown as typeof fetch;

    const accounts = await listUnipileLinkedInAccounts();

    expect(callCount).toBe(1);
    expect(accounts.length).toBe(1);
    expect(accounts[0].id).toBe("acc_single_1");
  });

  it("stops safely when provider returns a repeated cursor", async () => {
    const requestedUrls: string[] = [];

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = new URL(input.toString());
      requestedUrls.push(url.pathname + url.search);

      // Provider keeps returning the same cursor in a loop
      return new Response(
        JSON.stringify({
          object: "AccountList",
          items: [
            {
              id: `acc_loop_${requestedUrls.length}`,
              type: "LINKEDIN",
              name: "Account",
              status: "OK",
            },
          ],
          cursor: "stuck_cursor_123",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as unknown as typeof fetch;

    const accounts = await listUnipileLinkedInAccounts();

    // First call: no cursor -> returns stuck_cursor_123
    // Second call: cursor=stuck_cursor_123 -> returns stuck_cursor_123 again
    // Loop detects seen cursor and breaks
    expect(requestedUrls).toEqual([
      "/api/v1/accounts?limit=250",
      "/api/v1/accounts?limit=250&cursor=stuck_cursor_123",
    ]);
    expect(accounts.length).toBe(2);
  });
});
