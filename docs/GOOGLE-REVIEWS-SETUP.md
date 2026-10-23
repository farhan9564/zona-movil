# Live Google reviews setup

The homepage now has a Spanish, left-to-right Zona Móvil review section: summary on the left and cards on the right. It replaces the old admin-authored homepage review grid so manual testimonials are not attributed to Google.

The supplied profile link is https://share.google/yxbXE7fZRivI9xICs. It could not be resolved in this environment (Google returned HTTP 429); no Place ID, review, total or score has been guessed. Until credentials are configured, the section shows a branded invitation with the supplied profile link, not review cards or a rating.

## Owner setup
1. In Google Cloud, select/create a project, enable billing and **Places API (New)**. Google may charge for requests; review the applicable plan and set API quotas and billing alerts.
2. Create an API key and restrict its API access to Places API (New). This implementation calls Google from the Vercel server, not the browser. Never use a NEXT_PUBLIC variable. Apply server IP restrictions if your hosting has stable outbound IPs.
3. Use Google's Place ID Finder and select the exact Zona Móvil listing in Castelldefels. Verify its address against the supplied profile before copying the Place ID. A share.google link is not a Place ID.
4. In Vercel → project → Settings → Environment Variables, add to Production:
   - GOOGLE_PLACES_API_KEY = your restricted key
   - GOOGLE_PLACE_ID = the verified shop Place ID
5. Redeploy. Open the home page and scroll to the reviews section. With a valid response, the live score, total, up to five Google-selected reviews and a direct write-review button appear automatically.
6. If the fallback remains, check Places API enablement, billing, the API key restriction, the Place ID and Vercel function logs. Logs record HTTP status only, not credentials. Do not send the API key in chat.

## Behavior
The section requests data only as it approaches the viewport. Responses and Google fetches use no-store: reviews are not written to Supabase or browser storage. Each page view reaching this section can trigger one billable request. No auto-refresh polling. Reviews retain Google's relevance selection, original text/language, author attribution and source links. Long reviews can be expanded. No filter hides negative ratings. No review/rating structured data is added. Google profile links open externally. Failure does not break the rest of the store.

## Google requirements and references
Owner should incorporate applicable Google terms/privacy disclosures into the store's published legal pages before enabling the integration, including EEA terms if applicable to the billing account.
- Setup: https://developers.google.com/maps/documentation/places/web-service/get-api-key
- Place ID Finder: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
- Place Details: https://developers.google.com/maps/documentation/places/web-service/place-details
- Attribution and policies: https://developers.google.com/maps/documentation/places/web-service/policies

## Verification
Production build and review normalization/security unit checks run during implementation. Live Google content cannot be verified until the owner supplies credentials in Vercel. The fallback design can be verified without credentials.

## Carousel correction
The connected state now uses two vertical tracks moving in opposite directions, with soft top/bottom fades, Spanish LTR text and the summary on the left. Hover, keyboard focus or an expanded review pauses movement. A visible pause/read button switches to static scrollable originals; reduced-motion users get static originals. Repeated items exist only to loop the animation and are inert/hidden from assistive technologies; they do not count as additional reviews. No giant invitation card is shown when credentials are missing: only a compact profile link remains. Automatic freshness means a fresh API request for each visit reaching this section, not background synchronization or access to all Google reviews. Live review content remains blocked until credentials and the verified Place ID are configured.
