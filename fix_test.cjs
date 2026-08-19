const fs = require('fs');

let content = fs.readFileSync('server/tests/integration/order-lifecycle.test.ts', 'utf-8');

content = content.replace(/const setupProduct = async \(\) => \{[\s\S]*?const setupOrder = async \(\) => \{/m, `const setupProduct = async () => {
    const product = await prisma.product.create({
      data: {
        id: randomUUID(),
        sku: \`SKU-\${randomUUID().slice(0, 8)}\`,
        name: 'Test Saree',
        slug: \`test-saree-\${randomUUID().slice(0, 8)}\`,
        seoDescription: 'A test saree',
        shortDescription: 'short',
        longDescription: 'long',
        priceMinor: BigInt(50000),
        currency: 'USD',
      }
    });

    const inventory = await prisma.inventory.create({
      data: {
        productId: product.id,
        onHand: 10,
      }
    });

    return { product, inventory };
  };

  const setupOrder = async () => {`);

content = content.replace(/const checkoutSession = await prisma.checkoutSession.create\(\{[\s\S]*?\}\);/m, `const checkoutSession = await prisma.checkoutSession.create({
      data: {
        id: randomUUID(),
        idempotencyKey: randomUUID(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        status: 'OPEN',
        currency: 'USD',
        subtotalMinor: BigInt(50000),
        taxMinor: BigInt(0),
        shippingMinor: BigInt(0),
        discountMinor: BigInt(0),
        totalMinor: BigInt(50000),
        lines: {
          create: [{
            productId: product.id,
            sku: product.sku,
            name: product.name,
            quantity: 1,
            unitPriceMinor: BigInt(50000),
            lineSubtotalMinor: BigInt(50000),
            reservationId: reservation.reservationId,
          }]
        }
      },
      include: { lines: true }
    });`);

content = content.replace(/const paymentAttempt = await prisma.paymentAttempt.create\(\{[\s\S]*?\}\);/m, `const paymentAttempt = await prisma.paymentAttempt.create({
      data: {
        id: randomUUID(),
        idempotencyKey: randomUUID(),
        providerOrderId: randomUUID(),
        checkoutSessionId: checkoutSession.id,
        amountMinor: BigInt(50000),
        currency: 'USD',
        provider: 'STRIPE',
        providerPaymentId: \`pi_\${randomUUID()}\`,
        status: 'SUCCEEDED'
      }
    });`);

fs.writeFileSync('server/tests/integration/order-lifecycle.test.ts', content);
