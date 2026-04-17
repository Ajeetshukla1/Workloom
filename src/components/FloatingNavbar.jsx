import { useState } from 'react'
import './FloatingNavbar.css'

function FloatingNavbar({ placeholder = 'write a prompt...', onSend }) {
    const [value, setValue] = useState('')

    const handleSubmit = (event) => {
        event.preventDefault()
        const trimmed = value.trim()
        if (!trimmed) {
            return
        }
        if (onSend) {
            onSend(trimmed)
        }
        setValue('')
    }

    return (
        <div className="floating-navbar-shell">
            <form className="floating-navbar" onSubmit={handleSubmit}>
                <input
                    className="floating-navbar-input"
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    aria-label="Prompt"
                />
                <button
                    className="floating-navbar-send"
                    type="submit"
                    aria-label="Send prompt"
                >
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path d="M5 12L19 5l-4 7 4 7-14-7zm4.4 0L18 7.4 14.9 12 18 16.6 9.4 12z" />
                    </svg>
                </button>
            </form>
        </div>
    )
}

export default FloatingNavbar
