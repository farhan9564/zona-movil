# Home page reviews

The homepage uses `lib/static-google-reviews.js`, transcribed from 11 Google screenshots supplied by the shop on 23 October 2026. No API key or Place ID is needed.

There are 14 selected reviews, including the positive four-star review. The negative review is excluded as requested. The overall snapshot remains 4.7/5 from 17 ratings, as shown in the first screenshot; it is not calculated from the selected reviews. The UI identifies the selection and snapshot date.

English Google translations are preserved and labelled; Spanish originals were not visible. Faizan is a labelled excerpt ending at the last complete sentence available in the screenshot. Two ratings have no written comment. Names and individual stars are transcribed, with initials instead of copied profile photos. Links go to the business listing, not to fabricated individual review URLs.

To update, edit the static data with verified source content, update the snapshot date and score if needed, and deploy. The optional `/api/google-reviews` route is retained for future integration but is not called by the homepage.

The carousel has opposite vertical tracks, a pause/read button, hover/focus pause, and a reduced-motion layout. Duplicate tracks are inert and hidden from assistive technology.
