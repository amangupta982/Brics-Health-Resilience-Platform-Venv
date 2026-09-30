import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, LogIn, Loader2 } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';
import { auth, signInWithEmailAndPassword } from '../firebase';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // For Hackathon demo purposes, if Firebase fails because it's using a dummy config,
    // we can fallback to a simulated success or you can use a real Firebase project.
    try {
      if (email === 'admin@brics.org' && password === 'admin123') {
        // Simulated bypass for hackathon if dummy config is used
        toast.success("Authentication Successful (Demo Mode)");
        setTimeout(() => navigate('/'), 1000);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Authentication Successful");
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#090e18] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-2xl border shadow-xl ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
            <ShieldAlert size={32} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2">BRICS Health Platform</h2>
        <p className={`text-center text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Secure Sovereign Access Portal
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Government Email (or demo: admin@brics.org)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-slate-100' 
                  : 'bg-slate-50 border-slate-300 focus:border-blue-500'
              }`}
              placeholder="operator@mohfw.gov"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Passcode (or demo: admin123)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-slate-100' 
                  : 'bg-slate-50 border-slate-300 focus:border-blue-500'
              }`}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-500 text-white disabled:bg-blue-800'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            Authenticate Node
          </button>
        </form>
      </motion.div>
    </div>
  );
}
