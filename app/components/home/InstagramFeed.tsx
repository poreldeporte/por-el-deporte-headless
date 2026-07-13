const IG = 'https://www.instagram.com/poreldeporte/';
const CDN = 'https://poreldeporte.com/cdn/shop/files/';
const A = (id: string, v: string) =>
  `${CDN}20240609_PorElDeporteFinal_ACajiga-${id}.jpg?v=${v}&width=700`;

type Post =
  | {kind: 'photo'; id: string; rot: number; src: string; alt: string; product?: boolean}
  | {kind: 'say'; id: string; rot: number; tone: 'green' | 'light'; title: string; name: string; body: string};

const POSTS: Post[] = [
  {kind: 'photo', id: 'i1', rot: -2.4, src: A('888', '1755704548'), alt: 'Community members together after a match'},
  {kind: 'photo', id: 'i2', rot: 1.6, src: A('1207', '1755704396'), alt: 'Supporters on match day'},
  {kind: 'photo', id: 'i3', rot: -1.2, src: `${CDN}palmas-kit-462846.png?v=1736430527&width=533`, alt: '“Palmas” Jersey', product: true},
  {kind: 'say', id: 'i4', rot: 2.2, tone: 'green', title: 'Feels like family', name: 'Tomás R.', body: 'Wore the crest to a match and got stopped twice asking where it was from.'},
  {kind: 'photo', id: 'i5', rot: -1.8, src: A('856', '1755701316'), alt: 'Por El Deporte community'},
  {kind: 'photo', id: 'i6', rot: 1.4, src: `${CDN}artisan-ped-hoodie-9133088.png?v=1757600942&width=533`, alt: 'Artisan PED Hoodie', product: true},
  {kind: 'photo', id: 'i7', rot: -2.2, src: `${CDN}20241117_PorElDeporte_acajiga-7.jpg?v=1755707182&width=700`, alt: 'Sharing mate on the sideline'},
  {kind: 'photo', id: 'i8', rot: 1.8, src: A('1151', '1755704513'), alt: 'Kickabout in Key Biscayne'},
  {kind: 'photo', id: 'i9', rot: 2.4, src: `${CDN}la-isla-tee-511237.png?v=1713839421&width=533`, alt: 'La Isla Tee', product: true},
  {kind: 'say', id: 'i10', rot: -1.6, tone: 'light', title: 'We give back', name: 'Por el deporte', body: 'Every purchase funds local matches, events, and youth soccer.'},
  {kind: 'photo', id: 'i11', rot: 1.2, src: A('1017_1', '1755704655'), alt: 'Club member in a Por El Deporte bucket hat'},
  {kind: 'photo', id: 'i12', rot: -2, src: `${CDN}the-island-bucket-9731644.png?v=1755720072&width=533`, alt: 'The Island Bucket hat', product: true},
  {kind: 'photo', id: 'i13', rot: 1.6, src: A('225', '1755706151'), alt: 'On the pitch in Miami'},
  {kind: 'photo', id: 'i14', rot: -2.4, src: `${CDN}ocean-sunset-tee-382023.png?v=1736430528&width=533`, alt: 'The Ocean Tee', product: true},
];

export function InstagramFeed() {
  return (
    <section className="pel-ig" aria-label="From the feed">
      <div className="pel-ig__head" data-reveal>
        <div className="pel-ig__badge" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2c.6 4.8 2.4 6.9 7.2 7.5v1c-4.8.6-6.6 2.7-7.2 7.5h-1c-.6-4.8-2.4-6.9-7.2-7.5v-1C8.6 8.9 10.4 6.8 11 2h1z" />
          </svg>
        </div>
        <h2 className="pel-ig__title">From the Feed</h2>
        <a href={IG} target="_blank" rel="noopener noreferrer" className="pel-ig__handle">
          @poreldeporte on Instagram
        </a>
      </div>

      <div className="pel-ig__grid">
        {POSTS.map((p) => (
          <a
            key={p.id}
            href={IG}
            target="_blank"
            rel="noopener noreferrer"
            className="pel-ig__card"
            style={{transform: `rotate(${p.rot}deg)`}}
            aria-label="View this post on Instagram"
          >
            {p.kind === 'photo' ? (
              <div className="pel-ig__inner">
                <img
                  className={p.product ? 'pel-ig__img pel-ig__img--product' : 'pel-ig__img'}
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                />
              </div>
            ) : (
              <div className={`pel-ig__inner pel-ig__inner--say pel-ig__inner--${p.tone}`}>
                <span className="pel-ig__say-title">{p.title}</span>
                <span>
                  <span className="pel-ig__say-name">{p.name}</span>
                  <span className="pel-ig__say-body">{p.body}</span>
                </span>
              </div>
            )}
          </a>
        ))}
      </div>

      <div className="pel-ig__foot">
        <a href={IG} target="_blank" rel="noopener noreferrer" className="pel-btn-outline pel-ig__follow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" stroke="none" />
          </svg>
          Follow @poreldeporte
        </a>
      </div>
    </section>
  );
}
