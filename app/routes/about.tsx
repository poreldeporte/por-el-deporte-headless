import type {Route} from './+types/about';
import {AboutPage} from '~/components/about/AboutPage';
import aboutStyles from '~/styles/about.css?url';

export const meta: Route.MetaFunction = () => [
  {title: 'Por El Deporte | About — Built by the Community'},
  {
    name: 'description',
    content:
      'Since 2014, Por El Deporte has been more than a club — a Miami soccer community built in Key Biscayne.',
  },
];

export const links: Route.LinksFunction = () => [
  {rel: 'stylesheet', href: aboutStyles},
];

export default function About() {
  return <AboutPage />;
}
