import { useEffect, useState } from "react";
import { Plus, CheckCircle2, RotateCcw } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [newTask, setNewTask] = useState({ title: "", description: "", assigned_to: "" });
  const [creating, setCreating] = useState(false);

  async function loadTasks() {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (assignedFilter) filters.assigned_to = assignedFilter;
      const data = await api.getTasks(filters);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, assignedFilter]);

  async function handleCreateTask(e) {
    e.preventDefault();
    setCreating(true);
    setError("");
    setMessage("");
    try {
      await api.createTask({
        title: newTask.title,
        description: newTask.description,
        assigned_to: Number(newTask.assigned_to),
      });
      setMessage("Task created");
      setNewTask({ title: "", description: "", assigned_to: "" });
      loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await api.updateTaskStatus(id, status);
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <h1>Tasks</h1>
      <p className="page-subtitle">
        {isAdmin ? "Create and assign tasks to users." : "View your assigned tasks and update their status."}
      </p>

      {isAdmin && (
        <form className="task-form" onSubmit={handleCreateTask}>
          <h2>New task</h2>
          <label>Title</label>
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />

          <label>Description</label>
          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            rows={2}
          />

          <label>Assign to (user id)</label>
          <input
            type="number"
            value={newTask.assigned_to}
            onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
            required
          />

          <button type="submit" disabled={creating}>
            <Plus size={15} strokeWidth={2.4} />
            {creating ? "Creating..." : "Create task"}
          </button>
        </form>
      )}

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="filters">
        <label>
          Status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </label>

        {isAdmin && (
          <label>
            Assigned to (user id)
            <input
              type="number"
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              placeholder="Any"
            />
          </label>
        )}
      </div>

      {loading ? (
        <p className="loading-text"><span className="spinner"></span>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="empty-state">No tasks found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              {isAdmin && <th>Assigned to</th>}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>
                  <span className={`status-badge ${task.status === "Completed" ? "completed" : "pending"}`}>
                    {task.status}
                  </span>
                </td>
                {isAdmin && <td>{task.assigned_to}</td>}
                <td>
                  {task.status === "Pending" ? (
                    <button className="btn-link" onClick={() => handleStatusChange(task.id, "Completed")}>
                      <CheckCircle2 size={14} strokeWidth={2.2} />
                      Mark completed
                    </button>
                  ) : (
                    <button className="btn-link" onClick={() => handleStatusChange(task.id, "Pending")}>
                      <RotateCcw size={14} strokeWidth={2.2} />
                      Reopen
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
