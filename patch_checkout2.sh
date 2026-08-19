sed -i "s/onClick={handleCheckoutInitialization}/onClick={handleCheckoutInitialization} disabled={isInitializing}/g" client/src/pages/CheckoutPage.tsx
sed -i "s/<span>Continue to Payment<\/span>/<span>{isInitializing ? 'Validating...' : 'Continue to Payment'}<\/span>/g" client/src/pages/CheckoutPage.tsx
