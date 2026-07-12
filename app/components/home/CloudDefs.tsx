/**
 * The signature Por El Deporte "cloud" sticker shape, as an SVG clip-path.
 * Rendered once (hidden) near the top of the homepage so any element can use
 * `clip-path: url(#pelCloud)`. Uses objectBoundingBox units so it scales to any box.
 */
export function CloudDefs() {
  return (
    <svg width="0" height="0" style={{position: 'absolute'}} aria-hidden="true">
      <defs>
        <clipPath id="pelCloud" clipPathUnits="objectBoundingBox">
          <path d="M0.2,0.9 L0.774,0.9 C0.879,0.9 0.914,0.76 0.862,0.636 C0.94,0.558 0.923,0.356 0.827,0.356 C0.835,0.184 0.705,0.091 0.618,0.216 C0.583,0.076 0.452,0.06 0.409,0.216 C0.348,0.107 0.226,0.138 0.226,0.324 C0.121,0.293 0.077,0.464 0.147,0.589 C0.06,0.667 0.086,0.853 0.2,0.9 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
