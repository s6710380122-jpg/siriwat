import React, { useState } from 'react';
import {
  GraduationCap,
  PlusCircle,
  Heart,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  Search,
  Menu,
  X,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

interface NavbarProps {
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
  onOpenCreateResource: () => void;
  currentView: 'catalog' | 'favorites' | 'my-resources' | 'admin';
  onChangeView: (view: 'catalog' | 'favorites' | 'my-resources' | 'admin') => void;
  pendingReportsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenCreateResource,
  currentView,
  onChangeView,
  pendingReportsCount = 0,
}) => {
  const { user, profile, role, isAdmin, isModerator, isMember, logout, isSuspended } = useAuth();
  const { settings } = useSettings();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            ผู้ดูแลระบบ (Admin)
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            ผู้ตรวจสอบ (Moderator)
          </span>
        );
      case 'member':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            สมาชิก (Member)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            บุคคลทั่วไป
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onChangeView('catalog')}
              className="flex items-center gap-2.5 text-left group transition-all"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-sky-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-900 flex items-center gap-1.5">
                  Edu<span className="text-blue-600">Hub</span>
                </span>
                <p className="text-[11px] font-medium text-slate-500 hidden sm:block truncate max-w-[220px]">
                  {settings.siteName || 'คลังความรู้และสื่อการเรียนรู้'}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onChangeView('catalog')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'catalog'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              คลังความรู้
            </button>

            {user && (
              <>
                <button
                  onClick={() => onChangeView('favorites')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'favorites'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>รายการโปรด</span>
                </button>

                <button
                  onClick={() => onChangeView('my-resources')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'my-resources'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <FolderOpen className="w-4 h-4 text-sky-600" />
                  <span>สื่อของฉัน</span>
                </button>
              </>
            )}

            {isModerator && (
              <button
                onClick={() => onChangeView('admin')}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === 'admin'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <span>แผงควบคุมผู้ดูแล</span>
                {pendingReportsCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse">
                    {pendingReportsCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Create Resource CTA */}
            {user ? (
              <button
                onClick={onOpenCreateResource}
                disabled={isSuspended}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>โพสต์สื่อการเรียนรู้</span>
              </button>
            ) : null}

            {/* Auth section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      (user.displayName || user.email || 'U')[0].toUpperCase()
                    )}
                  </div>
                  <div className="hidden lg:block text-xs">
                    <p className="font-semibold text-slate-800 truncate max-w-[120px]">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <div className="mt-0.5">{getRoleBadge()}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 py-2 divide-y divide-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
                      <div className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user.displayName || 'ผู้ใช้งาน'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <div className="mt-2 flex items-center justify-between">
                          {getRoleBadge()}
                          {user.emailVerified ? (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" /> ยืนยันอีเมลแล้ว
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5" /> รอการยืนยันอีเมล
                            </span>
                          )}
                        </div>
                        {isSuspended && (
                          <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700 font-medium">
                            บัญชีนี้ถูกระงับการใช้งานชั่วคราว ไม่สามารถโพสต์หรือแสดงความเห็นได้
                          </div>
                        )}
                      </div>

                      <div className="py-1 text-sm">
                        <button
                          onClick={() => {
                            onChangeView('favorites');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                        >
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span>รายการโปรดของฉัน</span>
                        </button>
                        <button
                          onClick={() => {
                            onChangeView('my-resources');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                        >
                          <FolderOpen className="w-4 h-4 text-sky-600" />
                          <span>สื่อการสอนของฉัน</span>
                        </button>
                        {isModerator && (
                          <button
                            onClick={() => {
                              onChangeView('admin');
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-indigo-700 hover:bg-indigo-50 font-medium"
                          >
                            <ShieldAlert className="w-4 h-4 text-indigo-600" />
                            <span>แผงควบคุมผู้ดูแล (Admin)</span>
                          </button>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>ออกจากระบบ</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all"
                >
                  สมัครสมาชิก
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 space-y-1">
            <button
              onClick={() => {
                onChangeView('catalog');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentView === 'catalog' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
              }`}
            >
              คลังความรู้
            </button>
            {user && (
              <>
                <button
                  onClick={() => {
                    onChangeView('favorites');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    currentView === 'favorites' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                  }`}
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>รายการโปรด</span>
                </button>
                <button
                  onClick={() => {
                    onChangeView('my-resources');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    currentView === 'my-resources' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                  }`}
                >
                  <FolderOpen className="w-4 h-4 text-sky-600" />
                  <span>สื่อของฉัน</span>
                </button>
                <button
                  onClick={() => {
                    onOpenCreateResource();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isSuspended}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>โพสต์สื่อการเรียนรู้ใหม่</span>
                </button>
              </>
            )}
            {isModerator && (
              <button
                onClick={() => {
                  onChangeView('admin');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                  currentView === 'admin' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <span>แผงควบคุมผู้ดูแล (Admin)</span>
                </span>
                {pendingReportsCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold text-white bg-rose-500 rounded-full">
                    {pendingReportsCount}
                  </span>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
