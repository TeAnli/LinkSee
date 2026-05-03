import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { ForumPage } from './pages/ForumPage';
import { AiChatPage } from './pages/AiChatPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/ai" element={<AiChatPage />} />
          <Route path="/messages" element={<ForumPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
