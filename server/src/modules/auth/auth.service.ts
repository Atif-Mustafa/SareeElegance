import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { CustomerDto } from '../../../../shared/contracts/auth/auth.dto';
import { RegisterInput, LoginInput } from '../../../../shared/schemas/auth';
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';

export class AuthService {
  private readonly SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly BCRYPT_SALT_ROUNDS = 10;

  async register(data: RegisterInput): Promise<{ customer: CustomerDto; sessionToken: string }> {
    const normalizedEmail = data.email.trim().toLowerCase();

    // Check if email already exists
    const existing = await prisma.customer.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      throw ApiError.conflict('An account with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(data.password, this.BCRYPT_SALT_ROUNDS);

    const customer = await prisma.customer.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: data.name?.trim() || null,
        phone: data.phone?.trim() || null
      }
    });

    const sessionToken = await this.createSession(customer.id);

    return {
      customer: this.mapCustomerToDto(customer),
      sessionToken
    };
  }

  async login(data: LoginInput): Promise<{ customer: CustomerDto; sessionToken: string }> {
    const normalizedEmail = data.email.trim().toLowerCase();

    const customer = await prisma.customer.findUnique({
      where: { email: normalizedEmail }
    });

    if (!customer) {
      // Generic invalid credentials error to prevent enumeration
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(data.password, customer.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const sessionToken = await this.createSession(customer.id);

    return {
      customer: this.mapCustomerToDto(customer),
      sessionToken
    };
  }

  async logout(rawToken: string): Promise<void> {
    if (!rawToken) return;
    const tokenHash = this.hashToken(rawToken);
    await prisma.customerSession.deleteMany({
      where: { tokenHash }
    });
  }

  async validateSession(rawToken: string): Promise<CustomerDto | null> {
    if (!rawToken) return null;
    const tokenHash = this.hashToken(rawToken);

    const session = await prisma.customerSession.findUnique({
      where: { tokenHash },
      include: { customer: true }
    });

    if (!session) {
      return null;
    }

    // Check expiration
    if (session.expiresAt < new Date()) {
      await prisma.customerSession.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    return this.mapCustomerToDto(session.customer);
  }

  private async createSession(customerId: string): Promise<string> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION_MS);

    await prisma.customerSession.create({
      data: {
        tokenHash,
        customerId,
        expiresAt
      }
    });

    return rawToken;
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  async ensureAdminUser(email: string = 'admin@sareeelegance.com', password: string = 'Admin@123456', role: 'ADMIN' | 'OPERATIONS' = 'ADMIN') {
    const normalizedEmail = email.trim().toLowerCase();
    let user = await prisma.customer.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      const passwordHash = await bcrypt.hash(password, this.BCRYPT_SALT_ROUNDS);
      user = await prisma.customer.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name: role === 'ADMIN' ? 'System Administrator' : 'Operations Manager',
          role: role as any
        }
      });
    } else if (user.role !== role && (user.role === 'CUSTOMER' || role === 'ADMIN')) {
      user = await prisma.customer.update({
        where: { id: user.id },
        data: { role: role as any }
      });
    }
    return user;
  }

  async createAdminSession(userId: string): Promise<string> {
    return this.createSession(userId);
  }

  public mapCustomerToDto(customer: any): CustomerDto {
    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      role: (customer.role as any) || 'CUSTOMER',
      createdAt: customer.createdAt instanceof Date ? customer.createdAt.toISOString() : customer.createdAt
    };
  }
}

export const authService = new AuthService();
