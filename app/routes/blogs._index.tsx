import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blogs._index';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import type {BlogsQuery} from 'storefrontapi.generated';
import {BlogBanner} from '~/components/blog/BlogBanner';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {breadcrumbLd, seoMeta, siteOrigin} from '~/lib/seo';

type BlogNode = BlogsQuery['blogs']['nodes'][0];

export const meta: Route.MetaFunction = ({location, matches}) => {
  const origin = siteOrigin(matches);
  return [
    ...seoMeta({
      title: 'Por El Deporte | Journal',
      description:
        'Match reports, tournaments, and days on the island from the Por El Deporte community.',
      url: `${origin}${location.pathname}`,
    }),
    breadcrumbLd(origin, [{name: 'Home', href: '/'}, {name: 'Journal'}]),
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {blogs};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Blogs() {
  const {blogs} = useLoaderData<typeof loader>();

  return (
    <div className="pel-journal">
      <BlogBanner
        eyebrow="From the Club"
        title="Journal"
        sub="Match reports, tournaments, and days on the island."
      />
      <Breadcrumbs items={[{name: 'Home', href: '/'}, {name: 'Journal'}]} />
      <div className="pel-journal__inner">
        <div className="pel-journal__blogs">
          <PaginatedResourceSection<BlogNode> connection={blogs}>
            {({node: blog}) => (
              <Link
                className="pel-journal__blog"
                key={blog.handle}
                prefetch="intent"
                to={`/blogs/${blog.handle}`}
              >
                <span>{blog.title}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M7 17L17 7M8.5 7H17v8.5" />
                </svg>
              </Link>
            )}
          </PaginatedResourceSection>
        </div>
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
` as const;
