# ZONA MÓVIL — storefront and administration

Spanish Next.js ecommerce project for **ZONA MÓVIL, Castelldefels**. Includes the supplied logo and blue/yellow branding, interactive CSS 3D phone, separate service pages, product catalog, product details, cart, PayPal checkout, and a protected administration panel.

## Deploy this repository to Vercel

1. Open https://vercel.com/new and import `farhan9564/zona-movil`.
2. Keep Root Directory as `./` and framework as Next.js. The repository includes `vercel.json` and a package lock.
3. For your first demo, leave environment variables empty and click Deploy. No database account is required for the demo.
4. For real store operations, follow the PostgreSQL, admin, Cloudinary and PayPal setup below. Set `APP_URL` to your final HTTPS website origin and redeploy.

The repository includes deployable source and the logo. The generated standalone preview and unused original poster are kept in the downloadable ZIP rather than the deployment source. Checkout is disabled in demo mode.

## Start here: choose your preview

**Fastest:** in the downloaded ZIP, double-click `PREVIEW.html` (the generated file is excluded from Git; run `npm run preview:build` to recreate it). It is a self-contained visual demo with the storefront, cart, service pages, and read-only admin. No installation or account is needed. Prices/products are clearly labeled examples. The preview does not use the production database, process payments, or save admin edits. Its browser fonts may differ from the full application.

**Full application:** install Node.js 22 or later, extract this project, open a terminal inside `zona-movil`, then run:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. Visit `http://localhost:3000/admin` for the read-only admin demo. With no `DATABASE_URL`, the project intentionally uses sample products and disables all payment/admin mutations. Connecting a database replaces the demo with your real catalog, initially empty.

## What each service does

| Route | Purpose |
| --- | --- |
| `/` | Home, interactive 3D phone with color and rotation controls |
| `/tienda` | Searchable catalog, categories and price sorting |
| `/moviles` | New and refurbished phones |
| `/accesorios` | Accessories |
| `/tarjetas-sim` | Prepaid SIM information and relevant products |
| `/reparaciones` | Repair enquiries via WhatsApp |
| `/envios-de-dinero` | Ria and Western Union information, in-store enquiries |
| `/recargas` | Mobile top-up enquiries |
| `/impresion` | Printing and copying enquiries |
| `/servicios` | Service directory |
| `/producto/[id]` | Product detail |
| `/carrito` | Cart and store-pickup checkout |
| `/pago` | Server-verified payment confirmation |
| `/nosotros`, `/contacto` | About, address, contact details and opening hours |
| `/privacidad`, `/condiciones` | Editable privacy and purchase terms |
| `/admin` | Admin login, dashboard, products, categories, reviews, orders, PayPal and legal settings |

Service enquiries do not execute money transfers, activate SIMs, top up a phone, or submit documents online. Those services are arranged with the shop. Only catalog products go through checkout.

## The correct architecture

- **Vercel:** website and server-side API hosting.
- **GitHub:** source code and deployment history.
- **PostgreSQL:** products, categories, authentic customer reviews, orders, and encrypted settings. Use a hosted database such as Neon or Supabase.
- **Cloudinary:** product-image storage and delivery. Cloudinary is not the database for orders or products.
- **PayPal:** payment creation, approval and capture. Credentials are configured from the admin panel after the database and encryption key are ready.

## 1. Connect PostgreSQL

Create a PostgreSQL database. Copy its **pooled connection string** including TLS parameters. Keep the provider's connection string intact. Never disable certificate validation to fix a connection error.

Copy `.env.example` to `.env.local` in the project root. In Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Set `DATABASE_URL` in `.env.local`. Then create the tables:

```bash
npm run db:setup
```

Alternatively paste `scripts/schema.sql` into the database provider's SQL editor. It creates the tables and three real category names; it does not insert fake products, orders or reviews. Use a separate database/branch for development and production.

## 2. Create the admin login

For browser-only setup, add these server-only variables in Vercel → Project → Settings → Environment Variables → Production:

| Name | Value |
| --- | --- |
| `ADMIN_EMAIL` | Your chosen login email |
| `ADMIN_PASSWORD` | Your own unique password, 14–200 characters |
| `SESSION_SECRET` | A random 64-character hex key |
| `SETTINGS_ENCRYPTION_KEY` | A different random 64-character hex key |
| `APP_URL` | Your live HTTPS website origin without a trailing slash |

Keep your existing `DATABASE_URL`. Redeploy after saving, then open `/admin`. Do not set `ADMIN_PASSWORD_HASH` for this simple method; remove an old value if switching to `ADMIN_PASSWORD`. No terminal is required if you already have the two generated keys.

Store the password and keys only in Vercel environment settings, never in GitHub, public files or `NEXT_PUBLIC_` variables. The server derives a salted password hash for comparison. Existing login rate limiting and HttpOnly session cookies remain in place.

**Optional advanced method:** use a pre-generated hash instead of `ADMIN_PASSWORD`. Set `ADMIN_EMAIL` to your chosen administrator email, then generate a hash locally with a unique password at least 14 characters long:

```bash
npm run admin:hash -- "YOUR-UNIQUE-LONG-PASSWORD"
```

Copy the generated `salt:hash` value into `ADMIN_PASSWORD_HASH`. Do not copy the command or npm log lines. The password itself is not stored in the database. Be aware this command may be saved in your local terminal history.

Generate two different random keys by running this command twice:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save the first result as `SESSION_SECRET` and the second as `SETTINGS_ENCRYPTION_KEY`. Both are 64 hex characters. Keep the encryption key backed up securely: losing it means saved PayPal credentials cannot be decrypted. Changing the session secret logs out existing administrators.

Set `APP_URL=http://localhost:3000` for local development. Restart the dev server after changing environment variables, then open `/admin` and sign in. There is no public admin signup or default password.

## 3. Configure Cloudinary

From your own Cloudinary account, get the cloud name, API key, and API secret. Set these **server-only** variables:

```text
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Do not prefix them with `NEXT_PUBLIC_`. No unsigned upload preset is required. The admin requests a signed upload from the protected backend, and the browser uploads the image directly to Cloudinary under `zona-movil`.

In Admin → Productos → Añadir producto, select an image (JPG/PNG/WebP, under 5 MB). Add the name, category, EUR price **including VAT**, condition, and description. Mark it published and save. Uploaded images can also be supplied as `https://res.cloudinary.com/...` URLs.

Deleting a product does not delete its Cloudinary image automatically. Manage unused media separately in Cloudinary.

## 4. Configure PayPal from the admin panel

1. Create or use a PayPal Business/developer account and obtain **Sandbox** application credentials.
2. In `/admin` → **Pagos y legal**, select Sandbox and enter the Client ID and Client Secret.
3. Complete the actual legal business name, NIF/CIF, privacy policy and purchase terms. These are not supplied facts; the default pages are explicitly drafts. Review the terms for your specific business before accepting orders.
4. Confirm the legal information and enable checkout. Save.
5. Add a real test catalog item, open the storefront, and complete a Sandbox purchase with a Sandbox buyer account.
6. Return to `/pago` in the same browser. Confirm the order appears as `PAID` in Admin → Pedidos. Test cancellation and retries too.
7. Once ready, switch to Live and enter the **Live** credentials. Sandbox credentials cannot process real payments.

Existing pending PayPal orders must be reconciled before changing the payment account or mode. Use **Comprobar con PayPal** in the order detail. Separate Sandbox and Live databases are recommended to avoid mixing test and production orders. Enabling/disabling checkout or editing legal text does not require changing credentials.

The payment secret is encrypted using AES-256-GCM. The admin never receives the saved plaintext secret; leaving the secret field blank preserves it. Prices are loaded from PostgreSQL, not trusted from the browser. An order is marked paid only after the backend checks PayPal's completed capture, exact EUR amount and order reference. Capture retries use an idempotency key.

This version implements **PayPal only**. Card options inside PayPal depend on PayPal's eligibility. Stripe, Redsys and Bizum are not implemented. Never enter another provider's credentials in the PayPal fields.

## 5. Upload the source to GitHub

Create a repository in your own GitHub account, then upload the **contents of the extracted `zona-movil` folder**, so `package.json` is at the repository root. Do not upload only the ZIP. Include `app`, `components`, `lib`, `public`, `scripts`, `tests`, package files, `next.config.mjs`, `.gitignore`, and `.env.example`.

Do **not** upload `node_modules`, `.next`, `.env.local`, real secrets, or database credentials. `.gitignore` excludes them.

Using Git instead of drag-and-drop:

```bash
git init
git add .
git commit -m "Build Zona Movil storefront and admin"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the placeholder repository URL with your own. GitHub Desktop is another option if you prefer a visual workflow. The deployable source is available at https://github.com/farhan9564/zona-movil. Import this repository into Vercel to deploy it. Hosting is configured separately in your Vercel account.

## 6. Deploy to Vercel

1. In your Vercel account, choose **Add New → Project** and import the GitHub repository.
2. Use the **Next.js** framework preset. If `package.json` is inside a nested folder, set Root Directory to that folder.
3. Keep the default build command `npm run build` and default Next.js output settings. Use Node.js 22 or newer. Do not set the output directory to `public`.
4. For a visual demo deployment, leave database variables empty. For the real store, add the server environment variables below and initialize the target database first.
5. Deploy. Once the project has its URL, set `APP_URL` to that exact HTTPS origin, without a trailing slash, e.g. `https://your-project.vercel.app`, and redeploy.
6. Open the deployed `/admin` page, sign in, add real products and configure PayPal.
7. Add your custom domain in Vercel if required. After changing to the final domain, update `APP_URL` and redeploy again.

Required for real administration and checkout:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | PostgreSQL pooled TLS connection string |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Unique 14–200 character password (or use `ADMIN_PASSWORD_HASH` instead) |
| `SESSION_SECRET` | Generated secret, 64 hex characters |
| `SETTINGS_ENCRYPTION_KEY` | Separate generated key, 64 hex characters |
| `APP_URL` | Exact HTTPS site origin, no trailing slash |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

PayPal credentials are stored through the admin panel, not in public environment variables. Changing Vercel environment variables requires redeployment. Do not enable production payments against Vercel Preview deployment URLs. Use an isolated database with Sandbox credentials for previews.

## Store operations and scope

- Orders are **store pickup only**; no shipping fee, delivery-zone system, or carrier integration has been invented.
- Product prices are stored as integer cents. Enter tax-inclusive retail prices. There is no automated tax invoice system.
- The admin can publish/unpublish products. Numeric inventory, stock reservations, variants and inventory synchronization are not included. Only publish items the shop can supply; this implementation does not prevent overselling scarce stock.
- Customers use guest checkout. There is no customer account area.
- Orders are saved before requesting PayPal approval. A pending record is not proof of payment.
- No automatic transactional emails, SMS or WhatsApp messages are sent. Contact the buyer manually when a pickup is ready, then mark the paid order as collected.
- The return page confirms payments; the admin can reconcile orders with PayPal if the browser is closed or the callback is interrupted. A webhook/background reconciliation service is not included. Check pending orders regularly.
- Refunds/disputes are managed in PayPal. Their later status is not automatically synchronized into this admin panel.
- Reviews are manually entered authentic reviews with customer permission; there are no fabricated reviews.
- The supplied address was read from the logo. Confirm `Av. Manuel Girona 14 · Bajo 2` before launch.
- External links open WhatsApp and Google Maps. The full site loads DM Sans and Manrope through Google Fonts; disclose the applicable providers in your finalized privacy policy or self-host the fonts. No analytics or advertising scripts are included.
- The admin is a single-owner login with an 8-hour signed HttpOnly session and login rate limiting. Add MFA/managed authentication if your operational requirements need it. Use Vercel/database backups and access controls appropriate to your shop.

## Validation performed

- Production `next build` compilation.
- Automated tests for password verification, session tampering, encrypted secret integrity, server-side totals, invalid quantities, and PayPal amount/currency/status/order matching.
- Browser layout and interaction checks are recorded in `VALIDATION.md`.
- Real PostgreSQL, Cloudinary uploads and Sandbox/Live PayPal transactions require your credentials and were not executed in this environment.

Run the checks yourself:

```bash
npm test
npm run build
npm start
```

Build the standalone preview again after design changes:

```bash
npm run preview:build
```

## Troubleshooting

- **Demo products still visible:** `DATABASE_URL` is missing in the running environment; restart/redeploy after adding it.
- **Empty catalog after database setup:** expected; add and publish your real products in admin.
- **Database table error:** run `npm run db:setup` against the same database your deployment uses.
- **Admin will not sign in:** check admin email, password hash, session key and database; too many attempts are blocked for 15 minutes.
- **Save/checkout rejected:** make sure `APP_URL` matches the exact origin you are visiting, including local port or custom domain.
- **Cloudinary upload fails:** check all three server variables and image file type/size.
- **PayPal connection error:** verify Sandbox/Live mode matches the Client ID and secret. Check the encryption key has not changed.
- **Buyer paid but order is pending:** use the order's PayPal reconciliation button; verify the actual transaction before arranging collection.
- **Cannot switch PayPal credentials:** reconcile pending orders first; never discard a pending order that might have been paid.

## Official references

- Vercel Git deployments: https://vercel.com/docs/git
- Vercel environment variables: https://vercel.com/docs/environment-variables
- PayPal checkout: https://developer.paypal.com/studio/checkout/standard/getstarted
- Cloudinary signed uploads: https://cloudinary.com/documentation/authentication_signatures
- Neon connection guide: https://neon.com/docs/connect/connect-from-any-app
