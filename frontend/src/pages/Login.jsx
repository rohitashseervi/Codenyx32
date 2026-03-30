import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { Chrome, Mail, Zap, ArrowRight, Shield, Globe, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const { loginWithGoogle, isAuthenticated, role, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(`/${role}/dashboard`, { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      const result = await loginWithGoogle()

      if (result.isNewUser) {
        navigate('/signup', { replace: true })
      } else {
        navigate(`/${result.role}/dashboard`, { replace: true })
      }
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Failed to login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <LoadingSpinner message="Authenticating..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Extravagant Animated Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -120, 0],
            x: [0, -80, 0],
            y: [0, -100, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px]" 
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Extravagant Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative"
            >
              <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20 border border-slate-800">
                <Zap className="w-8 h-8 text-indigo-400 fill-indigo-400" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-indigo-500/20 rounded-[2rem] blur-xl -z-10"
              />
            </motion.div>
          </div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black text-white mb-2 tracking-tighter"
          >
            Code<span className="text-indigo-400">Nyx</span>
          </motion.h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
            Future of Education Equity
          </p>
        </motion.div>

        {/* Premium Glass Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-10 shadow-2xl shadow-black/50"
        >
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-white mb-1">Operational Login</h2>
            <p className="text-slate-500 text-xs font-medium">Continue your mission within the network</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500" />
            <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 border border-white/5 rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50 font-black text-xs uppercase tracking-widest text-white">
              <Chrome className="w-5 h-5 text-indigo-400" />
              {isLoading ? 'Decrypting...' : 'Sign in with Google'}
            </div>
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="px-4 bg-slate-900/50 text-slate-500">Secure Protocol</span>
            </div>
          </div>

          <button
            disabled
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 font-black text-[10px] uppercase tracking-widest opacity-50 cursor-not-allowed"
          >
            <Mail className="w-4 h-4" />
            Enterprise SSO
          </button>
        </motion.div>

        {/* Extravagant Info Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-2 gap-4"
        >
          <div className="bg-white/5 backdrop-blur-lg border border-white/5 rounded-3xl p-5 group hover:bg-indigo-500/5 transition-colors cursor-default">
             <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-indigo-400" />
             </div>
             <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Encrypted</p>
             <p className="text-[9px] text-slate-500 leading-tight">Your data is secured by industry standards.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/5 rounded-3xl p-5 group hover:bg-blue-500/5 transition-colors cursor-default">
             <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5 text-blue-400" />
             </div>
             <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Global Coverage</p>
             <p className="text-[9px] text-slate-500 leading-tight">Access the network from anywhere on earth.</p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[10px] font-medium text-slate-500 mt-10 uppercase tracking-widest"
        >
          New to the network?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-black transition-colors underline underline-offset-4">
             Initialize Account
          </Link>
        </motion.p>
      </div>
    </div>
  )
}

export default Login
  )
}

export default Login
