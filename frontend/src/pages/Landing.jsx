import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ArrowRight,
  Users,
  Zap,
  Award,
  TrendingUp,
  LogOut,
  BookOpen,
  Shield,
  Brain,
  Globe,
  ChevronRight,
  Star,
  Heart,
  Target,
  Sparkles,
  GraduationCap,
  School,
  UserCheck,
} from 'lucide-react'

// Animated counter hook
function useCounter(target, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!startOnView) {
      setStarted(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true)
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started, startOnView])

  useEffect(() => {
    if (!started) return
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [started, target, duration])

  return { count, ref }
}

// Fade-in-on-scroll component
function FadeIn({ children, className = '', delay = 0 }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

const Landing = () => {
  const navigate = useNavigate()
  const { isAuthenticated, role, logout } = useAuth()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated && role) {
      const r = role === 'ngo_admin' ? 'ngo' : role
      navigate(`/${r}/dashboard`)
    } else {
      navigate('/signup')
    }
  }

  const stat1 = useCounter(10000, 2500)
  const stat2 = useCounter(500, 2000)
  const stat3 = useCounter(200, 1800)
  const stat4 = useCounter(95, 1500)

  return (
    <div className="min-h-screen bg-[#0a0b1a] text-white overflow-x-hidden">
      {/* ============ ANIMATED BACKGROUND ============ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Gradient orbs */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
            top: '-200px',
            right: '-200px',
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
            bottom: '10%',
            left: '-150px',
            transform: `translateY(${-scrollY * 0.08}px)`,
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-10 blur-[80px]"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            top: '50%',
            right: '20%',
            transform: `translateY(${-scrollY * 0.05}px)`,
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ============ NAVIGATION ============ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrollY > 50 ? 'rgba(10, 11, 26, 0.85)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
          borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-white font-black text-sm tracking-tight">GZ</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Gap<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Zero</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#impact" className="text-sm text-gray-400 hover:text-white transition-colors">
                Impact
              </a>
              <a href="#roles" className="text-sm text-gray-400 hover:text-white transition-colors">
                Join Us
              </a>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to={`/${role === 'ngo_admin' ? 'ngo' : role}/dashboard`}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <button
                    onClick={handleGetStarted}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all hover:-translate-y-0.5"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section className="relative z-10 pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-8">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-300">Empowering Education for Every Child</span>
              </div>
            </FadeIn>

            {/* Main heading */}
            <FadeIn delay={100}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-8">
                Bring Learning
                <br />
                Gaps to{' '}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">
                    Zero
                  </span>
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full" />
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={200}>
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                A scalable platform connecting NGOs, volunteer teachers, and mentors to deliver quality
                education to underserved children in Grades 1-5.
              </p>
            </FadeIn>

            {/* CTA Buttons */}
            <FadeIn delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGetStarted}
                  className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-lg font-semibold hover:shadow-xl hover:shadow-cyan-500/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 border border-white/10 rounded-2xl text-lg font-semibold hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-gray-300"
                >
                  See How It Works
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Hero visual - Floating cards */}
          <FadeIn delay={400}>
            <div className="mt-20 relative max-w-5xl mx-auto">
              {/* Main dashboard preview card */}
              <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-1">
                <div className="rounded-[22px] bg-[#0d0e24] p-8 overflow-hidden">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'Students Active', value: '1,247', color: 'from-cyan-500 to-blue-500', icon: Users },
                      { label: 'Sessions Today', value: '38', color: 'from-violet-500 to-purple-500', icon: BookOpen },
                      { label: 'Avg Mastery', value: '78%', color: 'from-emerald-500 to-teal-500', icon: TrendingUp },
                    ].map((card, i) => {
                      const Icon = card.icon
                      return (
                        <div
                          key={i}
                          className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 hover:bg-white/[0.06] transition-colors"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">{card.label}</span>
                          </div>
                          <p className="text-3xl font-bold">{card.value}</p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Fake chart bars */}
                  <div className="flex items-end gap-2 h-32">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-lg bg-gradient-to-t from-cyan-500/40 to-cyan-500/10 transition-all hover:from-cyan-400/60 hover:to-cyan-400/20"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating notification cards */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 hidden lg:block">
                <div className="rounded-2xl border border-white/10 bg-[#0d0e24]/90 backdrop-blur-xl p-4 shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New Mentor Joined</p>
                      <p className="text-xs text-gray-500">Anita D. - Math Expert</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 top-1/3 hidden lg:block">
                <div className="rounded-2xl border border-white/10 bg-[#0d0e24]/90 backdrop-blur-xl p-4 shadow-2xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Award className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Badge Earned!</p>
                      <p className="text-xs text-gray-500">Aarav M. - Math Star</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section id="features" className="relative z-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-sm uppercase tracking-widest text-cyan-400 font-semibold">Platform Features</span>
              <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6">
                Everything You Need to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                  Transform Education
                </span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Built with cutting-edge technology to make quality education accessible, trackable, and impactful.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Assessments',
                description: 'Gemini AI generates personalized tests adapted to each student\'s grade and difficulty level.',
                gradient: 'from-violet-500 to-purple-600',
                glow: 'violet',
              },
              {
                icon: Target,
                title: 'Smart Mentor Matching',
                description: '5-factor weighted algorithm pairs students with the ideal mentor based on needs and expertise.',
                gradient: 'from-cyan-500 to-blue-600',
                glow: 'cyan',
              },
              {
                icon: TrendingUp,
                title: 'Real-Time Analytics',
                description: 'Live dashboards track mastery scores, at-risk students, and learning trends across your NGO.',
                gradient: 'from-emerald-500 to-teal-600',
                glow: 'emerald',
              },
              {
                icon: BookOpen,
                title: 'Structured Learning Paths',
                description: 'Auto-generated curriculum modules with teaching guides tailored to volunteer availability.',
                gradient: 'from-amber-500 to-orange-600',
                glow: 'amber',
              },
              {
                icon: Shield,
                title: 'Multi-NGO Architecture',
                description: 'Built to scale — each NGO gets isolated data, their own admin panel, and full autonomy.',
                gradient: 'from-rose-500 to-pink-600',
                glow: 'rose',
              },
              {
                icon: Globe,
                title: 'Multilingual Support',
                description: 'Content in Hindi, English, Telugu, and more — reaching children in their native language.',
                gradient: 'from-blue-500 to-indigo-600',
                glow: 'blue',
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <FadeIn key={i} delay={i * 100}>
                  <div className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-1 h-full">
                    {/* Glow effect on hover */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(400px circle at 50% 0%, rgba(var(--${feature.glow}), 0.06), transparent)`,
                      }}
                    />
                    <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="relative text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="relative text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="relative z-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-20">
              <span className="text-sm uppercase tracking-widest text-cyan-400 font-semibold">The Process</span>
              <h2 className="text-4xl md:text-5xl font-black mt-4">
                How GapZero Works
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-cyan-500/30 via-violet-500/30 to-cyan-500/30" />

            {[
              { step: '01', title: 'NGOs Onboard', desc: 'Register your organization and enroll students in minutes', icon: School, color: 'from-cyan-400 to-blue-500' },
              { step: '02', title: 'Volunteers Teach', desc: 'Conduct structured sessions with AI-generated lesson plans', icon: Zap, color: 'from-violet-400 to-purple-500' },
              { step: '03', title: 'Mentors Guide', desc: 'Matched mentors provide personalized 1-on-1 support', icon: Heart, color: 'from-rose-400 to-pink-500' },
              { step: '04', title: 'Students Thrive', desc: 'Track progress, earn badges, and master foundational skills', icon: GraduationCap, color: 'from-emerald-400 to-teal-500' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <FadeIn key={i} delay={i * 150}>
                  <div className="text-center relative">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg relative z-10`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Step {item.step}</span>
                    <h3 className="text-xl font-bold mt-2 mb-3">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ IMPACT STATS ============ */}
      <section id="impact" className="relative z-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-12 md:p-16 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full" />

              <div className="relative">
                <div className="text-center mb-14">
                  <span className="text-sm uppercase tracking-widest text-cyan-400 font-semibold">Our Impact</span>
                  <h2 className="text-4xl md:text-5xl font-black mt-4">
                    Numbers That{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                      Matter
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { ref: stat1.ref, value: stat1.count, suffix: '+', label: 'Students Empowered', icon: Users },
                    { ref: stat2.ref, value: stat2.count, suffix: '+', label: 'Active Mentors', icon: UserCheck },
                    { ref: stat3.ref, value: stat3.count, suffix: '+', label: 'Partner NGOs', icon: Globe },
                    { ref: stat4.ref, value: stat4.count, suffix: '%', label: 'Satisfaction Rate', icon: Star },
                  ].map((stat, i) => {
                    const Icon = stat.icon
                    return (
                      <div key={i} ref={stat.ref} className="text-center">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                          <Icon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <p className="text-4xl md:text-5xl font-black text-white mb-2">
                          {stat.value.toLocaleString()}
                          <span className="text-cyan-400">{stat.suffix}</span>
                        </p>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ============ ROLE CARDS ============ */}
      <section id="roles" className="relative z-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-sm uppercase tracking-widest text-cyan-400 font-semibold">Join The Movement</span>
              <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6">
                Find Your Role
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Whether you run an NGO, want to volunteer, mentor students, or are a student yourself — there's a place for you.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'NGO Admin',
                desc: 'Register your organization, enroll students, and track educational outcomes with powerful analytics.',
                icon: School,
                gradient: 'from-cyan-500 to-blue-600',
                borderColor: 'border-cyan-500/20 hover:border-cyan-500/40',
                features: ['Bulk student enrollment', 'Real-time dashboards', 'Volunteer management'],
              },
              {
                title: 'Volunteer',
                desc: 'Teach structured sessions and create AI-powered assessments for students who need it most.',
                icon: Zap,
                gradient: 'from-violet-500 to-purple-600',
                borderColor: 'border-violet-500/20 hover:border-violet-500/40',
                features: ['AI lesson plans', 'Session scheduling', 'Student progress tracking'],
              },
              {
                title: 'Mentor',
                desc: 'Get matched with students automatically and provide personalized guidance to help them succeed.',
                icon: Heart,
                gradient: 'from-rose-500 to-pink-600',
                borderColor: 'border-rose-500/20 hover:border-rose-500/40',
                features: ['Smart matching', 'Progress alerts', 'Session notes'],
              },
              {
                title: 'Student',
                desc: 'Access quality education, take assessments, earn badges, and track your learning journey.',
                icon: GraduationCap,
                gradient: 'from-emerald-500 to-teal-600',
                borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
                features: ['Interactive tests', 'Badge system', 'Mentor support'],
              },
            ].map((role, i) => {
              const Icon = role.icon
              return (
                <FadeIn key={i} delay={i * 100}>
                  <div className={`group rounded-2xl border ${role.borderColor} bg-white/[0.02] p-7 hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-2 h-full flex flex-col`}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{role.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-5 flex-1">{role.desc}</p>
                    <ul className="space-y-2 mb-6">
                      {role.features.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-2 text-sm text-gray-500">
                          <ChevronRight className="w-3 h-3 text-cyan-400" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/signup"
                      className={`text-sm font-semibold bg-gradient-to-r ${role.gradient} bg-clip-text text-transparent flex items-center gap-1 group-hover:gap-2 transition-all`}
                    >
                      Join as {role.title}
                      <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="relative rounded-3xl overflow-hidden">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-600 to-violet-600" />
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              }} />

              <div className="relative p-12 md:p-16 text-center">
                <h2 className="text-3xl md:text-5xl font-black mb-6">
                  Ready to Bridge the Gap?
                </h2>
                <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
                  Join thousands of educators, mentors, and volunteers who are transforming education for underserved children across India.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleGetStarted}
                    className="group px-8 py-4 bg-white text-gray-900 rounded-2xl text-lg font-bold hover:shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <Link
                    to="/login"
                    className="px-8 py-4 border-2 border-white/30 rounded-2xl text-lg font-semibold hover:bg-white/10 transition-all flex items-center justify-center"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 border-t border-white/[0.06] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm">GZ</span>
                </div>
                <span className="text-xl font-bold">GapZero</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                A scalable learning support platform connecting NGOs, volunteer teachers, and mentors to deliver quality education to underserved children.
              </p>
            </div>

            {[
              { title: 'Platform', links: ['Features', 'How It Works', 'For NGOs', 'For Volunteers'] },
              { title: 'Resources', links: ['Documentation', 'API', 'Support', 'Blog'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Privacy', 'Terms'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link, li) => (
                    <li key={li}>
                      <a href="#" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              2026 GapZero. Built with purpose by Team CodeNyx.
            </p>
            <div className="flex items-center gap-6">
              {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
                <a key={social} href="#" className="text-sm text-gray-600 hover:text-cyan-400 transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
