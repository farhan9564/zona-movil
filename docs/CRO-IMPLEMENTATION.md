# Zona Móvil: conversion and local SEO update

## Audit and priorities

Reviewed the Next.js App Router project, routing, shared Store/Admin components, CSS, product galleries, checkout, delivery settings, API, PostgreSQL model and PayPal integration. Inspected the live Home, About, Contact and Services overview in the browser and compared them with source. Existing source is Next.js 16 / React 19, plain JavaScript/JSX, shared CSS, PostgreSQL and signed Cloudinary uploads. No GA4, Ads or Meta tags or inquiry form backend were present.

Priority issues were a generic homepage headline, shop-first hero CTA, duplicated service discovery sections, a basic services overview, no structured repair/sales inquiry, generic metadata and absent sitemap/robots/local structured data. External font imports added a third-party request. The logo, phone illustration and demo product illustrations were available; no verified shop/team photos were present.

## Implementation

- Home: local service/location headline, WhatsApp/call/directions actions, separate repair and mobile inquiry paths, clearer service cards, factual trust content, address/hours block and final CTA. Retained interactive phone illustration with an explicit illustrative caption. Home featured products only use real published catalog data, not the demo inventory.
- Services: descriptive cards, common needs/next steps and overview FAQ. Existing seven detailed service pages and their FAQs remain. Repair and mobile services now offer structured inquiry forms. Service pages still contain no product grids; shop categories remain separate.
- Contact: direct contact actions, accurate full hours, address, Google Maps directions, email and an optional inquiry composer.
- About: concise Spanish introduction based on verified services, physical shop presence, contact links and location/hours. No business age, founder, guarantees or customer counts invented.
- Shared navigation/footer: clear WhatsApp label, skip link, keyboard focus, active-page indicators, dropdown Escape handling and expandable hours. Responsive styles retain brand navy/blue/yellow. No new dependencies.
- Store data, admin, product galleries, shipping and payment API code were not modified by this update.

## Selected Spanish copy

Home H1: “Tu tienda de móviles en Castelldefels.”

Home introduction: “Móviles nuevos y reacondicionados, reparaciones y accesorios. Cuéntanos qué necesitas y te ayudamos a elegir el siguiente paso.”

Primary CTA: “Consultar por WhatsApp”. Secondary CTA: “Cómo llegar”.

About H1: “Más cerca de ti, más fácil conectar.”

Contact H1: “Hablemos de lo que necesitas.”

Repair form: “¿Qué le ocurre a tu dispositivo?”

Phone form: “Cuéntanos qué móvil buscas.”

Prepared state: “Tu mensaje está preparado, aún no se ha enviado.”

Full production copy is in components/Conversion.jsx, components/Store.jsx and components/FrontFeatures.jsx.

## Inquiry behavior

Repair form requires brand, model and problem; purchase form requires the desired model/type; general inquiry requires reason and message. Optional notes have length limits. Fields are trimmed and WhatsApp text is URL encoded. Preparing a message does not submit it anywhere, persist it, reserve an appointment or show a false success. The customer explicitly clicks “Abrir WhatsApp” and sends the message in WhatsApp. No automatic emails, leads database, passwords or payment fields are added. No WhatsApp messages were sent during testing.

## SEO

Unique titles/descriptions for important routes; canonical URLs; Open Graph/Twitter metadata; logo icon; valid ElectronicsStore JSON-LD with the existing address, phone, email and split opening hours. No invented geo coordinates, postcode, ratings or price range. sitemap.xml lists public routes and active products where the database query succeeds. robots.txt disallows API/admin access by crawlers; noindex covers admin, cart, payment and legal pages (legal drafts should not become search landing pages). Product metadata reads active product names/descriptions when available and falls back to noindex if unavailable. Robots directives are not access control.

APP_URL must remain the actual HTTPS origin. After a custom-domain move, update APP_URL and redeploy; do not point canonical URLs at an unrelated site. Submit the sitemap in the owner's Search Console after verifying ownership. No immediate ranking or rich-result claim is made.

References used: Next.js official generateMetadata/metadata documentation and Schema.org openingHoursSpecification definitions.

## Analytics / privacy

No measurement ID or existing analytics consent integration was available. No GA4 script, Ads tag, Meta Pixel, analytics cookie, network collector or cosmetic consent banner was installed. ConversionSignals exposes a browser-only `zona:conversion` CustomEvent with event, pathname and a service enum. It sends no input text, query strings, phone/email fields or purchase details. Listeners are removed on unmount/route change to avoid duplicate handlers. Private checkout/admin pages are excluded.

Prepared events: whatsapp_click, phone_click, directions_click, repair_inquiry, purchase_inquiry. The inquiry events mean an outbound WhatsApp click, not a submitted lead or sale. No contact-form submission event is emitted because no web submission takes place. GA4 page_view and collection remain unconfigured. An actual analytics integration needs the owner's measurement ID, appropriate consent management, privacy text and independent testing; do not forward this hook before those requirements are addressed.

The Google Fonts import was removed in favor of local system fonts. Third-party maps are linked rather than embedded. Existing cart/admin cookies and payment flow remain unchanged. No claim of full Spanish/EU legal compliance is made; the owner must complete/review business legal data in admin.

## Validation and limits

- 26 automated tests passed: existing authentication/payment/shipping/gallery coverage plus inquiry validation, correct WhatsApp recipient/encoding, bounded message text, event classification, unique metadata and schema facts.
- Production build passed after clearing a stale local Turbopack cache. No lint script or independent TypeScript setup exists; project uses JavaScript and Next's build checks.
- Local production HTML smoke checks cover routes, metadata, links/anchors, WhatsApp recipient, sitemap, robots and 404 behavior; browser verification is reported separately at delivery.
- Responsive CSS covers desktop/tablet/mobile and reduced motion. No speed score, Lighthouse improvement, legal compliance or live payment test is claimed.
- Actual WhatsApp sending, email delivery, Cloudinary uploads, PayPal transactions, authenticated admin and GA collection are outside this update's live testing.

## Owner information still needed

Real shop/team photographs with permission; any verified warranty/service terms; legal business name and tax details if not already entered in admin; holiday exceptions; final production domain; optional verified Google Business Profile URL; and analytics account/ID plus consent requirements if measurement is wanted. Do not invent these details.

No new database migration, environment secret or payment configuration is required for the frontend update. Existing APP_URL controls SEO origin. The current legal texts remain owner-managed.
