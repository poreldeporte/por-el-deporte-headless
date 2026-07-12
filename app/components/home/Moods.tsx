/**
 * "More Than Just a Team" — full-bleed photo with the four brand-value cards
 * (Community / Respect / Lifestyle / Beyond the Game). Static brand content;
 * a good candidate to move to metaobjects later.
 */
const MOODS = [
  {
    t: 'Community',
    b: 'Building a vibrant Miami soccer community where fans connect through shared events, matches, and passion for the game since 2014.',
  },
  {
    t: 'Respect',
    b: 'Honoring the spirit of fair play — valuing opponents, teammates, and soccer traditions in every aspect of our club.',
  },
  {
    t: 'Lifestyle',
    b: 'Embracing an active, healthy lifestyle inspired by tropical Miami vibes, blending soccer passion with everyday comfort in our gear.',
  },
  {
    t: 'Beyond the Game',
    b: 'Pickup matches, beach days, and watch parties — the moments in between where teammates become lifelong friends.',
  },
];

export function Moods() {
  return (
    <section className="pel-moods" aria-label="Our community values">
      <img
        className="pel-moods__bg"
        data-bg-parallax
        src="https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-1294.jpg?v=1755702679&width=2400"
        alt=""
        aria-hidden="true"
      />
      <div className="pel-moods__overlay" />

      <div className="pel-moods__head">
        <h2 className="pel-moods__title" data-reveal>
          More Than Just a Team.
          <br />
          This Is a Community.
        </h2>
        <p className="pel-moods__sub" data-reveal>
          The values of camaraderie and mutual support have shaped everything we do
          since 2014.
        </p>
      </div>

      <div className="pel-moods__grid" data-reveal-stagger>
        {MOODS.map((m, i) => (
          <div
            key={m.t}
            className="pel-mood"
            data-reveal-item
            data-dy="64"
            data-scale="1"
            data-rot={i % 2 ? 4 : -4}
          >
            <h3 className="pel-mood__t">{m.t}</h3>
            <p className="pel-mood__b">{m.b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
