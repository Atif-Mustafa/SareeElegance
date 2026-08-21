import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { CustomerDto, CustomerAddressDto } from '../../../../shared/contracts/auth/auth.dto';
import { UpdateProfileInput, CreateAddressInput } from '../../../../shared/schemas/auth';
import { createHash } from 'crypto';

export class CustomerService {
  async getProfile(customerId: string): Promise<CustomerDto> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      throw ApiError.notFound('Customer profile not found');
    }

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      role: (customer.role as any) || 'CUSTOMER',
      createdAt: customer.createdAt.toISOString()
    };
  }

  async updateProfile(customerId: string, data: UpdateProfileInput): Promise<CustomerDto> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      throw ApiError.notFound('Customer profile not found');
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        name: data.name !== undefined ? (data.name?.trim() || null) : undefined,
        phone: data.phone !== undefined ? (data.phone?.trim() || null) : undefined
      }
    });

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      role: (updated.role as any) || 'CUSTOMER',
      createdAt: updated.createdAt.toISOString()
    };
  }

  async getAddresses(customerId: string): Promise<CustomerAddressDto[]> {
    const addresses = await prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });

    return addresses.map(addr => ({
      id: addr.id,
      recipientName: addr.recipientName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      isDefault: addr.isDefault,
      createdAt: addr.createdAt.toISOString(),
      updatedAt: addr.updatedAt.toISOString()
    }));
  }

  async createAddress(customerId: string, data: CreateAddressInput): Promise<CustomerAddressDto> {
    return await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId, isDefault: true },
          data: { isDefault: false }
        });
      }

      // If this is the first address, make it default automatically
      const count = await tx.customerAddress.count({ where: { customerId } });
      const isDefault = count === 0 ? true : !!data.isDefault;

      const address = await tx.customerAddress.create({
        data: {
          customerId,
          recipientName: data.recipientName.trim(),
          phone: data.phone?.trim() || null,
          addressLine1: data.addressLine1.trim(),
          addressLine2: data.addressLine2?.trim() || null,
          city: data.city.trim(),
          state: data.state.trim(),
          pincode: data.pincode.trim(),
          country: data.country?.trim() || 'India',
          isDefault
        }
      });

      return {
        id: address.id,
        recipientName: address.recipientName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country,
        isDefault: address.isDefault,
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString()
      };
    });
  }

  async deleteAddress(customerId: string, addressId: string): Promise<void> {
    const address = await prisma.customerAddress.findFirst({
      where: { id: addressId, customerId }
    });

    if (!address) {
      throw ApiError.notFound('Address not found');
    }

    await prisma.customerAddress.delete({
      where: { id: addressId }
    });
  }

  async getCustomerOrders(customerId: string, page: number = 1, limit: number = 10) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [total, orders] = await Promise.all([
      prisma.order.count({ where: { customerId } }),
      prisma.order.findMany({
        where: { customerId },
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          lines: true,
          shipment: true,
          returns: {
            include: {
              lines: true,
              shipment: true
            }
          }
        }
      })
    ]);

    const mappedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      currency: order.currency,
      totals: {
        productSubtotalMinor: order.productSubtotalMinor.toString(),
        taxMinor: order.taxMinor.toString(),
        shippingMinor: order.shippingMinor.toString(),
        discountMinor: order.discountMinor.toString(),
        totalMinor: order.totalMinor.toString()
      },
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      email: order.email,
      phone: order.phone,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      lines: order.lines.map(line => ({
        id: line.id,
        productId: line.productId,
        sku: line.sku,
        name: line.name,
        quantity: line.quantity,
        unitPriceMinor: line.unitPriceMinor.toString(),
        lineSubtotalMinor: line.lineSubtotalMinor.toString()
      })),
      shipment: order.shipment ? {
        id: order.shipment.id,
        provider: order.shipment.provider,
        trackingNumber: order.shipment.trackingNumber,
        status: order.shipment.status,
        dispatchedAt: order.shipment.dispatchedAt?.toISOString() || null,
        deliveredAt: order.shipment.deliveredAt?.toISOString() || null
      } : null,
      returns: order.returns.map(ret => ({
        id: ret.id,
        status: ret.status,
        refundStatus: ret.refundStatus,
        reason: ret.reason,
        refundAmountMinor: ret.refundAmountMinor?.toString() || null,
        createdAt: ret.createdAt.toISOString()
      }))
    }));

    return {
      orders: mappedOrders,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit)
      }
    };
  }

  async claimGuestOrder(customerId: string, orderId: string, accessToken: string) {
    return await prisma.$transaction(async (tx) => {
      // Lock row for update
      await tx.$queryRaw`SELECT * FROM "Order" WHERE "id" = ${orderId} FOR UPDATE`;

      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { lines: true }
      });

      if (!order) {
        throw ApiError.notFound('Order not found');
      }

      // Verify token
      const hashedInput = createHash('sha256').update(accessToken).digest('hex');
      if (order.accessToken !== hashedInput && order.accessToken !== accessToken) {
        throw ApiError.unauthorized('Invalid access token for order', 'INVALID_ACCESS_TOKEN');
      }

      // Check if already claimed by this customer (idempotent)
      if (order.customerId === customerId) {
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          customerId: order.customerId,
          message: 'Order already linked to your account'
        };
      }

      // Check if already claimed by a different customer
      if (order.customerId && order.customerId !== customerId) {
        throw ApiError.badRequest('This order is already claimed by another account', 'ORDER_ALREADY_CLAIMED');
      }

      // Link order to customer
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { customerId },
        include: { lines: true }
      });

      return {
        id: updated.id,
        orderNumber: updated.orderNumber,
        status: updated.status,
        customerId: updated.customerId,
        message: 'Order linked successfully to your account'
      };
    });
  }
}

export const customerService = new CustomerService();
