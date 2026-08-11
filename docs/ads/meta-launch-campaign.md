# Meta launch campaign

Everything needed to build the first paid campaign in Ads Manager. Copy is
paste-ready. Nothing here needs rewriting on the way in.

Pixel `1120673588661818` went live on the storefront on 2026-08-11 and is
confirmed sending PageView, ViewContent, AddToCart, InitiateCheckout and
Search. Purchase already came from the Shopify checkout before that.

---

## Fix before spending

**"Palmas" Jersey is overselling.** Every size is negative (M −6, L −16,
XL −21, 2XL −3) and inventory policy is CONTINUE, so it still shows as
available and will keep taking orders. It is the $78 item, the most expensive
thing in the store. Either reconcile the count or set the policy to DENY.
Do not put paid traffic on it until that is settled.

**PED Shorts has 5 units left**, across three sizes. Medium and X-Large black
are already sold out. Leave it out of the carousel. A card that leads to a
sold-out size is a wasted click that Meta still charges for.

Everything else is print to order with deep stock and is safe to advertise.

---

## Why not just optimise for purchases

The instinct is to pick Sales and optimise for Purchase. With a pixel that has
days of history, that spends most of the budget learning. Meta wants roughly 50
optimisation events per ad set per week to leave the learning phase, and the
store will not do 50 purchases a week yet.

So: **optimise for Add to Cart to start.** There is enough volume to get there,
it teaches the pixel what a buyer looks like, and it keeps costs sane. Once
purchases hold above about 50 a week, switch the same campaign to Purchase.
That switch restarts learning, so make it once, deliberately, not weekly.

---

## Structure

One campaign, objective **Sales**, two ad sets. Same creative in both so the
comparison is clean.

| | Ad set A: the club | Ad set B: Miami |
|---|---|---|
| Who | Instagram and Facebook followers, plus anyone who engaged in 365 days | Miami-Dade and Key Biscayne, 18 to 45 |
| Interests | none, the audience is the targeting | Soccer, Liga MLS, Inter Miami CF, Premier League, LaLiga |
| Size | small, will run at low volume | broad enough to spend |
| Why | they already know you, cheapest conversions available | where the club is real and people can recognise it |

Budget: start at **$20/day**, $8 to A and $12 to B. A will exhaust its audience
quickly, that is expected and fine. Run 7 days before judging anything. Do not
touch it mid-flight, every edit restarts learning.

Placements: Advantage+ placements on. Manually restricting placements on a
budget this size starves delivery.

Attribution: 7-day click, 1-day view.

---

## The carousel

Six cards, ordered deliberately. Card 1 is the hook, card 2 is the highest
value item while attention is still there, and the cap closes on the cheapest
entry point.

| # | Product | Price | Link |
|---|---|---|---|
| 1 | Members Tee | $45 | `/products/members-tee` |
| 2 | Artisan PED Hoodie | $75 | `/products/artisan-ped-hoodie` |
| 3 | Marado Tee | $40 | `/products/marado-tee` |
| 4 | La Isla Hooded Long Sleeve | $65 | `/products/la-isla-hooded-long-sleeve` |
| 5 | The Futbol Club Tee | $45 | `/products/key-biscayne-shield-tee` |
| 6 | Por El Deporte Cap | $35 | `/products/por-el-deporte-cap` |

Full URLs with tracking, so Shopify analytics can separate paid from organic.
Paste these as the card destinations exactly:

```
https://poreldeporte.com/products/members-tee?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch_carousel&utm_content=members_tee
https://poreldeporte.com/products/artisan-ped-hoodie?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch_carousel&utm_content=hoodie
https://poreldeporte.com/products/marado-tee?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch_carousel&utm_content=marado_tee
https://poreldeporte.com/products/la-isla-hooded-long-sleeve?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch_carousel&utm_content=hooded_ls
https://poreldeporte.com/products/key-biscayne-shield-tee?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch_carousel&utm_content=futbol_club_tee
https://poreldeporte.com/products/por-el-deporte-cap?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch_carousel&utm_content=cap
```

### Primary text

The body above the carousel. Meta cuts it at roughly 125 characters on mobile
before "See more", so the first line has to carry it alone.

> We started in 2014 with a ball and whoever turned up.
>
> Ten years on, the club still plays every week and it is still free to turn
> up. The gear is how it keeps going. Every piece is made to order, and what
> you buy pays for pitch time, balls and the next match.
>
> Por El Deporte. For the sport.

### Card headlines and descriptions

Headlines are capped near 40 characters, descriptions near 25. Both are written
to fit without truncation.

| # | Headline | Description |
|---|---|---|
| 1 | For the ones who turn up | Members Tee, $45 |
| 2 | Heavyweight, made to order | Artisan Hoodie, $75 |
| 3 | Worn for the love of it | Marado Tee, $40 |
| 4 | Cover up after the match | Hooded Long Sleeve, $65 |
| 5 | The club on your chest | Futbol Club Tee, $45 |
| 6 | Start here | PED Cap, $35 |

Call to action: **Shop now** on every card.

---

## Run the Golazo video too

The strongest asset is not a product photo. It is Nico Cantor on CBS Sports
Golazo talking about the club, which is third-party validation no ad copy can
buy. It is already on the site in the As Seen On section.

Build it as a second campaign, objective **Traffic**, same two audiences,
$10/day, pointing at the homepage:

```
https://poreldeporte.com/?utm_source=facebook&utm_medium=paid_social&utm_campaign=golazo_video
```

Primary text:

> CBS Sports came to Key Biscayne to see what we built.
>
> A club that started with two brothers and whoever turned up, and is still
> free to play in ten years later.

This one is not trying to sell a shirt. It is buying recognition, so that when
the carousel reaches the same people, the name already means something. Judge
it on cost per landing page view and on whether the carousel's cost per Add to
Cart drops while it runs, not on its own sales.

---

## Before switching it on

1. Events Manager, confirm ViewContent and AddToCart are arriving. They were
   verified on production, but see them with your own eyes.
2. Events Manager, Diagnostics tab. If it flags that `content_ids` do not match
   the catalogue, the storefront sends numeric variant ids and the feed needs to
   match on variant, not product. That is the one thing that could not be
   checked from outside.
3. Commerce Manager, catalogue, confirm the 6 carousel products show as In
   stock and Approved. Rejected items fail silently in catalogue ads.
4. Business settings, confirm poreldeporte.com is a verified domain. Without it
   Aggregated Event Measurement will not attribute properly on iOS.

## Reading it after a week

Look at cost per Add to Cart, not clicks. Clicks are easy to buy and mean
nothing on their own.

- Ad set A should beat B on cost per Add to Cart. If it does not, the follower
  list is colder than it looks and the money belongs in B.
- If one carousel card takes most of the clicks, build the next ad around that
  product instead of spreading evenly.
- Once about 30 people have hit a product page, a retargeting ad set becomes
  worth building. That audience did not exist before today.
