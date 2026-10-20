import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Settings as SettingsIcon,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Lock,
  Unlock,
  Plus,
  Edit2,
  Search,
  History,
  TrendingUp,
  FolderPlus,
  AlertCircle,
  Save,
  Loader2,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { ModerationLogItem, ReportItem, ReportStatus, Resource, UserProfile, UserRole } from '../types';
import {
  subscribeToReports,
  subscribeToUsers,
  updateReportStatus,
  updateUserAccount,
  subscribeToModerationLogs,
  addModerationLog,
} from '../services/adminService';
import { updateResource, deleteResource } from '../services/resourceService';

interface AdminDashboardProps {
  resources: Resource[];
  onOpenResourceDetail: (resource: Resource) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  resources,
  onOpenResourceDetail,
}) => {
  const { user, profile, isAdmin } = useAuth();
  const { settings, updateSettings, addCategory, removeCategory, editCategory } = useSettings();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'reports' | 'resources' | 'members' | 'settings' | 'logs'>('reports');

  // Live state from Firebase
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<ModerationLogItem[]>([]);

  // Search & filter states
  const [userSearch, setUserSearch] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  // Site settings form
  const [siteName, setSiteName] = useState(settings.siteName);
  const [siteDesc, setSiteDesc] = useState(settings.siteDescription);
  const [announcement, setAnnouncement] = useState(settings.announcement || '');
  const [newCatInput, setNewCatInput] = useState('');
  const [editingCat, setEditingCat] = useState<{ old: string; current: string } | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Confirm delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'resource' | 'report'; id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const unsubReports = subscribeToReports(setReports);
    const unsubUsers = subscribeToUsers(setUsers);
    const unsubLogs = subscribeToModerationLogs(setLogs);

    return () => {
      unsubReports();
      unsubUsers();
      unsubLogs();
    };
  }, []);

  useEffect(() => {
    setSiteName(settings.siteName);
    setSiteDesc(settings.siteDescription);
    setAnnouncement(settings.announcement || '');
  }, [settings]);

  // Moderation: Handle Report action
  const handleResolveReport = async (report: ReportItem, status: ReportStatus) => {
    if (!user) return;
    try {
      await updateReportStatus(report.id, status, user.uid);
      await addModerationLog({
        action: `เปลี่ยนสถานะรายงานเป็น ${status}`,
        targetType: 'report',
        targetId: report.id,
        performedBy: user.uid,
        performedByName: user.displayName || user.email || 'Admin',
        reason: `รายงานสื่อ ID: ${report.resourceId}`,
      });
      showToast('success', 'อัปเดตสถานะรายงานแล้ว');
    } catch (e) {
      showToast('error', 'ไม่สามารถอัปเดตสถานะรายงานได้');
    }
  };

  // Toggle resource visibility
  const handleToggleResourceVisibility = async (resource: Resource) => {
    if (!user) return;
    const newStatus = !resource.isPublished;
    try {
      await updateResource(resource.id, { isPublished: newStatus });
      await addModerationLog({
        action: newStatus ? 'เปิดเผยแพร่สื่อสู่สาธารณะ' : 'ซ่อนสื่อจากสาธารณะ',
        targetType: 'resource',
        targetId: resource.id,
        performedBy: user.uid,
        performedByName: user.displayName || user.email || 'Admin',
        reason: 'การตรวจสอบโดยผู้ดูแลระบบ',
      });
      showToast('success', newStatus ? 'เปิดเผยแพร่สื่อแล้ว' : 'ซ่อนสื่อเรียบร้อยแล้ว');
    } catch (e) {
      showToast('error', 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะสื่อ');
    }
  };

  // Confirm and delete resource
  const handleConfirmDelete = async () => {
    if (!deleteTarget || !user) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'resource') {
        await deleteResource(deleteTarget.id);
        await addModerationLog({
          action: 'ลบสื่อการเรียนรู้ถาวร',
          targetType: 'resource',
          targetId: deleteTarget.id,
          performedBy: user.uid,
          performedByName: user.displayName || user.email || 'Admin',
          reason: `ลบสื่อ: ${deleteTarget.title}`,
        });
        showToast('success', 'ลบสื่อการเรียนรู้เรียบร้อยแล้ว');
      }
      setDeleteTarget(null);
    } catch (e) {
      showToast('error', 'ไม่สามารถลบข้อมูลได้');
    } finally {
      setIsDeleting(false);
    }
  };

  // Member management: change role
  const handleChangeRole = async (targetUser: UserProfile, newRole: 'member' | 'moderator' | 'admin') => {
    if (!user || !isAdmin) return;
    try {
      await updateUserAccount(
        targetUser.uid,
        { role: newRole },
        user.uid,
        user.displayName || user.email || 'Admin',
        `เปลี่ยนบทบาทเป็น ${newRole}`
      );
      showToast('success', 'ปรับเปลี่ยนบทบาทสมาชิกสำเร็จ');
    } catch (e) {
      showToast('error', 'ไม่สามารถเปลี่ยนสิทธิ์ได้');
    }
  };

  // Member management: toggle suspension
  const handleToggleSuspension = async (targetUser: UserProfile) => {
    if (!user) return;
    const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    try {
      await updateUserAccount(
        targetUser.uid,
        { status: newStatus },
        user.uid,
        user.displayName || user.email || 'Admin',
        newStatus === 'suspended' ? 'ระงับการใช้งานบัญชีเนื่องจากละเมิดกฎ' : 'ยกเลิกการระงับบัญชี'
      );
      showToast('success', newStatus === 'suspended' ? 'ระงับบัญชีผู้ใช้แล้ว' : 'ยกเลิกการระงับบัญชีแล้ว');
    } catch (e) {
      showToast('error', 'ไม่สามารถเปลี่ยนสถานะบัญชีได้');
    }
  };

  // Save General Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) return;
    setSavingSettings(true);
    try {
      await updateSettings(
        {
          siteName: siteName.trim(),
          siteDescription: siteDesc.trim(),
          announcement: announcement.trim(),
        },
        user.uid
      );
      await addModerationLog({
        action: 'ปรับปรุงการตั้งค่าเว็บไซต์',
        targetType: 'settings',
        targetId: 'general',
        performedBy: user.uid,
        performedByName: user.displayName || user.email || 'Admin',
      });
      showToast('success', 'บันทึกการตั้งค่าเว็บไซต์เรียบร้อยแล้ว');
    } catch (e) {
      showToast('error', 'ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      setSavingSettings(false);
    }
  };

  // Category additions
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim() || !user || !isAdmin) return;
    try {
      await addCategory(newCatInput.trim(), user.uid);
      setNewCatInput('');
      showToast('success', 'เพิ่มหมวดหมู่ใหม่สำเร็จ');
    } catch (e) {
      showToast('error', 'ไม่สามารถเพิ่มหมวดหมู่ได้');
    }
  };

  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !user || !isAdmin) return;
    try {
      await editCategory(editingCat.old, editingCat.current, user.uid);
      setEditingCat(null);
      showToast('success', 'แก้ไขชื่อหมวดหมู่สำเร็จ');
    } catch (e) {
      showToast('error', 'ไม่สามารถแก้ไขหมวดหมู่ได้');
    }
  };

  const handleRemoveCategory = async (catName: string) => {
    if (!user || !isAdmin) return;
    if (confirm(`ยืนยันการลบหมวดหมู่ "${catName}" หรือไม่?`)) {
      try {
        await removeCategory(catName, user.uid);
        showToast('success', 'ลบหมวดหมู่เรียบร้อยแล้ว');
      } catch (e) {
        showToast('error', 'ไม่สามารถลบหมวดหมู่ได้');
      }
    }
  };

  // Computed metrics
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const totalViews = resources.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);
  const filteredUsers = users.filter((u) =>
    (u.displayName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredResources = resources.filter((r) =>
    r.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
    r.category.toLowerCase().includes(resourceSearch.toLowerCase()) ||
    r.authorName.toLowerCase().includes(resourceSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold mb-3 border border-white/10">
            <ShieldAlert className="w-4 h-4 text-sky-300" />
            <span>EduHub Moderator & Administrator Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            แผงควบคุมระบบและการจัดการผู้ดูแล
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            ตรวจสอบสื่อที่ถูกรายงาน จัดการสิทธิ์สมาชิก และตั้งค่าเว็บไซต์แบบไดนามิกโดยไม่ต้องแก้ไขโค้ด
          </p>
        </div>

        {/* Overview Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
            <span className="block text-2xl font-black text-white">{resources.length}</span>
            <span className="text-[11px] text-slate-300">สื่อทั้งหมด</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
            <span className="block text-2xl font-black text-rose-300">{pendingReports.length}</span>
            <span className="text-[11px] text-slate-300">รายงานรอตรวจ</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
            <span className="block text-2xl font-black text-emerald-300">{users.length}</span>
            <span className="text-[11px] text-slate-300">สมาชิกทั้งหมด</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
            <span className="block text-2xl font-black text-sky-300">{totalViews}</span>
            <span className="text-[11px] text-slate-300">ยอดเปิดอ่านรวม</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'reports'
              ? 'border-rose-600 text-rose-700 bg-rose-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>รายงานเนื้อหา</span>
          {pendingReports.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
              {pendingReports.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'resources'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>จัดการสื่อการสอน ({resources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'members'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>จัดการสมาชิก ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'settings'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <SettingsIcon className="w-4 h-4 text-amber-600" />
          <span>ตั้งค่าเว็บไซต์ & หมวดหมู่</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'logs'
              ? 'border-slate-800 text-slate-900 bg-slate-100/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4 text-slate-600" />
          <span>บันทึกการดูแล ({logs.length})</span>
        </button>
      </div>

      {/* Tab 1: Reports Management */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-base font-bold text-slate-900">
              รายงานเนื้อหาที่ไม่เหมาะสมหรือมีปัญหา
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setReportFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  reportFilter === 'pending'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white border text-slate-600'
                }`}
              >
                รอตรวจสอบ ({pendingReports.length})
              </button>
              <button
                onClick={() => setReportFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  reportFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border text-slate-600'
                }`}
              >
                รายงานทั้งหมด ({reports.length})
              </button>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800">ไม่มีรายงานปัญหาในขณะนี้</h3>
              <p className="text-xs text-slate-500">คลังสื่อการเรียนรู้อยู่ในสถานะปลอดภัยและเรียบร้อยดี</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(reportFilter === 'pending' ? pendingReports : reports).map((report) => {
                const targetRes = resources.find((r) => r.id === report.resourceId);
                return (
                  <div
                    key={report.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                              report.status === 'pending'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : report.status === 'reviewed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            สถานะ: {report.status === 'pending' ? 'รอตรวจสอบ' : report.status === 'reviewed' ? 'ตรวจสอบแล้ว' : 'ยกเลิกรายงาน'}
                          </span>
                          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                            สาเหตุ: {report.reason}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(report.createdAt).toLocaleString('th-TH')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-2">
                          สื่อ: {report.resourceTitle}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono">ID สื่อ: {report.resourceId}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {targetRes && (
                          <button
                            onClick={() => onOpenResourceDetail(targetRes)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ดูสื่อนี้</span>
                          </button>
                        )}
                        {targetRes && (
                          <button
                            onClick={() => handleToggleResourceVisibility(targetRes)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-semibold"
                          >
                            {targetRes.isPublished ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>ซ่อนสื่อ</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>เปิดสื่อ</span>
                              </>
                            )}
                          </button>
                        )}
                        {targetRes && (
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                type: 'resource',
                                id: targetRes.id,
                                title: targetRes.title,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ลบสื่อ</span>
                          </button>
                        )}
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleResolveReport(report, 'reviewed')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                            >
                              บันทึกว่าแก้ไขแล้ว
                            </button>
                            <button
                              onClick={() => handleResolveReport(report, 'dismissed')}
                              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
                            >
                              ยกเลิกรายงาน
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {report.details && (
                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                        <span className="font-semibold block text-slate-900">รายละเอียดจากผู้รายงาน:</span>
                        {report.details}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manage Resources */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                placeholder="ค้นหาชื่อสื่อ หรือผู้เขียน..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">ชื่อสื่อการเรียนรู้</th>
                    <th className="px-4 py-3">หมวดหมู่</th>
                    <th className="px-4 py-3">ผู้โพสต์</th>
                    <th className="px-4 py-3">ยอดชม / ถูกใจ</th>
                    <th className="px-4 py-3">สถานะ</th>
                    <th className="px-4 py-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 max-w-xs truncate">
                        <button
                          onClick={() => onOpenResourceDetail(res)}
                          className="hover:text-blue-600 truncate block text-left"
                        >
                          {res.title}
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                          {res.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{res.authorName}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {res.viewsCount || 0} / {res.favoritesCount || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {res.isPublished ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                            เผยแพร่อยู่
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                            ซ่อนจากระบบ
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleToggleResourceVisibility(res)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                        >
                          {res.isPublished ? 'ซ่อน' : 'เผยแพร่'}
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: 'resource',
                              id: res.id,
                              title: res.title,
                            })
                          }
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-medium"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Member Management */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="ค้นหาชื่อหรืออีเมลสมาชิก..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-slate-500">
              * เฉพาะผู้ดูแลระดับ Admin เท่านั้นที่สามารถเปลี่ยนบทบาทผู้ใช้ได้
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">ชื่อสมาชิก</th>
                    <th className="px-4 py-3">อีเมล</th>
                    <th className="px-4 py-3">บทบาท (Role)</th>
                    <th className="px-4 py-3">สถานะบัญชี</th>
                    <th className="px-4 py-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isSelf = u.uid === user?.uid;
                    return (
                      <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {u.displayName || 'ผู้ใช้งาน'}
                          {isSelf && (
                            <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm">
                              คุณ
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{u.email}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isAdmin && !isSelf ? (
                            <select
                              value={u.role || 'member'}
                              onChange={(e) => handleChangeRole(u, e.target.value as any)}
                              className="px-2 py-1 rounded-lg border border-slate-200 font-medium bg-white text-slate-800 text-xs"
                            >
                              <option value="member">สมาชิก (Member)</option>
                              <option value="moderator">ผู้ตรวจสอบ (Moderator)</option>
                              <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                            </select>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded-full font-semibold ${
                                u.role === 'admin'
                                  ? 'bg-rose-100 text-rose-800'
                                  : u.role === 'moderator'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {u.role || 'member'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {u.status === 'suspended' ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                              ถูกระงับ
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                              ปกติ
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {!isSelf && (
                            <button
                              onClick={() => handleToggleSuspension(u)}
                              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                                u.status === 'suspended'
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              }`}
                            >
                              {u.status === 'suspended' ? 'ปลดระงับ' : 'ระงับบัญชี'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Site Settings & Dynamic Categories */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Site Config */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <SettingsIcon className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-base">การตั้งค่าทั่วไปของเว็บไซต์</h3>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">ชื่อเว็บไซต์ / ระบบ</label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">คำอธิบายระบบ (Site Description)</label>
                <textarea
                  rows={3}
                  value={siteDesc}
                  onChange={(e) => setSiteDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">ข้อความประกาศแถบด้านบน (Announcement Banner)</label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="เว้นว่างไว้หากไม่ต้องการแสดงประกาศ"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingSettings || !isAdmin}
                className="w-full py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                <span>บันทึกการตั้งค่าเว็บไซต์</span>
              </button>
            </form>
          </div>

          {/* Dynamic Categories Manager */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">จัดการหมวดหมู่ความรู้ (Categories)</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{settings.categories.length} หมวด</span>
            </div>

            <p className="text-xs text-slate-500">
              เพิ่ม แก้ไข หรือลบหมวดหมู่ความรู้ได้ทันทีผ่านหน้าเว็บ ข้อมูลจะถูกบันทึกและอัปเดตบนหน้าเว็บแบบ Realtime
            </p>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
              <input
                type="text"
                required
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                placeholder="ระบุชื่อหมวดหมู่ใหม่..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!isAdmin}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มหมวดหมู่</span>
              </button>
            </form>

            {/* Categories List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {settings.categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm"
                >
                  {editingCat?.old === cat ? (
                    <form onSubmit={handleEditCategorySubmit} className="flex-1 flex gap-2 mr-2">
                      <input
                        type="text"
                        value={editingCat.current}
                        onChange={(e) => setEditingCat({ ...editingCat, current: e.target.value })}
                        className="flex-1 px-2 py-1 rounded-lg border border-blue-400 text-xs"
                      />
                      <button
                        type="submit"
                        className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                      >
                        บันทึก
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCat(null)}
                        className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                      >
                        ยกเลิก
                      </button>
                    </form>
                  ) : (
                    <span className="font-semibold text-slate-800 truncate">{cat}</span>
                  )}

                  {editingCat?.old !== cat && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingCat({ old: cat, current: cat })}
                        disabled={!isAdmin}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                        title="แก้ไขชื่อหมวดหมู่"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveCategory(cat)}
                        disabled={!isAdmin}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="ลบหมวดหมู่นี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Moderation Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <History className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">ประวัติและบันทึกการดำเนินการของผู้ดูแลระบบ (Audit Logs)</h3>
          </div>

          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">ยังไม่มีประวัติการดูแลระบบ</p>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start justify-between text-xs gap-3"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{log.action}</p>
                    <p className="text-slate-500">
                      โดย: <span className="text-slate-700 font-medium">{log.performedByName}</span>
                      {log.reason && ` • เหตุผล: ${log.reason}`}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString('th-TH')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">ยืนยันการลบข้อมูลถาวร?</h3>
              <p className="text-xs text-slate-500">
                คุณกำลังจะลบ: <span className="font-bold text-slate-800 block mt-1">{deleteTarget.title}</span>
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center justify-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>ยืนยันการลบ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
