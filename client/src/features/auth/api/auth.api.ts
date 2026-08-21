import { CustomerDto } from '../../../../../shared/contracts/auth/auth.dto';
import { RegisterInput, LoginInput } from '../../../../../shared/schemas/auth';

export const authApi = {
  async register(data: RegisterInput): Promise<{ customer: CustomerDto; message: string }> {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'Registration failed');
    }

    return await res.json();
  },

  async login(data: LoginInput): Promise<{ customer: CustomerDto; message: string }> {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'Invalid email or password');
    }

    return await res.json();
  },

  async logout(): Promise<void> {
    await fetch('/api/v1/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async getMe(): Promise<{ customer: CustomerDto } | null> {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
};
