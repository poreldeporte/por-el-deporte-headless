import {redirect} from 'react-router';
import {JERSEY_HANDLE} from '~/lib/jersey';

export function loader() {
  return redirect(`/products/${JERSEY_HANDLE}`);
}
