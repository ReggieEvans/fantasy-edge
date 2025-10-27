'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/libs/supabase/client'

const signupSchema = z
  .object({
    email: z.string().email({ message: 'Enter a valid email' }),
    user_name: z.string().min(2, { message: 'Display Name is required' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type SignupValues = z.infer<typeof signupSchema>

export default function RegisterForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupValues) => {
    setLoading(true)
    const { email, password, user_name } = data

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name,
          avatar_url: null,
        },
      },
    })

    if (signUpError) {
      toast({
        title: 'Signup failed',
        description: signUpError.message,
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    toast({
      title: 'Success',
      description: 'Check your email to confirm your account.',
    })

    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md bg-background border-none">
      <CardHeader>
        <CardTitle className="text-center text-xl">Create Your Account</CardTitle>
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
            placeholder="Display Name"
            {...register('user_name')}
            className="bg-background-darker border border-muted-bg"
          />
          {errors.user_name && <p className="text-sm text-red-500">{errors.user_name.message}</p>}

          <Input
            type="password"
            placeholder="Password"
            {...register('password')}
            className="bg-background-darker border border-muted-bg"
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}

          <Input
            type="password"
            placeholder="Confirm Password"
            {...register('confirmPassword')}
            className="bg-background-darker border border-muted-bg"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}

          <button type="submit" className="btn-accent w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="hover:underline text-accent">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
