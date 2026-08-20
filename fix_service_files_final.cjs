const fs = require('fs');

let inv = fs.readFileSync('server/src/modules/inventory/inventory.service.ts', 'utf-8');
// It seems we have multiple exports or messed up bracket structures.
// Let's just grab the whole file, remove the loose methods, and put them inside the class.
const invLines = inv.split('\n');
const exportLine = invLines.findIndex(l => l.includes('export const inventoryService'));
const invClass = invLines.slice(0, exportLine).join('\n');
const extraMethods = `
  async checkAvailability(productId: string, quantity: number = 1): Promise<{ available: boolean, onHand: number }> {
    const inventory = await prisma.inventory.findUnique({ where: { productId } });
    if (!inventory) return { available: false, onHand: 0 };
    return { available: inventory.onHand >= quantity, onHand: inventory.onHand };
  }

  async releaseReservation(reservationId: string) {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id: reservationId } });
      if (!reservation) throw ApiError.notFound('Reservation not found');
      if (reservation.status !== 'ACTIVE') return; // Idempotent

      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'RELEASED' }
      });

      await tx.inventory.update({
        where: { id: reservation.inventoryId },
        data: { onHand: { increment: reservation.quantity } }
      });
    });
  }
`;

// Insert extra methods before the last closing brace of the class
let finalInv = invClass.replace(/}\s*$/, extraMethods + '\n}\n\nexport const inventoryService = new InventoryService();\n');
fs.writeFileSync('server/src/modules/inventory/inventory.service.ts', finalInv);


let pay = fs.readFileSync('server/src/modules/payment/payment.service.ts', 'utf-8');
const payLines = pay.split('\n');
const exportLinePay = payLines.findIndex(l => l.includes('export const paymentService'));
const payClass = payLines.slice(0, exportLinePay).join('\n');
const extraPayMethods = `
  async createPaymentAttempt(checkoutSessionId: string, amountMinor: bigint, currency: string, provider: PaymentProvider): Promise<{ id: string, providerOrderId: string }> {
    const providerOrderId = \`po_\${randomBytes(8).toString('hex')}\`;
    const attempt = await prisma.paymentAttempt.create({
      data: {
        idempotencyKey: randomUUID(),
        checkoutSessionId,
        provider,
        providerOrderId,
        amountMinor,
        currency,
        status: 'CREATED'
      }
    });
    return { id: attempt.id, providerOrderId: attempt.providerOrderId };
  }

  async verifyPayment(providerOrderId: string): Promise<{ paymentAttemptId: string, status: PaymentStatus }> {
    const attempt = await prisma.paymentAttempt.findUnique({ where: { providerOrderId } });
    if (!attempt) throw ApiError.notFound('Payment attempt not found');
    
    // Simple mock transition
    const newStatus: PaymentStatus = attempt.status === 'CREATED' ? 'SUCCEEDED' : attempt.status;

    if (newStatus !== attempt.status) {
      await prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: { status: newStatus, verifiedAt: new Date() }
      });
    }
    return { paymentAttemptId: attempt.id, status: newStatus };
  }

  async handleWebhook(provider: string, payload: any): Promise<void> {
    // mock webhook handler
  }
`;

let finalPay = payClass.replace(/}\s*$/, extraPayMethods + '\n}\n\nexport const paymentService = new PaymentService();\n');
fs.writeFileSync('server/src/modules/payment/payment.service.ts', finalPay);

