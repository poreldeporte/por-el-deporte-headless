import {useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {Image, Money, type MappedProductOptions} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';

type Variant = ProductFragment['selectedOrFirstAvailableVariant'];

const STATS = [
  {value: '100%', label: 'Ring-Spun Cotton'},
  {value: '0', label: 'Plastic'},
  {value: '1 WK', label: 'To Your Door'},
  {value: '2014', label: 'Est. Key Biscayne'},
];

const BEYOND_WORDS = [
  'Matchday rituals',
  'Weekend kickabouts',
  'Your new favorite piece',
  'Built by supporters',
  'Toes in the sand',
];

const MOMENTS = [
  {id: 'm1', src: 'https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-1207.jpg?v=1755704396&width=800', alt: 'Supporters together on match day'},
  {id: 'm2', src: 'https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-856.jpg?v=1755701316&width=800', alt: 'Por El Deporte community'},
  {id: 'm3', src: 'https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-1151.jpg?v=1755704513&width=800', alt: 'Key Biscayne kickabout'},
  {id: 'm4', src: 'https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-225.jpg?v=1755706151&width=800', alt: 'On the pitch in Miami'},
  {id: 'm5', src: 'https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-687.jpg?v=1755706282&width=800', alt: 'Club supporters'},
  {id: 'm6', src: 'https://poreldeporte.com/cdn/shop/files/20241117_PorElDeporte_acajiga-7.jpg?v=1755707182&width=800', alt: 'Weekend match'},
  {id: 'm7', src: 'https://poreldeporte.com/cdn/shop/files/20241117_PorElDeporte_acajiga-483.jpg?v=1755707645&width=800', alt: 'Beyond the game'},
  {id: 'm8', src: 'https://poreldeporte.com/cdn/shop/files/20241117_PorElDeporte_acajiga-808.jpg?v=1755707867&width=800', alt: 'Building community'},
];

function Star() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
    </svg>
  );
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

  const images =
    product.images?.nodes?.length
      ? product.images.nodes
      : selectedVariant?.image
        ? [selectedVariant.image]
        : [];
  const [activeImg, setActiveImg] = useState(0);
  const main = images[activeImg] ?? selectedVariant?.image ?? images[0];

  const available = Boolean(selectedVariant?.availableForSale);
  const unitAmount = Number(selectedVariant?.price?.amount ?? 0);
  const totalLabel = `$${(unitAmount * qty).toFixed(0)}`;

  return (
    <div className="pel-pdp">
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
          <div className="pel-pdp__review">
            <div className="pel-pdp__stars">
              <Star />
              <Star />
              <Star />
              <Star />
              <Star />
            </div>
            <span className="pel-pdp__review-txt">
              &ldquo;Iconic design, insane comfort&rdquo; — supporter review
            </span>
          </div>

          <h1 className="pel-pdp__title">{product.title}</h1>
          <div className="pel-pdp__price">
            {selectedVariant?.price ? <Money data={selectedVariant.price} /> : null}
            {selectedVariant?.compareAtPrice ? (
              <s className="pel-pdp__compare">
                <Money data={selectedVariant.compareAtPrice} />
              </s>
            ) : (
              <span>&nbsp;&bull;&nbsp;100% Cotton</span>
            )}
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
            <span className="pel-pdp__fabric-lead">Plastic-Free</span>
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
              {available ? `Add to Cart — ${totalLabel}` : 'Sold Out'}
            </AddToCartButton>
          </div>

          <p className="pel-pdp__note">Each purchase powers our Miami community.</p>
        </div>
      </section>

      {/* Info cards */}
      <section className="pel-pdp__info" id="pdp-details">
        <div className="pel-pdp__card">
          <h2 className="pel-pdp__card-title">Club Pride</h2>
          {product.descriptionHtml ? (
            <div
              className="pel-pdp__card-body"
              dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
            />
          ) : (
            <p className="pel-pdp__card-body">
              Rep the core of Por El Deporte FC — your ultimate support badge,
              channeling Miami soccer fire.
            </p>
          )}
          <div className="pel-pdp__card-foot">
            <div>Est. 2014 — Key Biscayne</div>
            <div>Every order supports local soccer</div>
          </div>
        </div>

        <div className="pel-pdp__card">
          <h2 className="pel-pdp__card-title">Fabric &amp; Fit</h2>
          <p className="pel-pdp__card-body">
            100% ring-spun cotton — no plastic. Super-soft, breathable heavyweight
            that feels like a hug. Pre-shrunk relaxed fit with a double-needle
            collar and twill-taped neck for unbeatable toughness.
          </p>
        </div>

        <div className="pel-pdp__card">
          <h2 className="pel-pdp__card-title">Details</h2>
          <div className="pel-pdp__specs">
            {[
              ['Fit', 'Relaxed, pre-shrunk'],
              ['Weight', 'Heavyweight'],
              ['Collar', 'Double-needle'],
              ['Neck', 'Twill-taped'],
              ['Sizes', 'S – 2XL'],
            ].map(([k, v]) => (
              <div key={k} className="pel-pdp__spec">
                <span className="pel-pdp__spec-k">{k}</span>
                <span className="pel-pdp__spec-v">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beyond the Game */}
      <section className="pel-pdp__beyond" aria-label="Beyond the game">
        <div className="pel-pdp__beyond-eyebrow">Beyond the Game</div>
        <div className="pel-pdp__beyond-words">
          {BEYOND_WORDS.map((w, i) => (
            <span key={w} className="pel-pdp__beyond-word">
              <span>{w}</span>
              {i < BEYOND_WORDS.length - 1 ? (
                <span className="pel-pdp__cloudchip" aria-hidden="true">
                  <svg viewBox="0 0 1 1" preserveAspectRatio="none">
                    <path d="M0.2,0.9 L0.774,0.9 C0.879,0.9 0.914,0.76 0.862,0.636 C0.94,0.558 0.923,0.356 0.827,0.356 C0.835,0.184 0.705,0.091 0.618,0.216 C0.583,0.076 0.452,0.06 0.409,0.216 C0.348,0.107 0.226,0.138 0.226,0.324 C0.121,0.293 0.077,0.464 0.147,0.589 C0.06,0.667 0.086,0.853 0.2,0.9 Z" fill="var(--pel-cream)" stroke="var(--pel-ink)" strokeWidth="0.03" />
                  </svg>
                  <svg className="pel-pdp__cloudchip-star" viewBox="0 0 100 100">
                    <path d="M50 0C54 30 70 46 100 50C70 54 54 70 50 100C46 70 30 54 0 50C30 46 46 30 50 0Z" fill="currentColor" />
                  </svg>
                </span>
              ) : null}
            </span>
          ))}
        </div>
        <div className="pel-pdp__moments">
          <div className="pel-pdp__moments-track">
            {[...MOMENTS, ...MOMENTS].map((m, i) => (
              <div key={`${m.id}-${i}`} className="pel-pdp__moment">
                <img src={m.src} alt={i < MOMENTS.length ? m.alt : ''} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
