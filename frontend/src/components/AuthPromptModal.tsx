import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, ShoppingBag } from 'lucide-react';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
}

const AuthPromptModal = ({ isOpen, onClose, onContinueAsGuest }: AuthPromptModalProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full p-6 md:p-8 relative">
              {/* Close button */}
              <button onClick={onClose} className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-foreground">Before You Checkout</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  Sign in to track your orders and enjoy a faster checkout experience.
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/account/login')}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-terracotta-dark transition-colors text-sm"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </button>

                <button
                  onClick={() => navigate('/account/register')}
                  className="w-full flex items-center justify-center gap-2 bg-background border border-border text-foreground py-3 rounded-lg font-medium hover:border-primary/30 hover:bg-primary/5 transition-all text-sm"
                >
                  <UserPlus className="w-4 h-4" /> Create Account
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground tracking-wider">or</span>
                  </div>
                </div>

                <button
                  onClick={onContinueAsGuest}
                  className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                >
                  Continue as Guest →
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthPromptModal;
