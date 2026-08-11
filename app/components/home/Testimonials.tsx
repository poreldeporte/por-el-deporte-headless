/**
 * "What the Club Says" — an auto-scrolling, hover-to-pause marquee of voices
 * from the PED community.
 *
 * Deliberately NOT product reviews. There is no review system behind this, so
 * star ratings and review framing came out: the FTC's rule on consumer reviews
 * and testimonials covers exactly this kind of static, store-authored content,
 * and a "5 stars, Andres M" card is a claim the store can't back. What's left is
 * community sentiment about the club — no ratings, no product-performance or
 * delivery-speed claims, and nothing marked up as schema.org/Review, so Google
 * never treats it as a rating signal either.
 *
 * If real reviews arrive later (a Shopify review app, or a metaobject the team
 * fills in), that's when ratings and aggregateRating markup can come back.
 *
 * Written to sound said rather than written: short, specific, and without the
 * tells that gave the first pass away — "the real deal", "means something",
 * "something bigger than a team". People do not summarise their own feelings
 * that neatly out loud.
 */
const VOICES = [
  {
    t: 'First one there',
    b: 'I show up an hour before we play just to sit around. That is half of why I come.',
    n: 'Andres M',
  },
  {
    t: 'Got asked twice',
    b: 'Wore the crest to a match and two people stopped me about it. Told them both where to look.',
    n: 'Tomás R',
  },
  {
    t: 'The group chat',
    b: 'Half of us met on that pitch. Now it is birthdays, weddings, the whole thing.',
    n: 'Nico B',
  },
  {
    t: 'Looks like here',
    b: 'Most kit could be from anywhere. This one actually looks like Miami.',
    n: 'Sofía L',
  },
  {
    t: 'Since the beginning',
    b: 'Been around since the Key Biscayne days. Still show up, still wear it.',
    n: 'Diego F',
  },
];

function Group({hidden}: {hidden?: boolean}) {
  return (
    <div className="pel-testi__group" aria-hidden={hidden || undefined}>
      {VOICES.map((v) => (
        <article key={v.n} className="pel-testi__card">
          <h3 className="pel-testi__cardtitle">{v.t}</h3>
          <p className="pel-testi__body">{v.b}</p>
          <div className="pel-testi__name">{v.n}</div>
        </article>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section
      id="community"
      className="pel-testi"
      aria-label="Voices from the community"
    >
      <h2 className="pel-testi__title" data-reveal>
        What the Club
        <br />
        Says
      </h2>
      <p className="pel-testi__sub" data-reveal>
        From people who play with us. Hover to pause.
      </p>
      <div className="pel-testi__wrap">
        <div className="pel-testi__track">
          <Group />
          <Group hidden />
        </div>
      </div>
    </section>
  );
}
