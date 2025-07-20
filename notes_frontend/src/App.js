import React, { useState, useEffect } from "react";
import "./App.css";

// Minimal unique ID generator
const uuid = () =>
  "_" +
  Math.random().toString(36).substr(2, 9) +
  Date.now().toString(36);

// PUBLIC_INTERFACE
/**
 * NotesApp: Central component for notes list, creation, editing, and deletion.
 * Features:
 * - List all notes in the center.
 * - Create and edit notes via a side modal.
 * - Delete notes.
 * - Minimalistic, responsive light-themed layout.
 */
function App() {
  const [notes, setNotes] = useState(() => {
    // Persist notes in localStorage
    const saved = localStorage.getItem("notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null); // Null = new note
  const [theme] = useState("light"); // Always light theme per requirement

  // Sync changes to localStorage
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // PUBLIC_INTERFACE
  /** Open modal to add a new note */
  const handleAddNote = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  // PUBLIC_INTERFACE
  /** Open modal to edit an existing note */
  const handleEditNote = (note) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  // PUBLIC_INTERFACE
  /** Delete note handler */
  const handleDeleteNote = (noteId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this note? This action cannot be undone."
      )
    ) {
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    }
  };

  // PUBLIC_INTERFACE
  /** Save (create or update) note handler */
  const handleSaveNote = (noteData) => {
    if (!noteData.title.trim() && !noteData.content.trim()) {
      setModalOpen(false);
      return;
    }
    setNotes((prev) => {
      if (editingNote) {
        // Update
        return prev.map((n) =>
          n.id === editingNote.id ? { ...n, ...noteData, updated: Date.now() } : n
        );
      } else {
        // Create
        return [
          ...prev,
          {
            id: uuid(),
            ...noteData,
            created: Date.now(),
            updated: Date.now(),
          },
        ];
      }
    });
    setModalOpen(false);
  };

  // PUBLIC_INTERFACE
  /** Sort notes by update timestamp, newest first */
  const sortedNotes = [...notes].sort((a, b) => b.updated - a.updated);

  return (
    <div
      className="nf-root"
      style={{
        background: "var(--bg-primary, #fff)",
        color: "var(--text-primary, #222)",
        minHeight: "100vh",
      }}
    >
      <header className="nf-header">
        <h1 className="nf-title">📝 Minimal Notes</h1>
        <button className="nf-btn nf-btn-accent" onClick={handleAddNote} title="Add Note">
          + New Note
        </button>
      </header>
      <main className="nf-main">
        {sortedNotes.length === 0 && (
          <p className="nf-empty-text">No notes yet.<br />Click <b>+ New Note</b> to create one.</p>
        )}
        <ul className="nf-list">
          {sortedNotes.map((note) => (
            <li className="nf-list-item" key={note.id}>
              <div className="nf-note" onClick={() => handleEditNote(note)}>
                <div className="nf-note-title">
                  {note.title ? note.title : <span className="nf-faded">[Untitled]</span>}
                </div>
                <div className="nf-note-date">
                  {new Date(note.updated).toLocaleString()}
                </div>
              </div>
              <button
                className="nf-btn nf-btn-delete"
                title="Delete note"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNote(note.id);
                }}
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      </main>
      {isModalOpen && (
        <EditNoteModal
          initialNote={editingNote}
          onCancel={() => setModalOpen(false)}
          onSave={handleSaveNote}
        />
      )}
      <footer className="nf-footer">
        <span>
          Minimal Notes &mdash; Powered by React | <span style={{ color: "#ff9800" }}>accent</span>
        </span>
      </footer>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * EditNoteModal: Modal for creating or editing a note.
 * @param {object} props - initialNote, onSave, onCancel
 */
function EditNoteModal({ initialNote, onSave, onCancel }) {
  const [title, setTitle] = useState(initialNote ? initialNote.title : "");
  const [content, setContent] = useState(initialNote ? initialNote.content : "");

  /** Handle Save button */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, content });
  };

  useEffect(() => {
    // Trap focus and close on Escape
    const handler = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div className="nf-modal-backdrop" tabIndex="-1">
      <div className="nf-modal" role="dialog" aria-modal="true">
        <form className="nf-modal-form" onSubmit={handleSubmit}>
          <h2 className="nf-modal-title">
            {initialNote ? "Edit Note" : "New Note"}
          </h2>
          <input
            className="nf-input nf-modal-input"
            value={title}
            maxLength={100}
            placeholder="Title (optional)"
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <textarea
            className="nf-input nf-modal-textarea"
            value={content}
            placeholder="Write your note..."
            rows={8}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="nf-modal-actions">
            <button
              type="button"
              className="nf-btn nf-btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="nf-btn nf-btn-accent"
              disabled={!title.trim() && !content.trim()}
            >
              {initialNote ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
