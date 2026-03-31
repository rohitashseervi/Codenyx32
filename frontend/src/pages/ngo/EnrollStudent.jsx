import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, School, Phone, Mail, Globe, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance, { api } from '../../services/api';

export default function EnrollStudent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classGroups, setClassGroups] = useState([]);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [form, setForm] = useState({
    name: '',
    grade: '',
    school: '',
    language: 'Hindi',
    guardianPhone: '',
    guardianEmail: '',
    classGroup: '',
    newGroupName: '',
    takeBaseline: false
  });

  const languages = ['Hindi', 'English', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Urdu'];
  const grades = [1, 2, 3, 4, 5];

  useEffect(() => {
    fetchClassGroups();
  }, []);

  const fetchClassGroups = async () => {
    try {
      const res = await axiosInstance.get('/ngo/class-groups');
      setClassGroups(res.data || []);
    } catch (err) {
      // Use empty array if no groups exist yet
      setClassGroups([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.grade || !form.school || !form.guardianPhone) {
      toast.error('Please fill all required fields');
      return;
    }

    if (form.guardianPhone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        grade: parseInt(form.grade),
        school: form.school,
        language: form.language,
        guardianPhone: form.guardianPhone,
        guardianEmail: form.guardianEmail,
        classGroup: form.classGroup === 'new' ? form.newGroupName : form.classGroup,
        takeBaseline: form.takeBaseline
      };

      await axiosInstance.post('/ngo/students', payload);
      toast.success(`${form.name} enrolled successfully!`);

      if (form.takeBaseline) {
        toast('Baseline assessment will be sent to student', { icon: '📝' });
      }

      navigate('/ngo/students');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/ngo/students')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 text-sm"
        >
          <ArrowLeft size={16} /> Back to Students
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <UserPlus className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enroll New Student</h1>
            <p className="text-gray-500 text-sm">Add a student to your NGO's program</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter student's full name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade / Class <span className="text-red-500">*</span>
                </label>
                <select
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Grade</option>
                  {grades.map(g => (
                    <option key={g} value={g}>Class {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe size={14} className="inline mr-1" />
                  Language
                </label>
                <select
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {languages.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <School size={14} className="inline mr-1" />
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="school"
                value={form.school}
                onChange={handleChange}
                placeholder="e.g., Government Primary School, Rampur"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Guardian Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Guardian Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone size={14} className="inline mr-1" />
                Guardian Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="guardianPhone"
                value={form.guardianPhone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail size={14} className="inline mr-1" />
                Guardian Email
              </label>
              <input
                type="email"
                name="guardianEmail"
                value={form.guardianEmail}
                onChange={handleChange}
                placeholder="guardian@email.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Used for sending class links and test notifications</p>
            </div>
          </div>
        </div>

        {/* Class Group */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <Users size={18} className="inline mr-2" />
            Class Group Assignment
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Class Group
              </label>
              <select
                name="classGroup"
                value={form.classGroup}
                onChange={(e) => {
                  handleChange(e);
                  setShowNewGroup(e.target.value === 'new');
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">No group (assign later)</option>
                {classGroups.map(g => (
                  <option key={g._id} value={g._id}>
                    {g.name} - Grade {g.grade} ({g.subject})
                  </option>
                ))}
                <option value="new">+ Create New Group</option>
              </select>
            </div>

            {showNewGroup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Group Name
                </label>
                <input
                  type="text"
                  name="newGroupName"
                  value={form.newGroupName}
                  onChange={handleChange}
                  placeholder="e.g., Grade 3 - Math Batch A"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Baseline Assessment */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="takeBaseline"
              checked={form.takeBaseline}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <div>
              <label className="font-medium text-gray-900">Take Baseline Assessment</label>
              <p className="text-sm text-gray-500 mt-1">
                Send a baseline test to determine the student's current level in Math and Language.
                This helps the system place them correctly and track improvement over time.
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/ngo/students')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Enroll Student
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
