'use client';

import { useState } from 'react';
import { createBrowserClient } from '../lib/supabase';
import { PixelButton } from './ui/PixelButton';
import { PixelBox } from './ui/PixelBox';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createBrowserClient();

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <PixelBox className="w-[400px] p-[32px]">
        <div className="text-center mb-[24px]">
          <div className="text-[48px]">🌿</div>
          <h1 className="text-[32px] text-[var(--primary-dark)]">EcoCraft AI</h1>
          <p className="text-[20px] text-[var(--text-light)]">Sáng Tạo Từ Rác</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[12px]">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pixel-box p-[10px] text-[18px] bg-[var(--bg)] text-[var(--text)] outline-none"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="pixel-box p-[10px] text-[18px] bg-[var(--bg)] text-[var(--text)] outline-none"
          />

          {error && (
            <div className="text-[16px] text-[var(--accent)] text-center">{error}</div>
          )}

          <PixelButton variant="primary" fullWidth disabled={loading}>
            {loading ? 'Đang xử lý...' : isSignup ? 'Đăng ký' : 'Đăng nhập'}
          </PixelButton>
        </form>

        <div className="text-center mt-[16px]">
          <button
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            className="text-[16px] text-[var(--primary)] underline cursor-pointer bg-transparent border-none"
          >
            {isSignup ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
          </button>
        </div>
      </PixelBox>
    </div>
  );
}
