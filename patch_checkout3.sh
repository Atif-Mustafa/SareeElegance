sed -i "s/<span>Verified Catalog Subtotal<\/span>/<span>Verified Catalog Subtotal<\/span>/g" client/src/pages/CheckoutPage.tsx
sed -i "s/<span>{formatMoney(validatedSubtotal)}<\/span>/<span>{checkoutSession ? formatMoney(checkoutSession.subtotal) : formatMoney(validatedSubtotal)}<\/span>/g" client/src/pages/CheckoutPage.tsx
