import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, ChevronRight, ArrowLeft, Github, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth, signInWithGoogle } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile
} from 'firebase/auth';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useStore();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Google Auth Error:", err.code, err.message);
      if (err.code === 'auth/unauthorized-domain') {
        setError(`Unauthorized domain. Please add "${window.location.hostname}" to your Firebase Console > Authentication > Settings > Authorized domains.`);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Scholar',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        await updateProfile(firebaseUser, {
          displayName: name,
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        });

        setUser({
          id: firebaseUser.uid,
          name: name,
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Auth Error:", err.code, err.message);
      
      let message = 'An error occurred during authentication';
      
      switch (err.code) {
        case 'auth/invalid-credential':
          message = isLogin 
            ? 'Invalid email or password. If you haven\'t created an account yet, please switch to the Sign Up tab.'
            : 'Invalid credential. Please ensure your email is correct and your password is at least 6 characters.';
          break;
        case 'auth/user-not-found':
          message = 'No account found with this email. Please sign up first.';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password. Please try again.';
          break;
        case 'auth/email-already-in-use':
          message = 'This email is already in use. Try signing in instead.';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak. Please use at least 6 characters.';
          break;
        case 'auth/operation-not-allowed':
          message = (
            <span>
              Email/Password sign-in is not enabled. 
              <a 
                href="https://console.firebase.google.com/project/gen-lang-client-0582513186/authentication/providers" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline ml-1 font-bold"
              >
                Click here to enable it
              </a> 
              in the Firebase Console.
            </span>
          );
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later.';
          break;
        default:
          message = err.message || message;
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/10 blur-[120px] rounded-full" />

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 transition-colors font-bold text-[10px] uppercase tracking-widest">
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/30 mx-auto mb-4">
            <Zap className="text-white" size={28} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2 text-slate-900">
            {isLogin ? 'Welcome Back' : 'Join FocusOS'}
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            {isLogin ? 'Enter your credentials to continue' : 'Start your productivity journey today'}
          </p>
        </div>

        <div className="card p-8 shadow-2xl border border-primary-50">
          {error && (
            <div className="mb-6">
              <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold flex items-start gap-3 border border-rose-100">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <span>{error}</span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-12 py-3.5 rounded-2xl font-bold"
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  placeholder="scholar@focusos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12 py-3.5 rounded-2xl font-bold"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-12 py-3.5 rounded-2xl font-bold"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-4 text-base mt-2 flex items-center justify-center gap-2 shadow-xl shadow-primary-600/20 rounded-2xl"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'} <ChevronRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-50"></div>
              </div>
              <span className="relative px-4 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="bg-slate-50 border border-primary-50 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all disabled:opacity-50 text-slate-900"
              >
                {googleLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                    Google
                  </>
                )}
              </button>
              <button 
                className="bg-slate-50 border border-primary-50 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all disabled:opacity-50 text-slate-900"
                disabled={googleLoading || loading}
              >
                <Github size={18} />
                GitHub
              </button>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-primary-50 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-primary-600 transition-colors tracking-tight uppercase tracking-widest"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
