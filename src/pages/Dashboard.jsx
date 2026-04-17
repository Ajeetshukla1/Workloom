import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, logoutUser } from '../lib/api.js'

const roleLabels = {
    seller: 'Freelancer',
    buyer: 'Client',
    admin: 'Admin',
}

const getInitials = (name) => {
    if (!name) return '??'
    const parts = name.trim().split(' ').filter(Boolean)
    const first = parts[0]?.[0] || ''
    const last = parts[parts.length - 1]?.[0] || ''
    return `${first}${last}`.toUpperCase() || '??'
}

function Dashboard() {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeNav, setActiveNav] = useState('overview')

    useEffect(() => {
        let isMounted = true

        const loadUser = async () => {
            try {
                const user = await getMe()
                if (isMounted) {
                    setCurrentUser(user)
                }
            } catch (error) {
                if (isMounted) {
                    navigate('/auth', { replace: true })
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        loadUser()
        return () => {
            isMounted = false
        }
    }, [navigate])

    const onLogout = async () => {
        try {
            await logoutUser()
            setCurrentUser(null)
            navigate('/', { replace: true })
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="dashboard-shell">
                <div className="dashboard-empty">
                    <h1>Loading dashboard...</h1>
                </div>
            </div>
        )
    }

    if (!currentUser) {
        return (
            <div className="dashboard-shell">
                <div className="dashboard-empty">
                    <h1>Access Denied</h1>
                    <p>Please sign in to continue.</p>
                </div>
            </div>
        )
    }

    const displayName = currentUser.name || 'User'
    const displayRole = roleLabels[currentUser.role] || 'Member'
    const avatarLabel = getInitials(displayName)
    const isFreelancer = currentUser.role === 'seller'

    return (
        <div className="dashboard-shell">
            {/* Top Navigation Bar */}
            <header className="dashboard-topbar">
                <div className="dashboard-topbar-inner">
                    <div className="dashboard-brand">Workloom</div>
                    
                    <nav className="dashboard-topbar-nav">
                        <button 
                            className={`nav-item ${activeNav === 'overview' ? 'active' : ''}`}
                            type="button"
                            onClick={() => setActiveNav('overview')}
                        >
                            Overview
                        </button>
                        <button 
                            className={`nav-item ${activeNav === 'projects' ? 'active' : ''}`}
                            type="button"
                            onClick={() => setActiveNav('projects')}
                        >
                            Projects
                        </button>
                        <button 
                            className={`nav-item ${activeNav === 'messages' ? 'active' : ''}`}
                            type="button"
                            onClick={() => setActiveNav('messages')}
                        >
                            Messages
                        </button>
                        <button 
                            className={`nav-item ${activeNav === 'earnings' ? 'active' : ''}`}
                            type="button"
                            onClick={() => setActiveNav('earnings')}
                        >
                            Earnings
                        </button>
                        <button 
                            className={`nav-item ${activeNav === 'contracts' ? 'active' : ''}`}
                            type="button"
                            onClick={() => setActiveNav('contracts')}
                        >
                            Contracts
                        </button>
                    </nav>

                    <div className="dashboard-user">
                        {currentUser.avatarUrl ? (
                            <img
                                className="dashboard-avatar-image"
                                src={currentUser.avatarUrl}
                                alt={displayName}
                            />
                        ) : (
                            <div className="dashboard-avatar">{avatarLabel}</div>
                        )}
                        <div>
                            <div className="dashboard-name">{displayName}</div>
                            <div className="dashboard-role">{displayRole}</div>
                        </div>
                        <button 
                            className="dashboard-link" 
                            type="button" 
                            onClick={onLogout}
                            style={{background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', padding: '0', textDecoration: 'underline'}}
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="dashboard-body">
                <main className="dashboard-main">
                    {/* Overview Tab */}
                    {activeNav === 'overview' && (
                        <>
                            {/* Hero Section */}
                            <section className="dashboard-hero">
                                <div>
                                    <h1>Welcome back, {displayName.split(' ')[0]}</h1>
                                    <p>Track your projects, earnings, and growth on the Workloom platform.</p>
                                    <div className="dashboard-actions">
                                        <button className="primary-button" type="button">
                                            {isFreelancer ? '+ Browse Gigs' : '+ Post Project'}
                                        </button>
                                        <button className="ghost-button" type="button">
                                            {isFreelancer ? 'View My Gigs' : 'View Applications'}
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Stats Cards */}
                            <section className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-label">Active Projects</div>
                                    <div className="stat-value">0</div>
                                    <div className="stat-meta">No active work</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Total Earnings</div>
                                    <div className="stat-value">$0</div>
                                    <div className="stat-meta">This month</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Profile Rating</div>
                                    <div className="stat-value">—</div>
                                    <div className="stat-meta">No ratings yet</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Response Time</div>
                                    <div className="stat-value">—</div>
                                    <div className="stat-meta">Not available</div>
                                </div>
                            </section>

                            {/* Main Content Grid */}
                            <section className="dashboard-grid-2">
                                {/* Active Projects */}
                                <div className="dashboard-section">
                                    <div className="section-title-row">
                                        <h3>Active Projects</h3>
                                        <button className="ghost-button" type="button">
                                            View All
                                        </button>
                                    </div>
                                    <div className="empty-state">
                                        <div className="item-title">No active projects</div>
                                        <p className="item-meta">
                                            {isFreelancer
                                                ? 'Start by browsing available gigs and applying to projects.'
                                                : 'Post your first project to start hiring talent.'}
                                        </p>
                                        <div className="empty-actions">
                                            <button className="primary-button" type="button">
                                                {isFreelancer ? 'Browse Gigs' : 'Post Project'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="dashboard-section">
                                    <div className="section-title-row">
                                        <h3>Recent Activity</h3>
                                        <button className="ghost-button" type="button">
                                            View Log
                                        </button>
                                    </div>
                                    <div className="empty-state">
                                        <div className="item-title">No activity yet</div>
                                        <p className="item-meta">
                                            Your activity history will appear here once projects start.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Profile Completion & Quick Links */}
                            <section className="dashboard-grid-2">
                                <div className="dashboard-section">
                                    <div className="section-title-row">
                                        <h3>Profile Completion</h3>
                                    </div>
                                    <div className="profile-progress">
                                        <div className="progress-item">
                                            <span>Profile Photo</span>
                                            <span className="status-badge">{currentUser.avatarUrl ? '✓ Added' : '○ Not Added'}</span>
                                        </div>
                                        <div className="progress-item">
                                            <span>Bio & Headline</span>
                                            <span className="status-badge">{currentUser.bio ? '✓ Added' : '○ Not Added'}</span>
                                        </div>
                                        <div className="progress-item">
                                            <span>Skills</span>
                                            <span className="status-badge">{currentUser.skills?.length > 0 ? '✓ Added' : '○ Not Added'}</span>
                                        </div>
                                        <div className="progress-item">
                                            <span>Portfolio</span>
                                            <span className="status-badge">{currentUser.portfolioUrl ? '✓ Added' : '○ Not Added'}</span>
                                        </div>
                                        <button className="primary-button" style={{ marginTop: '16px', width: '100%' }} type="button">
                                            Go to Profile
                                        </button>
                                    </div>
                                </div>

                                <div className="dashboard-section">
                                    <div className="section-title-row">
                                        <h3>Quick Links</h3>
                                    </div>
                                    <div className="quick-links">
                                        <a className="quick-link-item" href="#messages">
                                            <div>Messages</div>
                                            <span className="badge">0</span>
                                        </a>
                                        <a className="quick-link-item" href="#applications">
                                            <div>Applications</div>
                                            <span className="badge">0</span>
                                        </a>
                                        <a className="quick-link-item" href="#reviews">
                                            <div>Reviews</div>
                                            <span className="badge">0</span>
                                        </a>
                                        <a className="quick-link-item" href="#disputes">
                                            <div>Support</div>
                                            <span className="badge">0</span>
                                        </a>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {/* Projects Tab */}
                    {activeNav === 'projects' && (
                        <div className="dashboard-section">
                            <h2>Projects</h2>
                            <div className="empty-state">
                                <div className="item-title">No projects yet</div>
                                <p className="item-meta">
                                    {isFreelancer 
                                        ? 'Browse and apply to gigs to get started.'
                                        : 'Post a project to begin working with freelancers.'}
                                </p>
                                <button className="primary-button" type="button">
                                    {isFreelancer ? 'Browse Gigs' : 'Post Project'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Messages Tab */}
                    {activeNav === 'messages' && (
                        <div className="dashboard-section">
                            <h2>Messages</h2>
                            <div className="empty-state">
                                <div className="item-title">No messages yet</div>
                                <p className="item-meta">
                                    Your conversations will appear here.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Earnings Tab */}
                    {activeNav === 'earnings' && (
                        <div className="dashboard-section">
                            <h2>Earnings</h2>
                            <div className="earnings-summary">
                                <div className="earning-stat">
                                    <div className="earning-label">Total Earned</div>
                                    <div className="earning-value">$0</div>
                                </div>
                                <div className="earning-stat">
                                    <div className="earning-label">This Month</div>
                                    <div className="earning-value">$0</div>
                                </div>
                                <div className="earning-stat">
                                    <div className="earning-label">Pending</div>
                                    <div className="earning-value">$0</div>
                                </div>
                                <div className="earning-stat">
                                    <div className="earning-label">Available</div>
                                    <div className="earning-value">$0</div>
                                </div>
                            </div>
                            <div className="empty-state" style={{ marginTop: '32px' }}>
                                <div className="item-title">No earnings yet</div>
                                <p className="item-meta">
                                    Earnings from completed projects will appear here.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Contracts Tab */}
                    {activeNav === 'contracts' && (
                        <div className="dashboard-section">
                            <h2>Contracts</h2>
                            <div className="empty-state">
                                <div className="item-title">No contracts yet</div>
                                <p className="item-meta">
                                    Your contracts will be listed here.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default Dashboard
