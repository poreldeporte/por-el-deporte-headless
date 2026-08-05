import {Link} from 'react-router';

/**
 * Visible breadcrumb trail.
 *
 * Google's ecommerce guidance asks for a hierarchical link structure (menu ->
 * category -> product) and specifically for real `<a href>` links rather than
 * JavaScript navigation, because it reads the links between pages to work out
 * site structure and relative page importance. This gives every product and
 * collection page a crawlable path back up the hierarchy, and pairs with the
 * BreadcrumbList JSON-LD emitted from each route's meta().
 *
 * The last crumb is the current page and is not a link (matching the JSON-LD,
 * where the final ListItem omits `item` so Google infers the current URL).
 */
export type Crumb = {name: string; href?: string};

export function Breadcrumbs({items}: {items: Crumb[]}) {
  if (items.length < 2) return null;
  return (
    <nav className="pel-crumbs" aria-label="Breadcrumb">
      <ol className="pel-crumbs__list">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.name} className="pel-crumbs__item">
              {last || !c.href ? (
                <span aria-current={last ? 'page' : undefined}>{c.name}</span>
              ) : (
                <Link to={c.href} prefetch="intent">
                  {c.name}
                </Link>
              )}
              {last ? null : (
                <span className="pel-crumbs__sep" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
