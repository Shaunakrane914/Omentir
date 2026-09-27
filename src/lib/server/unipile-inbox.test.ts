import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));
mock.module("./data", () => ({
  consumeAvatarViewBudget: async () => "exhausted",
  consumeProfileViewBudget: async () => false,
  listLinkedInAccounts: async () => [],
}));

const originalFetch = globalThis.fetch;
const originalEnv = { key: process.env.UNIPILE_API_KEY, dsn: process.env.UNIPILE_DSN };
process.env.UNIPILE_API_KEY = "test-key";
process.env.UNIPILE_DSN = "unipile.test";

type Route = (url: URL) => Response;
let routes: Record<string, Route> = {};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

globalThis.fetch = (async (input: RequestInfo | URL) => {
  const url = new URL(String(input));
  const route = routes[url.pathname];
  if (!route) throw new Error(`Unexpected Unipile call: ${url.pathname}`);
  return route(url);
}) as typeof fetch;

const {
  findLinkedInChatWithAttendee,
  linkedInChatBelongsToAccount,
  listLinkedInChatMessagesPage,
  listLinkedInInbox,
} = await import("./unipile");

const healthy: Record<string, Route> = {
  "/api/v1/chats": () =>
    json({ items: [{ id: "chat-1", account_id: "acc-1", attendee_provider_id: "ACoPriya" }] }),
  "/api/v1/chat_attendees": () =>
    json({ items: [{ id: "att-1", provider_id: "ACoPriya", name: "Priya Nair" }] }),
  "/api/v1/messages": () =>
    json({
      items: [
        {
          id: "msg-1",
          chat_id: "chat-1",
          text: "Sounds good, send it over",
          timestamp: "2026-09-25T10:00:00.000Z",
          is_sender: false,
        },
      ],
    }),
};

const listInbox = () =>
  listLinkedInInbox({ accountId: "acc-1", limit: 30, includeMessageHistory: false });

afterAll(() => {
  globalThis.fetch = originalFetch;
  process.env.UNIPILE_API_KEY = originalEnv.key;
  process.env.UNIPILE_DSN = originalEnv.dsn;
});

describe("listLinkedInInbox (inbox list)", () => {
  beforeEach(() => {
    routes = { ...healthy };
  });

  test("names each chat from the bulk attendee list and carries its last message", async () => {
    const threads = await listInbox();
    expect(threads.map((thread) => thread.profileName)).toEqual(["Priya Nair"]);
    expect(threads[0].messages.at(-1)?.body).toBe("Sounds good, send it over");
  });

  test("a failed attendee lookup fails the load instead of returning nameless chats that the inbox would drop", async () => {
    routes["/api/v1/chat_attendees"] = () => json({ type: "errors/unknown" }, 500);
    await expect(listInbox()).rejects.toThrow();
  });

  test("a failed recent-messages lookup fails the load instead of blanking every preview", async () => {
    routes["/api/v1/messages"] = () => json({ type: "errors/unknown" }, 500);
    await expect(listInbox()).rejects.toThrow();
  });
});

describe("linkedInChatBelongsToAccount", () => {
  beforeEach(() => {
    routes = {
      "/api/v1/chats/chat-1": () => json({ id: "chat-1", account_id: "acc-1" }),
      "/api/v1/chats/missing": () => json({ type: "errors/resource_not_found" }, 404),
      "/api/v1/chats/flaky": () => json({ type: "errors/unknown" }, 500),
    };
  });

  test("accepts a chat on the given account", async () => {
    expect(await linkedInChatBelongsToAccount("chat-1", "acc-1")).toBe(true);
  });

  test("rejects a chat that lives on another account, so nobody reads or replies through someone else's inbox", async () => {
    expect(await linkedInChatBelongsToAccount("chat-1", "acc-2")).toBe(false);
  });

  test("treats an unknown chat as not owned", async () => {
    expect(await linkedInChatBelongsToAccount("missing", "acc-1")).toBe(false);
  });

  test("a provider outage is an error, not a false 'chat not found'", async () => {
    await expect(linkedInChatBelongsToAccount("flaky", "acc-1")).rejects.toThrow();
  });
});

// Shapes copied from real Unipile chat history (2026-09-27).
const reactedMessage = {
  id: "msg-reacted",
  text: "Hi Anton, I'm working on AceDraft",
  timestamp: "2026-09-23T10:00:00.000Z",
  is_sender: true,
  reactions: [{ value: "👍", is_sender: false }],
};
const reactionNotice = {
  id: "msg-notice",
  text: "Anton reacted 👍",
  timestamp: "2026-09-23T23:37:58.656Z",
  is_sender: false,
  is_event: 1,
  event_type: 2,
  hidden: 1,
};
const photoOnly = {
  id: "msg-photo",
  text: "",
  timestamp: "2026-09-11T06:29:18.694Z",
  is_sender: false,
  attachments: [{ id: "att-photo", type: "img", url: "att://acc-1/abc", unavailable: false }],
};
const sharedPost = {
  id: "msg-post",
  text: "",
  timestamp: "2026-09-12T06:29:18.694Z",
  is_sender: false,
  attachments: [
    { id: "att-post", type: "linkedin_post", url: "https://www.linkedin.com/feed/update/urn:li:activity:1" },
  ],
};
const inMail = {
  id: "msg-inmail",
  text: "Hi Vyaas, I hope you are doing well",
  subject: "You're the one for Stripe!",
  timestamp: "2026-09-10T06:56:26.972Z",
  is_sender: false,
  message_type: "INMAIL",
};
const deletedMessage = {
  id: "msg-deleted",
  text: null,
  timestamp: "2026-09-16T09:48:36.769Z",
  is_sender: true,
  deleted: 1,
  attachments: [],
};
const requestAccepted = {
  id: "msg-accepted",
  text: "Message request accepted",
  timestamp: "2026-09-10T07:00:00.000Z",
  is_sender: false,
  is_event: 1,
  event_type: 0,
  hidden: 0,
};

describe("listLinkedInChatMessagesPage (open chat history)", () => {
  beforeEach(() => {
    routes = {
      "/api/v1/chats/chat-1/messages": () =>
        json({
          items: [reactionNotice, reactedMessage, deletedMessage, sharedPost, photoOnly, requestAccepted, inMail],
          cursor: null,
        }),
    };
  });

  test("keeps photo and shared-post messages that have no text, which LinkedIn shows in the thread", async () => {
    const { messages } = await listLinkedInChatMessagesPage({ chatId: "chat-1" });
    const photo = messages.find((message) => message.id === "msg-photo");
    const post = messages.find((message) => message.id === "msg-post");
    expect(photo?.attachments).toEqual([{ id: "att-photo", type: "img", name: undefined, url: undefined, unavailable: undefined }]);
    // A public post link is kept; an att:// reference is not a URL the browser can open.
    expect(post?.attachments?.[0].url).toBe("https://www.linkedin.com/feed/update/urn:li:activity:1");
  });

  test("keeps a deleted message as a placeholder, the way LinkedIn leaves it in the thread", async () => {
    const { messages } = await listLinkedInChatMessagesPage({ chatId: "chat-1" });
    expect(messages.find((message) => message.id === "msg-deleted")?.deleted).toBe(true);
  });

  test("drops hidden reaction notices, which LinkedIn never shows as messages, and puts the reaction on the message instead", async () => {
    const { messages } = await listLinkedInChatMessagesPage({ chatId: "chat-1" });
    expect(messages.some((message) => message.body === "Anton reacted 👍")).toBe(false);
    expect(messages.find((message) => message.id === "msg-reacted")?.reactions).toEqual(["👍"]);
  });

  test("carries the InMail subject and marks visible notices as events, oldest first", async () => {
    const { messages } = await listLinkedInChatMessagesPage({ chatId: "chat-1" });
    expect(messages.map((message) => message.id)).toEqual([
      "msg-inmail",
      "msg-accepted",
      "msg-photo",
      "msg-post",
      "msg-deleted",
      "msg-reacted",
    ]);
    expect(messages[0].subject).toBe("You're the one for Stripe!");
    expect(messages[1].event).toBe(true);
    expect(messages[0].event).toBeUndefined();
  });
});

describe("listLinkedInInbox preview", () => {
  test("a reaction notice does not become the last message, or it would show up as a bubble in the open chat", async () => {
    routes = {
      ...healthy,
      "/api/v1/messages": () =>
        json({ items: [{ ...reactedMessage, chat_id: "chat-1" }, { ...reactionNotice, chat_id: "chat-1" }] }),
    };
    const threads = await listInbox();
    expect(threads[0].messages.map((message) => message.id)).toEqual(["msg-reacted"]);
  });
});

describe("findLinkedInChatWithAttendee", () => {
  test("finds the newest chat with the person on that account, so an old conversation opens LinkedIn's thread", async () => {
    routes = {
      "/api/v1/chat_attendees/ACoSyed/chats": (url) => {
        expect(url.searchParams.get("account_id")).toBe("acc-1");
        return json({
          items: [
            { id: "chat-old", account_id: "acc-1", timestamp: "2026-08-01T00:00:00.000Z" },
            { id: "chat-other-account", account_id: "acc-2", timestamp: "2026-09-25T00:00:00.000Z" },
            { id: "chat-new", account_id: "acc-1", timestamp: "2026-09-21T15:03:53.000Z" },
          ],
        });
      },
    };
    expect(
      await findLinkedInChatWithAttendee({ accountId: "acc-1", providerProfileId: "ACoSyed" }),
    ).toBe("chat-new");
  });

  test("returns null when the person has no chat on that account", async () => {
    routes = { "/api/v1/chat_attendees/ACoNobody/chats": () => json({ items: [] }) };
    expect(
      await findLinkedInChatWithAttendee({ accountId: "acc-1", providerProfileId: "ACoNobody" }),
    ).toBeNull();
  });
});
