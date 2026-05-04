import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useMarket } from "../context/MarketContext";
import api from "../api/axios";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { stocks, connected } = useMarket();
  const [myStock, setMyStock] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [ticker, setTicker] = useState("");
  const [initialPrice, setInitialPrice] = useState(100);
  const [newPrice, setNewPrice] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loadingData, setLoadingData] = useState(true);

  const fetchMyData = async () => {
    try {
      const [stockRes, holdingsRes] = await Promise.all([
        api.get("/stocks/mine"),
        api.get("/trade/portfolio"),
      ]);
      setMyStock(stockRes.data);
      setHoldings(holdingsRes.data);
    } catch (err) {
      console.error("Failed to load dashboard data");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { fetchMyData(); }, []);

  const handleCreateStock = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });
    try {
      const res = await api.post("/stocks/create", { ticker, price: Number(initialPrice) });
      setMyStock(res.data);
      setMsg({ text: "✓ Stock listed successfully", type: "success" });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Error creating stock", type: "error" });
    }
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });
    try {
      const res = await api.put(`/stocks/${myStock._id}/price`, { price: Number(newPrice) });
      setMyStock(res.data);
      setNewPrice("");
      setMsg({ text: "✓ Price broadcast to all traders", type: "success" });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Error updating price", type: "error" });
    }
  };

  const myLiveStock = myStock
    ? stocks.find((s) => s.ticker === myStock.ticker) || myStock
    : null;

  const portfolioValue = holdings.reduce((sum, h) => {
    const live = stocks.find((s) => s._id === (h.stock?._id || h.stock));
    const price = live ? live.price : h.stock?.price || 0;
    return sum + price * h.shares;
  }, 0);

  return (
    <div className="page">
      <header className="top-bar">
        <span className="logo">PEX</span>
        <div className="top-bar-right">
          <div className="ws-indicator">
            <span className={`ws-dot ${connected ? "green" : "red"}`} />
            <span className="ws-label">{connected ? "LIVE" : "OFFLINE"}</span>
          </div>
          <div className="wallet-display">
            <span className="wallet-label">Balance</span>
            <span className="wallet">${user?.wallet?.toFixed(2)}</span>
          </div>
          <button className="btn-logout" onClick={logout}>EXIT</button>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-label">My Listed Stock</div>

          {loadingData ? (
            <p className="empty">// loading...</p>
          ) : myLiveStock ? (
            <>
              <div className="card-value">{myLiveStock.ticker}</div>
              <div className="card-price">${myLiveStock.price.toFixed(2)}</div>
              <p className="card-sub" style={{ marginBottom: "1.25rem" }}>Update price to broadcast live</p>
              <form onSubmit={handleUpdatePrice}>
                <div className="form-group">
                  <label>New Price (USD)</label>
                  <input type="number" step="0.01" min="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="e.g. 142.50" required />
                </div>
                <button type="submit" className="btn-primary">BROADCAST PRICE</button>
              </form>
            </>
          ) : (
            <>
              <p className="empty" style={{ marginBottom: "1.25rem" }}>// No stock listed yet</p>
              <form onSubmit={handleCreateStock}>
                <div className="form-group">
                  <label>Ticker Symbol</label>
                  <input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} placeholder="e.g. NOVA" maxLength={6} required />
                </div>
                <div className="form-group">
                  <label>IPO Price (USD)</label>
                  <input type="number" min="1" value={initialPrice} onChange={(e) => setInitialPrice(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary">LIST MY STOCK →</button>
              </form>
            </>
          )}

          {msg.text && <div className={`msg ${msg.type === "success" ? "success" : ""}`}>{msg.text}</div>}
        </div>

        <div className="card">
          <div className="card-label">Portfolio Holdings</div>

          {portfolioValue > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <div className="card-sub">Total Value</div>
              <div className="card-value" style={{ fontSize: "1.4rem", color: "var(--gold)" }}>
                ${portfolioValue.toFixed(2)}
              </div>
            </div>
          )}

          {holdings.length === 0 ? (
            <p className="empty">// No positions — visit Market to trade</p>
          ) : (
            <table className="mini-table">
              <thead>
                <tr><th>Ticker</th><th>Shares</th><th>Price</th><th>Value</th></tr>
              </thead>
              <tbody>
                {holdings.map((h) => {
                  const live = stocks.find((s) => s._id === (h.stock?._id || h.stock));
                  const price = live ? live.price : h.stock?.price || 0;
                  const tkr = live ? live.ticker : h.stock?.ticker || "—";
                  return (
                    <tr key={h._id}>
                      <td style={{ color: "var(--accent)" }}>{tkr}</td>
                      <td>{h.shares}</td>
                      <td style={{ color: "var(--accent3)" }}>${price.toFixed(2)}</td>
                      <td style={{ color: "var(--gold)" }}>${(price * h.shares).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}