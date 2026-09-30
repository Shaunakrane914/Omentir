import FaqAccordion, { type FaqItem } from "./faq-accordion";

/** FAQ block for marketing pages: a centered serif heading and the question
 *  list in a cream rounded panel. */
export default function FaqSplitSection({
  items,
  className,
  widthClass = "omentir-primary-width",
}: {
  items: readonly FaqItem[];
  className?: string;
  widthClass?: string;
}) {
  return (
    <section
      id="faq"
      className={`${widthClass} min-w-0 scroll-mt-24 ${className ?? ""}`}
    >
      <div className="cal-faq-panel">
        <h2 className="cal-faq-heading">Frequently asked questions</h2>
        <div className="cal-faq-list">
          <FaqAccordion items={items} />
        </div>
      </div>
    </section>
  );
}
