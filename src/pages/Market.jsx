import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMarket } from "../context/MarketContext";
import api from "../api/axios";

export default function Market() {
  const { user, refreshUser, logout } = useAuth();
  const { stocks, connected } = useMarket();
  const [amounts, setAmounts] = useState({});
  const [msgs, setMsgs] = useState({});

  const setAmount = (id, val) => setAmounts((p) => ({ ...p, [id]: val }));
  const setMsg = (id, val) => setMsgs((p) => ({ ...p, [id]: val }));

  const handleBuy = async (stock) => {
    const shares = parseInt(amounts[stock._id] || 1);
    setMsg(stock._id, "");
    try {
      await api.post("/trade/buy", { stockId: stock._id, shares });
      await refreshUser();
      setMsg(stock._id, { text: `✓ Bought ${shares} shares`, type: "ok" });
    } catch (err) {
      setMsg(stock._id, { text: err.response?.data?.message || "Buy failed", type: "err" });
    }
  };

  const handleSell = async (stock) => {
    const shares = parseInt(amounts[stock._id] || 1);
    setMsg(stock._id, "");
    try {
      await api.post("/trade/sell", { stockId: stock._id, shares });
      await refreshUser();
      setMsg(stock._id, { text: `✓ Sold ${shares} shares`, type: "ok" });
    } catch (err) {
      setMsg(stock._id, { text: err.response?.data?.message || "Sell failed", type: "err" });
    }
  };

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

      <div className="page-content">
        <div className="page-header">
          <div className="page-title">// Market Feed</div>
          <div className="stock-count">{stocks.length} instruments listed</div>
        </div>

        {stocks.length === 0 ? (
          <div className="empty-market">// NO INSTRUMENTS LISTED — BE THE FIRST TO IPO</div>
        ) : (
          <div className="market-table-wrap">
            <table className="market-table">
              <thead>
                <tr>
                  <th>Ticker</th><th>Owner</th><th>Live Price</th><th>Qty</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => {
                  const isOwner = stock.owner?._id === user?._id || stock.owner === user?._id;
                  const qty = parseInt(amounts[stock._id] || 1);
                  const cost = stock.price * qty;
                  const m = msgs[stock._id];
                  return (
                    <tr key={stock._id}>
                      <td className="ticker-cell">{stock.ticker}</td>
                      <td className="owner-cell">
                        {stock.owner?.email || "—"}
                        {isOwner && <span className="you-badge">YOU</span>}
                      </td>
                      <td className="price-cell">${stock.price.toFixed(2)}</td>
                      <td>
                        <input type="number" min="1" value={amounts[stock._id] || ""} onChange={(e) => setAmount(stock._id, e.target.value)} placeholder="1" className="shares-input" />
                      </td>
                      <td>
                        {isOwner ? (
                          <span className="own-label">YOUR STOCK</span>
                        ) : (
                          <div className="action-btns">
                            <button className="btn-buy" onClick={() => handleBuy(stock)}>BUY ${cost.toFixed(2)}</button>
                            <button className="btn-sell" onClick={() => handleSell(stock)}>SELL</button>
                          </div>
                        )}
                        {m && <div className={`trade-msg ${m.type === "err" ? "error" : ""}`}>{m.text}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}