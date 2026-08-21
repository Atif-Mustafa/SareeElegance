import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { adminApi } from '../api/adminApi';

interface AdminLoginProps {
  onSuccess: (admin: any) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('admin@sareeelegance.com');
  const [password, setPassword] = useState('Admin@123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { admin } = await adminApi.login({ email, password });
      onSuccess(admin);
    } catch (err: any) {
      setError(err.message || 'Administrative authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Admin@123456');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-[#EBE4DC]">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-[#7A1E3A]/10 rounded-full flex items-center justify-center mb-4 text-[#7A1E3A]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#2C221E]">
            Operations Console
          </h2>
          <p className="mt-2 text-sm text-[#6E5D53]">
            Authoritative catalog, inventory, and fulfillment boundary
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Authentication Failed</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3E39] mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8C7A70]" />
              <input
                id="admin-login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sareeelegance.com"
                className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F2] border border-[#D5C7BC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1E3A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3E39] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8C7A70]" />
              <input
                id="admin-login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F2] border border-[#D5C7BC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1E3A]"
              />
            </div>
          </div>

          <button
            id="admin-login-submit"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#7A1E3A] hover:bg-[#60172E] text-white font-medium rounded-lg text-sm shadow transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Access Operations Boundary
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#EBE4DC]">
          <p className="text-xs font-medium text-[#8C7A70] text-center mb-3">
            Quick fill demo operational credentials:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@sareeelegance.com')}
              className="flex-1 py-1.5 px-2 bg-[#FAF7F2] hover:bg-[#F3EFE9] border border-[#D5C7BC] text-[#4A3E39] text-xs rounded transition-colors"
            >
              👑 Admin (Full)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('operations@sareeelegance.com')}
              className="flex-1 py-1.5 px-2 bg-[#FAF7F2] hover:bg-[#F3EFE9] border border-[#D5C7BC] text-[#4A3E39] text-xs rounded transition-colors"
            >
              📦 Operations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
