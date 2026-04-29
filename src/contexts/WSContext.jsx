import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const WSContext = createContext();

export function WSProvider({ children }) {
  const { token } = useAuth();
  const [prices, setPrices] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const wsUrl = `${import.meta.env.VITE_WS_URL}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    };
    
    ws.onerror = (err) => {
      console.error('❌ WebSocket error:', err);
      setIsConnected(false);
    };
    
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'TICKER_UPDATE') {
          setPrices(prev => ({ 
            ...prev, 
            [msg.payload.ticker]: msg.payload.price 
          }));
        }
      } catch (err) {
        console.error('Failed to parse WS message:', err);
      }
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
    };

    return () => ws.close();
  }, [token]);

  return (
    <WSContext.Provider value={{ prices, isConnected }}>
      {children}
    </WSContext.Provider>
  );
}

export const useWS = () => useContext(WSContext);