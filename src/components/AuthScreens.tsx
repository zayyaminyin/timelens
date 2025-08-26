import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Clock, AlertCircle, Loader2, UserX, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from '../utils/supabase/client';
import vintageTypewriter from 'figma:asset/cca0ac8ac0201f3d187a6a9c88b4ec51862740bb.png';

interface AuthScreensProps {
  onAuthenticated: () => void;
  onGuestMode: () => void;
}

export function AuthScreens({ onAuthenticated, onGuestMode }: AuthScreensProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      onAuthenticated();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Auth Form */}
      <div className="w-full lg:w-2/5 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* TimeLens Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-orange-700 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">TimeLens</h1>
            </div>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <Label htmlFor="name" className="text-gray-700 text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 h-12 border-gray-300 focus:border-orange-600 focus:ring-orange-600 rounded-lg"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-gray-700 text-sm font-medium">
                {isSignUp ? 'Email Address' : 'Username or Email'}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={isSignUp ? "Enter your email" : "Username or email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 h-12 border-gray-300 focus:border-orange-600 focus:ring-orange-600 rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 text-sm font-medium">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 pr-12 border-gray-300 focus:border-orange-600 focus:ring-orange-600 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-orange-700 hover:text-orange-800 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-orange-700 hover:bg-orange-800 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isSignUp ? 'CREATE ACCOUNT' : 'LOGIN'
              )}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">or</span>
            </div>

            <Button
              type="button"
              onClick={onGuestMode}
              variant="outline"
              className="w-full h-12 border-2 border-orange-700 text-orange-700 hover:bg-orange-50 font-medium rounded-lg transition-colors"
            >
              <UserX className="w-5 h-5 mr-2" />
              CONTINUE AS GUEST
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="text-sm text-orange-700 hover:text-orange-800 font-medium mt-1"
            >
              {isSignUp ? 'Sign in to TimeLens' : 'Create a TimeLens account'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Clean Background Image */}
      <div className="hidden lg:flex lg:w-3/5 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${vintageTypewriter})`
          }}
        />
        
        {/* Subtle gradient overlay for visual enhancement */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-amber-800/10 to-orange-900/30" />
      </div>
    </div>
  );
}