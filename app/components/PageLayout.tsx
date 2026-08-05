import {Await, useLocation} from 'react-router';
import {Suspense} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {PelHeader} from '~/components/PelHeader';
import {PelFooter} from '~/components/PelFooter';
import {CartButton} from '~/components/home/CartButton';
import {CommunityPanel} from '~/components/home/CommunityPanel';
import {CartMain} from '~/components/CartMain';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({cart, children = null}: PageLayoutProps) {
  // Only the homepage carries its own transparent nav over a full-bleed hero;
  // every other page gets the solid branded PelHeader. (About used to be in this
  // list because it cloned that hero — it now uses the design's subpage banner,
  // which sits BELOW the standard header, same as the Shop banner.) The branded
  // footer, cart FAB, and cloud clip-path defs are global.
  const {pathname} = useLocation();
  const ownsHero = pathname === '/';

  return (
    <Aside.Provider>
      {/* The cart drawer is the only aside the branded chrome can open. The
          skeleton's search and mobile-menu asides were never wired to a trigger
          — PelHeader shows all three nav links inline, even at 360px — so they
          only ever rendered off-screen. Dropping them also removes the stock
          menu's links from every page's HTML; they pointed at empty Shopify
          pages, which was the site's only crawl path to them. */}
      <CartAside cart={cart} />
      {!ownsHero && <PelHeader />}
      <main>{children}</main>
      <PelFooter />
      {/* `pel-fabs` marks the floating buttons so mobile CSS can hide them on
          pages that keep a sticky header (its CART pill is always reachable, so
          the FAB is redundant there and only ends up covering content). The
          homepage keeps them: its nav is absolutely positioned over the hero and
          scrolls away, so the FAB is the only cart access once you scroll. */}
      <div className={ownsHero ? 'pel-fabs' : 'pel-fabs pel-fabs--redundant'}>
        <CommunityPanel />
        <CartButton variant="fab" />
      </div>
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}
