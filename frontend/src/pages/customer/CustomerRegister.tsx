import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';

const CustomerRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useCustomerAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${api.baseUrl}/customer/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.customer);
        toast.success('Account created successfully!');
        navigate('/account');
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
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
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Create Account</h1>
            <p className="text-muted-foreground mt-2 text-sm">Join us and enjoy a seamless shopping experience</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-sm"
                />
              </div>
            </div>
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
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-terracotta-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
            >
              {isLoading ? 'Creating Account...' : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/account/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerRegister;
