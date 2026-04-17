import { Link } from 'react-router-dom'

function NotFound() {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                background: '#0a0a0a',
                color: '#f0ede8',
            }}
        >
            <div style={{ maxWidth: 420, textAlign: 'center' }}>
                <p style={{ letterSpacing: 2, fontSize: 12, color: '#8f8b86' }}>404</p>
                <h1 style={{ fontSize: 32, margin: '10px 0' }}>Page not found</h1>
                <p style={{ color: '#8f8b86', lineHeight: 1.6 }}>
                    This route does not exist yet. Head back to the homepage.
                </p>
                <Link
                    to="/"
                    style={{
                        marginTop: 20,
                        display: 'inline-flex',
                        padding: '10px 18px',
                        borderRadius: 10,
                        background: '#1dbf73',
                        color: '#fff',
                        fontWeight: 600,
                    }}
                >
                    Back to home
                </Link>
            </div>
        </div>
    )
}

export default NotFound
