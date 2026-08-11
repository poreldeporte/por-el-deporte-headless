# Meta launch campaign

Everything needed to build the first paid campaign in Ads Manager. Copy is
paste-ready. Nothing here needs rewriting on the way in.

Pixel `1120673588661818` went live on the storefront on 2026-08-11 and is
confirmed sending PageView, ViewContent, AddToCart, InitiateCheckout and
Search. Purchase already came from the Shopify checkout before that.

---

## Fix before spending

**"Palmas" Jersey stays out of the ads.** Franco's call, and the inventory
agrees: every size is negative (M −6, L −16, XL −21, 2XL −3) with inventory
policy CONTINUE, so it still reads as available and keeps taking orders.

Worth knowing what it is, though. At $2,745 across 34 orders it is the single
best selling product the store has ever had, roughly five times the best tee.
It is not being kept out because it fails, it is being kept out because it
oversold and nobody wants to sell 47 of something that is not there. Reconcile
the count or set the policy to DENY, then decide separately whether it comes
back as a restock announcement. That is an email to the list, not an ad.

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

Seven cards: four tees, the cap, two totes. Picked on two years of sales
rather than on how they look in the grid, with one deliberate exception noted
below.

Order matters. Meta shows cards left to right and the first two take most of
the attention, so the two highest earning tees lead. The totes close because
they are the cheapest way in, not because they are expected to carry the ad.

| # | Product | Price | Lifetime | Link |
|---|---|---|---|---|
| 1 | The Golf Club Pocket Tee | $45 | $582, 15 orders | `/products/the-golf-club-pocket-tee` |
| 2 | El Clásico Tee | $45 | $578, 13 orders | `/products/el-clasico-tee` |
| 3 | Members Tee | $45 | new, no sales yet | `/products/members-tee` |
| 4 | Futbol, Mate, Asado Tee | $40 | $386, 15 orders | `/products/futbol-mate-asado-tee` |
| 5 | Por El Deporte Cap | $35 | $306, 12 orders | `/products/por-el-deporte-cap` |
| 6 | DRV PNK Tote | $35 | $45, 5 orders | `/products/the-tote` |
| 7 | El Clásico Tote | $35 | $35, 2 orders | `/products/el-clasico-tote` |

Three things worth knowing about this list.

**Members Tee is the one card with no track record.** It went in at Franco's
call, replacing The Futbol Club Tee ($376, the lowest earner of the four tees
that made the cut). It is the piece the homepage is built around, so it earns
a place, but it is the only card here running on conviction rather than
receipts. Watch it specifically: if it takes clicks and does not convert while
cards 1 and 2 do, that is the store telling you something useful for free.

**Marado Tee stays out.** Also new, also unsold, and one unproven card in a
carousel is a test while two is a guess.

**Totes are the weakest category in the store**, $80 and seven orders across
two years combined. They are in because a $35 entry point is worth having in
the carousel and because they cost nothing to include. If cards 6 and 7 take
clicks without converting after a week, cut them and go to five cards.

Full URLs with tracking, so Shopify analytics can separate paid from organic.
Paste these as the card destinations exactly:

```
https://poreldeporte.com/products/the-golf-club-pocket-tee?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch_carousel&utm_content=golf_club_tee
https://poreldeporte.com/products/el-clasico-tee?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch_carousel&utm_content=el_clasico_tee
https://poreldeporte.com/products/members-tee?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch_carousel&utm_content=members_tee
https://poreldeporte.com/products/futbol-mate-asado-tee?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch_carousel&utm_content=mate_asado_tee
https://poreldeporte.com/products/por-el-deporte-cap?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch_carousel&utm_content=cap
https://poreldeporte.com/products/the-tote?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch_carousel&utm_content=drv_pnk_tote
https://poreldeporte.com/products/el-clasico-tote?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch_carousel&utm_content=el_clasico_tote
```

Turn on **"Automatically show the best performing cards first"**. The order
above is the best guess from past sales; let Meta correct it with live data.

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
| 1 | The Golf Club, our way | Pocket Tee, $45 |
| 2 | A classic, worn in | El Clásico Tee, $45 |
| 3 | For the ones who turn up | Members Tee, $45 |
| 4 | Futbol. Mate. Asado. | Heavyweight tee, $40 |
| 5 | Shade for the sideline | PED Cap, $35 |
| 6 | Holds a full kit | DRV PNK Tote, $35 |
| 7 | Market run and match day | El Clásico Tote, $35 |

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
