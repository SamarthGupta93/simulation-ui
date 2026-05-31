import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const { user, login } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@verizon.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) return <Navigate to="/projects" replace />

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('Email is required'); return }
    login(email.trim())
    navigate('/projects')
  }

  function handleDemo() {
    login('demo@verizon.com', 'Demo User')
    navigate('/projects')
  }

  return (
    <div className="min-h-screen bg-vz-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <VzLogo />
          <div>
            <p className="text-lg font-bold text-vz-gray-900 leading-none">SimLab</p>
            <p className="text-xs text-vz-gray-500 mt-0.5">Simulation Platform</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border shadow-sm p-8">
          <h1 className="text-xl font-semibold text-vz-gray-900 mb-1">Sign in</h1>
          <p className="text-sm text-vz-gray-500 mb-6">Access your simulation projects</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vz-gray-300" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vz-gray-300" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <Button type="submit" className="w-full" size="lg">
              Continue <ArrowRight size={15} />
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-vz-gray-400">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleDemo}
          >
            Continue in demo mode
          </Button>
        </div>

        <p className={cn('text-center text-xs text-vz-gray-400 mt-4')}>
          Don't have an account? Contact your workspace admin.
        </p>
      </div>
    </div>
  )
}

function VzLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="3" fill="#CD040B" />
      <path d="M5.5 5.5h4l4 8 4-8h4L13 18.5h-2.5L5.5 5.5z" fill="white" />
    </svg>
  )
}
