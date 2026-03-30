import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, Users, Zap, Award, TrendingUp, LogOut, UserPlus } from 'lucide-react'

const Landing = () => {
  const navigate = useNavigate()
  const { isAuthenticated, role, logout } = useAuth()

  const handleGetStarted = () => {
    if (isAuthenticated && role) {
      navigate(`/${role}/dashboard`)
    } else {
      navigate('/login')
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GZ</span>
              </div>
              <span className="text-xl font-bold text-gray-900">GapZero</span>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to={`/${role}/dashboard`}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-medium text-danger-600 hover:text-danger-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                 <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn-primary py-2 px-4 text-xs">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Bring Learning Gaps to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Zero</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Empower underserved children with quality education through a network of dedicated mentors and volunteers.
            </p>
             <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGetStarted}
                className="btn-primary group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                to="/signup"
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-secondary-200 rounded-2xl blur-3xl opacity-50"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-xl">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-2 bg-gray-100 rounded w-32"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Four simple steps to make a difference</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                number: '1',
                title: 'NGOs Register Students',
                description: 'Education organizations enroll underserved students into the platform',
                icon: Users,
              },
              {
                number: '2',
                title: 'Volunteers Teach',
                description: 'Volunteers provide learning sessions and create custom content',
                icon: Zap,
              },
              {
                number: '3',
                title: 'Mentors Guide',
                description: 'Mentors provide personalized guidance and track student progress',
                icon: Award,
              },
              {
                number: '4',
                title: 'Students Succeed',
                description: 'Students master foundational concepts and build confidence',
                icon: TrendingUp,
              },
            ].map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  {index < 3 && (
                    <div className="hidden md:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-400 to-transparent"></div>
                  )}
                  <div className="card-hover">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 text-primary-600 font-bold mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* For Different Roles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 text-center">For Everyone</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'For NGOs',
              description: 'Manage student enrollment, track progress, and connect with mentors',
              color: 'ngo',
              cta: 'Start as NGO',
            },
            {
              title: 'For Volunteers',
              description: 'Teach and create learning content to help students succeed',
              color: 'secondary',
              cta: 'Join as Volunteer',
            },
            {
              title: 'For Mentors',
              description: 'Provide personalized guidance and help students achieve their goals',
              color: 'mentor',
              cta: 'Join as Mentor',
            },
          ].map((section, index) => (
            <div key={index} className="card-hover">
              <div className={`w-12 h-12 rounded-lg bg-${section.color}-100 mb-4`}></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h3>
              <p className="text-gray-600 mb-6">{section.description}</p>
              <Link
                to="/login"
                className={`inline-flex items-center gap-2 text-${section.color}-600 hover:text-${section.color}-700 font-medium`}
              >
                {section.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-16 text-center">Our Impact</h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { stat: '10K+', label: 'Students Helped' },
              { stat: '500+', label: 'Active Mentors' },
              { stat: '200+', label: 'Partner NGOs' },
              { stat: '95%', label: 'Success Rate' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{item.stat}</p>
                <p className="text-white/80 text-lg">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of educators, mentors, and volunteers who are helping underserved students succeed.
          </p>
          <button
            onClick={handleGetStarted}
            className="btn-primary group inline-flex"
          >
            Get Started Today
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-gray-800">
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Our Mission</a></li>
                <li><a href="#" className="hover:text-white">Team</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GZ</span>
              </div>
              <span className="font-bold">GapZero</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              Bringing Learning Gaps to Zero. Empowering education for all.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
