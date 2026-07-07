-- Allow customers to update their own payment records (to save proof_url)
create policy "payments_update_customer" on public.payments for update using (
  exists (
    select 1 from public.bookings
    where bookings.id = payments.booking_id and bookings.customer_id = auth.uid()
  )
);
