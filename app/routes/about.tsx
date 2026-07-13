import type {Route} from './+types/about';
import {AboutPage} from '~/components/about/AboutPage';
import {seoMeta, siteOrigin} from '~/lib/seo';
import aboutStyles from '~/styles/about.css?url';

export const meta: Route.MetaFunction = ({location, matches}) =>
  seoMeta({
    title: 'Por El Deporte | About — Built by the Community',
    description:
      'Since 2014, Por El Deporte has been more than a club — a Miami soccer community built in Key Biscayne.',
    url: `${siteOrigin(matches)}${location.pathname}`,
    image:
      'https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-335.jpg?v=1750173740&width=1200',
  });

export const links: Route.LinksFunction = () => [
  {rel: 'stylesheet', href: aboutStyles},
];

export default function About() {
  return <AboutPage />;
}
