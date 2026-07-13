import {useState} from 'react';
import {Link} from 'react-router';
import {PelLogoMark} from '~/components/PelLogo';

/**
 * The Por El Deporte site footer: scallop top edge, the big "Become Part of the
 * Story" statement with a newsletter card and cloud photos, a nav grid, and legal.
 * Built to be reusable — Increment 6 lifts this into the global layout for all pages.
 */

type FooterLink = {t: string; to?: string; href?: string};
const FOOTER_COLS: {h: string; items: FooterLink[]}[] = [
  {
    h: 'Shop',
    items: [
      {t: '“Palmas” Jersey', to: '/products/kit-launch'},
      {t: 'Tropical Tees', to: '/collections/all-tees'},
      {t: 'Hats & Totes', to: '/collections/all-products'},
      {t: 'Official Kits', to: '/collections/2022-kits'},
      {t: 'All Products', to: '/collections/all-products'},
    ],
  },
  {
    h: 'Club',
    items: [
      {t: 'Our Mission', to: '/about'},
      {t: 'Gallery', to: '/about'},
      {t: 'Join the Revolution', to: '/about'},
    ],
  },
  {
    h: 'Follow',
    items: [
      {t: 'Instagram', href: 'https://www.instagram.com/poreldeporte/'},
      {t: '@poreldeporte', href: 'https://www.instagram.com/poreldeporte/'},
    ],
  },
  {
    h: 'Account',
    items: [
      {t: 'Log In', to: '/account'},
      {t: 'View Cart', to: '/cart'},
      {t: 'Search', to: '/search'},
    ],
  },
  {
    h: 'Legal',
    items: [
      {t: 'Refund Policy', to: '/policies/refund-policy'},
      {t: 'Privacy Policy', to: '/policies/privacy-policy'},
    ],
  },
];

function FooterLinkEl({item}: {item: FooterLink}) {
  if (item.href) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" className="pel-footer__link">
        {item.t}
      </a>
    );
  }
  return (
    <Link to={item.to ?? '#'} className="pel-footer__link">
      {item.t}
    </Link>
  );
}

function NewsletterCard() {
  const [notified, setNotified] = useState(false);
  return (
    <form
      className="pel-newsletter"
      onSubmit={(e) => {
        e.preventDefault();
        setNotified(true);
      }}
    >
      <input
        className="pel-newsletter__input"
        type="email"
        required
        placeholder="ENTER YOUR EMAIL..."
        aria-label="Email address"
      />
      <button type="submit" className="pel-newsletter__btn">
        {notified ? 'You’re In!' : 'Notify Me'}
      </button>
    </form>
  );
}

export function PelFooter() {
  return (
    <footer id="site-footer" className="pel-footer" aria-label="Footer">
      <div className="pel-footer__scallop" aria-hidden="true" />
      <div className="pel-footer__body">
        <div className="pel-footer__lead">
          <Link to="/" className="pel-footer__logo" aria-label="Por El Deporte — home">
            <PelLogoMark height={70} />
          </Link>
          <div className="pel-footer__hero">
            <h2 className="pel-footer__big" data-reveal>
              Become Part
              <br />
              of the Story
            </h2>
            <NewsletterCard />
            <div className="pel-footer__cloud pel-footer__cloud--l">
              <div className="pel-footer__cloud-shadow" />
              <div className="pel-footer__cloud-frame">
                <img
                  src="https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-888.jpg?v=1755704548&width=700"
                  alt="La Isla Tee"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="pel-footer__cloud pel-footer__cloud--r">
              <div className="pel-footer__cloud-shadow" />
              <div className="pel-footer__cloud-frame">
                <img
                  src="https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-1017_1.jpg?v=1755704655&width=700"
                  alt="Por El Deporte Cap"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

        <nav className="pel-footer__nav" aria-label="Footer">
          {FOOTER_COLS.map((col) => (
            <div key={col.h} className="pel-footer__col">
              <div className="pel-footer__colh">{col.h}</div>
              <div className="pel-footer__links">
                {col.items.map((item) => (
                  <FooterLinkEl key={item.t} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="pel-footer__copy">
          ©2026 Por El Deporte. All Rights Reserved.
        </div>
        <div className="pel-footer__rule" />
        <p className="pel-footer__legal">
          Founded in 2014 in Key Biscayne, FL. Free shipping on all orders — every
          tee or hat you snag supports our community: building events, uniting fans,
          and spreading sunny soccer passion. Eco-friendly 100% cotton.
        </p>
      </div>
    </footer>
  );
}
