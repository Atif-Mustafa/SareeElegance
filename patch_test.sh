sed -i 's/idempotencyKey: randomUUID(),//' server/tests/integration/order-lifecycle.test.ts
sed -i 's/expiresAt: new Date(),//' server/tests/integration/order-lifecycle.test.ts
