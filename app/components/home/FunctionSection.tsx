import type {CSSProperties} from 'react';
import {Link} from 'react-router';

/**
 * "You Asked, We Delivered" — the Artisan PED Hoodie feature: an overlapping
 * product cluster flanked by floating cloud "sticker" callouts.
 * Product images are brand PNGs (Shopify-hosted); the cluster reveals with a
 * stagger and the clouds gently float (CSS) + fade in (anime.js via useHomeReveal).
 */
const CDN = 'https://poreldeporte.com/cdn/shop/files';

const CLUSTER: {
  img: string;
  alt: string;
  wrap: CSSProperties;
  inner: CSSProperties;
  imgTransform: string;
  dx: number;
  dy: number;
}[] = [
  {
    img: `${CDN}/artisan-ped-hoodie-4463316.png?v=1757600942&width=700`,
    alt: 'Artisan PED Hoodie — back',
    wrap: {width: '300px', height: '400px', marginRight: '-110px'},
    inner: {transform: 'rotate(-9deg) translateY(26px)'},
    imgTransform: 'scale(1.12)',
    dx: -90,
    dy: 0,
  },
  {
    img: `${CDN}/artisan-ped-hoodie-9133088.png?v=1757600942&width=900`,
    alt: 'Artisan PED Hoodie',
    wrap: {width: '370px', height: '480px', zIndex: 2},
    inner: {},
    imgTransform: 'none',
    dx: 0,
    dy: 72,
  },
  {
    img: `${CDN}/the-island-bucket-9731644.png?v=1755720072&width=700`,
    alt: 'The Island Bucket',
    wrap: {width: '300px', height: '380px', zIndex: 1, marginLeft: '-115px'},
    inner: {transform: 'translateY(14px)'},
    imgTransform: 'scale(1.32) translateY(4%)',
    dx: 0,
    dy: 60,
  },
  {
    img: `${CDN}/por-el-deporte-cap-1609335.png?v=1755720071&width=700`,
    alt: 'Por El Deporte Cap',
    wrap: {width: '280px', height: '340px', marginLeft: '-125px'},
    inner: {transform: 'rotate(9deg) translateY(30px)'},
    imgTransform: 'scale(1.28) translateY(7%)',
    dx: 120,
    dy: 0,
  },
];

const CLOUDS: {pos: CSSProperties; text: string}[] = [
  {pos: {left: '5%', top: '10%', width: '200px', height: '158px'}, text: 'Our first-ever official hoodie'},
  {pos: {right: '5%', top: '12%', width: '210px', height: '165px'}, text: 'Crafted for unbeatable softness'},
  {pos: {left: '1%', top: '52%', width: '195px', height: '152px'}, text: 'An original for the PED community'},
  {pos: {right: '2%', top: '54%', width: '195px', height: '152px'}, text: 'Designed & worn in Miami'},
  {pos: {left: '4%', bottom: '2%', width: '205px', height: '160px'}, text: 'Free shipping — on your doorstep in 1 week'},
  {pos: {right: '4%', bottom: '1%', width: '205px', height: '160px'}, text: 'Every purchase powers our Miami community'},
];

const HOODIE_URL = '/products/artisan-ped-hoodie';

export function FunctionSection() {
  return (
    <section className="pel-function" aria-label="The Artisan PED Hoodie">
      <div className="pel-function__head">
        <h2 className="pel-function__title" data-reveal>
          You Asked,
          <br />
          We Delivered
        </h2>
        <p className="pel-function__sub" data-reveal>
          The Artisan PED Hoodie — our first-ever official hoodie, an homage to our
          Key Biscayne roots.
        </p>
        <div className="pel-function__cta" data-reveal>
          <Link to={HOODIE_URL} className="pel-btn-outline">
            Shop Hoodie
          </Link>
          <Link to={HOODIE_URL} className="pel-icon-btn" aria-label="Shop the hoodie">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M7 17L17 7M8.5 7H17v8.5" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="pel-cluster" data-reveal-stagger>
        {CLUSTER.map((c) => (
          <div
            key={c.alt}
            className="pel-cluster__item"
            style={c.wrap}
            data-reveal-item
            data-dx={c.dx}
            data-dy={c.dy}
            data-scale="0.82"
          >
            <div className="pel-cluster__inner" style={c.inner}>
              <img
                src={c.img}
                alt={c.alt}
                loading="lazy"
                style={{transform: c.imgTransform}}
              />
            </div>
          </div>
        ))}
      </div>

      {CLOUDS.map((cloud) => (
        <div key={cloud.text} className="pel-cloud" style={cloud.pos} data-reveal>
          <div className="pel-cloud__float">
            <div className="pel-cloud__shadow" />
            <div className="pel-cloud__body">
              <span>{cloud.text}</span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
