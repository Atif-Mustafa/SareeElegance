sed -i "s/    const dummyAmount = 0;/    const dummyAmount = 0;/g" client/src/pages/CheckoutPage.tsx
sed -i "s/subtotalINR: dummyAmount/subtotalINR: checkoutSession ? checkoutSession.subtotal.amount : dummyAmount/g" client/src/pages/CheckoutPage.tsx
sed -i "s/currencyAmount: dummyAmount/currencyAmount: checkoutSession ? checkoutSession.subtotal.amount : dummyAmount/g" client/src/pages/CheckoutPage.tsx
sed -i "s/totalINR: dummyAmount/totalINR: checkoutSession ? checkoutSession.subtotal.amount : dummyAmount/g" client/src/pages/CheckoutPage.tsx
