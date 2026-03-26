import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import API from '../utils/api';

// --- Shared Premium Components ---

const FloatingInput = ({ label, icon: Icon, type = "text", name, value, onChange, required }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div style={S.inputRoot}>
      <div style={{
        ...S.inputContainer,
        borderColor: isFocused ? '#0ea5e9' : 'rgba(255,255,255,0.06)',
        background: isFocused ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.3)',
        boxShadow: isFocused ? '0 0 0 4px rgba(14, 165, 233, 0.12)' : 'none'
      }}>
        <Icon size={18} style={{ ...S.inputIcon, color: isFocused ? '#0ea5e9' : '#64748b' }} />
        <div style={S.inputWrapper}>
          <label style={{
            ...S.label,
            transform: (isFocused || value) ? 'translateY(-14px) scale(0.85)' : 'translateY(0) scale(1)',
            color: isFocused ? '#0ea5e9' : '#94a3b8'
          }}>
            {label}
          </label>
          <input
            type={actualType}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required={required}
            style={S.input}
          />
        </div>
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={S.eyeBtn}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

const ShimmerButton = ({ children, onClick, loading, icon: Icon }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={S.shimmerBtn}
    >
      <div style={S.shimmerOverlay} />
      <div style={S.btnContent}>
        {loading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <>
            {children}
            {Icon && <Icon size={20} />}
          </>
        )}
      </div>
    </button>
  );
};

// --- Main Login Component ---

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/login', formData);
      if (data?.data?.token) {
        const { user, token } = data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'doctor') navigate('/doctor/dashboard');
        else navigate('/patient/dashboard');
      } else {
        setError('Invalid response from server.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Background Layer */}
      <div style={S.bg}>
        <img src="/assets/auth_bg.png" alt="Background" style={S.bgImg} />
        <div style={S.bgOverlay} />
      </div>

      <div style={S.card} className="login-card-anim">
        <div style={S.cardGlow} />

        <div>
          <div style={S.header}>
            <div style={S.logoWrap}>
              <div style={S.logo}>🏥</div>
            </div>
            <h1 style={S.title}>Medical Portal</h1>
            <p style={S.subtitle}>Professional Diagnostic Access</p>
          </div>

          {error && (
            <div style={S.error}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={S.form}>
            <FloatingInput
              label="Email Address"
              icon={Mail}
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <FloatingInput
              label="Password"
              icon={Lock}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div style={S.forgotWrap}>
              <Link to="/forgot-password" style={S.forgotLink}>Security Recovery?</Link>
            </div>

            <ShimmerButton loading={loading} icon={ArrowRight}>
              {loading ? 'Verifying Credentials...' : 'Sign In To Dashboard'}
            </ShimmerButton>
          </form>

          <p style={S.footer}>
            First time here? <Link to="/signup" style={S.link}>Initialize Account</Link>
          </p>
        </div>
      </div>

      <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%) skewX(-15deg); }
                    100% { transform: translateX(200%) skewX(-15deg); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .login-card-anim {
                    animation: fadeSlideIn 0.8s ease-out forwards;
                }
            `}</style>
    </div>
  );
};

const S = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#020617', overflow: 'hidden',
    fontFamily: "'Outfit', 'Inter', sans-serif"
  },
  bg: { position: 'absolute', inset: 0, zIndex: 0 },
  bgImg: {
    width: '100%', height: '100%', objectFit: 'cover',
    opacity: 0.35, filter: 'blur(30px) brightness(0.6)'
  },
  dynamicGlow: {
    position: 'absolute', width: '800px', height: '800px',
    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
    borderRadius: '50%', transform: 'translate(-50%, -50%)',
    pointerEvents: 'none', filter: 'blur(60px)', mixBlendMode: 'screen'
  },
  bgOverlay: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(circle at center, transparent 0%, #020617 100%)'
  },
  card: {
    width: '100%', maxWidth: '440px',
    background: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(60px) saturate(210%)',
    borderRadius: '40px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '54px',
    boxShadow: `
            0 50px 100px -20px rgba(0, 0, 0, 1),
            inset 0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 10px 20px -5px rgba(255, 255, 255, 0.05)
        `,
    position: 'relative', zIndex: 1, margin: '20px'
  },
  cardGlow: {
    position: 'absolute', top: '-1px', left: '10%', right: '10%', height: '1.5px',
    background: 'linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.6), transparent)',
    maskImage: 'linear-gradient(90deg, transparent, black, transparent)'
  },
  header: { textAlign: 'center', marginBottom: '44px' },
  logoWrap: {
    display: 'inline-flex', padding: '18px', borderRadius: '28px',
    background: 'rgba(14, 165, 233, 0.08)', marginBottom: '24px',
    border: '1px solid rgba(14, 165, 233, 0.2)',
    boxShadow: '0 0 30px -5px rgba(14, 165, 233, 0.2)'
  },
  logo: { fontSize: '40px' },
  title: {
    fontSize: '34px', fontWeight: 800, color: '#f8fafc',
    marginBottom: '10px', letterSpacing: '-0.03em'
  },
  subtitle: { fontSize: '17px', color: '#94a3b8', fontWeight: 500, opacity: 0.8 },
  error: {
    background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#fca5a5', padding: '14px 20px', borderRadius: '18px', fontSize: '14px',
    marginBottom: '34px', display: 'flex', alignItems: 'center', gap: '14px',
    overflow: 'hidden'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '8px' },
  inputRoot: { marginBottom: '12px' },
  inputContainer: {
    position: 'relative', display: 'flex', alignItems: 'center',
    padding: '16px 20px', borderRadius: '20px', border: '1px solid transparent',
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    backdropFilter: 'blur(10px)'
  },
  inputIcon: { marginRight: '18px', transition: 'color 0.3s cubic-bezier(0.16, 1, 0.3, 1)' },
  inputWrapper: { flex: 1, position: 'relative' },
  label: {
    position: 'absolute', left: 0, top: 0, fontSize: '15px', fontWeight: 500,
    pointerEvents: 'none', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    transformOrigin: '0 0'
  },
  input: {
    width: '100%', background: 'none', border: 'none', outline: 'none',
    color: '#f8fafc', fontSize: '16px', fontWeight: 600, paddingTop: '10px'
  },
  eyeBtn: {
    background: 'none', border: 'none', padding: '6px', color: '#64748b',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'color 0.2s'
  },
  forgotWrap: { display: 'flex', justifyContent: 'flex-end', margin: '4px 0 24px 0' },
  forgotLink: { fontSize: '13px', color: '#0ea5e9', textDecoration: 'none', fontWeight: 600, opacity: 0.9 },
  shimmerBtn: {
    width: '100%', background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
    color: '#ffffff', border: 'none', borderRadius: '22px', padding: '18px',
    fontSize: '16px', fontWeight: 700, cursor: 'pointer', position: 'relative',
    overflow: 'hidden', boxShadow: '0 15px 30px -10px rgba(37, 99, 235, 0.5)',
    transition: 'all 0.3s ease'
  },
  shimmerOverlay: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
    animation: 'shimmer 2.8s infinite cubic-bezier(0.4, 0, 0.2, 1)'
  },
  btnContent: {
    position: 'relative', zIndex: 1, display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: '14px'
  },
  footer: { marginTop: '44px', textAlign: 'center', fontSize: '16px', color: '#94a3b8' },
  link: { color: '#0ea5e9', textDecoration: 'none', fontWeight: 700, marginLeft: '6px' }
};

export default Login;
