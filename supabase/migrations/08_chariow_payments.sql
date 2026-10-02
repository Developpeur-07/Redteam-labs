-- Paiements Chariow et accès déclenchés exclusivement par webhook signé.
CREATE TABLE IF NOT EXISTS public.user_entitlements (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked')),
  chariow_sale_id TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chariow_sales (
  sale_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('awaiting_payment', 'completed', 'failed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chariow_deliveries (
  delivery_id TEXT PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chariow_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chariow_deliveries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.user_entitlements FROM anon, authenticated;
REVOKE ALL ON public.chariow_sales FROM anon, authenticated;
REVOKE ALL ON public.chariow_deliveries FROM anon, authenticated;
GRANT SELECT ON public.user_entitlements TO authenticated;
GRANT SELECT ON public.chariow_sales TO authenticated;

DROP POLICY IF EXISTS "Users can read their own entitlement" ON public.user_entitlements;
CREATE POLICY "Users can read their own entitlement"
  ON public.user_entitlements FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read their own Chariow sales" ON public.chariow_sales;
CREATE POLICY "Users can read their own Chariow sales"
  ON public.chariow_sales FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.process_chariow_sale(
  p_delivery_id TEXT,
  p_sale_id TEXT,
  p_user_id UUID,
  p_product_id TEXT,
  p_customer_email TEXT,
  p_amount NUMERIC,
  p_currency TEXT,
  p_completed_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_delivery_id IS NOT NULL THEN
    INSERT INTO public.chariow_deliveries (delivery_id)
    VALUES (p_delivery_id)
    ON CONFLICT (delivery_id) DO NOTHING;

    IF NOT FOUND THEN
      RETURN FALSE;
    END IF;
  END IF;

  INSERT INTO public.chariow_sales (
    sale_id, user_id, product_id, customer_email, amount, currency, status, created_at, completed_at
  ) VALUES (
    p_sale_id, p_user_id, p_product_id, p_customer_email, p_amount, p_currency,
    'completed', COALESCE(p_completed_at, NOW()), COALESCE(p_completed_at, NOW())
  )
  ON CONFLICT (sale_id) DO UPDATE SET
    status = 'completed',
    completed_at = COALESCE(EXCLUDED.completed_at, NOW()),
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency
  WHERE public.chariow_sales.status <> 'completed'
    AND public.chariow_sales.user_id = EXCLUDED.user_id
    AND public.chariow_sales.product_id = EXCLUDED.product_id
    AND public.chariow_sales.customer_email = EXCLUDED.customer_email;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.user_entitlements (
    user_id, status, chariow_sale_id, product_id, customer_email, purchased_at, updated_at
  ) VALUES (
    p_user_id, 'active', p_sale_id, p_product_id, p_customer_email, COALESCE(p_completed_at, NOW()), NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'active',
    chariow_sale_id = EXCLUDED.chariow_sale_id,
    product_id = EXCLUDED.product_id,
    customer_email = EXCLUDED.customer_email,
    purchased_at = EXCLUDED.purchased_at,
    updated_at = NOW();

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_chariow_sale_status(
  p_delivery_id TEXT,
  p_sale_id TEXT,
  p_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('failed', 'abandoned') THEN
    RAISE EXCEPTION 'Unsupported Chariow sale status';
  END IF;

  IF p_delivery_id IS NOT NULL THEN
    INSERT INTO public.chariow_deliveries (delivery_id)
    VALUES (p_delivery_id)
    ON CONFLICT (delivery_id) DO NOTHING;

    IF NOT FOUND THEN
      RETURN FALSE;
    END IF;
  END IF;

  UPDATE public.chariow_sales
  SET status = p_status
  WHERE sale_id = p_sale_id AND status <> 'completed';

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.process_chariow_sale(TEXT, TEXT, UUID, TEXT, TEXT, NUMERIC, TEXT, TIMESTAMPTZ)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_chariow_sale(TEXT, TEXT, UUID, TEXT, TEXT, NUMERIC, TEXT, TIMESTAMPTZ)
  TO service_role;
REVOKE ALL ON FUNCTION public.set_chariow_sale_status(TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_chariow_sale_status(TEXT, TEXT, TEXT)
  TO service_role;
