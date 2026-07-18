import { useEffect, useState } from "react";
import { ListTodo, CheckCircle2, Clock3, TrendingUp } from "lucide-react";
import { api } from "../api";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p className="loading-text"><span className="spinner"></span>Loading analytics...</p></div>;
  if (error) return <div className="page"><div className="error-box">{error}</div></div>;
  if (!data) return null;

  return (
    <div className="page">
      <h1>Analytics</h1>
      <p className="page-subtitle">Overview of task activity and search usage.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><ListTodo size={16} strokeWidth={2.2} /></div>
          <span className="stat-value">{data.total_tasks}</span>
          <span className="stat-label">Total tasks</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed"><CheckCircle2 size={16} strokeWidth={2.2} /></div>
          <span className="stat-value">{data.completed_tasks}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending"><Clock3 size={16} strokeWidth={2.2} /></div>
          <span className="stat-value">{data.pending_tasks}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>

      <h2><TrendingUp size={15} strokeWidth={2.2} style={{ verticalAlign: "-2px", marginRight: "6px" }} />Most searched queries</h2>
      {data.most_searched_queries.length === 0 ? (
        <p className="empty-state">No searches recorded yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Query</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {data.most_searched_queries.map((q, i) => (
              <tr key={i}>
                <td>{q.query}</td>
                <td>{q.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
