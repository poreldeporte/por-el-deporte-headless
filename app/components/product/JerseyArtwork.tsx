export function JerseyArtwork({
  away,
  back,
  shorts,
  personalize,
  name,
  number,
}: {
  away: boolean;
  back: boolean;
  shorts: boolean;
  personalize: boolean;
  name: string;
  number: string;
}) {
  const shirt = away ? '#242522' : '#e96026';
  return (
    <svg
      viewBox="0 0 440 510"
      role="img"
      aria-label={`${away ? 'Black away' : 'Orange home'} jersey illustration${back ? (personalize ? `, back: ${name || 'your name'} ${number || '10'}` : ', plain back') : ', front'}${shorts ? ' with shorts' : ''}`}
    >
      <defs>
        <pattern
          id="jersey-diamonds"
          width="28"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 8 14 0 28 8 14 16Z" fill="#f7f0de" />
        </pattern>
        <linearGradient id="jersey-shade" x1="0" x2="1">
          <stop stopColor="#000" stopOpacity=".12" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".04" />
          <stop offset="1" stopColor="#000" stopOpacity=".15" />
        </linearGradient>
        <filter id="jersey-shadow" x="-40%" width="180%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodOpacity=".14" />
        </filter>
      </defs>
      <g
        transform={shorts ? 'translate(45 0) scale(.8)' : 'translate(0 38)'}
        filter="url(#jersey-shadow)"
      >
        <path
          d="m167 48-61 22-67 86 61 43 32-37-9 205q97 19 194 0l-9-205 32 37 61-43-67-86-61-22Z"
          fill={shirt}
          stroke="#171717"
          strokeOpacity=".2"
        />
        {!back && (
          <path d="M151 54h37v321l-37-3Z" fill="url(#jersey-diamonds)" />
        )}
        <path
          d="m167 48-13 9 42 42 24-23 24 23 42-42-13-9q-53 31-106 0Z"
          fill="#1a1c1a"
          stroke="#f7f0de"
          strokeWidth="2"
        />
        <path
          d="M133 163 123 367q97 19 194 0l-9-204M106 71l27 92m201-92-26 92"
          fill="none"
          stroke="#000"
          strokeOpacity=".12"
          strokeWidth="2"
        />
        <path
          d="m39 156 61 43 6-10-59-43Zm301 43 61-43-8-10-59 43Z"
          fill="#1a1c1a"
        />
        {back && personalize ? (
          <g
            fill="#f7f0de"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontWeight="800"
          >
            <text
              x="220"
              y="151"
              fontSize={name.length > 10 ? '17' : '21'}
              letterSpacing="2"
            >
              {name || 'YOUR NAME'}
            </text>
            <text x="220" y="300" fontSize="138" letterSpacing="-8">
              {number || '10'}
            </text>
          </g>
        ) : !back ? (
          <g>
            <path
              d="M252 117h31v25q-15 22-31 0Z"
              fill="#f7f0de"
              stroke="#171717"
              strokeWidth="2"
            />
            <path d="M260 119v29m15-29v29" stroke={shirt} strokeWidth="5" />
            <text
              x="267"
              y="134"
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
              fontWeight="900"
              fontSize="9"
              fill="#171717"
            >
              PED
            </text>
          </g>
        ) : null}
        <path
          d="m167 48-61 22-67 86 61 43 32-37-9 205q97 19 194 0l-9-205 32 37 61-43-67-86-61-22Z"
          fill="url(#jersey-shade)"
        />
      </g>
      {shorts && (
        <g filter="url(#jersey-shadow)">
          <path
            d="M141 325h158l23 138-87 9-15-83-15 83-87-9Z"
            fill={away ? '#242522' : '#f4eee0'}
            stroke="#171717"
            strokeOpacity=".25"
          />
          <path d="M141 325h158v12H141Z" fill={away ? '#171717' : '#ded8cc'} />
          <path d="m279 337 20-2 22 127-25 3Z" fill="url(#jersey-diamonds)" />
          <path
            d="M216 335v17m8-17v17"
            stroke={away ? '#f7f0de' : '#171717'}
            strokeWidth="2"
          />
        </g>
      )}
    </svg>
  );
}
