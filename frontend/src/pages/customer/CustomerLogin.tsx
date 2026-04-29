import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useCustomerAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${api.baseUrl}/customer/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.customer);
        toast.success('Welcome back!');
        navigate('/account');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch(`${api.baseUrl}/customer/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.customer);
        toast.success('Logged in with Google!');
        navigate('/account');
      } else {
        toast.error(data.error || 'Google login failed');
      }
    } catch (err) {
      toast.error('An error occurred during Google login');
    }
  };

  return (
    <div className="section-padding">
      <div className="container-custom max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-2xl border border-border p-8 md:p-10 shadow-sm"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground mt-2 text-sm">Sign in to access your account, orders & more</p>
          </div>

          {/* Google Login */}
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Login Failed')}
              useOneTap
              shape="pill"
              size="large"
              width="100%"
            />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground tracking-wider">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-terracotta-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
            >
              {isLoading ? 'Signing in...' : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/account/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerLogin;
