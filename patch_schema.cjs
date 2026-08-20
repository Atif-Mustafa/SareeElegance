const fs = require('fs');

let content = fs.readFileSync('prisma/schema.prisma', 'utf-8');

if (!content.includes('enum ReturnStatus')) {
  content = content.replace('model OrderLine {', `enum ReturnStatus {
  REQUESTED
  APPROVED
  REJECTED
  AWAITING_RETURN
  IN_TRANSIT
  RECEIVED
  INSPECTED
  CLOSED
}

enum RefundStatus {
  NOT_REQUESTED
  PENDING
  SUCCEEDED
  FAILED
}

enum ReturnDisposition {
  PENDING
  RESTOCKABLE
  DAMAGED
  NON_RESELLABLE
}

model ReturnRequest {
  id              String         @id @default(uuid())
  orderId         String
  order           Order          @relation(fields: [orderId], references: [id])
  status          ReturnStatus   @default(REQUESTED)
  refundStatus    RefundStatus   @default(NOT_REQUESTED)
  providerRefundId String?       @unique
  reason          String?
  lines           ReturnLine[]
  shipment        ReturnShipment?
  refundAmountMinor BigInt?
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([orderId])
}

model ReturnLine {
  id              String            @id @default(uuid())
  returnRequestId String
  returnRequest   ReturnRequest     @relation(fields: [returnRequestId], references: [id], onDelete: Cascade)
  orderLineId     String
  orderLine       OrderLine         @relation(fields: [orderLineId], references: [id])
  quantity        Int
  reason          String?
  disposition     ReturnDisposition @default(PENDING)

  @@index([returnRequestId])
  @@index([orderLineId])
}

enum ReturnShipmentStatus {
  CREATED
  IN_TRANSIT
  RECEIVED
  FAILED
  CANCELLED
}

model ReturnShipment {
  id                 String               @id @default(uuid())
  returnRequestId    String               @unique
  returnRequest      ReturnRequest        @relation(fields: [returnRequestId], references: [id], onDelete: Cascade)
  provider           String
  providerShipmentId String               @unique
  trackingNumber     String?
  status             ReturnShipmentStatus @default(CREATED)
  
  createdAt          DateTime             @default(now())
  updatedAt          DateTime             @updatedAt
}

model OrderLine {`);
}

if (!content.includes('returns              ReturnRequest[]')) {
  content = content.replace('lines                OrderLine[]', `lines                OrderLine[]
  returns              ReturnRequest[]`);
}

if (!content.includes('returnLines       ReturnLine[]')) {
  content = content.replace('@@index([orderId])', `@@index([orderId])
  returnLines       ReturnLine[]`);
}

fs.writeFileSync('prisma/schema.prisma', content);
