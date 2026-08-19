const fs = require('fs');

let content = fs.readFileSync('prisma/schema.prisma', 'utf-8');

if (!content.includes('enum ShipmentStatus')) {
  content = content.replace('model FulfillmentHandoff {', `enum ShipmentStatus {
  CREATED
  DISPATCHED
  IN_TRANSIT
  DELIVERED
  FAILED
  CANCELLED
}

model Shipment {
  id                 String           @id @default(uuid())
  orderId            String           @unique
  order              Order            @relation(fields: [orderId], references: [id], onDelete: Cascade)
  fulfillmentId      String           @unique
  fulfillmentHandoff FulfillmentHandoff @relation(fields: [fulfillmentId], references: [id])
  provider           String
  providerShipmentId String           @unique
  trackingNumber     String?
  status             ShipmentStatus   @default(CREATED)
  statusHistory      ShipmentStatusHistory[]
  
  shippingAddress    Json
  
  dispatchedAt       DateTime?
  deliveredAt        DateTime?
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt
}

model ShipmentStatusHistory {
  id          String         @id @default(uuid())
  shipmentId  String
  shipment    Shipment       @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
  status      ShipmentStatus
  reason      String?
  providerEventId String?
  createdAt   DateTime       @default(now())

  @@index([shipmentId])
}

model FulfillmentHandoff {`);
}

if (!content.includes('shipment         Shipment?')) {
  content = content.replace('fulfillmentHandoff FulfillmentHandoff?', `fulfillmentHandoff FulfillmentHandoff?
  shipment         Shipment?`);
}

if (!content.includes('shipment   Shipment?')) {
  content = content.replace('handoffData Json', `handoffData Json
  shipment   Shipment?`);
}


fs.writeFileSync('prisma/schema.prisma', content);
