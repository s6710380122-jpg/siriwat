import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { HeroSearch, FilterState } from './components/HeroSearch';
import { Breadcrumb } from './components/Breadcrumb';
import { SidebarCategories } from './components/SidebarCategories';
import { ResourceCard } from './components/ResourceCard';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { ResourceFormModal } from './components/ResourceFormModal';
import { ReportModal } from './components/ReportModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { EmptyState } from './components/EmptyState';
import { GridSkeleton } from './components/LoadingSkeleton';
import { Footer } from './components/Footer';
import {
  subscribeToResources,
  subscribeToUserFavorites,
  toggleResourceFavorite,
  createResource,
  updateResource,
  deleteResource,
  submitContentReport,
  seedResourcesIfEmpty,
} from './services/resourceService';
import { subscribeToReports } from './services/adminService';
import { Resource, ReportReason, ReportItem } from './types';

function MainApp() {
  const { user, isModerator, isAdmin, isSuspended } = useAuth();
  const { settings } = useSettings();
  const { showToast } = useToast();

  // Navigation & View State
  const [currentView, setCurrentView] = useState<'catalog' | 'favorites' | 'my-resources' | 'admin'>('catalog');

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategory: 'all',
    selectedGradeLevel: 'all',
    selectedMediaType: 'all',
    sortBy: 'newest',
  });

  // Resources & Favorites State
  const [resources, setResources] = useState<Resource[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);

  // Modal States
  const [detailResource, setDetailResource] = useState<Resource | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [reportingResource, setReportingResource] = useState<Resource | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Seed on startup and listen to resources
  useEffect(() => {
    seedResourcesIfEmpty();

    const unsubResources = subscribeToResources(
      (list) => {
        setResources(list);
        setLoadingResources(false);
      },
      (err) => {
        console.error('Resources fetch error:', err);
        setLoadingResources(false);
      }
    );

    const unsubReports = subscribeToReports(setReports);

    return () => {
      unsubResources();
      unsubReports();
    };
  }, []);

  // Listen to user favorites if logged in
  useEffect(() => {
    if (user?.uid) {
      const unsubFavorites = subscribeToUserFavorites(user.uid, setFavorites);
      return () => unsubFavorites();
    } else {
      setFavorites(new Set());
    }
  }, [user?.uid]);

  // Keep detailResource fresh when resources update
  useEffect(() => {
    if (detailResource) {
      const updated = resources.find((r) => r.id === detailResource.id);
      if (updated) {
        setDetailResource(updated);
      }
    }
  }, [resources]);

  // Filter handlers
  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCategory: 'all',
      selectedGradeLevel: 'all',
      selectedMediaType: 'all',
      sortBy: 'newest',
    });
  };

  // Filter & Sort Logic
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // Visibility rule: guests and normal members see only published resources;
      // authors see their own even if unpublished; moderators see all.
      const isVisible =
        res.isPublished ||
        (user && user.uid === res.authorId) ||
        isModerator;
      if (!isVisible) return false;

      // In "favorites" view, only show items in user's favorites
      if (currentView === 'favorites') {
        if (!favorites.has(res.id)) return false;
      }

      // In "my-resources" view, only show items created by current user
      if (currentView === 'my-resources') {
        if (!user || res.authorId !== user.uid) return false;
      }

      // Category filter
      if (filters.selectedCategory !== 'all' && res.category !== filters.selectedCategory) {
        return false;
      }

      // Grade level filter
      if (filters.selectedGradeLevel !== 'all' && res.gradeLevel !== filters.selectedGradeLevel) {
        return false;
      }

      // Media type filter
      if (filters.selectedMediaType !== 'all' && res.mediaType !== filters.selectedMediaType) {
        return false;
      }

      // Search Query filter (matches title, description, category, tags, author)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesDesc = res.description.toLowerCase().includes(q);
        const matchesAuthor = res.authorName.toLowerCase().includes(q);
        const matchesCategory = res.category.toLowerCase().includes(q);
        const matchesTag = res.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesAuthor && !matchesCategory && !matchesTag) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'views') {
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      }
      if (filters.sortBy === 'favorites') {
        return (b.favoritesCount || 0) - (a.favoritesCount || 0);
      }
      if (filters.sortBy === 'title') {
        return a.title.localeCompare(b.title, 'th');
      }
      // 'newest' default
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [resources, currentView, favorites, user, isModerator, filters]);

  // Action: Toggle Favorite
  const handleToggleFavorite = async (resource: Resource) => {
    if (!user) {
      setAuthTab('login');
      setIsAuthOpen(true);
      showToast('info', 'กรุณาเข้าสู่ระบบก่อน', 'เข้าสู่ระบบเพื่อบันทึกรายการโปรดและซิงค์ข้อมูล');
      return;
    }

    const isFav = favorites.has(resource.id);
    try {
      const added = await toggleResourceFavorite(user.uid, resource.id, isFav);
      showToast(
        'success',
        added ? 'บันทึกในรายการโปรดแล้ว' : 'ลบออกจากรายการโปรดแล้ว',
        resource.title
      );
    } catch (err) {
      showToast('error', 'ไม่สามารถบันทึกรายการโปรดได้');
    }
  };

  // Action: Open Resource Form for creation
  const handleOpenCreateResource = () => {
    if (!user) {
      setAuthTab('login');
      setIsAuthOpen(true);
      return;
    }
    if (isSuspended) {
      showToast('error', 'บัญชีของคุณถูกระงับ', 'ไม่สามารถโพสต์สื่อการเรียนรู้ได้ในขณะนี้');
      return;
    }
    setEditingResource(null);
    setIsFormOpen(true);
  };

  // Action: Open Resource Form for editing
  const handleOpenEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setIsFormOpen(true);
  };

  // Action: Submit Resource Form (Create or Edit)
  const handleSubmitResource = async (formData: Partial<Resource>) => {
    if (editingResource) {
      await updateResource(editingResource.id, formData);
      showToast('success', 'บันทึกการแก้ไขสื่อเรียบร้อยแล้ว');
    } else {
      await createResource(formData as any);
      showToast('success', 'เผยแพร่สื่อการเรียนรู้ใหม่สำเร็จ');
    }
  };

  // Action: Delete Resource
  const handleDeleteResource = async (resource: Resource) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสื่อ "${resource.title}"?`)) {
      try {
        await deleteResource(resource.id);
        showToast('success', 'ลบสื่อการเรียนรู้เรียบร้อยแล้ว');
        if (isDetailOpen && detailResource?.id === resource.id) {
          setIsDetailOpen(false);
        }
      } catch (err) {
        showToast('error', 'ไม่สามารถลบสื่อนี้ได้');
      }
    }
  };

  // Action: Toggle Published
  const handleTogglePublished = async (resource: Resource) => {
    const nextState = !resource.isPublished;
    try {
      await updateResource(resource.id, { isPublished: nextState });
      showToast('success', nextState ? 'เปิดเผยแพร่สู่สาธารณะแล้ว' : 'ซ่อนสื่อจากสาธารณะแล้ว');
    } catch (err) {
      showToast('error', 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะสื่อ');
    }
  };

  // Action: Open Report
  const handleOpenReport = (resource: Resource) => {
    if (!user) {
      setAuthTab('login');
      setIsAuthOpen(true);
      showToast('info', 'กรุณาเข้าสู่ระบบก่อนรายงานสื่อ');
      return;
    }
    setReportingResource(resource);
    setIsReportOpen(true);
  };

  // Action: Submit Report
  const handleSubmitReport = async (reason: ReportReason, details: string) => {
    if (!reportingResource || !user) return;
    await submitContentReport({
      resourceId: reportingResource.id,
      resourceTitle: reportingResource.title,
      reporterId: user.uid,
      reporterEmail: user.email || '',
      reason,
      details,
    });
    showToast('success', 'ส่งรายงานความไม่เหมาะสมเรียบร้อยแล้ว', 'ทีมผู้ดูแลจะเร่งตรวจสอบโดยเร็ว');
  };

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  // Breadcrumbs items construction
  const breadcrumbItems = useMemo<{ label: string; onClick?: () => void; active?: boolean }[]>(() => {
    if (currentView === 'favorites') {
      return [{ label: 'คลังความรู้', onClick: () => setCurrentView('catalog') }, { label: 'รายการโปรดของฉัน', active: true }];
    }
    if (currentView === 'my-resources') {
      return [{ label: 'คลังความรู้', onClick: () => setCurrentView('catalog') }, { label: 'สื่อการสอนของฉัน', active: true }];
    }
    if (currentView === 'admin') {
      return [{ label: 'คลังความรู้', onClick: () => setCurrentView('catalog') }, { label: 'แผงควบคุมผู้ดูแลระบบ (Admin)', active: true }];
    }
    // catalog
    const items: { label: string; onClick?: () => void; active?: boolean }[] = [
      { label: 'คลังความรู้', onClick: handleResetFilters, active: filters.selectedCategory === 'all' && !filters.searchQuery }
    ];
    if (filters.selectedCategory !== 'all') {
      items.push({ label: filters.selectedCategory, active: true });
    }
    return items;
  }, [currentView, filters.selectedCategory, filters.searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthTab(tab || 'login');
          setIsAuthOpen(true);
        }}
        onOpenCreateResource={handleOpenCreateResource}
        currentView={currentView}
        onChangeView={setCurrentView}
        pendingReportsCount={pendingReportsCount}
      />

      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Hero Search Section - Rendered on catalog view */}
      {currentView === 'catalog' && (
        <HeroSearch
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalResults={filteredResources.length}
        />
      )}

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-100">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'admin' ? (
          <AdminDashboard
            resources={resources}
            onOpenResourceDetail={(res) => {
              setDetailResource(res);
              setIsDetailOpen(true);
            }}
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar for Categories & Filters */}
            <SidebarCategories
              resources={resources}
              selectedCategory={filters.selectedCategory}
              onSelectCategory={(cat) => handleFilterChange({ selectedCategory: cat })}
              selectedGradeLevel={filters.selectedGradeLevel}
              onSelectGradeLevel={(grade) => handleFilterChange({ selectedGradeLevel: grade })}
            />

            {/* Content Area */}
            <div className="flex-1 w-full space-y-6">
              {/* Header Title for Current View */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {currentView === 'favorites' && 'รายการโปรดของฉัน'}
                    {currentView === 'my-resources' && 'สื่อการสอนของฉัน'}
                    {currentView === 'catalog' && (
                      filters.selectedCategory === 'all'
                        ? 'สื่อการเรียนรู้ทั้งหมด'
                        : filters.selectedCategory
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentView === 'favorites' && 'สื่อและบทเรียนที่คุณกดบันทึกไว้ทบทวน'}
                    {currentView === 'my-resources' && 'จัดการและติดตามผลงานที่คุณเคยโพสต์ไว้ในระบบ'}
                    {currentView === 'catalog' && `แสดงผลลัพธ์ ${filteredResources.length} รายการ`}
                  </p>
                </div>

                {currentView === 'my-resources' && (
                  <button
                    onClick={handleOpenCreateResource}
                    disabled={isSuspended}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
                  >
                    + เพิ่มสื่อใหม่
                  </button>
                )}
              </div>

              {/* Resource Grid / Skeleton / Empty State */}
              {loadingResources ? (
                <GridSkeleton count={6} />
              ) : filteredResources.length === 0 ? (
                <EmptyState
                  type={
                    currentView === 'favorites'
                      ? 'favorites'
                      : currentView === 'my-resources'
                      ? 'my-resources'
                      : filters.searchQuery || filters.selectedCategory !== 'all' || filters.selectedGradeLevel !== 'all' || filters.selectedMediaType !== 'all'
                      ? 'search'
                      : 'default'
                  }
                  onReset={
                    currentView === 'catalog' &&
                    (filters.searchQuery || filters.selectedCategory !== 'all' || filters.selectedGradeLevel !== 'all' || filters.selectedMediaType !== 'all')
                      ? handleResetFilters
                      : undefined
                  }
                  onAction={
                    currentView === 'favorites'
                      ? () => setCurrentView('catalog')
                      : currentView === 'my-resources'
                      ? handleOpenCreateResource
                      : undefined
                  }
                  actionLabel={
                    currentView === 'favorites'
                      ? 'ไปที่คลังความรู้เพื่อค้นหา'
                      : currentView === 'my-resources'
                      ? 'โพสต์สื่อการเรียนรู้แรกของคุณ'
                      : undefined
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredResources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      isFavorite={favorites.has(resource.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onOpenDetail={(res) => {
                        setDetailResource(res);
                        setIsDetailOpen(true);
                      }}
                      onEdit={handleOpenEditResource}
                      onDelete={handleDeleteResource}
                      onReport={handleOpenReport}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ResourceDetailModal
        resource={detailResource}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        isFavorite={detailResource ? favorites.has(detailResource.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onEdit={handleOpenEditResource}
        onDelete={handleDeleteResource}
        onReport={handleOpenReport}
        onTogglePublished={handleTogglePublished}
      />

      <ResourceFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingResource(null);
        }}
        onSubmit={handleSubmitResource}
        initialData={editingResource}
      />

      <ReportModal
        resource={reportingResource}
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setReportingResource(null);
        }}
        onSubmit={handleSubmitReport}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          handleFilterChange({ selectedCategory: cat });
          setCurrentView('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <MainApp />
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
