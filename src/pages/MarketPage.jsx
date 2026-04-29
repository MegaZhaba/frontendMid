import { useEffect, useState } from 'react';
import apiFetch from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useWS } from '../contexts/WSContext';

export default function MarketPage() {
  const { token } = useAuth();
  const { prices } = useWS();
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    apiFetch('/api/stocks', {}, token).then(setStocks);
  }, []);

  return (
    <div>
      <h1>Market</h1>
      {stocks.map(s => (
        <div key={s._id}>
          {s.ticker} - ${prices[s.ticker] || s.price}
        </div>
      ))}
    </div>
  );
}