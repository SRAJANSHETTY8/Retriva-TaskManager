import { useEffect, useState } from "react";
import { FileText, UploadCloud, Trash2 } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Documents() {
  const { isAdmin } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadDocuments() {
    setLoading(true);
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage("");
    setError("");
    try {
      const result = await api.uploadDocument(file);
      setMessage(`Uploaded "${file.name}" — ${result.chunks_created} chunks created`);
      setFile(null);
      e.target.reset();
      loadDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this document?")) return;
    try {
      await api.deleteDocument(id);
      loadDocuments();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Documents</h1>
          <p className="page-subtitle">The knowledge base used for semantic search.</p>
        </div>
      </div>

      {isAdmin && (
        <form className="upload-form" onSubmit={handleUpload}>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button type="submit" disabled={!file || uploading}>
            <UploadCloud size={15} strokeWidth={2.2} />
            {uploading ? "Uploading..." : "Upload document"}
          </button>
        </form>
      )}

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <p className="loading-text"><span className="spinner"></span>Loading documents...</p>
      ) : documents.length === 0 ? (
        <p className="empty-state">No documents uploaded yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Filename</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <div className="document-card">
                    <div className="document-icon">
                      <FileText size={16} strokeWidth={2} />
                    </div>
                    {doc.title}
                  </div>
                </td>
                <td>{doc.filename}</td>
                {isAdmin && (
                  <td>
                    <button className="btn-link danger" onClick={() => handleDelete(doc.id)}>
                      <Trash2 size={13} strokeWidth={2.2} />
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
