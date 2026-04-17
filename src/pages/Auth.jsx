import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import {
    getMe,
    loginUser,
    logoutUser,
    registerUser,
    requestPasswordReset,
} from '../lib/api.js'

const loginSchema = z.object({
    email: z.string().email('Enter a valid email.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
})

const signupSchema = z
    .object({
        name: z.string().min(2, 'Enter your full name.'),
        email: z.string().email('Enter a valid email.'),
        password: z.string().min(8, 'Password must be at least 8 characters.'),
        confirmPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters.'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
    })

const resetSchema = z.object({
    email: z.string().email('Enter a valid email.'),
})

const roleOptions = [
    {
        id: 'freelancer',
        label: 'Freelancer',
        description: 'Offer services and get hired for projects.',
        role: 'seller',
    },
    {
        id: 'client',
        label: 'Client',
        description: 'Hire vetted experts and manage deliverables.',
        role: 'buyer',
    },
]

const emptyStatus = {
    type: 'info',
    message: '',
}

function Auth() {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState(null)
    const [view, setView] = useState('login')
    const [signupDraft, setSignupDraft] = useState(null)
    const [roleChoice, setRoleChoice] = useState('freelancer')
    const [status, setStatus] = useState({
        login: emptyStatus,
        signup: emptyStatus,
        reset: emptyStatus,
        me: emptyStatus,
    })

    const loginForm = useForm({ resolver: zodResolver(loginSchema) })
    const signupForm = useForm({ resolver: zodResolver(signupSchema) })
    const resetForm = useForm({ resolver: zodResolver(resetSchema) })

    const setFormStatus = (key, next) =>
        setStatus((prev) => ({ ...prev, [key]: next }))

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const user = await getMe()
                setCurrentUser(user)
                setFormStatus('me', { type: 'success', message: 'Session active.' })
                navigate('/home', { replace: true })
            } catch (error) {
                setFormStatus('me', {
                    type: 'info',
                    message: 'Sign in to access your workspace.',
                })
            }
        }

        fetchMe()
    }, [navigate])

    const onLogin = async (values) => {
        try {
            const user = await loginUser(values)
            setCurrentUser(user)
            setFormStatus('login', {
                type: 'success',
                message: 'Welcome back. Session started.',
            })
            loginForm.reset()
            navigate('/home', { replace: true })
        } catch (error) {
            setFormStatus('login', { type: 'error', message: error.message })
        }
    }

    const onStartSignup = (values) => {
        setSignupDraft(values)
        setView('role')
    }

    const onCompleteSignup = async () => {
        if (!signupDraft) {
            setView('signup')
            return
        }

        try {
            const selection =
                roleOptions.find((option) => option.id === roleChoice) || roleOptions[0]
            const { confirmPassword, ...payload } = signupDraft

            await registerUser({
                ...payload,
                role: selection.role,
            })

            setFormStatus('signup', {
                type: 'success',
                message: 'Account created. You can sign in now.',
            })
            signupForm.reset()
            setSignupDraft(null)
            setView('login')
        } catch (error) {
            setFormStatus('signup', { type: 'error', message: error.message })
        }
    }

    const onReset = async (values) => {
        try {
            await requestPasswordReset(values)
            setFormStatus('reset', {
                type: 'success',
                message: 'Reset email sent. Check your inbox for the token.',
            })
            resetForm.reset()
        } catch (error) {
            setFormStatus('reset', { type: 'error', message: error.message })
        }
    }

    const onLogout = async () => {
        await logoutUser()
        setCurrentUser(null)
        setFormStatus('login', {
            type: 'info',
            message: 'Signed out successfully.',
        })
    }

    const title =
        view === 'signup'
            ? 'Create account'
            : view === 'reset'
                ? 'Forgot password'
                : view === 'role'
                    ? 'Choose your role'
                    : 'Sign in'

    const subtitle =
        view === 'signup'
            ? 'Create your account to manage briefs and escrow milestones.'
            : view === 'reset'
                ? 'We will email you a reset token to update your password.'
                : view === 'role'
                    ? 'Tell us how you plan to use the platform.'
                    : 'Use your email and password to access your workspace.'

    return (
        <div className="auth-shell">
            <div className="auth-layout">
                <div className="auth-image" aria-hidden="true">
                    <div className="auth-image-overlay"></div>
                    <div className="auth-image-content">
                        <span className="auth-image-tag">Studio Access</span>
                        <h1>Deliver your next launch with verified talent.</h1>
                        <p>
                            Secure authentication, escrow milestones, and delivery tracking in
                            one place.
                        </p>
                    </div>
                </div>

                <div className="auth-panel">
                    <Link className="auth-brand" to="/">
                        Workloom
                    </Link>
                    <h2>{title}</h2>
                    <p className="auth-subtitle">{subtitle}</p>

                    {status.me.message ? (
                        <div className={`status-pill ${status.me.type}`}>
                            {status.me.message}
                        </div>
                    ) : null}

                    {currentUser ? (
                        <div className="auth-row">
                            <button className="ghost-button" type="button" onClick={onLogout}>
                                Sign out {currentUser.name}
                            </button>
                        </div>
                    ) : null}

                    {view !== 'reset' && view !== 'role' ? (
                        <div className="auth-tabs">
                            <button
                                className={`auth-tab ${view === 'login' ? 'active' : ''}`}
                                type="button"
                                onClick={() => setView('login')}
                            >
                                Sign in
                            </button>
                            <button
                                className={`auth-tab ${view === 'signup' ? 'active' : ''}`}
                                type="button"
                                onClick={() => setView('signup')}
                            >
                                Create account
                            </button>
                        </div>
                    ) : null}

                    {view === 'login' ? (
                        <form className="auth-form" onSubmit={loginForm.handleSubmit(onLogin)}>
                            <label htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                placeholder="you@workloom.com"
                                autoComplete="email"
                                {...loginForm.register('email')}
                            />
                            {loginForm.formState.errors.email ? (
                                <div className="error">{loginForm.formState.errors.email.message}</div>
                            ) : null}

                            <label htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                placeholder="Password"
                                autoComplete="current-password"
                                {...loginForm.register('password')}
                            />
                            {loginForm.formState.errors.password ? (
                                <div className="error">{loginForm.formState.errors.password.message}</div>
                            ) : null}

                            <div className="auth-row">
                                <span></span>
                                <button
                                    className="auth-link"
                                    type="button"
                                    onClick={() => setView('reset')}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button className="primary-button" type="submit">
                                Sign in
                            </button>

                            {status.login.message ? (
                                <div className={`status ${status.login.type}`}>
                                    {status.login.message}
                                </div>
                            ) : null}
                        </form>
                    ) : null}

                    {view === 'signup' ? (
                        <form className="auth-form" onSubmit={signupForm.handleSubmit(onStartSignup)}>
                            <label htmlFor="signup-name">Full name</label>
                            <input
                                id="signup-name"
                                type="text"
                                placeholder="Full name"
                                autoComplete="name"
                                {...signupForm.register('name')}
                            />
                            {signupForm.formState.errors.name ? (
                                <div className="error">{signupForm.formState.errors.name.message}</div>
                            ) : null}

                            <label htmlFor="signup-email">Email</label>
                            <input
                                id="signup-email"
                                type="email"
                                placeholder="you@workloom.com"
                                autoComplete="email"
                                {...signupForm.register('email')}
                            />
                            {signupForm.formState.errors.email ? (
                                <div className="error">{signupForm.formState.errors.email.message}</div>
                            ) : null}

                            <label htmlFor="signup-password">Password</label>
                            <input
                                id="signup-password"
                                type="password"
                                placeholder="Create password"
                                autoComplete="new-password"
                                {...signupForm.register('password')}
                            />
                            {signupForm.formState.errors.password ? (
                                <div className="error">{signupForm.formState.errors.password.message}</div>
                            ) : null}

                            <label htmlFor="signup-confirm">Confirm password</label>
                            <input
                                id="signup-confirm"
                                type="password"
                                placeholder="Repeat password"
                                autoComplete="new-password"
                                {...signupForm.register('confirmPassword')}
                            />
                            {signupForm.formState.errors.confirmPassword ? (
                                <div className="error">
                                    {signupForm.formState.errors.confirmPassword.message}
                                </div>
                            ) : null}

                            <button className="primary-button" type="submit">
                                Continue
                            </button>
                        </form>
                    ) : null}

                    {view === 'role' ? (
                        <div className="auth-form">
                            {signupDraft ? (
                                <div className="auth-note">Account: {signupDraft.email}</div>
                            ) : null}
                            <div className="role-grid">
                                {roleOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        className={`role-card ${roleChoice === option.id ? 'active' : ''}`}
                                        type="button"
                                        onClick={() => setRoleChoice(option.id)}
                                    >
                                        <span className="role-title">{option.label}</span>
                                        <span className="role-desc">{option.description}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="role-actions">
                                <button className="ghost-button" type="button" onClick={() => setView('signup')}>
                                    Back
                                </button>
                                <button className="primary-button" type="button" onClick={onCompleteSignup}>
                                    Create account
                                </button>
                            </div>
                            {status.signup.message ? (
                                <div className={`status ${status.signup.type}`}>
                                    {status.signup.message}
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {view === 'reset' ? (
                        <form className="auth-form" onSubmit={resetForm.handleSubmit(onReset)}>
                            <label htmlFor="reset-email">Email</label>
                            <input
                                id="reset-email"
                                type="email"
                                placeholder="you@workloom.com"
                                autoComplete="email"
                                {...resetForm.register('email')}
                            />
                            {resetForm.formState.errors.email ? (
                                <div className="error">{resetForm.formState.errors.email.message}</div>
                            ) : null}

                            <button className="primary-button" type="submit">
                                Send reset email
                            </button>

                            {status.reset.message ? (
                                <div className={`status ${status.reset.type}`}>
                                    {status.reset.message}
                                </div>
                            ) : null}
                        </form>
                    ) : null}

                    <div className="auth-switch">
                        {view === 'login' ? (
                            <>
                                <span>Need an account?</span>
                                <button className="auth-link" type="button" onClick={() => setView('signup')}>
                                    Create account
                                </button>
                            </>
                        ) : null}
                        {view === 'signup' ? (
                            <>
                                <span>Already have an account?</span>
                                <button className="auth-link" type="button" onClick={() => setView('login')}>
                                    Sign in
                                </button>
                            </>
                        ) : null}
                        {view === 'reset' ? (
                            <>
                                <span>Remembered your password?</span>
                                <button className="auth-link" type="button" onClick={() => setView('login')}>
                                    Back to sign in
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth
