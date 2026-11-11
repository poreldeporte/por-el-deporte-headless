import {JERSEY_COLORS, type JERSEY_STYLES} from '~/lib/jersey';

// Imported assets receive content hashes and Oxygen's direct CDN URLs.
const photos = import.meta.glob<string>('/app/assets/jersey/*/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

export type JerseyPhotoView =
  'front' | 'back' | 'kit' | 'shorts' | 'detail' | 'action';

export function JerseyPhotos({
  styles,
  view,
  sizes = '(min-width: 60em) 40vw, 100vw',
  priority = false,
  decorative = false,
}: {
  styles: typeof JERSEY_STYLES;
  view: JerseyPhotoView;
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
}) {
  return (
    <span
      className={`jersey-photos${styles.length === 2 ? ' jersey-photos--pair' : ''}${view === 'action' ? ' jersey-photos--action' : ''}`}
    >
      {styles.map((style) => {
        const home = style.color === JERSEY_COLORS[0];
        const color = home ? 'home' : 'away';
        const sleeve = style.sleeve === 'Short sleeve' ? 'short' : 'long';
        const shorts = view === 'shorts' || view === 'detail';
        const action = view === 'action';
        const file = action
          ? `${color}-action`
          : shorts
            ? `${color}-shorts${view === 'detail' ? '-detail' : ''}`
            : `${color}-${sleeve}-${view}`;
        const src = `${action ? 'action' : 'cutouts'}/${file}`;
        const alt = action
          ? `Player wearing the ${home ? 'orange home' : 'black away'} short-sleeve jersey and matching shorts on the field`
          : shorts
            ? `${home ? 'Cream home' : 'Black away'} shorts${view === 'detail' ? ', diamond panel and crest detail' : ', front'}`
            : `${home ? 'Orange home' : 'Black away'} ${style.sleeve.toLowerCase()} ${view === 'kit' ? 'jersey with matching shorts' : `jersey, ${view}`}${view === 'back' ? ', sample VIOLA 10 personalization' : ''}`;
        return (
          <img
            key={style.value}
            {...photoSources(src)}
            sizes={sizes}
            width={1024}
            height={action ? 1536 : 1024}
            alt={decorative ? '' : alt}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
          />
        );
      })}
    </span>
  );
}

export function SocksPhoto({
  color,
  view = 'pair',
  sizes = '72px',
}: {
  color: string;
  view?: 'pair' | 'detail';
  sizes?: string;
}) {
  const src = `socks/${color.toLowerCase()}-${view}`;
  return (
    <img
      className="jersey-socks-photo"
      {...photoSources(src)}
      sizes={sizes}
      alt={`${color} PED socks with orange island logos${view === 'detail' ? ', knit and logo detail' : ', one pair'}`}
      loading="lazy"
      decoding="async"
    />
  );
}

function photoSources(path: string) {
  const url = (width: number) =>
    photos[`/app/assets/jersey/${path}-${width}.webp`];
  return {
    src: url(640),
    srcSet: [160, 320, 640, 1024]
      .map((width) => `${url(width)} ${width}w`)
      .join(', '),
  };
}
