const IG = 'https://www.instagram.com/poreldeporte/';
const CDN = 'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/';

type Post = {id: string; rot: number; src: string; alt: string};

const POSTS: Post[] = [
  {id: 'i1', rot: -2.4, src: `${CDN}ped-2025-dad-sitting-cross-legged-in.jpg?v=1785799791&width=700`, alt: 'A dad in the kit laughing as his toddler walks past'},
  {id: 'i2', rot: 1.6, src: `${CDN}ped-2025-three-players-walking-away-together.jpg?v=1785799791&width=700`, alt: 'Three teammates walking away together'},
  {id: 'i3', rot: -1.2, src: `${CDN}ped-2025-young-girl-in-pink-kit.jpg?v=1785801925&width=700`, alt: 'A young supporter up in the banyan tree'},
  {id: 'i4', rot: 2.2, src: `${CDN}ped-2025-two-players-embracing-back-of.jpg?v=1785799791&width=700`, alt: 'Teammates embracing after a goal'},
  {id: 'i5', rot: -1.8, src: `${CDN}ped-2025-player-with-water-bottle-hair.jpg?v=1785799791&width=700`, alt: 'A water break in the shade'},
  {id: 'i6', rot: 1.4, src: `${CDN}ped-2025-bearded-player-walking-past-sunlit.jpg?v=1785801925&width=700`, alt: 'Walking past the sunlit fence line'},
  {id: 'i7', rot: -2.2, src: `${CDN}ped-2025-keeper-sliding-out-as-a.jpg?v=1785799791&width=700`, alt: 'A shot on goal with the Miami skyline behind'},
  {id: 'i8', rot: 1.8, src: `${CDN}ped-2025-teammates-clasping-hands-and-slapping.jpg?v=1785801925&width=700`, alt: 'Hands clasped after the final whistle'},
  {id: 'i9', rot: 2.4, src: `${CDN}ped-2025-player-running-toward-camera-laughing.jpg?v=1785801925&width=700`, alt: 'All smiles mid-stride'},
  {id: 'i10', rot: -1.6, src: `${CDN}ped-2025-player-laughing-in-cream-crest.jpg?v=1785801925&width=700`, alt: 'Laughing on the sideline in the crest tee'},
  {id: 'i11', rot: 1.2, src: `${CDN}ped-2025-back-of-kit-ale-23.jpg?v=1785799791&width=700`, alt: 'Back of the club kit on match day'},
  {id: 'i12', rot: -2, src: `${CDN}ped-2025-bearded-player-standing-relaxed-in.jpg?v=1785801925&width=700`, alt: 'The kit, out in the afternoon light'},
  {id: 'i13', rot: 1.6, src: `${CDN}ped-2025-goalkeeper-fully-extended-in-a.jpg?v=1785799791&width=700`, alt: 'The keeper full stretch for a diving save'},
  {id: 'i14', rot: -2.4, src: `${CDN}ped-2025-goalkeeper-stretched-low-inside-the.jpg?v=1785801925&width=700`, alt: 'Gloves wrapped around it on the line'},
  {id: 'i15', rot: 1.8, src: `${CDN}ped-2025-slide-tackle-one-player-down.jpg?v=1785878274&width=700`, alt: 'A slide tackle at full stretch'},
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
            <div className="pel-ig__inner">
              <img
                className="pel-ig__img"
                src={p.src}
                alt={p.alt}
                loading="lazy"
              />
            </div>
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
