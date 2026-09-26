# williamcastedodds.com — Dr. William Castedo, DDS

Deploy: drag this folder (or the zip) onto Netlify, or upload to any host. index.html is at the root.

Files: index.html (home + booking builder), cv.html (concise CV, prints clean),
css/styles.css, js/main.js, images/dr-castedo.webp (+ .jpg copy).

## Pricing — edit in js/main.js, top of file (CONFIG)
Placeholder numbers, set them to his real rates:
  dayRate: 6500            full rate for day one
  dayDiscount: [0,.10,.15,.20,.25]   discount on days 1-5
  travelEstimate: 1750     flat travel estimate shown in the summary
  topicsPerDay: 2          cap on a la carte topics per day
Topics live in the TOPICS array in the same file — name plus one-line description.
Topic cards on the home page are in index.html under "The Curriculum"; keep the two lists in step.

## Booking form
The form builds a summary and opens the visitor's email client addressed to
william.castedo@gmail.com. No backend needed. To capture submissions instead,
add Netlify Forms (name + data-netlify="true" on the <form>) or point it at Formspree.

## Logos
School and company marks are rendered as brand-colored type tiles (IU crimson, Marquette
blue/gold, Mayo blue, etc.) rather than downloaded logo files, to stay clear of licensing
and broken hotlinks. To swap in real logos, replace the .mark divs in index.html with
<img> tags — the tile is 76x52.
