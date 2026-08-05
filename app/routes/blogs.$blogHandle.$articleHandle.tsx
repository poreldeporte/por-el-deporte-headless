import {useLoaderData} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle.$articleHandle';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {breadcrumbLd, seoMeta, siteOrigin} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data, location, matches}) => {
  const origin = siteOrigin(matches);
  const article = data?.article;
  const title = article?.title ?? 'Journal';
  const url = `${origin}${location.pathname}`;
  // Strip the body down to a description when the article has no SEO one set.
  const excerpt = article?.contentHtml
    ? article.contentHtml
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 155)
    : undefined;

  return [
    ...seoMeta({
      title: `Por El Deporte | ${title}`,
      description: article?.seo?.description || excerpt,
      url,
      image: article?.image?.url,
      type: 'article',
    }),
    // BlogPosting rather than Article: it's the specific type, and Google reads
    // headline/datePublished/author/image from it for the Article rich result.
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        url,
        mainEntityOfPage: {'@type': 'WebPage', '@id': url},
        datePublished: article?.publishedAt,
        image: article?.image?.url ? [article.image.url] : undefined,
        author: article?.author?.name
          ? {'@type': 'Person', name: article.author.name}
          : undefined,
        publisher: {
          '@type': 'Organization',
          name: 'Por El Deporte',
          logo: origin
            ? {'@type': 'ImageObject', url: `${origin}/icon-512.png`}
            : undefined,
        },
        description: article?.seo?.description || excerpt,
      },
    },
    breadcrumbLd(origin, [
      {name: 'Home', href: '/'},
      {name: 'Journal', href: '/blogs'},
      {name: title},
    ]),
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
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;

  return {article};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Article() {
  const {article} = useLoaderData<typeof loader>();
  const {title, image, contentHtml, author} = article;

  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <div className="pel-article">
      <Breadcrumbs
        items={[
          {name: 'Home', href: '/'},
          {name: 'Journal', href: '/blogs'},
          {name: title},
        ]}
      />
      <article className="pel-article__inner">
        <header className="pel-article__head">
          <div className="pel-article__meta">
            <time dateTime={article.publishedAt}>{publishedDate}</time>
            {author?.name ? (
              <>
                <span aria-hidden="true">&middot;</span>
                <address>{author.name}</address>
              </>
            ) : null}
          </div>
          <h1 className="pel-article__title">{title}</h1>
        </header>

        {image ? (
          <div className="pel-article__media">
            <Image data={image} sizes="(min-width: 900px) 860px, 92vw" loading="eager" />
          </div>
        ) : null}

        <div
          className="pel-prose pel-article__body"
          dangerouslySetInnerHTML={{__html: contentHtml}}
        />
      </article>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
` as const;
