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
 */
const VOICES = [
  {
    t: 'More than merch',
    b: 'You can tell every piece is made by people who actually live this club, and the story behind it means something.',
    n: 'Andres M',
  },
  {
    t: 'Feels like family',
    b: 'Wore the crest to a match and got stopped twice asking where it was from. This community is the real deal.',
    n: 'Tomás R',
  },
  {
    t: 'Sundays on the island',
    b: 'Half of us met on that pitch. Now it is the group chat, the weekend, the whole thing.',
    n: 'Nico B',
  },
  {
    t: 'Miami in a shirt',
    b: 'Tropical, clean, and different from anything else out there. The island designs actually feel like home.',
    n: 'Sofía L',
  },
  {
    t: 'Proud to rep the shield',
    b: 'Been following PED since the Key Biscayne days. Wearing the crest means being part of something bigger than a team.',
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
        Hover to pause · Voices from the PED community
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
