# Notification emails

Five Shopify customer notifications, rebranded. Paste each into
**Settings → Notifications → Customer notifications → [name] → Edit code**,
replacing the whole body, and set the subject line above the editor.

Every one of these has **"Revert to default"** in the code editor. Nothing here
is one-way.

| File | Notification | Subject line |
|---|---|---|
| `abandoned-checkout.liquid` | Abandoned checkout | You left something in your bag |
| `order-confirmation.liquid` | Order confirmation | Order {{ order_name }} is in |
| `shipping-confirmation.liquid` | Shipping confirmation | Your order {{ order_name }} is on the way |
| `account-activation.liquid` | Customer account activation | Activate your Por El Deporte account |
| `account-welcome.liquid` | Customer account welcome | Welcome to Por El Deporte |

## Before pasting

**Change the store address.** Settings → General. Shopify appends the billing
address to every commercial email (CAN-SPAM requires a physical address), and it
is currently a residential street address in Miami Shores. A PO Box satisfies the
law without sending it to every customer.

## After pasting

**Send a test on each.** Preview cannot prove the links, because
`{{ invoice_url }}` and `{{ customer.account_activation_url }}` are only
populated for real events. Check the button lands where it should.

## Rules these all follow

- **No returns or refunds copy.** All sales are final. The only refund
  references are `line.refunded_quantity`, which labels a line only when a
  refund was actually issued, and the DE/DK PDF attachment, which is a legal
  requirement for German and Danish buyers and sends whatever the policy says.
- **URLs hardcoded to poreldeporte.com.** `{{ shop.url }}` resolves to
  `por-el-deporte.myshopify.com`, the old themed store, which is the wrong place
  to send anyone and does not serve `/icon-192.png`.
- **Table layout, inline styles, no web fonts.** Gmail strips `<style>`, Outlook
  renders through Word, and Flapjack will not load, so headings are heavy
  uppercase Helvetica with wide tracking.

## Traps found while writing these

Shopify's variable names differ per template and are not guessable. Getting one
wrong produces an email that looks right in preview and fails in an inbox.

- Abandoned checkout uses **`{{ invoice_url }}`**, not `{{ url }}`.
- Line items are **`subtotal_line_items`**, not `line_items`, and the price is
  **`line.final_line_price`**, not `line.line_price`.
- Shipping confirmation iterates **`fulfillment.fulfillment_line_items`**, where
  each entry wraps the real line as **`line.line_item`**, and `line.quantity` is
  the amount in *that shipment* — lower than `line.line_item.quantity` when a
  shipment is split, which Printful does.
- **Filters are not allowed inside a condition.** `{% if x | strip != blank %}`
  fails at render, not preview. Assign first.
- Anything that loops over transactions must build a **capture** before printing
  a heading, or an order paid by gift card plus card prints it twice.
