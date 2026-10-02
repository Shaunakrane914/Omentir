import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "../comparisons/brand-logo";
import {
  MarketingTable,
  MarketingTd,
  MarketingTh,
  MarketingThead,
  MarketingTr,
} from "../marketing-table";
import type { SeoComparisonTable } from "../seo-content/types";
import type { GuideContrast } from "./types";

const LINK_CLASS =
  "font-medium text-[var(--md-sys-color-primary)] underline decoration-[var(--md-sys-color-primary)]/30 underline-offset-4 hover:text-[var(--md-sys-color-on-surface)]";

export function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match) return <span key={index}>{part}</span>;
    const href = match[2];
    const external = href.startsWith("http://") || href.startsWith("https://");
    if (external) {
      return (
        <a key={index} href={href} target="_blank" rel="noopener" className={LINK_CLASS}>
          {match[1]}
        </a>
      );
    }
    return (
      <Link key={index} href={href} className={LINK_CLASS}>
        {match[1]}
      </Link>
    );
  });
}

/** Stable, unique anchor ids for section headings so the contents list can jump to them. */
export function sectionIds(headings: readonly string[]): string[] {
  const seen = new Map<string, number>();
  return headings.map((heading) => {
    const base =
      heading
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  });
}

export function GuideAnswer({ text }: { text: string }) {
  return (
    <div className="cal-answer">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cal-muted)]">
        Short answer
      </p>
      <p className="mt-2">{renderInline(text)}</p>
    </div>
  );
}

export function GuideContents({
  items,
}: {
  items: ReadonlyArray<{ id: string; label: string }>;
}) {
  return (
    <nav
      aria-label="On this page"
      className="rounded-[24px] border border-[var(--site-border)] p-5 sm:p-6"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cal-muted)]">
        On this page
      </p>
      <ol className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
        {items.map((item, index) => (
          <li key={item.id} className="flex gap-3 text-sm leading-6">
            <span className="w-5 shrink-0 tabular-nums text-[var(--cal-muted)]">{index + 1}</span>
            <a
              href={`#${item.id}`}
              className="text-[var(--md-sys-color-on-surface)] underline-offset-4 hover:text-[var(--cal-blue)] hover:underline"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function HeaderLabel({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2 leading-none">
      <BrandLogo brand={name} size="sm" framed={false} />
      {name}
    </span>
  );
}

export function GuideTable({ table }: { table: SeoComparisonTable }) {
  return (
    <>
      <MarketingTable className="hidden sm:block" minWidthClass="">
        <MarketingThead>
          <tr>
            <MarketingTh>
              <span className="sr-only">Compared on</span>
            </MarketingTh>
            {table.headers.map((header) => (
              <MarketingTh key={header}>
                <HeaderLabel name={header} />
              </MarketingTh>
            ))}
          </tr>
        </MarketingThead>
        <tbody>
          {table.rows.map((row) => (
            <MarketingTr key={row.dimension}>
              <MarketingTh scope="row">{row.dimension}</MarketingTh>
              {row.cells.map((cell, index) => (
                <MarketingTd key={`${row.dimension}-${index}`}>{renderInline(cell)}</MarketingTd>
              ))}
            </MarketingTr>
          ))}
        </tbody>
      </MarketingTable>
      <div className="overflow-hidden rounded-2xl border border-[var(--md-sys-color-outline-variant)] sm:hidden">
        {table.rows.map((row, rowIndex) => (
          <div
            key={row.dimension}
            className={`px-5 py-4 ${rowIndex > 0 ? "border-t border-[var(--md-sys-color-outline-variant)]" : ""}`}
          >
            <h3 className="font-semibold text-[var(--md-sys-color-on-surface)]">{row.dimension}</h3>
            <dl className="mt-3 space-y-3 text-sm leading-6">
              {row.cells.map((cell, index) => (
                <div key={`${row.dimension}-mobile-${index}`}>
                  <dt className="text-[var(--md-sys-color-on-surface-variant)]">
                    <HeaderLabel name={table.headers[index] ?? ""} />
                  </dt>
                  <dd className="mt-1 text-[var(--md-sys-color-on-surface)]">{renderInline(cell)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}

function Mark({ good }: { good: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-1.5 h-4 w-4 shrink-0">
      {good ? (
        <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function GuideContrastCards({ contrast }: { contrast: GuideContrast }) {
  const columns = [
    { good: false, label: contrast.badLabel, items: contrast.bad },
    { good: true, label: contrast.goodLabel, items: contrast.good },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {columns.map((column) => (
        <div
          key={column.label}
          className={
            column.good
              ? "rounded-[24px] bg-[var(--cal-blue-soft)] p-5"
              : "rounded-[24px] border border-dashed border-[var(--md-sys-color-outline)] p-5"
          }
        >
          <p
            className={`text-xs font-semibold uppercase tracking-[0.14em] ${
              column.good ? "text-[var(--cal-blue)]" : "text-[var(--cal-muted)]"
            }`}
          >
            {column.label}
          </p>
          <ul className="mt-3 space-y-3">
            {column.items.map((item) => (
              <li
                key={item}
                className={`flex gap-2.5 text-sm leading-7 ${
                  column.good
                    ? "text-[var(--md-sys-color-on-surface)]"
                    : "text-[var(--md-sys-color-on-surface-variant)]"
                }`}
              >
                <span className={column.good ? "text-[var(--cal-blue)]" : "text-[var(--cal-muted)]"}>
                  <Mark good={column.good} />
                </span>
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function GuideCallout({ text }: { text: string }) {
  return (
    <p className="max-w-2xl rounded-r-2xl border-l-4 border-[var(--cal-blue)] bg-[var(--cal-blue-soft)] px-5 py-4 text-base font-medium leading-7 text-[var(--md-sys-color-on-surface)]">
      {renderInline(text)}
    </p>
  );
}
