// src/components/molecules/AuthModal.tsx
'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
import { useCreateAccount, useLogin } from '@/hooks/useAuth';
import type { CreateAccountRequestDTO } from '@/types/dtos/auth';
import { useAuthStore } from '@/store/auth';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutate: createAccount, isPending: isCreating } = useCreateAccount();
  const { mutate: login, isPending: isLogging } = useLogin();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const handleClose = () => {
    if (isAuthenticated) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous errors

    if (isRegister) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const data: CreateAccountRequestDTO = {
        email,
        fullName,
        password,
      };

      createAccount(data, {
        onSuccess: () => {
          // Switch back to login form after successful registration
          setIsRegister(false);
          // Optionally clear the password fields
          setPassword('');
          setConfirmPassword('');
          // Add success notification
        },
        onError: (error) => {
          // Add error notification
          console.error('Registration failed:', error);
        },
      });
    } else {
      login(
        {
          email,
          password,
        },
        {
          onSuccess: () => {
            onClose();
            // Reload the page to clear all previous states
            window.location.reload();
          },
          onError: (error) => {
            setError('Invalid email or password');
            console.error('Login failed:', error);
          },
        }
      );
    }
  };

  const isPending = isRegister ? isCreating : isLogging;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative w-full max-w-md rounded-2xl bg-background/80 p-6 backdrop-blur">
          <DialogTitle className="mb-6 text-h3">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-500">
                {error}
              </div>
            )}

            {/* Email Input */}
            <label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              name="email"
              id="email"
              autoComplete="email"
            />

            {isRegister && (
              <>
                {/* Full Name Input */}
                <label htmlFor="fullName" className="text-white">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  name="fullName"
                  id="fullName"
                  autoComplete="name"
                />
              </>
            )}

            {/* Password Input */}
            <label htmlFor="password" className="text-white">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                name="password"
                id="password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>

            {isRegister && (
              <>
                {/* Confirm Password Input */}
                <label htmlFor="confirmPassword" className="text-white">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    name="confirmPassword"
                    id="confirmPassword"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isPending}
            >
              {isPending
                ? 'Loading...'
                : isRegister
                  ? 'Create Account'
                  : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setIsRegister(!isRegister);
                // Optionally clear fields when switching
                if (isRegister) {
                  setEmail('');
                  setPassword('');
                  setFullName('');
                  setConfirmPassword('');
                }
              }}
              disabled={isPending}
            >
              {isRegister
                ? 'Already have an account? Sign In'
                : "Don't have an account? Register"}
            </Button>
          </div>

          <button
            onClick={handleClose}
            className={`absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 ${
              !isAuthenticated ? 'cursor-not-allowed opacity-30' : ''
            }`}
            disabled={!isAuthenticated}
          >
            {/* ... close button content ... */}
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
