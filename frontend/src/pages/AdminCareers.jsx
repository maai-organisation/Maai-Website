import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  createAdminCareer,
  deleteAdminCareer,
  getAdminCareers,
  patchAdminCareer,
  updateAdminCareer,
} from "../services/api";
import "../styles/home.css";

const initialCareerForm = {
  title: "",
  department: "",
  employmentType: "",
  location: "",
  description: "",
  bannerUrl: "",
  applyLink: "",
  isActive: true,
};

function normalizeCareer(career) {
  return {
    title: career.title || "",
    department: career.department || "",
    employmentType: career.employmentType || career.type || "",
    location: career.location || "",
    description: career.description || career.shortDescription || "",
    bannerUrl: career.bannerUrl || "",
    applyLink: career.applyLink || career.applyUrl || "",
    isActive: career.isActive ?? career.active ?? true,
  };
}

function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminCareers() {
  const [careers, setCareers] = useState([]);
  const [formData, setFormData] = useState(initialCareerForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const filteredCareers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return careers;

    return careers.filter((career) =>
      [career.title, career.department, career.employmentType, career.type, career.location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [careers, search]);

  useEffect(() => {
    let cancelled = false;

    async function loadCareers() {
      setLoading(true);
      setError("");

      try {
        const data = await getAdminCareers();
        if (!cancelled) setCareers(data);
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError?.response?.data?.message || "Could not load career openings.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCareers();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(name, value) {
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setFormData(initialCareerForm);
    setEditingId(null);
  }

  function handleEdit(career) {
    setEditingId(career.id);
    setFormData(normalizeCareer(career));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...formData,
      active: formData.isActive,
    };

    try {
      const saved = editingId
        ? await updateAdminCareer(editingId, payload)
        : await createAdminCareer(payload);

      setCareers((items) =>
        editingId
          ? items.map((item) => (item.id === editingId ? saved : item))
          : [saved, ...items],
      );
      resetForm();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not save this career opening.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(career) {
    const nextActive = !(career.isActive ?? career.active);
    const previous = careers;
    setCareers((items) =>
      items.map((item) =>
        item.id === career.id ? { ...item, active: nextActive, isActive: nextActive } : item,
      ),
    );

    try {
      const updated = await patchAdminCareer(career.id, { active: nextActive });
      setCareers((items) => items.map((item) => (item.id === career.id ? updated : item)));
    } catch (requestError) {
      setCareers(previous);
      setError(requestError?.response?.data?.message || "Could not update career status.");
    }
  }

  async function handleDelete(id) {
    const previous = careers;
    setCareers((items) => items.filter((item) => item.id !== id));

    try {
      await deleteAdminCareer(id);
      if (editingId === id) resetForm();
    } catch (requestError) {
      setCareers(previous);
      setError(requestError?.response?.data?.message || "Could not delete career opening.");
    }
  }

  return (
    <main className="admin-careers-page">
      <section className="admin-careers-shell">
        <motion.div
          className="admin-careers-header"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>Admin Panel</span>
          <h1>Career Openings</h1>
          <p>Add, edit, deactivate, and manage the opportunities shown in the NGO Open Careers section.</p>
        </motion.div>

        <div className="admin-careers-layout">
          <form className="admin-careers-form" onSubmit={handleSubmit}>
            <div className="admin-careers-form__head">
              <h2>{editingId ? "Edit opening" : "Add opening"}</h2>
              {editingId && (
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>

            <label>
              <span>Job title</span>
              <input
                value={formData.title}
                onChange={(event) => updateField("title", event.target.value)}
                required
              />
            </label>
            <div className="admin-careers-form__grid">
              <label>
                <span>Department</span>
                <input
                  value={formData.department}
                  onChange={(event) => updateField("department", event.target.value)}
                />
              </label>
              <label>
                <span>Employment type</span>
                <input
                  value={formData.employmentType}
                  onChange={(event) => updateField("employmentType", event.target.value)}
                />
              </label>
            </div>
            <label>
              <span>Location</span>
              <input
                value={formData.location}
                onChange={(event) => updateField("location", event.target.value)}
              />
            </label>
            <label>
              <span>Short description</span>
              <textarea
                value={formData.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </label>
            <label>
              <span>Apply link</span>
              <input
                type="url"
                value={formData.applyLink}
                onChange={(event) => updateField("applyLink", event.target.value)}
              />
            </label>
            <label>
              <span>Banner media URL</span>
              <input
                type="url"
                value={formData.bannerUrl}
                onChange={(event) => updateField("bannerUrl", event.target.value)}
                placeholder="https://cdn.example.com/careers/banner.jpg"
              />
              <small>Paste a Cloudinary/ImageKit/public media URL.</small>
            </label>
            {formData.bannerUrl && (
              <div className="admin-careers-media-preview">
                <img src={formData.bannerUrl} alt="Career banner preview" />
              </div>
            )}
            <label className="admin-careers-form__check">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) => updateField("isActive", event.target.checked)}
              />
              <span>Show this opening publicly</span>
            </label>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Opening" : "Add Opening"}
            </button>
          </form>

          <div className="admin-careers-list-card">
            <div className="admin-careers-toolbar">
              <label>
                <span>Search openings</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Title, department, type, location..."
                />
              </label>
            </div>

            {error && <p className="admin-careers-error">{error}</p>}
            {loading ? (
              <p className="admin-careers-empty">Loading career openings...</p>
            ) : filteredCareers.length === 0 ? (
              <p className="admin-careers-empty">No career openings found.</p>
            ) : (
              <div className="admin-careers-list">
                {filteredCareers.map((career) => {
                  const isActive = career.isActive ?? career.active;
                  return (
                    <article className="admin-careers-item" key={career.id}>
                      <div>
                        <strong>{career.title}</strong>
                        <span>
                          {[career.department, career.employmentType || career.type, career.location]
                            .filter(Boolean)
                            .join(" • ") || "Details not set"}
                        </span>
                        <small>Added {formatDate(career.createdAt)}</small>
                      </div>
                      <div className="admin-careers-item__actions">
                        <em className={isActive ? "is-active" : ""}>{isActive ? "Active" : "Inactive"}</em>
                        <button type="button" onClick={() => handleEdit(career)}>
                          Edit
                        </button>
                        <button type="button" onClick={() => handleToggle(career)}>
                          {isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button type="button" className="is-danger" onClick={() => handleDelete(career.id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
