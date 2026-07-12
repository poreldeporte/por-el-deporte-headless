const SPARK =
  'M50 0C54 30 70 46 100 50C70 54 54 70 50 100C46 70 30 54 0 50C30 46 46 30 50 0Z';

/** The blue top marquee used across non-home pages (home has its own). */
export function PelMarquee({
  items,
}: {
  items: {id: string; text: string}[];
}) {
  const Group = ({hidden}: {hidden?: boolean}) => (
    <div className="pel-marquee__group" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item.id} style={{display: 'inline-flex', alignItems: 'center', gap: 'inherit'}}>
          <span>{item.text}</span>
          <svg className="pel-marquee__star" width="14" height="14" viewBox="0 0 100 100" aria-hidden="true">
            <path d={SPARK} fill="currentColor" />
          </svg>
        </span>
      ))}
    </div>
  );
  return (
    <div className="pel-marquee pel-marquee--blue">
      <div className="pel-marquee__track">
        <Group />
        <Group hidden />
      </div>
    </div>
  );
}

export const MARQUEE_ITEMS = [
  {id: 'ship', text: 'Free Shipping on All Orders'},
  {id: 'btg', text: 'Beyond the Game'},
  {id: 'week', text: 'On Your Doorstep in 1 Week'},
  {id: 'ship2', text: 'Free Shipping on All Orders'},
  {id: 'btg2', text: 'Beyond the Game'},
  {id: 'week2', text: 'On Your Doorstep in 1 Week'},
];
