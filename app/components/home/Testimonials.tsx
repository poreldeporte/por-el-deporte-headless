import {Stars} from './Stars';

/**
 * "Don't Take Our Word For It" — an auto-scrolling, hover-to-pause marquee of
 * community reviews. Static content for now (a natural future metaobject).
 */
const TESTIMONIALS = [
  {
    t: 'More than merch',
    b: 'You can tell every piece is made by people who actually live this club. The quality is great, and the story behind it means something.',
    n: 'Andres M',
  },
  {
    t: 'Feels like family',
    b: 'Wore the El Clásico Tee to a match and got stopped twice asking where it was from. This community is the real deal.',
    n: 'Tomás R',
  },
  {
    t: 'Softest hoodie I own',
    b: 'The Artisan PED Hoodie is unreal. It has barely left my shoulders since it arrived — and it was on my doorstep within the week.',
    n: 'Nico B',
  },
  {
    t: 'Miami in a shirt',
    b: 'Tropical, clean, and different from anything else in my closet. The island designs are actually original.',
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
      {TESTIMONIALS.map((t) => (
        <article key={t.n} className="pel-testi__card">
          <Stars total={5} filled={5} size={24} className="pel-testi__stars" />
          <h3 className="pel-testi__cardtitle">{t.t}</h3>
          <p className="pel-testi__body">{t.b}</p>
          <div className="pel-testi__name">{t.n}</div>
        </article>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="reviews" className="pel-testi" aria-label="Community reviews">
      <h2 className="pel-testi__title" data-reveal>
        Don&rsquo;t Take Our
        <br />
        Word For It
      </h2>
      <p className="pel-testi__sub" data-reveal>
        Hover to pause · Real words from the PED community
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
