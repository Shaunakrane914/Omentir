import CustomerLogoWall from "./customer-logo-wall";
import { PROOF_STATS } from "./proof-data";
import Reveal from "./scroll-reveal";

const STATS = PROOF_STATS;

/** Customer results band: large numbers on soft gradient cards, then logos. */
export default function HomeResults() {
  return (
    <section aria-labelledby="cal-results-heading" className="cal-section">
      <Reveal className="cal-intro omentir-primary-width">
        <h2 id="cal-results-heading" className="cal-h2-xl">
          Real customers. Real numbers.
        </h2>
      </Reveal>
      <div className="omentir-primary-width">
        <Reveal className="cal-results">
          {STATS.map((stat) => (
            <div key={stat.label} className="cal-result">
              <p className="cal-result-value">{stat.value}</p>
              <p className="cal-result-label">{stat.label}</p>
              <p className="cal-muted">{stat.note}</p>
            </div>
          ))}
        </Reveal>
      </div>
      <CustomerLogoWall />
    </section>
  );
}
