ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_question text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_reply text;
