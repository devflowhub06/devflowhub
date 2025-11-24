'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, Zap, Users, Shield } from 'lucide-react'
import Link from 'next/link'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Get callback URL from query params or default to dashboard
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: callbackUrl
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      if (result?.ok) {
        // Redirect to the callback URL
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      setError('')
      
      const result = await signIn('google', { 
        callbackUrl: callbackUrl,
        redirect: true,
      })

      if (result?.error) {
        setError('Google authentication failed. Please try again.')
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      setError('An unexpected error occurred during Google sign in.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    try {
      setIsGithubLoading(true)
      setError('')
      
      const result = await signIn('github', { 
        callbackUrl: callbackUrl,
        redirect: true,
      })

      if (result?.error) {
        setError('GitHub authentication failed. Please try again.')
      }
    } catch (error) {
      console.error('GitHub sign in error:', error)
      setError('An unexpected error occurred during GitHub sign in.')
    } finally {
      setIsGithubLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-900 via-surface-800 to-bg-900 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center py-8 md:py-12">
        
        {/* Left Side - Branding */}
        <div className={`text-center lg:text-left transition-all duration-1000 ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-100 translate-x-0'}`}>
          <div className="flex items-center justify-center lg:justify-start space-x-2 md:space-x-3 mb-4 md:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0">
              <img 
                src="/devflowhub-original-logo.png" 
                alt="devflowhub" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl sm:text-2xl md:text-3xl font-semibold text-white tracking-tight">devflowhub</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight">
            Welcome Back to{' '}
            <span className="block text-accent-warn">
              10x Faster Development
            </span>
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-4 md:mb-6 leading-relaxed px-2">
            The only AI Development OS that unifies ideation, coding, testing, design, and deployment with intelligent context.
          </p>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 lg:gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-accent-warn" />
              </div>
              <div className="text-white font-semibold text-lg md:text-xl">2,000+</div>
              <div className="text-gray-400 text-xs md:text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-accent-warn" />
              </div>
              <div className="text-white font-semibold text-lg md:text-xl">99.9%</div>
              <div className="text-gray-400 text-xs md:text-sm">Reliability</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-accent-warn" />
              </div>
              <div className="text-white font-semibold text-lg md:text-xl">10x</div>
              <div className="text-gray-400 text-xs md:text-sm">Faster Development</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className={`transition-all duration-1000 delay-300 ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-100 translate-x-0'}`}>
          <Card className="bg-surface-800/90 backdrop-blur-xl border border-white/10 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl md:text-3xl font-bold text-white">
                Sign In
              </CardTitle>
              <CardDescription className="text-gray-300 text-base md:text-lg">
                Access your AI development dashboard
              </CardDescription>
            </CardHeader>
              
            <CardContent className="space-y-4 md:space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl backdrop-blur-sm text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-accent-warn/50 focus:ring-accent-warn/50"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-blue-500/50 pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/50"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
                      Remember me
                    </label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-accent-warn hover:text-orange-400">
                    Forgot password?
                  </Link>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-accent-warn hover:bg-orange-600 text-white font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin align-middle"></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface-800 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <Button
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin align-middle"></span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                  onClick={handleGithubSignIn}
                  disabled={isGithubLoading}
                >
                  {isGithubLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin align-middle"></span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </>
                  )}
                </Button>
              </div>
              <p className="text-center text-gray-400 text-xs md:text-sm mt-4 md:mt-6">
                Don't have an account?{' '}
                <Link href="/signup" className="text-accent-warn hover:text-orange-400 font-medium">Create an account</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}