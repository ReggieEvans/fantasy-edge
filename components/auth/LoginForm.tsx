'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { z } from 'zod'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/libs/supabase/client'
import { setAuth } from '@/store/slices/authSlice'

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const dispatch = useDispatch()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginValues) => {
    setLoading(true)
    const { email, password } = data
    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      toast({
        title: 'Login failed',
        description: signInError.message,
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user || userError) {
      toast({
        title: 'User fetch error',
        description: userError?.message || 'Could not load user',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      toast({
        title: 'Profile fetch error',
        description: profileError.message,
        variant: 'destructive',
      })
    }

    dispatch(
      setAuth({
        id: user.id,
        email: user.email ?? null,
        user_name: profile.username ?? null,
        role: profile.role ?? null,
        hasCreatedDynasty: profile.has_created_dynasty ?? null,
      }),
    )

    toast({
      title: 'Welcome',
      description: `Logged in as ${profile?.display_name ?? user.email}`,
    })

    router.push('/')
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md bg-background border-none">
      <CardHeader>
        <CardTitle className="text-center text-xl">Welcome Back</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            placeholder="Email"
            {...register('email')}
            className="bg-background-darker border border-muted-bg"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}

          <Input
            type="password"
            placeholder="Password"
            {...register('password')}
            className="bg-background-darker border border-muted-bg"
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}

          <button type="submit" className="btn-accent w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-foreground">
          Don’t have an account?{' '}
          <Link href="/register" className="hover:underline text-accent">
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
