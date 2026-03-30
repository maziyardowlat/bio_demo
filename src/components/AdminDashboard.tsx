"use client";

import { useState, useEffect, useCallback } from "react";

interface KnowledgeEntry {
  id: string;
  instructorName: string;
  title: string;
  content: string;
  createdAt: string;
}

interface AppSettings {
  useGeneralKnowledge: boolean;
}

export default function AdminDashboard() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    useGeneralKnowledge: true,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [form, setForm] = useState({
    instructorName: "",
    title: "",
    content: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [entriesRes, settingsRes] = await Promise.all([
        fetch("/api/admin/knowledge"),
        fetch("/api/admin/settings"),
      ]);
      if (entriesRes.ok) setEntries(await entriesRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  async function handleToggleGeneralKnowledge() {
    const updated = {
      useGeneralKnowledge: !settings.useGeneralKnowledge,
    };
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (res.ok) setSettings(await res.json());
  }

  function openAddForm() {
    setEditingEntry(null);
    setForm({ instructorName: "", title: "", content: "" });
    setShowForm(true);
  }

  function openEditForm(entry: KnowledgeEntry) {
    setEditingEntry(entry);
    setForm({
      instructorName: entry.instructorName,
      title: entry.title,
      content: entry.content,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingEntry) {
        const res = await fetch(
          `/api/admin/knowledge/${editingEntry.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          }
        );
        if (res.ok) {
          const updated = await res.json();
          setEntries(
            entries.map((e) => (e.id === updated.id ? updated : e))
          );
        }
      } else {
        const res = await fetch("/api/admin/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const newEntry = await res.json();
          setEntries([...entries, newEntry]);
        }
      }
      setShowForm(false);
      setForm({ instructorName: "", title: "", content: "" });
      setEditingEntry(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this knowledge entry?")) return;
    const res = await fetch(`/api/admin/knowledge/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setEntries(entries.filter((e) => e.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage instructor knowledge and chatbot settings
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          Log out
        </button>
      </div>

      {/* Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Chatbot Settings
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">
              General AI Knowledge
            </p>
            <p className="text-sm text-gray-500">
              When enabled, the chatbot can use general biology knowledge in
              addition to instructor notes
            </p>
          </div>
          <button
            onClick={handleToggleGeneralKnowledge}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.useGeneralKnowledge ? "bg-[#002145]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.useGeneralKnowledge
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Knowledge Entries */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Knowledge Entries ({entries.length})
        </h2>
        <button
          onClick={openAddForm}
          className="bg-[#002145] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#003366] transition-colors"
        >
          + Add Entry
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingEntry ? "Edit Entry" : "New Knowledge Entry"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructor Name
              </label>
              <input
                type="text"
                value={form.instructorName}
                onChange={(e) =>
                  setForm({ ...form, instructorName: e.target.value })
                }
                placeholder="e.g., Dr. Jane Smith"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002145] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="e.g., Introduction to Cell Biology"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002145] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm({ ...form, content: e.target.value })
                }
                placeholder="Paste the instructor's notes or knowledge here..."
                rows={8}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002145] focus:border-transparent resize-y"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#002145] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#003366] disabled:opacity-50 transition-colors"
              >
                {saving
                  ? "Saving..."
                  : editingEntry
                    ? "Update Entry"
                    : "Add Entry"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 px-5 py-2 rounded-lg text-sm border border-gray-200 hover:border-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-xl">
          <div className="text-4xl mb-3">📝</div>
          <p className="font-medium">No knowledge entries yet</p>
          <p className="text-sm mt-1">
            Add instructor knowledge for the chatbot to reference
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800">
                    {entry.title}
                  </h3>
                  <p className="text-sm text-[#002145] font-medium mt-0.5">
                    {entry.instructorName}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                    {entry.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Added{" "}
                    {new Date(entry.createdAt).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => openEditForm(entry)}
                    className="text-sm text-gray-500 hover:text-[#002145] px-3 py-1 rounded-lg border border-gray-200 hover:border-[#002145] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-sm text-gray-500 hover:text-red-600 px-3 py-1 rounded-lg border border-gray-200 hover:border-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
