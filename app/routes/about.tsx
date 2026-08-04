import type {Route} from './+types/about';
import {AboutPage} from '~/components/about/AboutPage';
import {seoMeta, siteOrigin} from '~/lib/seo';
import aboutStyles from '~/styles/about.css?url';

export const meta: Route.MetaFunction = ({location, matches}) =>
  seoMeta({
    title: 'Por El Deporte | About',
    description:
      'Since 2014 we have been playing, watching, and hanging out in Key Biscayne. This is our story.',
    url: `${siteOrigin(matches)}${location.pathname}`,
    image:
      'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/20241117_PorElDeporte_acajiga-406_1.jpg?v=1755707550&width=1200',
  });

export const links: Route.LinksFunction = () => [
  {rel: 'stylesheet', href: aboutStyles},
];

export default function About() {
  return <AboutPage />;
}
