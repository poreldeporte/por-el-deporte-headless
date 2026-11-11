import {JERSEY_COLORS, type JERSEY_STYLES} from '~/lib/jersey';

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
        const src = `/jersey/${action ? 'action' : 'cutouts'}/${file}`;
        const alt = action
          ? `Player wearing the ${home ? 'orange home' : 'black away'} short-sleeve jersey and matching shorts on the field`
          : shorts
            ? `${home ? 'Cream home' : 'Black away'} shorts${view === 'detail' ? ', diamond panel and crest detail' : ', front'}`
            : `${home ? 'Orange home' : 'Black away'} ${style.sleeve.toLowerCase()} ${view === 'kit' ? 'jersey with matching shorts' : `jersey, ${view}`}${view === 'back' ? ', sample VIOLA 10 personalization' : ''}`;
        return (
          <img
            key={style.value}
            src={`${src}-640.webp`}
            srcSet={`${src}-160.webp 160w, ${src}-640.webp 640w, ${src}-1024.webp 1024w`}
            sizes={sizes}
            width={1024}
            height={action ? 1536 : 1024}
            alt={decorative ? '' : alt}
            loading={priority ? 'eager' : 'lazy'}
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
  priority = false,
}: {
  color: string;
  view?: 'pair' | 'detail';
  sizes?: string;
  priority?: boolean;
}) {
  const src = `/jersey/socks/${color.toLowerCase()}-${view}`;
  return (
    <img
      className="jersey-socks-photo"
      src={`${src}-640.webp`}
      srcSet={`${src}-160.webp 160w, ${src}-640.webp 640w, ${src}-1024.webp 1024w`}
      sizes={sizes}
      alt={`${color} PED socks with orange island logos${view === 'detail' ? ', knit and logo detail' : ', one pair'}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
