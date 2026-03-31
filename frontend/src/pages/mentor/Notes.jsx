import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { FileText, Plus, User } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Notes = () => {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNote, setNewNote] = useState({ studentId: '', content: '', category: 'general' })
  const [students, setStudents] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [notesRes, studentsRes] = await Promise.all([
        api.mentor.getNotes ? api.mentor.getNotes() : Promise.resolve({ data: { data: [] } }),
        api.mentor.getStudents().catch(() => ({ data: { data: [], students: [] } }))
      ])

      const notesList = notesRes.data?.data || notesRes.data?.notes || []
      setNotes(Array.isArray(notesList) ? notesList : [])

      const studentsList = studentsRes.data?.data || studentsRes.data?.students || []
      setStudents(Array.isArray(studentsList) ? studentsList : [])
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.content.trim()) {
      toast.error('Please enter note content')
      return
    }
    if (!newNote.studentId) {
      toast.error('Please select a student')
      return
    }

    try {
      await api.mentor.addNotes(newNote.studentId, {
        content: newNote.content,
        category: newNote.category
      })
      toast.success('Note added successfully')
      setNewNote({ studentId: '', content: '', category: 'general' })
      setShowAddForm(false)
      fetchData()
    } catch (error) {
      console.error('Failed to add note:', error)
      toast.error('Failed to add note')
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-700',
      academic: 'bg-blue-100 text-blue-700',
      behavioral: 'bg-yellow-100 text-yellow-700',
      achievement: 'bg-green-100 text-green-700',
      concern: 'bg-red-100 text-red-700',
    }
    return colors[category] || colors.general
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-600 mt-1">Track observations and guidance for your students</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {/* Add Note Form */}
      {showAddForm && (
        <div className="card border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Note</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <select
                value={newNote.studentId}
                onChange={(e) => setNewNote(prev => ({ ...prev, studentId: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a student...</option>
                {students.map((s) => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.name} {s.grade ? `(Grade ${s.grade})` : ''}
                  </option>
                ))}
              </select>
              {students.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">No students assigned yet. Join an NGO to get started.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newNote.category}
                onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="behavioral">Behavioral</option>
                <option value="achievement">Achievement</option>
                <option value="concern">Concern</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your observations or guidance..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddNote}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save Note
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map((note, idx) => (
            <div key={note._id || idx} className="card">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-gray-900">
                      {note.studentId?.name || 'Student'}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
                      {note.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700">{note.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No notes yet</p>
          <p className="text-sm text-gray-500">Add notes to track student progress and observations</p>
        </div>
      )}
    </div>
  )
}

export default Notes
