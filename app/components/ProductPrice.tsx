import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
  additional = false,
}: {
  price?: MoneyV2 | null;
  compareAtPrice?: MoneyV2 | null;
  additional?: boolean;
}) {
  const onSale =
    price &&
    compareAtPrice &&
    price.currencyCode === compareAtPrice.currencyCode &&
    Number(compareAtPrice.amount) > Number(price.amount);
  return (
    <span aria-label="Price" className="product-price" role="group">
      {onSale ? (
        <span className="product-price-on-sale">
          <span className="sr-only">Originally </span>
          <s>
            <Money data={compareAtPrice} as="span" />
          </s>
          <span className="sr-only">Now </span>
          <span>
            {additional ? '+' : ''}
            <Money data={price} as="span" />
          </span>
        </span>
      ) : price ? (
        <span>
          {additional ? '+' : ''}
          <Money data={price} as="span" />
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </span>
  );
}
