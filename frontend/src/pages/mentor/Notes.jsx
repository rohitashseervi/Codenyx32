import React, { useState, useEffect } from 'react'
import { Plus, Search, FileText, Calendar, Trash2, Edit2, CheckCircle2, Loader2 } from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

const Notes = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState([])
  const [students, setStudents] = useState([])
  const [newNote, setNewNote] = useState({ title: '', content: '', studentId: '', category: 'general' })

  useEffect(() => {
    fetchNotes()
    fetchStudents()
  }, [])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/mentor/notes')
      setNotes(response.data.notes)
    } catch (error) {
      console.error('Failed to fetch notes:', error)
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await api.get('/mentor/students')
      setStudents(response.data.students)
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/mentor/student/${newNote.studentId}/notes`, {
        content: newNote.content,
        category: newNote.category
      })
      toast.success('Note saved successfully')
      setShowModal(false)
      setNewNote({ title: '', content: '', studentId: '', category: 'general' })
      fetchNotes()
    } catch (error) {
      console.error('Failed to save note:', error)
      toast.error('Failed to save note')
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.student.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentor Notes</h1>
          <p className="text-gray-600">Document your observations and track student progress.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Note</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by student or title..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
            <div className={`h-1.5 w-full ${
              note.priority === 'high' ? 'bg-red-500' : 
              note.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`}></div>
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                    {note.student}
                  </span>
                  <h3 className="font-bold text-gray-900 line-clamp-1">{note.title}</h3>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Edit2 className="w-4 h-4 cursor-pointer hover:text-primary-600" />
                  <Trash2 className="w-4 h-4 cursor-pointer hover:text-red-600" />
                </div>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-3">
                {note.content}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{note.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Saved</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Note Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Note</h2>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Select Student</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={newNote.studentId}
                  onChange={(e) => setNewNote({ ...newNote, studentId: e.target.value })}
                >
                  <option value="">Select a student...</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Note Category</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={newNote.category}
                  onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="progress">Progress</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="critical">Critical/Alert</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Title</label>
                <input
                  required
                  type="text"
                  placeholder="Note title..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Content</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Write your observations..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                ></textarea>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-gray-600 font-medium hover:text-gray-900"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-8">
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notes
