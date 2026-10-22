# Spanish market research and discovery update

Reviewed 22 October 2026. Patterns adapted, not competitor text, images or commercial promises.

| Source | Observed pattern | Zona Móvil implementation |
| --- | --- | --- |
| https://reparaciones.phonehouse.es/como-funciona | Explains repair process, next steps, contact and service location | Guided service entry; repair enquiry followed by WhatsApp; existing local directions and opening times |
| https://www.k-tuin.com/reparaciones | Device selection leading to a form; FAQ alongside repair information | Inline repair/mobile enquiry after selecting a need; direct links to detailed service FAQs |
| https://www.movileo.com/reparacion-moviles | Brand/model/problem selection with contact fallback | Structured enquiry collects brand, model and problem; browse catalog or ask for help |

## Changes
- Seven-choice interactive guide on home and services overview. Selection changes the guidance and relevant actions. Repair/mobile queries use the existing validated preview form; nothing is sent automatically.
- Three original vector campaign illustrations with native HTML brand posters. Real logo, Spanish text, blue/navy/yellow palette. Illustrations are not photographs or actual listed products. No copied competitor assets or fabricated promotions.
- Posters link to repair enquiry, mobile catalog and services. Catalog → product → cart → delivery quote → existing configured PayPal → verified confirmation remains the purchase path.
- Purchase steps and delivery/post-purchase FAQs on home/catalog, stage indicator in cart. Demo product detail purchase button disabled.
- Existing service/product separation and multi-image admin remain intact. No new packages, environment variables, database migrations, trackers or cookies.
- Responsive grid, keyboard-native buttons, selected states, live result region, reduced-motion support and lazy images with dimensions.

## Limits
The service enquiry ends in a user-sent WhatsApp message, not a stored booking or automated CRM follow-up. No new provider, checkout or advertising account has been activated. Repair price and timing require store assessment. Payment success still requires server confirmation. Owner must keep products, legal configuration and delivery rates accurate.

## Validation
26 existing regression tests passed. Production build and live guided navigation checked during delivery. Real payments, admin image uploads and physical mobile devices are not exercised by this visual update.
