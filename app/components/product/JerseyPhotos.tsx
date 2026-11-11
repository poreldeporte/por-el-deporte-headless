import {JERSEY_COLORS, type JERSEY_STYLES} from '~/lib/jersey';

export type JerseyPhotoView = 'front' | 'back' | 'kit' | 'shorts' | 'detail';

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
      className={`jersey-photos${styles.length === 2 ? ' jersey-photos--pair' : ''}`}
    >
      {styles.map((style) => {
        const home = style.color === JERSEY_COLORS[0];
        const color = home ? 'home' : 'away';
        const sleeve = style.sleeve === 'Short sleeve' ? 'short' : 'long';
        const shorts = view === 'shorts' || view === 'detail';
        const file = shorts
          ? `${color}-shorts${view === 'detail' ? '-detail' : ''}`
          : `${color}-${sleeve}-${view}`;
        const src = `/jersey/cutouts/${file}`;
        const alt = shorts
          ? `${home ? 'Cream home' : 'Black away'} shorts${view === 'detail' ? ', diamond panel and crest detail' : ', front'}`
          : `${home ? 'Orange home' : 'Black away'} ${style.sleeve.toLowerCase()} ${view === 'kit' ? 'jersey with matching shorts' : `jersey, ${view}`}${view === 'back' ? ', sample VIOLA 10 personalization' : ''}`;
        return (
          <img
            key={style.value}
            src={`${src}-640.webp`}
            srcSet={`${src}-160.webp 160w, ${src}-640.webp 640w, ${src}-1024.webp 1024w`}
            sizes={sizes}
            width={1024}
            height={1024}
            alt={decorative ? '' : alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        );
      })}
    </span>
  );
}

export function SocksPhoto({color}: {color: string}) {
  return (
    <span
      className="jersey-photo-placeholder"
      aria-label={`${color} socks photo coming soon`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8" cy="9" r="1.5" />
        <path d="m3 17 6-5 4 4 3-3 5 5" />
      </svg>
      <small>Photo soon</small>
    </span>
  );
}
