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
import {CommunityPanel} from '~/components/home/CommunityPanel';
import {CartMain} from '~/components/CartMain';
import {useScrollMotion} from '~/components/motion/useScrollMotion';

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

  // Scroll motion for the whole site. It used to be called from _index and
  // ShopPage only, which is why everything else sat still.
  useScrollMotion();

  return (
    <Aside.Provider>
      {/* The cart drawer is the only aside the branded chrome can open. The
          skeleton's search and mobile-menu asides were never wired to a trigger
          — PelHeader shows all three nav links inline, even at 360px — so they
          only ever rendered off-screen. Dropping them also removes the stock
          menu's links from every page's HTML; they pointed at empty Shopify
          pages, which was the site's only crawl path to them. */}
      <CartAside cart={cart} />
      {/* The homepage gets the same header, fixed and revealed on scroll, so
          it is never left without navigation once the hero is gone. */}
      <PelHeader floating={ownsHero} />
      <main>{children}</main>
      <PelFooter />
      {/* Cart lives in the sticky header, which is now on every page including
          the homepage, so a floating cart button was a second control for the
          same thing in the same viewport. The community panel keeps the corner
          — it has no other entry point. */}
      <div className="pel-fabs">
        <CommunityPanel />
      </div>
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Suspense
      fallback={
        <Aside type="cart" heading="YOUR BAG">
          <p>Loading cart ...</p>
        </Aside>
      }
    >
      <Await resolve={cart}>
        {(resolved) => {
          const count = resolved?.totalQuantity ?? 0;
          // The reference names the contents rather than the container: "3 items
          // in your bag" tells you something, "CART" repeats the icon you clicked.
          const heading =
            count > 0
              ? `${count} ITEM${count === 1 ? '' : 'S'} IN YOUR BAG`
              : 'YOUR BAG';
          return (
            <Aside type="cart" heading={heading}>
              <CartMain cart={resolved} layout="aside" />
            </Aside>
          );
        }}
      </Await>
    </Suspense>
  );
}
