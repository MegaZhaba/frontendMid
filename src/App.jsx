import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WSProvider } from './contexts/WSContext';
import AuthPage from './pages/AuthPage';
import MarketPage from './pages/MarketPage';

export default function App() {
  return (
    <AuthProvider>
      <WSProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/market" element={<MarketPage />} />
          </Routes>
        </BrowserRouter>
      </WSProvider>
    </AuthProvider>
  );
}