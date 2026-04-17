const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const request = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
        const message = payload?.message || 'Request failed.'
        throw new Error(message)
    }

    return payload
}

export const registerUser = (data) =>
    request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    })

export const loginUser = (data) =>
    request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    })

export const logoutUser = () =>
    request('/auth/logout', {
        method: 'POST',
    })

export const requestPasswordReset = (data) =>
    request('/auth/request-password-reset', {
        method: 'POST',
        body: JSON.stringify(data),
    })

export const resetPassword = (data) =>
    request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
    })

export const getMe = () => request('/auth/me')

export const updateMe = (data) =>
    request('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
    })
