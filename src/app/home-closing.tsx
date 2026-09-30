import Image from "next/image";
import Link from "next/link";
import Reveal from "./scroll-reveal";

const MOMENTS = [
  ["Find the right buyers", "/home/outcome-buyers-v2.webp"],
  ["Reach decision-makers", "/home/outcome-decision-makers.webp"],
  ["Start conversations", "/home/outcome-conversations-v2.webp"],
  ["Follow up automatically", "/home/outcome-follow-ups-v2.webp"],
  ["Catch interested replies", "/home/outcome-replies.webp"],
  ["Book more meetings", "/home/outcome-meetings-v2.webp"],
  ["Build your pipeline", "/home/outcome-pipeline-v2.webp"],
  ["Create sales opportunities", "/home/outcome-opportunities-v2.webp"],
] as const;

/** Closing CTA with a slow marquee of photo cards, each with a status pill.
 *  The list is rendered twice so the loop is seamless; the whole strip is
 *  decorative and hidden from assistive tech. */
export default function HomeClosing() {
  return (
    <section aria-labelledby="cal-closing-heading" className="cal-section cal-closing">
      <Reveal className="cal-intro omentir-primary-width">
        <h2 id="cal-closing-heading" className="cal-h2-xl">
          Book meetings. Build your revenue pipeline.
        </h2>
        <p className="cal-lead">
          Omentir finds the right buyers on LinkedIn, starts conversations and follows up so you can
          turn interested replies into booked meetings.
        </p>
        <Link href="/signup" className="site-btn site-btn-primary mt-8">
          Get started
        </Link>
      </Reveal>

      <div className="cal-marquee" aria-hidden="true">
        <div className="cal-marquee-track">
          {[0, 1].map((copy) =>
            MOMENTS.map(([label, src], i) => (
              <div key={`${copy}-${label}`} className={`cal-moment cal-moment-${i + 1}`}>
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 352px, 272px"
                  className="cal-moment-img"
                />
                <p className="cal-moment-pill">{label}</p>
              </div>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
