import {Link, NavLink} from 'react-router';
import {CartButton} from '~/components/home/CartButton';
import {PelMarquee, MARQUEE_ITEMS} from '~/components/PelMarquee';

/**
 * The global site header for non-home pages — a solid branded bar. (The homepage
 * uses its own transparent nav layered over the hero.) Uses the shared cart
 * button so the count + drawer behave identically everywhere.
 */
const navClass = ({isActive}: {isActive: boolean}) =>
  isActive ? 'is-active' : undefined;

export function PelHeader() {
  return (
    <header className="pel-siteheader">
      <PelMarquee items={MARQUEE_ITEMS} />
      <div className="pel-siteheader__inner">
        <nav className="pel-siteheader__links" aria-label="Primary">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={navClass}>
            About
          </NavLink>
          <NavLink to="/collections/all-products" className={navClass}>
            Shop
          </NavLink>
        </nav>
        <Link to="/" className="pel-siteheader__logo" aria-label="Por El Deporte — home">
          Por El Deporte
        </Link>
        <div className="pel-siteheader__actions">
          <Link to="/account" className="pel-pill">
            Account
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="8" r="3.4" />
              <path d="M5.5 20c.5-3.5 3.5-5 6.5-5s6 1.5 6.5 5" />
            </svg>
          </Link>
          <CartButton variant="pill" />
        </div>
      </div>
    </header>
  );
}
