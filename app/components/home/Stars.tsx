const STAR_PATH =
  'M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.9L12 17.4 5.8 21l1.6-6.9L2.2 9.5l6.9-.6z';
const STAR_KEYS = ['s0', 's1', 's2', 's3', 's4'];

/** A row of rating stars — reused by the About block and testimonials. */
export function Stars({
  total = 5,
  filled = 5,
  size = 24,
  className = 'pel-stars',
}: {
  total?: number;
  filled?: number;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={className}
      role="img"
      aria-label={`${filled} out of ${total} stars`}
    >
      {STAR_KEYS.slice(0, total).map((key, i) => (
        <svg
          key={key}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={i < filled ? 0 : 1.6}
          aria-hidden="true"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}
