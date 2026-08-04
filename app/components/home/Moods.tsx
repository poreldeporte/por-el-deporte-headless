/**
 * "More Than Just a Team" — full-bleed photo with the four brand-value cards
 * (Community / Respect / Lifestyle / Beyond the Game). Static brand content;
 * a good candidate to move to metaobjects later.
 */
const MOODS = [
  {
    t: 'Community',
    b: 'A place to play, watch, and hang out. We have been putting on games and events in Miami since 2014.',
  },
  {
    t: 'Respect',
    b: 'Play hard, shake hands after. We look after our teammates and the people we play against.',
  },
  {
    t: 'Lifestyle',
    b: 'Football, the beach, and gear you can wear all week. That is pretty much the whole idea.',
  },
  {
    t: 'Beyond the Game',
    b: 'Pickup games, beach days, watch parties. The bits in between are where the friendships happen.',
  },
];

export function Moods() {
  return (
    <section className="pel-moods" aria-label="Our community values">
      <img
        className="pel-moods__bg"
        data-bg-parallax
        src="https://cdn.shopify.com/s/files/1/0548/8492/5487/files/20240609_PorElDeporteFinal_ACajiga-335.jpg?v=1750173740&width=2400"
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
