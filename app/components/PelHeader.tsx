import {useEffect, useState} from 'react';
import {Link, NavLink} from 'react-router';
import {CartButton} from '~/components/home/CartButton';
import {PelLogoMark} from '~/components/PelLogo';
import {PelMarquee, MARQUEE_ITEMS} from '~/components/PelMarquee';

/**
 * The global site header for non-home pages — a solid branded bar. (The homepage
 * uses its own transparent nav layered over the hero.) Uses the shared cart
 * button so the count + drawer behave identically everywhere.
 */
const navClass = ({isActive}: {isActive: boolean}) =>
  isActive ? 'is-active' : undefined;

export function PelHeader({floating = false}: {floating?: boolean} = {}) {
  // The homepage has no header of its own — its nav is absolutely positioned
  // over the hero and scrolls away, leaving nothing to navigate or reach the
  // cart with. In `floating` mode the same header is fixed off-screen and slides
  // in once the hero is behind you, so every page keeps a header at all times.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!floating) return;
    let ticking = false;
    const read = () => {
      ticking = false;
      setShown(window.scrollY > window.innerHeight * 0.7);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, [floating]);

  const className = floating
    ? `pel-siteheader pel-siteheader--floating${shown ? ' is-shown' : ''}`
    : 'pel-siteheader';

  return (
    <header className={className}>
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
        <Link to="/" className="pel-siteheader__logo" aria-label="Por El Deporte home">
          <PelLogoMark height={46} />
        </Link>
        <div className="pel-siteheader__actions">
          <Link to="/account" className="pel-pill pel-hide-mobile">
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
