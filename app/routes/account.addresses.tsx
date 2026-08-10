import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import type {
  AddressFragment,
  CustomerFragment,
} from 'customer-accountapi.generated';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type Fetcher,
} from 'react-router';
import type {Route} from './+types/account.addresses';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

export type ActionResponse = {
  addressId?: string | null;
  createdAddress?: AddressFragment;
  defaultAddress?: string | null;
  deletedAddress?: string | null;
  error: Record<AddressFragment['id'], string> | null;
  updatedAddress?: AddressFragment;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Por El Deporte | Addresses'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    // this will ensure redirecting to login never happen for mutatation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const {defaultAddress, addresses} = customer;

  return (
    <div className="account-addresses">
      <h2>Addresses</h2>
      <br />
      <div>
        <div>
          <legend>Create address</legend>
          <NewAddressForm key={addresses.nodes.length} />
        </div>
        <br />
        <hr />
        <br />
        {!addresses.nodes.length ? (
          <p>You have no addresses saved.</p>
        ) : (
          <ExistingAddresses
            addresses={addresses}
            defaultAddress={defaultAddress}
          />
        )}
      </div>
    </div>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div>
          <button
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
          >
            {stateForMethod('POST') !== 'idle' ? 'Creating' : 'Create'}
          </button>
        </div>
      )}
    </AddressForm>
  );
}

function ExistingAddresses({
  addresses,
  defaultAddress,
}: Pick<CustomerFragment, 'addresses' | 'defaultAddress'>) {
  return (
    <div>
      <legend>Existing addresses</legend>
      {addresses.nodes.map((address) => (
        <AddressForm
          key={address.id}
          addressId={address.id}
          address={address}
          defaultAddress={defaultAddress}
        >
          {({stateForMethod}) => (
            <div>
              <button
                disabled={stateForMethod('PUT') !== 'idle'}
                formMethod="PUT"
                type="submit"
              >
                {stateForMethod('PUT') !== 'idle' ? 'Saving' : 'Save'}
              </button>
              {/* Deleting an address is irreversible and the button sat right
                  beside Save, with nothing between a misclick and losing it. */}
              <button
                disabled={stateForMethod('DELETE') !== 'idle'}
                formMethod="DELETE"
                type="submit"
                onClick={(event) => {
                  if (
                    !window.confirm(
                      'Delete this address? This cannot be undone.',
                    )
                  ) {
                    event.preventDefault();
                  }
                }}
              >
                {stateForMethod('DELETE') !== 'idle' ? 'Deleting' : 'Delete'}
              </button>
            </div>
          )}
        </AddressForm>
      ))}
    </div>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  // This component renders once per saved address plus once for "create new",
  // and every instance used the same literal ids. Every label on every saved
  // address therefore pointed at the create form's field: clicking "City" on
  // your home address focused the empty new-address input. Namespacing by the
  // address id makes each instance's labels wire to its own inputs.
  const fieldId = (name: string) =>
    `${String(addressId).replace(/[^a-zA-Z0-9_-]/g, '')}-${name}`;
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;
  return (
    <Form id={addressId}>
      <fieldset>
        <input type="hidden" name="addressId" defaultValue={addressId} />
        <label htmlFor={fieldId('firstName')}>First name*</label>
        <input
          aria-label="First name"
          autoComplete="given-name"
          defaultValue={address?.firstName ?? ''}
          id={fieldId('firstName')}
          name="firstName"
          placeholder="First name"
          required
          type="text"
        />
        <label htmlFor={fieldId('lastName')}>Last name*</label>
        <input
          aria-label="Last name"
          autoComplete="family-name"
          defaultValue={address?.lastName ?? ''}
          id={fieldId('lastName')}
          name="lastName"
          placeholder="Last name"
          required
          type="text"
        />
        <label htmlFor={fieldId('company')}>Company</label>
        <input
          aria-label="Company"
          autoComplete="organization"
          defaultValue={address?.company ?? ''}
          id={fieldId('company')}
          name="company"
          placeholder="Company"
          type="text"
        />
        <label htmlFor={fieldId('address1')}>Address line*</label>
        <input
          aria-label="Address line 1"
          autoComplete="address-line1"
          defaultValue={address?.address1 ?? ''}
          id={fieldId('address1')}
          name="address1"
          placeholder="Address line 1*"
          required
          type="text"
        />
        <label htmlFor={fieldId('address2')}>Address line 2</label>
        <input
          aria-label="Address line 2"
          autoComplete="address-line2"
          defaultValue={address?.address2 ?? ''}
          id={fieldId('address2')}
          name="address2"
          placeholder="Address line 2"
          type="text"
        />
        <label htmlFor={fieldId('city')}>City*</label>
        <input
          aria-label="City"
          autoComplete="address-level2"
          defaultValue={address?.city ?? ''}
          id={fieldId('city')}
          name="city"
          placeholder="City"
          required
          type="text"
        />
        <label htmlFor={fieldId('zoneCode')}>State / Province* (2-letter code, e.g. FL)</label>
        <input
          aria-label="State/Province"
          autoComplete="address-level1"
          defaultValue={address?.zoneCode ?? ''}
          id={fieldId('zoneCode')}
          name="zoneCode"
          placeholder="FL"
          required
          type="text"
        />
        <label htmlFor={fieldId('zip')}>Zip / Postal Code*</label>
        <input
          aria-label="Zip"
          autoComplete="postal-code"
          defaultValue={address?.zip ?? ''}
          id={fieldId('zip')}
          name="zip"
          placeholder="Zip / Postal Code"
          required
          type="text"
        />
        <label htmlFor={fieldId('territoryCode')}>Country Code*</label>
        <input
          aria-label="Country code"
          autoComplete="country"
          defaultValue={address?.territoryCode ?? ''}
          id={fieldId('territoryCode')}
          name="territoryCode"
          placeholder="US"
          required
          type="text"
          maxLength={2}
        />
        <label htmlFor={fieldId('phoneNumber')}>Phone</label>
        <input
          aria-label="Phone Number"
          autoComplete="tel"
          defaultValue={address?.phoneNumber ?? ''}
          id={fieldId('phoneNumber')}
          name="phoneNumber"
          placeholder="+16135551111"
          pattern="^\+?[1-9]\d{3,14}$"
          type="tel"
        />
        <div>
          <input
            defaultChecked={isDefaultAddress}
            id={fieldId('defaultAddress')}
            name="defaultAddress"
            type="checkbox"
          />
          <label htmlFor={fieldId('defaultAddress')}>Set as default address</label>
        </div>
        {error ? (
          <p>
            <mark>
              <small>{error}</small>
            </mark>
          </p>
        ) : (
          <br />
        )}
        {children({
          stateForMethod: (method) => (formMethod === method ? state : 'idle'),
        })}
      </fieldset>
    </Form>
  );
}
