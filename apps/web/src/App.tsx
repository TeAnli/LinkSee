import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminGuard } from './components/admin/AdminGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';

const LazyHomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const LazyForumPage = lazy(() => import('./pages/ForumPage').then(m => ({ default: m.ForumPage })));
const LazyAiChatPage = lazy(() => import('./pages/AiChatPage').then(m => ({ default: m.AiChatPage })));
const LazyProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const LazySettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const LazyPostDetailPage = lazy(() => import('./pages/PostDetailPage').then(m => ({ default: m.PostDetailPage })));
const LazyCreatePostPage = lazy(() => import('./pages/CreatePostPage').then(m => ({ default: m.CreatePostPage })));
const LazyChannelPage = lazy(() => import('./pages/ChannelPage').then(m => ({ default: m.ChannelPage })));
const LazyUserProfilePage = lazy(() => import('./pages/UserProfilePage').then(m => ({ default: m.UserProfilePage })));
const LazyFriendsPage = lazy(() => import('./pages/FriendsPage').then(m => ({ default: m.FriendsPage })));
const LazyDmChatPage = lazy(() => import('./pages/DmChatPage').then(m => ({ default: m.DmChatPage })));
const LazyLoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const LazyOAuthCallbackPage = lazy(() => import('./pages/OAuthCallbackPage').then(m => ({ default: m.OAuthCallbackPage })));
const LazyRegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const LazyForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const LazyResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const LazyNotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const LazyAdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const LazyAdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const LazyAdminPostsPage = lazy(() => import('./pages/admin/AdminPostsPage').then(m => ({ default: m.AdminPostsPage })));
const LazyAdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })));
const LazyAdminAiPage = lazy(() => import('./pages/admin/AdminAiPage').then(m => ({ default: m.AdminAiPage })));
const LazyAdminSensitiveWordsPage = lazy(() => import('./pages/admin/AdminSensitiveWordsPage').then(m => ({ default: m.AdminSensitiveWordsPage })));
const LazyAdminReviewPage = lazy(() => import('./pages/admin/AdminReviewPage').then(m => ({ default: m.AdminReviewPage })));
const LazyAdminCommentsPage = lazy(() => import('./pages/admin/AdminCommentsPage').then(m => ({ default: m.AdminCommentsPage })));

function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Icon icon="mdi:loading" width={32} className="animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LazyLoginPage />} />
            <Route path="/oauth/callback" element={<LazyOAuthCallbackPage />} />
            <Route path="/register" element={<LazyRegisterPage />} />
            <Route path="/forgot-password" element={<LazyForgotPasswordPage />} />
            <Route path="/reset-password" element={<LazyResetPasswordPage />} />

            <Route element={<AppLayout />}>
              <Route path="/" element={<LazyHomePage />} />
              <Route path="/forum" element={<LazyForumPage />} />
              <Route path="/post/:id" element={<LazyPostDetailPage />} />
              <Route path="/create" element={<LazyCreatePostPage />} />
              <Route path="/ai" element={<LazyAiChatPage />} />
              <Route path="/messages" element={<LazyChannelPage />} />
              <Route path="/channels" element={<LazyChannelPage />} />
              <Route path="/profile" element={<LazyProfilePage />} />
              <Route path="/user/:userId" element={<LazyUserProfilePage />} />
              <Route path="/friends" element={<LazyFriendsPage />} />
              <Route path="/messages/dm/:userId" element={<LazyDmChatPage />} />
              <Route path="/settings" element={<LazySettingsPage />} />
            </Route>

            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<LazyAdminDashboardPage />} />
              <Route path="users" element={<LazyAdminUsersPage />} />
              <Route path="posts" element={<LazyAdminPostsPage />} />
              <Route path="categories" element={<LazyAdminCategoriesPage />} />
              <Route path="ai" element={<LazyAdminAiPage />} />
              <Route path="review" element={<LazyAdminReviewPage />} />
              <Route path="sensitive-words" element={<LazyAdminSensitiveWordsPage />} />
              <Route path="comments" element={<LazyAdminCommentsPage />} />
            </Route>

            <Route path="*" element={<LazyNotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors closeButton />
    </ErrorBoundary>
  );
}
