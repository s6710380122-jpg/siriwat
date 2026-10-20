import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
}) => {
  const { registerWithEmail, loginWithEmail, loginWithGoogle, sendResetPassword } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setTab(initialTab);
    setError(null);
    setSuccessMessage(null);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const getFirebaseErrorMessage = (err: any): string => {
    const msg = err?.message || String(err);
    if (msg.includes('auth/invalid-email')) return 'รูปแบบอีเมลไม่ถูกต้อง';
    if (msg.includes('auth/user-not-found')) return 'ไม่พบบัญชีผู้ใช้นี้ในระบบ';
    if (msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential'))
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    if (msg.includes('auth/email-already-in-use')) return 'อีเมลนี้ถูกลงทะเบียนใช้งานแล้ว';
    if (msg.includes('auth/weak-password')) return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    if (msg.includes('auth/too-many-requests')) return 'ลองเข้าสู่ระบบหลายครั้งเกินไป โปรดรอสักครู่';
    if (msg.includes('auth/popup-closed-by-user')) return 'การเข้าสู่ระบบผ่าน Google ถูกยกเลิก';
    return 'เกิดข้อผิดพลาด: ' + (err?.message || 'โปรดลองอีกครั้ง');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      showToast('success', 'เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับกลับ`);
      onClose();
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('กรุณากรอกชื่อ-นามสกุล หรือชื่อที่ใช้แสดงอย่างน้อย 2 ตัวอักษร');
      return;
    }
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      const res = await registerWithEmail(name, email, password);
      showToast(
        'success',
        'ลงทะเบียนสมาชิกเรียบร้อยแล้ว',
        res.needVerification ? 'ระบบได้ส่งอีเมลยืนยันตัวตนไปยังกล่องข้อความของคุณแล้ว' : ''
      );
      onClose();
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('กรุณากรอกอีเมลที่ใช้ลงทะเบียน');
      return;
    }

    setLoading(true);
    try {
      await sendResetPassword(email);
      setSuccessMessage('ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณเรียบร้อยแล้ว โปรดตรวจสอบในกล่องจดหมาย');
      showToast('success', 'ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว', 'โปรดตรวจสอบกล่องข้อความในอีเมลของคุณ');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast('success', 'เข้าสู่ระบบด้วย Google สำเร็จ');
      onClose();
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {tab === 'login' && 'เข้าสู่ระบบ EduHub'}
                {tab === 'register' && 'สมัครสมาชิกใหม่'}
                {tab === 'forgot' && 'ลืมรหัสผ่าน'}
              </h3>
              <p className="text-[11px] text-slate-500">
                ระบบจัดการคลังความรู้และสื่อการเรียนรู้ออนไลน์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        {tab !== 'forgot' && (
          <div className="flex border-b border-slate-100 text-sm font-semibold bg-slate-50/70">
            <button
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 py-3 text-center transition-all ${
                tab === 'login'
                  ? 'bg-white text-blue-700 border-b-2 border-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`flex-1 py-3 text-center transition-all ${
                tab === 'register'
                  ? 'bg-white text-blue-700 border-b-2 border-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>
        )}

        {/* Modal Form Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Google Sign In */}
          {tab !== 'forgot' && (
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วยบัญชี Google</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-white px-2 text-slate-400 font-semibold">หรือดำเนินการด้วยอีเมล</span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">อีเมล (Email)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">รหัสผ่าน (Password)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setError(null);
                    }}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>เข้าสู่ระบบ</span>
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ชื่อ-นามสกุล หรือชื่อแสดงผล</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี หรือ ครูสมศรี"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">อีเมล (Email)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ตั้งรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/70 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  ระบบจะส่งอีเมลยืนยันตัวตนจริงไปยังอีเมลของคุณโดยอัตโนมัติ เพื่อความปลอดภัยของข้อมูล
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>สมัครสมาชิก</span>
              </button>
            </form>
          )}

          {tab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 leading-relaxed">
                กรุณากรอกอีเมลของคุณ ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังกล่องจดหมายของคุณด้วย Firebase Password Reset API
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">อีเมลที่ใช้ลงทะเบียน</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>ส่งลิงก์ตั้งรหัสผ่านใหม่</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
