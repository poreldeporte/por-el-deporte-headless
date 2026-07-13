import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : 'Welcome to your account'
    : 'Account';

  return (
    <div className="pel-account">
      <div className="pel-account__inner">
        <div className="pel-account__head">
          <div>
            <div className="pel-legal__eyebrow">Your Account</div>
            <h1 className="pel-account__title">{heading}</h1>
          </div>
          <Logout />
        </div>
        <AccountMenu />
        <div className="pel-account__body">
          <Outlet context={{customer}} />
        </div>
      </div>
    </div>
  );
}

function AccountMenu() {
  const cls = ({isActive}: {isActive: boolean}) =>
    `pel-account__tab${isActive ? ' is-active' : ''}`;

  return (
    <nav className="pel-account__nav" role="navigation" aria-label="Account">
      <NavLink to="/account/orders" className={cls}>
        Orders
      </NavLink>
      <NavLink to="/account/profile" className={cls}>
        Profile
      </NavLink>
      <NavLink to="/account/addresses" className={cls}>
        Addresses
      </NavLink>
    </nav>
  );
}

function Logout() {
  return (
    <Form className="pel-account__logout" method="POST" action="/account/logout">
      <button type="submit">Sign out</button>
    </Form>
  );
}
