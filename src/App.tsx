import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Checklist } from './pages/Checklist';
import { ShareImport } from './pages/ShareImport';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="checklist/:planeId" element={<Checklist />} />
          <Route path="/share" element={<ShareImport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
