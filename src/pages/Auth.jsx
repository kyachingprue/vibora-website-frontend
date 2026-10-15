import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  AtSign,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  ArrowRight
} from 'lucide-react'

import SEO from '@/components/SEO'
import { Logo } from '@/components/layout/Navbar'
import { ThemeCycleButton } from '@/components/ThemeToggle'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useDispatch } from 'react-redux'
import { login } from '@/store/authSlice'

const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters.')
  .max(20, 'Username cannot exceed 20 characters.')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Only letters, numbers, and underscores are allowed.'
  )

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email address is required.')
  .email('Please enter a valid email address.')
  .max(254, 'Email address is too long.')

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.')
})

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(80, 'Full name cannot exceed 80 characters.')
    .refine(value => value.split(/\s+/).some(Boolean), {
      message: 'Please enter your full name.'
    }),
  username: z
    .string()
    .trim()
    .max(20, 'Username cannot exceed 20 characters.')
    .refine(
      value => value === '' || /^[a-zA-Z0-9_]{3,20}$/.test(value),
      'Use 3–20 letters, numbers, or underscores.'
    ),
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters.')
    .max(128, 'Password cannot exceed 128 characters.')
    .regex(/[a-z]/, 'Include at least one lowercase letter.')
    .regex(/[A-Z]/, 'Include at least one uppercase letter.')
    .regex(/[0-9]/, 'Include at least one number.')
})

const verificationSchema = z.object({
  code: z
    .string()
    .regex(/^[0-9]{6}$/, 'Enter the complete 6-digit verification code.')
})

const inputBase =
  'h-12 rounded-xl border bg-white/70 px-4 text-sm shadow-sm transition-all duration-200 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-violet-500/25 dark:bg-neutral-900/70 dark:text-white dark:placeholder:text-neutral-500'

function Field({ id, label, icon: Icon, error, success, children }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200"
      >
        {label}
      </label>

      <div className="relative">
        <Icon
          aria-hidden="true"
          className={`pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 ${
            error
              ? 'text-red-500'
              : success
                ? 'text-emerald-500'
                : 'text-neutral-400'
          }`}
        />

        {children}
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium leading-5 text-red-600 dark:text-red-400"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : success ? (
        <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Looks good!
        </p>
      ) : null}
    </div>
  )
}

function getInputClass(error) {
  return `${inputBase} w-full pl-10 ${
    error
      ? 'border-red-400 focus-visible:ring-red-500/20 dark:border-red-500'
      : 'border-neutral-200 focus-visible:border-violet-500 dark:border-neutral-700'
  }`
}

export default function Auth({ mode = 'login' }) {
  const isLogin = mode === 'login'
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const qc = useQueryClient()

  const [verify, setVerify] = useState(false)
  const [notice, setNotice] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resending, setResending] = useState(false)

  const schema = verify
    ? verificationSchema
    : isLogin
      ? loginSchema
      : registerSchema

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    clearErrors,
    reset,
    formState: { errors, dirtyFields, touchedFields }
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      code: ''
    }
  })

  const email = watch('email', '')
  const password = watch('password', '')
  const name = watch('name', '')
  const username = watch('username', '')
  const code = watch('code', '')

  const mutate = useMutation({
    mutationFn: async values => {
      if (verify) {
        return api.verifyEmail({
          email: getValues('email').trim(),
          code: values.code.trim()
        })
      }

      if (isLogin) {
        return api.login({
          email: values.email.trim(),
          password: values.password
        })
      }

      const generatedUsername = values.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 20)

      const finalUsername = values.username.trim() || generatedUsername

      if (!/^[a-z0-9_]{3,20}$/.test(finalUsername)) {
        throw new Error(
          'Your name cannot generate a valid username. Please enter a username manually.'
        )
      }

      await api.register({
        name: values.name.trim(),
        username: finalUsername,
        email: values.email.trim(),
        password: values.password
      })

      return { registered: true }
    },

    onSuccess: async result => {
      if (result?.registered) {
        setVerify(true)
        setNotice(
          'Verification code sent to your email. Enter the 6-digit code to finish registration.'
        )
        clearErrors()
        reset({
          name: getValues('name'),
          username: getValues('username'),
          email: getValues('email'),
          password: '',
          code: ''
        })
        return
      }

      if (result?.user) {
        dispatch(login(result.user))
        qc.setQueryData(['session'], result.user)

        await Promise.all([
          qc.invalidateQueries({ queryKey: ['session'] }),
          qc.invalidateQueries({ queryKey: ['feed'] })
        ])

        navigate('/', { replace: true })
      }
    },

    onError: error => {
      setNotice(error.message || 'Something went wrong.')
    }
  })

  const submit = values => {
    setNotice('')
    mutate.mutate(values)
  }

  const handleResend = async () => {
    setNotice('')
    setResending(true)

    try {
      await api.resendCode({ email: email.trim() })
      setNotice(
        'If the account exists and is not verified, a new code was sent.'
      )
    } catch (error) {
      setNotice(error.message || 'Could not resend the verification code.')
    } finally {
      setResending(false)
    }
  }

  const backToForm = () => {
    setVerify(false)
    setNotice('')
    clearErrors()
    setValue('password', '')
  }

  const fieldError = field => errors[field]?.message

  const fieldSuccess = field =>
    Boolean(
      watch(field) &&
      dirtyFields[field] &&
      touchedFields[field] &&
      !errors[field]
    )

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-violet-100 via-white to-fuchsia-100 px-4 py-12 dark:from-neutral-950 dark:via-neutral-950 dark:to-violet-950/40 sm:px-6">
      <SEO
        title={verify ? 'Verify email' : isLogin ? 'Log in' : 'Create account'}
        description="Join Vibora to connect and share."
      />

      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl"
      />

      <div className="absolute right-4 top-4 z-20">
        <ThemeCycleButton />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/90 sm:p-8">
          <Logo className="mb-4 justify-center" />

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
              {verify
                ? 'Verify your email'
                : isLogin
                  ? 'Welcome back'
                  : 'Create your account'}
            </h1>

            <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              {verify
                ? 'Enter the 6-digit code sent to your inbox.'
                : isLogin
                  ? 'Log in to continue your Vibora journey.'
                  : 'Join the community and connect with everyone.'}
            </p>
          </div>

          <form
            noValidate
            onSubmit={handleSubmit(submit)}
            className="flex flex-col gap-4"
          >
            {!isLogin && !verify && (
              <>
                <Field
                  id="name"
                  label="Full name"
                  icon={UserRound}
                  error={fieldError('name')}
                  success={fieldSuccess('name')}
                >
                  <Input
                    id="name"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    aria-invalid={Boolean(errors.name)}
                    {...register('name')}
                    className={getInputClass(errors.name)}
                  />
                </Field>

                <Field
                  id="username"
                  label="Username"
                  icon={AtSign}
                  error={fieldError('username')}
                  success={fieldSuccess('username')}
                >
                  <Input
                    id="username"
                    autoComplete="username"
                    placeholder="e.g. kyachingprue"
                    aria-invalid={Boolean(errors.username)}
                    {...register('username', {
                      onChange: event => {
                        event.target.value = event.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_]/g, '')
                          .slice(0, 20)
                      }
                    })}
                    className={getInputClass(errors.username)}
                  />
                </Field>

                <p className="-mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  Leave blank to generate a username from your name.
                </p>
              </>
            )}

            {!verify && (
              <Field
                id="email"
                label="Email address"
                icon={Mail}
                error={fieldError('email')}
                success={fieldSuccess('email')}
              >
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                  className={getInputClass(errors.email)}
                />
              </Field>
            )}

            {!verify && (
              <Field
                id="password"
                label="Password"
                icon={LockKeyhole}
                error={fieldError('password')}
                success={fieldSuccess('password')}
              >
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder={
                    isLogin ? 'Enter your password' : 'Create a strong password'
                  }
                  aria-invalid={Boolean(errors.password)}
                  {...register('password')}
                  className={`${getInputClass(errors.password)} pr-12`}
                />

                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(value => !value)}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-neutral-400 transition hover:text-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </Field>
            )}

            {!isLogin && !verify && password && (
              <div className="-mt-1 space-y-2 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/70">
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  Password requirements
                </p>

                {[
                  [password.length >= 8, 'At least 8 characters'],
                  [/[a-z]/.test(password), 'One lowercase letter'],
                  [/[A-Z]/.test(password), 'One uppercase letter'],
                  [/[0-9]/.test(password), 'One number']
                ].map(([valid, label]) => (
                  <p
                    key={label}
                    className={`flex items-center gap-2 text-xs ${
                      valid
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {label}
                  </p>
                ))}
              </div>
            )}

            {verify && (
              <Field
                id="code"
                label="Verification code"
                icon={ShieldCheck}
                error={fieldError('code')}
                success={fieldSuccess('code')}
              >
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  aria-invalid={Boolean(errors.code)}
                  {...register('code', {
                    onChange: event => {
                      event.target.value = event.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6)
                    }
                  })}
                  className={`${getInputClass(errors.code)} text-center font-mono text-lg tracking-[0.35em]`}
                />
              </Field>
            )}

            {notice && (
              <div
                role="status"
                aria-live="polite"
                className={`flex items-start gap-2 rounded-xl border p-3 text-sm leading-5 ${
                  mutate.isError
                    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                    : 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300'
                }`}
              >
                {mutate.isError ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <span>{notice}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={mutate.isPending}
              className="mt-1 h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 disabled:opacity-60"
            >
              {mutate.isPending ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {verify
                    ? 'Verify and continue'
                    : isLogin
                      ? 'Log in to Vibora'
                      : 'Create account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {verify && (
            <div className="mt-4 space-y-3 text-center">
              <button
                type="button"
                disabled={resending}
                onClick={handleResend}
                className="text-sm font-semibold text-violet-600 transition hover:text-fuchsia-600 hover:underline disabled:opacity-50 dark:text-violet-400"
              >
                {resending ? 'Sending code...' : 'Resend verification code'}
              </button>

              <p>
                <button
                  type="button"
                  onClick={backToForm}
                  className="text-sm text-neutral-500 hover:text-violet-600 hover:underline dark:text-neutral-400"
                >
                  Back to registration
                </button>
              </p>
            </div>
          )}

          {!verify && (
            <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
              {isLogin
                ? "Don't have an account? "
                : 'Already have an account? '}

              <Link
                to={isLogin ? '/register' : '/login'}
                className="font-bold text-violet-600 hover:underline dark:text-violet-400"
              >
                {isLogin ? 'Create account' : 'Log in'}
              </Link>
            </p>
          )}

          <div className="mt-6 border-t border-neutral-100 pt-4 text-center dark:border-neutral-800">
            <p className="text-xs text-neutral-400">
              Secure authentication · Welcome to Vibora
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
