'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Zap, Users, Shield, ArrowRight } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm-password') as string
    const name = formData.get('name') as string

    // Enhanced validation
    if (!email || !password || !confirmPassword || !name) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      console.log('Submitting registration with:', { email, name, password: '***' })
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      })

      const data = await res.json()
      console.log('Registration response:', { status: res.status, data })

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      // Redirect to login page on success
      router.push('/login?registered=true')
    } catch (err) {
      console.error('Registration error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      setError('')
      await signIn('google', { callbackUrl: '/dashboard', redirect: true })
    } catch (error) {
      console.error('Google sign in error:', error)
      setError('An unexpected error occurred during Google sign in.')
    } finally {
      setIsGoogleLoading(false)
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
            Start Building{' '}
            <span className="block text-accent-warn">
              10x Faster
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

        {/* Right Side - Sign Up Form */}
        <div className={`transition-all duration-1000 delay-300 ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-100 translate-x-0'}`}>
          <Card className="bg-surface-800/90 backdrop-blur-xl border border-white/10 shadow-2xl">
            <CardHeader className="text-center pb-6 md:pb-8">
              <CardTitle className="text-2xl md:text-3xl font-bold text-white">
                Create an Account
              </CardTitle>
              <CardDescription className="text-gray-300 text-base md:text-lg">
                Start building with AI-powered workflows
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
                  <label htmlFor="name" className="text-sm font-medium text-gray-300">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-accent-warn/50 focus:ring-accent-warn/50"
                    placeholder="John Doe"
                    required
                    minLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-accent-warn/50 focus:ring-accent-warn/50"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-accent-warn/50 focus:ring-accent-warn/50"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-accent-warn/50 focus:ring-accent-warn/50"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent-warn hover:bg-orange-600 text-white font-bold"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin align-middle"></span>
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
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
              
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin align-middle"></span>
                    Signing up...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
              
              <p className="text-center text-gray-400 text-xs md:text-sm mt-4 md:mt-6">
                Already have an account?{' '}
                <Link href="/login" className="text-accent-warn hover:text-orange-400 font-medium">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 