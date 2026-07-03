# Wompi production checklist

Use this when moving payments from sandbox to real money.

## Backend environment variables

Set these in the production backend host, then restart/redeploy the API:

```env
WOMPI_ENV=production
WOMPI_PUBLIC_KEY=pub_prod_xxx
WOMPI_INTEGRITY_SECRET=prod_integrity_xxx
WOMPI_EVENTS_SECRET=prod_events_xxx
WOMPI_REDIRECT_URL=https://www.sistemaspc.co/payments/register
FRONTEND_URL=https://www.sistemaspc.co
```

The API rejects mixed environments, for example `WOMPI_ENV=production` with a `pub_test_` key.

## Wompi dashboard

1. Enter the Wompi merchant dashboard.
2. Switch to production mode.
3. Open the developer or technical integration secrets section.
4. Copy the production public key, integrity secret, and events secret.
5. Configure the production events URL:

```text
https://vertecx-back-c5abeza7bwcrg2hh.canadacentral-01.azurewebsites.net/payments/wompi/events
```

Use a different URL in sandbox if you keep testing there.

## Smoke test

1. Create a small real sale in Vertecx.
2. Start the Wompi checkout from the site.
3. Confirm the Wompi page is using real payment methods, not test cards.
4. Complete the payment.
5. Confirm the browser returns to `/payments/register`.
6. Confirm the sale changes to `Pagada` and `Completed`.
7. In Wompi, confirm the transaction reference starts with `VERTECX-SALE-`.
