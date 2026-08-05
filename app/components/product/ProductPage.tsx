import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {Image, Money, type MappedProductOptions} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {Breadcrumbs} from '~/components/Breadcrumbs';

type Variant = ProductFragment['selectedOrFirstAvailableVariant'];

const STATS = [
  {value: '100%', label: 'Ring-Spun Cotton'},
  {value: '0', label: 'Plastic'},
  {value: '1 WK', label: 'To Your Door'},
  {value: '2014', label: 'Est. Key Biscayne'},
];

const MOMENTS = [
  {id: 'm1', src: 'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/20240609_PorElDeporteFinal_ACajiga-1207.jpg?v=1755704396&width=800', alt: 'Supporters together on match day'},
  {id: 'm2', src: 'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/20240609_PorElDeporteFinal_ACajiga-856.jpg?v=1755701316&width=800', alt: 'Por El Deporte community'},
  {id: 'm3', src: 'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/20241117_PorElDeporte_acajiga-693-2.jpg?v=1755707473&width=800', alt: 'Key Biscayne kickabout'},
  {id: 'm4', src: 'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/20240609_PorElDeporteFinal_ACajiga-225.jpg?v=1755706151&width=800', alt: 'On the pitch in Miami'},
  {id: 'm5', src: 'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/20240609_PorElDeporteFinal_ACajiga-687.jpg?v=1755706282&width=800', alt: 'Club supporters'},
  {id: 'm6', src: 'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/20241117_PorElDeporte_acajiga-7.jpg?v=1755707182&width=800', alt: 'Weekend match'},
  {id: 'm7', src: 'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/20241117_PorElDeporte_acajiga-483.jpg?v=1755707645&width=800', alt: 'Beyond the game'},
  {id: 'm8', src: 'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/20241117_PorElDeporte_acajiga-808.jpg?v=1755707867&width=800', alt: 'Building community'},
];


/**
 * Shopify has no productType or tags set on any product, so the garment kind is
 * inferred from the title. Set real product types in admin and this can read
 * them instead (it would also fix the Shop page's title-derived category chips).
 */
type Kind = 'hoodie' | 'tee' | 'hat' | 'tote' | 'jersey' | 'shorts';
function kindOf(title: string): Kind {
  const t = title.toLowerCase();
  if (t.includes('hoodie')) return 'hoodie';
  if (t.includes('cap') || t.includes('bucket') || t.includes('hat')) return 'hat';
  if (t.includes('tote')) return 'tote';
  if (t.includes('jersey') || t.includes('kit')) return 'jersey';
  if (t.includes('short')) return 'shorts';
  return 'tee';
}

/** Card 2: why you'll actually wear it. Short lines, not a wall of grey text. */
const WEAR: Record<Kind, string[]> = {
  tee: ['Heavyweight cotton that keeps its shape', 'Relaxed cut, true to size', 'Pre-shrunk, so it fits the same in a year', 'Soft enough for the flight home'],
  hoodie: ['Brushed fleece inside, heavy outside', 'Roomy without swimming in it', 'Ribbed cuffs that stay put', 'The one you will reach for all winter'],
  hat: ['Organic cotton twill, no plastic', 'Broken in from the first wear', 'Holds its shape in the sun', 'Adjustable, fits most heads'],
  tote: ['Thick canvas with a flat bottom', 'Handles long enough for a shoulder', 'Takes a full shop or a full kit', 'Washes and keeps going'],
  jersey: ['Match-day fabric that breathes', 'Cut to move, not to cling', 'Colours that hold after the wash', 'The same one the team wears'],
  shorts: ['Light enough to forget you have them on', 'Deep pockets that hold a phone', 'Elastic waist, drawcord if you want it', 'Dries fast after a game'],
};

/** Card 3: the specs, tailored per garment. */
const SPECS: Record<Kind, [string, string][]> = {
  tee: [['Fabric', '100% ring-spun cotton'], ['Weight', 'Heavyweight'], ['Fit', 'Relaxed, pre-shrunk'], ['Collar', 'Double-needle'], ['Neck', 'Twill-taped'], ['Sizes', 'S to 2XL']],
  hoodie: [['Fabric', 'Cotton-rich fleece'], ['Weight', 'Heavyweight'], ['Fit', 'Relaxed'], ['Hood', 'Double-lined'], ['Pocket', 'Front kangaroo'], ['Sizes', 'S to 2XL']],
  hat: [['Fabric', '100% organic cotton twill'], ['Weight', '8 oz'], ['Panels', 'Six, unstructured'], ['Closure', 'Adjustable'], ['Certified', 'GOTS and OEKO-TEX'], ['Fit', 'One size']],
  tote: [['Fabric', '100% cotton canvas'], ['Weight', 'Heavyweight'], ['Base', 'Flat bottom'], ['Handles', 'Shoulder length'], ['Care', 'Machine wash cold'], ['Size', 'One size']],
  jersey: [['Fabric', 'Performance knit'], ['Fit', 'Athletic'], ['Crest', 'Embroidered'], ['Worn by', 'The club, every match day'], ['Care', 'Cold wash, hang dry'], ['Sizes', 'S to 2XL']],
  shorts: [['Fabric', 'Lightweight woven'], ['Fit', 'Athletic'], ['Waist', 'Elastic with drawcord'], ['Pockets', 'Side, deep'], ['Care', 'Machine wash cold'], ['Sizes', 'S to 2XL']],
};

/**
 * The description is authored as a punchy opening line followed by the story.
 * The opener becomes the subtitle under the product name; the rest fills the
 * first info card, which stops that column running twice as long as the others.
 */
function splitDescription(html: string): {lead: string; rest: string} {
  const paras = html.match(/<p[\s\S]*?<\/p>/gi);
  if (!paras || paras.length === 0) return {lead: '', rest: html};
  const strip = (x: string) => x.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const lead = strip(paras[0]);
  if (paras.length === 1) return {lead, rest: ''};
  return {lead, rest: paras.slice(1).join('')};
}

export function ProductPage({
  product,
  selectedVariant,
  productOptions,
}: {
  product: ProductFragment;
  selectedVariant: Variant;
  productOptions: MappedProductOptions[];
}) {
  const {open} = useAside();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  const variantImage = selectedVariant?.image;
  const baseImages = product.images?.nodes?.length ? product.images.nodes : [];
  // Always include the selected variant's image in the gallery — it can sit
  // beyond the fetched product media, in which case findIndex would miss it and
  // the stage would keep showing the wrong colour. Prepending guarantees the
  // gallery can follow the variant.
  const images =
    variantImage && !baseImages.some((im) => im.id === variantImage.id)
      ? [variantImage, ...baseImages]
      : baseImages.length
        ? baseImages
        : variantImage
          ? [variantImage]
          : [];
  const [activeImg, setActiveImg] = useState(0);

  // Keep the gallery in sync with the selected variant: when the shopper picks a
  // different color/variant, jump the stage to that variant's image.
  const variantImageId = variantImage?.id;
  const variantIndex = variantImageId
    ? images.findIndex((im) => im.id === variantImageId)
    : -1;
  useEffect(() => {
    if (variantIndex >= 0) setActiveImg(variantIndex);
  }, [variantImageId, variantIndex]);

  const main = images[activeImg] ?? variantImage ?? images[0];
  const kind = kindOf(product.title);
  const {lead, rest} = splitDescription(product.descriptionHtml ?? '');

  const available = Boolean(selectedVariant?.availableForSale);
  const unitAmount = Number(selectedVariant?.price?.amount ?? 0);
  const currencyCode = selectedVariant?.price?.currencyCode ?? 'USD';
  // Real total: keep cents and honor the variant's currency (was `$${…toFixed(0)}`
  // which rounded $29.99 → "$30" and hardcoded the dollar sign).
  const totalMoney = {amount: (unitAmount * qty).toFixed(2), currencyCode};

  return (
    <div className="pel-pdp">
      <Breadcrumbs
        items={[
          {name: 'Home', href: '/'},
          {name: 'Shop', href: '/collections/all-products'},
          {name: product.title},
        ]}
      />
      <section className="pel-pdp__main">
        {/* Gallery */}
        <div className="pel-pdp__gallery">
          <div className="pel-pdp__stage">
            {main ? (
              <Image data={main} sizes="(min-width: 60em) 640px, 100vw" />
            ) : null}
          </div>
          {images.length > 1 ? (
            <div className="pel-pdp__thumbs">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={img.id ?? i}
                  type="button"
                  className={`pel-pdp__thumb${i === activeImg ? ' is-active' : ''}`}
                  aria-label={`View image ${i + 1}`}
                  onClick={() => setActiveImg(i)}
                >
                  <Image data={img} sizes="160px" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Stat cards */}
        <div className="pel-pdp__stats">
          {STATS.map((s) => (
            <div key={s.label} className="pel-pdp__stat">
              <div className="pel-pdp__stat-value">{s.value}</div>
              <div className="pel-pdp__stat-rule" />
              <div className="pel-pdp__stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Buy panel */}
        <div className="pel-pdp__buy">
          <h1 className="pel-pdp__title">{product.title}</h1>
          {lead ? <p className="pel-pdp__lead">{lead}</p> : null}
          <div className="pel-pdp__price">
            {selectedVariant?.price ? <Money data={selectedVariant.price} /> : null}
            {selectedVariant?.compareAtPrice ? (
              <s className="pel-pdp__compare">
                <Money data={selectedVariant.compareAtPrice} />
              </s>
            ) : null}
          </div>

          {productOptions.map((option) => {
            if (option.optionValues.length === 1) return null;
            const isColor = option.name.toLowerCase().includes('color');
            return (
              <div key={option.name} className="pel-pdp__opt">
                <div className="pel-pdp__opt-label">{option.name}</div>
                <div className={isColor ? 'pel-pdp__swatches' : 'pel-pdp__sizes'}>
                  {option.optionValues.map((value) => {
                    const {name, handle, variantUriQuery, selected, available: avail, exists, isDifferentProduct, swatch} = value;
                    const cls = isColor
                      ? `pel-pdp__swatch${selected ? ' is-active' : ''}`
                      : `pel-pdp__size${selected ? ' is-active' : ''}`;
                    const inner = isColor ? (
                      <>
                        <span
                          className="pel-pdp__swatch-dot"
                          style={{background: swatch?.color || 'var(--pel-sand)'}}
                        />
                        <span className="pel-pdp__swatch-name">{name}</span>
                      </>
                    ) : (
                      name
                    );
                    if (isDifferentProduct) {
                      return (
                        <Link
                          key={option.name + name}
                          className={cls}
                          prefetch="intent"
                          preventScrollReset
                          replace
                          to={`/products/${handle}?${variantUriQuery}`}
                          style={{opacity: avail ? 1 : 0.3}}
                        >
                          {inner}
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={option.name + name}
                        type="button"
                        className={cls}
                        disabled={!exists}
                        style={{opacity: avail ? 1 : 0.35}}
                        onClick={() => {
                          if (!selected) {
                            void navigate(`?${variantUriQuery}`, {
                              replace: true,
                              preventScrollReset: true,
                            });
                          }
                        }}
                      >
                        {inner}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="pel-pdp__fabric">
            <span>Plastic-Free</span>
            <span className="pel-pdp__fabric-div" />
            <span>100% ring-spun cotton</span>
            <span className="pel-pdp__fabric-div" />
            <span>Super-soft heavyweight</span>
          </div>

          <div className="pel-pdp__cart">
            <div className="pel-pdp__qty">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                &minus;
              </button>
              <span>{qty}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>
            <AddToCartButton
              className="pel-pdp__cta"
              disabled={!available}
              onClick={() => open('cart')}
              lines={
                selectedVariant
                  ? [{merchandiseId: selectedVariant.id, quantity: qty}]
                  : []
              }
            >
              {available ? (
                <>
                  Add to Cart <Money data={totalMoney} as="span" />
                </>
              ) : (
                'Sold Out'
              )}
            </AddToCartButton>
          </div>

          <p className="pel-pdp__note">Each purchase powers our Miami community.</p>
        </div>
      </section>

      {/* Info cards */}
      <section className="pel-pdp__info" id="pdp-details">
        <div className="pel-pdp__card">
          <h2 className="pel-pdp__card-title">The Story</h2>
          {rest ? (
            <div
              className="pel-pdp__card-body"
              dangerouslySetInnerHTML={{__html: rest}}
            />
          ) : (
            <p className="pel-pdp__card-body">
              Club gear made by people who actually play. Wear it to the game or
              anywhere else.
            </p>
          )}
          <div className="pel-pdp__card-foot">
            <div>Est. 2014 Key Biscayne</div>
            <div>Every order supports local soccer</div>
          </div>
        </div>

        <div className="pel-pdp__card">
          <h2 className="pel-pdp__card-title">Why You&rsquo;ll Live In It</h2>
          <ul className="pel-pdp__wear">
            {WEAR[kind].map((line) => (
              <li key={line}>
                <svg width="15" height="15" viewBox="0 0 100 100" aria-hidden="true">
                  <path d="M50 0C54 30 70 46 100 50C70 54 54 70 50 100C46 70 30 54 0 50C30 46 46 30 50 0Z" fill="currentColor" />
                </svg>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pel-pdp__card">
          <h2 className="pel-pdp__card-title">The Specs</h2>
          <div className="pel-pdp__specs">
            {SPECS[kind].map(([k, v]) => (
              <div key={k} className="pel-pdp__spec">
                <span className="pel-pdp__spec-k">{k}</span>
                <span className="pel-pdp__spec-v">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beyond the Game */}
      <section className="pel-pdp__beyond" aria-label="Community moments">
        <div className="pel-pdp__moments">
          <div className="pel-pdp__moments-track">
            {[
              ...MOMENTS.map((m) => ({...m, key: `a-${m.id}`, dup: false})),
              ...MOMENTS.map((m) => ({...m, key: `b-${m.id}`, dup: true})),
            ].map((m) => (
              <div key={m.key} className="pel-pdp__moment">
                <img src={m.src} alt={m.dup ? '' : m.alt} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
