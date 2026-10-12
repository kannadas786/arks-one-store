# ARKS ONE Store — Supabase-connected starter

## Included
- Responsive static storefront, product search/filter/sort and cart.
- Reads active product rows from the Supabase `public.products` table using the Project URL and publishable key.
- Falls back to sample products if the database request fails.
- Checkout creates a WhatsApp order-request message; it does not charge payments or automatically create a database order.

## Before publishing
1. In `app.js`, replace `whatsappNumber` with your WhatsApp number including country code, digits only (example format: `919876543210`).
2. The browser uses only a Supabase publishable key. Never place a secret key or service_role key in website files.
3. Confirm Row Level Security is enabled and that `public.products` has a SELECT policy for active products. The site queries `is_active = true` and expects the columns `id`, `name`, `description`, `category`, `image_url`, `price`, `original_price`, `stock_quantity`, `product_type`, `created_at`, and `is_active`.
4. Keep customer/order tables private and secure with appropriate policies. Do not allow public users to insert or read other customers' orders without a carefully designed policy.
5. Store Admin is still a local demo tool: product edits made there do not sync to Supabase. Shared product management requires authenticated admin functionality and database write policies.

## Important limitations
- This is a static starter, not a production-ready ecommerce platform.
- No online payment integration, automatic order persistence, shipping integration, or authenticated admin panel is included.
- Check stock and final price manually before confirming WhatsApp orders.


## ARKS ONE visual update
This version adds the supplied ARKS ONE shopping poster near the top of the home page and updates the brand colors to navy blue and orange. It retains the existing Supabase product-read setup and demo checkout limitations.
