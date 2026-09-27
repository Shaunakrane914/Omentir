"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { ScheduledAction } from "@/lib/server/scheduled-actions";
import { LeadAvatar } from "@/app/lead-avatar";
import { getLeadConversationAction, saveScheduledMessageAction } from "@/app/actions";
import type { ConversationMessage } from "@/lib/server/types";
import { unwrapAction } from "@/lib/action-result";
import { userFacingError } from "@/app/toast";

type Lead = NonNullable<ScheduledAction["lead"]>;

const TIMEZONE_LABELS: Record<string, string> = {
  UTC: "Universal",
  "America/Sao_Paulo": "Brazil",
  "America/Chicago": "Central US",
  "Europe/Berlin": "Central Europe",
  "America/New_York": "Eastern US",
  "Pacific/Honolulu": "Hawaii",
  "Asia/Kolkata": "India",
  "Asia/Tokyo": "Japan",
  "America/Denver": "Mountain US",
  "Pacific/Auckland": "New Zealand",
  "America/Los_Angeles": "Pacific US",
  "Asia/Singapore": "Singapore",
  "Australia/Sydney": "Australia",
  "Europe/London": "United Kingdom",
};

function timeZoneLabel(timeZone: string) {
  return TIMEZONE_LABELS[timeZone] || timeZone.split("/").at(-1)?.replaceAll("_", " ") || "Universal";
}

export function dateLabel(value: string | number | Date, timeZone: string, includeYear = false) {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric", ...(includeYear ? { year: "numeric" as const } : {}) }).format(new Date(value));
}

export function timeLabel(value: string, timeZone: string) {
  const time = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(value));
  return `${time} ${timeZoneLabel(timeZone)} time`;
}

function Avatar({ lead, size = "md" }: { lead: Lead; size?: "sm" | "md" | "lg" }) {
  const classes = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const text = size === "lg" ? "text-[12px]" : "text-[11px]";
  return (
    <LeadAvatar
      name={lead.name}
      avatarUrl={lead.avatarUrl}
      leadId={lead.id}
      className={`${classes} bg-[#f8e8ef]`}
      initialsClassName={`${text} font-bold text-[#ba3871]`}
    />
  );
}

export function resultMessage(result: string, kind: ScheduledAction["kind"]) {
  if (result === "connection") return { ok: true, text: "Connection request sent. The next step has been scheduled automatically." };
  if (result === "message") return { ok: true, text: "Message sent. The next step has been scheduled automatically." };
  if (result === "already-connected") return { ok: true, text: "This lead is already connected. The sequence advanced to the next step." };
  if (result === "action-claimed") return { ok: true, text: "This action is already being processed." };
  if (result === "invite-limit") return { ok: false, text: "Today’s connection-request limit has been reached. The action was rescheduled." };
  if (result === "invite-cooldown") return { ok: false, text: "New invitations are paused after LinkedIn rejected several attempts. This action remains scheduled; Send connection now will try again." };
  if (result === "invite-spaced") return { ok: false, text: "Another connection request went out in the last few minutes. This one was rescheduled to keep sending human-paced." };
  if (result === "message-limit") return { ok: false, text: "Today’s message limit has been reached. The action was rescheduled." };
  if (result === "message-before-connection") return { ok: false, text: "The connection must be accepted before this message can be sent." };
  if (result === "awaiting-connection") return { ok: false, text: "LinkedIn still shows this connection as pending. The message will send once they accept." };
  return { ok: false, text: `${kind === "connection" ? "Connection request" : "Message"} was not sent yet (${result.replaceAll("-", " ")}).` };
}

function shortStamp(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function TimelineRow({ item, label, timeZone, enrollmentId, onMessageSaved }: {
  item: ScheduledAction["timeline"][number];
  label: string;
  timeZone: string;
  enrollmentId?: string;
  onMessageSaved?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  // Later messages only: the step running next is edited under "Next up".
  const editable =
    Boolean(enrollmentId) &&
    item.kind === "message" &&
    item.id !== "lead-replied" &&
    item.status === "upcoming";
  const dot =
    item.status === "completed"
      ? "bg-emerald-500"
      : item.status === "scheduled"
        ? "bg-[#ba3871] ring-4 ring-[#ba3871]/15"
        : item.status === "cancelled"
          ? "bg-zinc-300"
          : "border border-zinc-300 bg-white";
  const when = item.at
    ? item.status === "scheduled"
      ? shortStamp(item.at, timeZone)
      : item.estimated
        ? `~${dateLabel(item.at, timeZone)}`
        : item.status === "completed"
          ? shortStamp(item.at, timeZone)
          : ""
    : item.status === "completed"
      ? "Done"
      : "";
  const note = item.status === "completed" || item.status === "scheduled" ? "" : item.note || "";

  return (
    <li className="flex items-start gap-3 py-2" title={item.at ? `${dateLabel(item.at, timeZone, true)} · ${timeLabel(item.at, timeZone)}` : undefined}>
      <span className={`mt-[5px] h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <span className={`block truncate text-[13px] leading-[18px] ${item.status === "completed" ? "text-zinc-900" : item.status === "scheduled" ? "font-medium text-[#ba3871]" : "text-zinc-400"}`}>
          {label}
          {item.status === "scheduled" ? <span className="ml-1.5 text-[11px] font-normal text-[#ba3871]/70">Next</span> : null}
        </span>
        {note ? <span className="block text-[11px] leading-4 text-zinc-400">{note}</span> : null}
        {editable && enrollmentId ? (
          editing ? (
            <MessageEditor
              enrollmentId={enrollmentId}
              stepId={item.id}
              initial={item.message || ""}
              edited={item.edited}
              onDone={(saved) => {
                setEditing(false);
                if (saved) onMessageSaved?.();
              }}
            />
          ) : (
            <div className="mt-1.5">
              {item.message ? (
                <p className="line-clamp-3 whitespace-pre-wrap text-[12px] leading-[17px] text-zinc-600">{item.message}</p>
              ) : (
                <p className="text-[11px] leading-4 text-zinc-400">AI writes this one when it is due.</p>
              )}
              <div className="mt-1 flex items-center gap-2">
                <button type="button" onClick={() => setEditing(true)} className="cursor-pointer text-[11px] font-semibold text-[#ba3871] hover:underline">
                  {item.message ? "Edit message" : "Write it yourself"}
                </button>
                {item.edited ? <span className="text-[11px] text-zinc-400">Written by you</span> : null}
              </div>
            </div>
          )
        ) : null}
      </div>
      {when ? <span className={`shrink-0 text-[11px] leading-[18px] tabular-nums ${item.status === "scheduled" ? "text-[#ba3871]" : "text-zinc-400"}`}>{when}</span> : null}
    </li>
  );
}

const PROGRESS_STEPS = ["Invited", "Accepted", "Messaged", "Replied"];

function OutreachProgress({ stage }: { stage: number }) {
  return (
    <div className="grid grid-cols-4 gap-1.5" aria-label={`Outreach progress: ${PROGRESS_STEPS[stage - 1] || "not contacted"}`}>
      {PROGRESS_STEPS.map((step, index) => {
        const reached = index < stage;
        return (
          <div key={step}>
            <div className={`h-1 rounded-full ${reached ? (stage === 4 ? "bg-emerald-500" : "bg-[#ba3871]") : "bg-zinc-200"}`} />
            <p className={`mt-1.5 text-[11px] ${reached ? "font-medium text-zinc-800" : "text-zinc-400"}`}>{step}</p>
          </div>
        );
      })}
    </div>
  );
}

export function OutreachPanelHeader({ lead, subtitle, actions }: {
  lead: Lead;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar lead={lead} size="lg" />
      <div className="min-w-0 flex-1">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold leading-5 text-zinc-950">
          <span className="truncate">{lead.name}</span>
          <span className="shrink-0 text-[11px] font-medium tabular-nums text-zinc-400" aria-label={`Fit score ${lead.fitScore || 0}`}>
            Fit {lead.fitScore || 0}
          </span>
        </h2>
        <p className="mt-0.5 truncate text-xs text-zinc-500">{subtitle}</p>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </div>
  );
}

export function OutreachSection({ title, children, first, action }: { title: string; children: ReactNode; first?: boolean; action?: ReactNode }) {
  return (
    <section className={first ? "" : "mt-5 border-t border-zinc-100 pt-5"}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold text-zinc-900">{title}</h3>
        {action}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

// The messages sent to this lead and their replies, loaded when opened.
function LeadConversation({ leadId, timeZone }: { leadId: string; timeZone: string }) {
  const [messages, setMessages] = useState<ConversationMessage[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getLeadConversationAction(leadId)
      .then((result) => {
        if (!cancelled) setMessages(unwrapAction(result));
      })
      .catch((loadError) => {
        if (!cancelled) setError(userFacingError(loadError, "The conversation could not be loaded."));
      });
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  if (error) return <p className="text-xs leading-5 text-amber-700">{error}</p>;
  if (!messages) return <p className="text-xs text-zinc-400">Loading conversation…</p>;
  if (!messages.length) return <p className="text-xs text-zinc-500">No messages yet.</p>;
  return (
    <ol className="flex max-h-[420px] flex-col gap-3 overflow-y-auto">
      {messages.map((message) => {
        const outbound = message.direction === "outbound";
        return (
          <li key={message.id} className={`flex flex-col ${outbound ? "items-end" : "items-start"}`}>
            <p className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-[13px] leading-5 ${outbound ? "bg-zinc-100 text-zinc-900" : "border border-zinc-200 bg-white text-zinc-700"}`}>
              {message.body}
            </p>
            <span className="mt-1 text-[11px] text-zinc-400">
              {message.senderName || (outbound ? "You" : "Them")} · {shortStamp(message.createdAt, timeZone)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// Progress for one lead. Once something was sent or they replied, a toggle
// swaps the steps for the actual conversation in the same spot, so the thread
// is one click away without cluttering the panel.
export function OutreachProgressSection({ leadId, items, timeZone, stage, first, enrollmentId, onMessageSaved }: {
  leadId: string;
  items: ScheduledAction["timeline"];
  timeZone: string;
  stage?: number;
  first?: boolean;
  enrollmentId?: string;
  onMessageSaved?: () => void;
}) {
  const [showConversation, setShowConversation] = useState(false);
  const hasConversation = items.some((item) => item.kind === "message" && item.status === "completed");
  return (
    <OutreachSection
      title={showConversation ? "Conversation" : "Progress"}
      first={first}
      action={
        hasConversation ? (
          <button
            type="button"
            onClick={() => setShowConversation((open) => !open)}
            className="cursor-pointer text-[11px] font-semibold text-[#ba3871] hover:underline"
          >
            {showConversation ? "Hide conversation" : "View conversation"}
          </button>
        ) : null
      }
    >
      {showConversation ? (
        <LeadConversation leadId={leadId} timeZone={timeZone} />
      ) : (
        <OutreachTimeline items={items} timeZone={timeZone} stage={stage} enrollmentId={enrollmentId} onMessageSaved={onMessageSaved} />
      )}
    </OutreachSection>
  );
}

export function OutreachTimeline({ items, timeZone, stage, enrollmentId, onMessageSaved }: {
  items: ScheduledAction["timeline"];
  timeZone: string;
  stage?: number;
  // Set when the rows belong to a live enrollment, which makes unsent
  // messages editable.
  enrollmentId?: string;
  onMessageSaved?: () => void;
}) {
  let messageNumber = 0;
  const labels = items.map((item) =>
    item.id === "lead-replied"
      ? "They replied"
      : item.kind === "connection"
        ? "Connection request"
        : `Message ${++messageNumber}`,
  );
  return (
    <div>
      {stage !== undefined ? <OutreachProgress stage={stage} /> : null}
      <ol className={stage !== undefined && items.length ? "mt-3" : ""}>
        {items.map((item, index) => (
          <TimelineRow key={item.id} item={item} label={labels[index]} timeZone={timeZone} enrollmentId={enrollmentId} onMessageSaved={onMessageSaved} />
        ))}
      </ol>
    </div>
  );
}

export function CloseButton({ onClose, label }: { onClose: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      className="grid h-8 w-8 cursor-pointer place-items-center text-zinc-400 transition-colors hover:text-zinc-900"
    >
      <span className="material-symbols-outlined ms-size-20" aria-hidden="true">close</span>
    </button>
  );
}

// Inline editor for one unsent sequence message of a lead. Saved text goes out
// exactly as written, in place of the agent's template or the AI draft. Saving
// it empty ("Reset") hands the step back to the template or AI.
function MessageEditor({ enrollmentId, stepId, initial, edited, onDone }: {
  enrollmentId: string;
  stepId: string;
  initial: string;
  edited?: boolean;
  onDone: (saved: boolean) => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const [saving, startSaving] = useTransition();

  function save(body: string) {
    const formData = new FormData();
    formData.set("enrollmentId", enrollmentId);
    formData.set("stepId", stepId);
    formData.set("body", body);
    setError("");
    startSaving(async () => {
      try {
        unwrapAction(await saveScheduledMessageAction(formData));
        onDone(true);
        router.refresh();
      } catch (saveError) {
        setError(userFacingError(saveError, "The message could not be saved."));
      }
    });
  }

  return (
    <div className="mt-2">
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={5}
        maxLength={1900}
        autoFocus
        aria-label="Message"
        placeholder="Write the message you want to send"
        className="w-full resize-y rounded-lg border border-zinc-300 bg-white p-3 text-[13px] leading-5 text-zinc-900 outline-none focus:border-[#ba3871]"
      />
      <p className="mt-1 text-[11px] leading-4 text-zinc-500">Sent exactly as written. {draft.length}/1900</p>
      {error ? <p className="mt-2 text-xs leading-5 text-amber-700">{error}</p> : null}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => save(draft)} disabled={saving || !draft.trim()} className="dark-keep-brand h-8 rounded-md bg-[#ba3871] px-3 text-xs font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save message"}</button>
        <button type="button" onClick={() => onDone(false)} disabled={saving} className="h-8 rounded-md border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700">Cancel</button>
        {edited ? (
          <button type="button" onClick={() => save("")} disabled={saving} className="ml-auto h-8 rounded-md px-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-60">Reset to agent message</button>
        ) : null}
      </div>
    </div>
  );
}

function ActionMessage({ action, disabled, onSaved }: { action: ScheduledAction; disabled: boolean; onSaved?: () => void }) {
  const [editing, setEditing] = useState(false);
  const editable = action.editableMessage;

  if (editing && editable) {
    return (
      <MessageEditor
        enrollmentId={action.id}
        stepId={editable.stepId}
        initial={editable.body}
        edited={action.timeline.some((item) => item.id === editable.stepId && item.edited)}
        onDone={(saved) => {
          setEditing(false);
          if (saved) onSaved?.();
        }}
      />
    );
  }

  return (
    <>
      <p className="mt-3 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white p-3 text-[13px] leading-5 text-zinc-700">{action.message}</p>
      {editable ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={disabled}
          className="mt-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[14px]">edit</span>Edit message
        </button>
      ) : null}
    </>
  );
}

export function ActionDetails({ action, siblings, onSelectSibling, timeZone, pending, confirming, confirmingStop, feedback, onConfirm, onCancel, onRun, onConfirmStop, onCancelStop, onStop, onClose, bare, showTimeline, variant = "panel", hideCompany, intro, stage, onMessageSaved }: {
  action: ScheduledAction;
  siblings: ScheduledAction[];
  onSelectSibling: (action: ScheduledAction) => void;
  timeZone: string;
  pending: boolean;
  confirming: boolean;
  confirmingStop: boolean;
  feedback?: { ok: boolean; text: string };
  onConfirm: () => void;
  onCancel: () => void;
  onRun: () => void;
  onConfirmStop: () => void;
  onCancelStop: () => void;
  onStop: () => void;
  onClose?: () => void;
  bare?: boolean;
  showTimeline?: boolean;
  variant?: "panel" | "inline";
  hideCompany?: boolean;
  intro?: ReactNode;
  // 0 not contacted, 1 invited, 2 accepted, 3 messaged, 4 replied.
  stage?: number;
  // For views that load outreach client-side and must refetch after an edit.
  onMessageSaved?: () => void;
}) {
  if (!action.lead) return null;
  const inline = variant === "inline";
  const showIdentity = !inline;
  const firstName = action.lead.name.split(" ")[0] || "this lead";
  const stopButton = !confirmingStop ? (
    <button
      type="button"
      onClick={onConfirmStop}
      disabled={pending}
      className="h-8 cursor-pointer rounded-lg px-2.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      Stop outreach
    </button>
  ) : null;

  return (
    <aside className={`flex min-h-0 flex-col overflow-hidden ${inline ? "" : bare ? "h-full max-h-full" : "m3-card m3-card-elevated m3-card-lg h-full"}`}>
      <div className={`min-h-0 flex-1 ${inline ? "" : "overflow-y-auto p-5"}`}>
        {showIdentity ? (
          <OutreachPanelHeader
            lead={action.lead}
            subtitle={hideCompany ? action.lead.title : [action.lead.title, action.lead.company].filter(Boolean).join(" · ")}
            actions={<>{stopButton}{onClose ? <CloseButton onClose={onClose} label="Close action details" /> : null}</>}
          />
        ) : (
          <div className="mb-2 flex justify-end gap-1">
            {stopButton}
            {onClose ? <CloseButton onClose={onClose} label="Hide outreach details" /> : null}
          </div>
        )}

        {confirmingStop ? (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
            <p className="text-xs font-semibold text-zinc-900">Stop outreach for {firstName}?</p>
            <p className="mt-1 text-[11px] leading-4 text-zinc-500">
              {siblings.length > 1
                ? "Nothing else will be sent in any campaign for this person."
                : "Nothing else will be sent to this person."}
            </p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={onStop} disabled={pending} className="h-8 rounded-md bg-zinc-900 px-3 text-xs font-semibold text-white disabled:opacity-60">
                {pending ? "Stopping…" : "Yes, stop outreach"}
              </button>
              <button type="button" onClick={onCancelStop} disabled={pending} className="h-8 rounded-md border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700">
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {siblings.length > 1 ? (
          <div className={`${showIdentity ? "mt-4" : ""} flex flex-wrap gap-1.5`}>
            {siblings.map((sibling) => (
              <button
                key={sibling.id}
                type="button"
                onClick={() => onSelectSibling(sibling)}
                className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                  sibling.id === action.id
                    ? "bg-[#f8e8ef] text-[#ba3871]"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {sibling.campaign || "Campaign"}
              </button>
            ))}
          </div>
        ) : null}

        {intro ? <div className="mt-5">{intro}</div> : null}

        <div className={inline ? "grid gap-4 lg:grid-cols-2" : ""}>
          {showTimeline ? (
            <OutreachProgressSection
              key={action.lead.id}
              leadId={action.lead.id}
              items={action.timeline}
              timeZone={timeZone}
              stage={stage}
              first={inline}
              enrollmentId={action.isReply ? undefined : action.id}
              onMessageSaved={onMessageSaved}
            />
          ) : null}

          <OutreachSection title={action.isReply ? "Their reply" : "Next up"} first={inline || (!showTimeline && !intro)}>
            <p className="text-sm font-medium text-zinc-900">{action.title}</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {action.awaitingConnection ? "When they accept the connection request" : `${dateLabel(action.at, timeZone, true)} · ${timeLabel(action.at, timeZone)}`}
            </p>
            <ActionMessage key={action.id} action={action} disabled={pending} onSaved={onMessageSaved} />

            {inline ? <p className="mt-3 text-xs text-zinc-500">{action.campaign || "Campaign"}</p> : null}

            {feedback ? <p className={`mt-3 rounded-lg px-3 py-2 text-xs leading-5 ${feedback.ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{feedback.text}</p> : null}
            {action.blockedReason ? <p className="mt-3 text-xs leading-5 text-amber-700">{action.blockedReason}</p> : null}

            {confirming ? (
              <div className="mt-3 rounded-lg border border-[#eac4d5] bg-[#fff7fa] p-3">
                <p className="text-xs font-semibold text-zinc-900">Send this live on LinkedIn now?</p>
                <p className="mt-1 text-[11px] leading-4 text-zinc-500">This skips the timer and cannot be undone.</p>
                <div className="mt-3 flex gap-2"><button type="button" onClick={onRun} disabled={pending} className="dark-keep-brand h-8 rounded-md bg-[#ba3871] px-3 text-xs font-semibold text-white disabled:opacity-60">{pending ? "Sending…" : "Yes, send now"}</button><button type="button" onClick={onCancel} disabled={pending} className="h-8 rounded-md border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700">Cancel</button></div>
              </div>
            ) : (
              <button type="button" onClick={onConfirm} disabled={!action.canRunNow || pending} className={`dark-keep-brand mt-3 flex h-9 items-center justify-center gap-2 rounded-lg bg-[#ba3871] text-[13px] font-semibold text-white transition hover:bg-[#a92f65] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 ${inline ? "min-w-[10rem] px-3" : "w-full"}`}><span className="material-symbols-outlined text-[16px]">send</span>{action.kind === "connection" ? "Send connection now" : action.isReply ? "Send reply now" : "Send message now"}</button>
            )}
          </OutreachSection>
        </div>
      </div>
    </aside>
  );
}
