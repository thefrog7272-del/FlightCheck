import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Checklist } from './pages/Checklist';
import { ShareImport } from './pages/ShareImport';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminGuard } from './components/AdminGuard';
import './App.css';

declare const __ADDON_BUILD__: boolean;
const Router = typeof __ADDON_BUILD__ !== 'undefined' && __ADDON_BUILD__ ? HashRouter : BrowserRouter;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="checklist/:planeId" element={<Checklist />} />
          <Route path="checklist/:planeId/:categoryName" element={<Checklist />} />
          <Route path="/share" element={<ShareImport />} />
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
