/**
 * Colour swatches for product options.
 *
 * Shopify only produces a `swatch.color` for option values that are linked to a
 * taxonomy metaobject. Ours aren't — every option value in the catalog returns
 * `swatch: null` — so the PDP was painting every dot with the same neutral
 * fallback. Ivory looked correct by coincidence; Bay, Stone, Black and White
 * were all sand.
 *
 * These hexes are not guesses. Each one is the dominant garment colour sampled
 * from the actual variant mockups on the CDN (opaque pixels only, quantised to
 * collapse compression noise), so the dot matches the photograph the customer is
 * looking at. Every colour was cross-checked across every product that offers
 * it and they agreed to within a couple of units:
 *
 *   Ivory  #F4EACD  5 mockups, #f4e9ca–#f5ecd3
 *   Bay    #B5BBA9  3 mockups, identical (a sage seafoam, not a blue)
 *   White  #F5F5F5  3 mockups, identical
 *   Black  #0F0F0F  shorts
 *   Stone  #DBC3AC  bucket hat
 *
 * If swatches are ever configured properly in Shopify, that data wins — see
 * swatchColor(). Add a new colour here when the catalog gains one; anything
 * unmapped renders as a name-only pill rather than a wrong colour.
 */
const SAMPLED: Readonly<Record<string, string>> = {
  ivory: '#F4EACD',
  bay: '#B5BBA9',
  white: '#F5F5F5',
  black: '#0F0F0F',
  stone: '#DBC3AC',
};

/**
 * The colour to paint an option value's dot, or null if we genuinely don't know.
 * Shopify's own swatch takes precedence so this file never has to be the source
 * of truth once the catalog carries it.
 */
export function swatchColor(
  name: string,
  shopifySwatch?: {color?: string | null} | null,
): string | null {
  if (shopifySwatch?.color) return shopifySwatch.color;
  return SAMPLED[name.trim().toLowerCase()] ?? null;
}
