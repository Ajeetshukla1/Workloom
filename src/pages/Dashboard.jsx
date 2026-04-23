import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
    API_BASE,
    getEarnings,
    getMe,
    getMessages,
    getProjects,
    getApplications,
    updateApplication,
} from '../lib/api.js'
import { logoutUser } from '../lib/api.js'

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
    const [projects, setProjects] = useState([])
    const [messages, setMessages] = useState([])
    const [applications, setApplications] = useState([])
    const [earnings, setEarnings] = useState({
        totalEarned: 0,
        monthEarned: 0,
        pending: 0,
        available: 0,
    })

    useEffect(() => {
        let isMounted = true

        const loadUser = async () => {
            try {
                const user = await getMe()
                if (isMounted) {
                    setCurrentUser(user)
                    const [projectsData, messagesData, earningsData, appsData] = await Promise.all([
                        getProjects(),
                        getMessages(),
                        getEarnings(),
                        getApplications().catch(() => []),
                    ])
                    setProjects(projectsData)
                    setMessages(messagesData)
                    setEarnings(earningsData)
                    setApplications(appsData)
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
            navigate('/auth', { replace: true })
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
    const profileChecks = [
        {
            label: 'Profile Photo',
            done: Boolean(currentUser.avatarUrl || currentUser.githubAvatarUrl),
        },
        { label: 'Bio & Headline', done: Boolean(currentUser.bio && currentUser.headline) },
        { label: 'Skills', done: Array.isArray(currentUser.skills) && currentUser.skills.length > 0 },
        { label: 'Portfolio', done: Boolean(currentUser.portfolioUrl) },
    ]
    const completedCount = profileChecks.filter((item) => item.done).length
    const completionPercent = Math.round((completedCount / profileChecks.length) * 100)
    const profileComplete = completedCount === profileChecks.length

    return (
        <div className="home-shell">
            <Navbar currentUser={currentUser} />

            {/* Main Content */}
            <div className="dashboard-body" style={{ marginTop: '0' }}>
                <main className="dashboard-main">
                    {/* Dashboard Sub-Navigation */}
                    <nav className="dashboard-topbar-nav" style={{ 
                        margin: '0 0 24px', 
                        padding: '12px 20px', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: '12px',
                        display: 'flex',
                        gap: '8px',
                        overflowX: 'auto'
                    }}>
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
                        <button
                            className={`nav-item ${activeNav === 'applications' ? 'active' : ''}`}
                            type="button"
                            onClick={() => setActiveNav('applications')}
                        >
                            Applications
                            {applications.filter(a => a.status === 'pending').length > 0 && (
                                <span style={{ marginLeft: '6px', background: 'var(--accent)', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>
                                    {applications.filter(a => a.status === 'pending').length}
                                </span>
                            )}
                        </button>
                    </nav>
                    {/* Overview Tab */}
                    {activeNav === 'overview' && (
                        <>
                            {/* Hero Section */}
                            <section className="dashboard-hero">
                                <div>
                                    <h1>Welcome back, {displayName.split(' ')[0]}</h1>
                                    <p>Track your projects, earnings, and growth on the Workloom platform.</p>
                                    <div className="dashboard-actions">
                                        <button
                                            className="primary-button"
                                            type="button"
                                            onClick={() =>
                                                navigate(isFreelancer ? '/home#gigs' : '/create-gig')
                                            }
                                        >
                                            {isFreelancer ? '+ Browse Gigs' : '+ Post Project'}
                                        </button>
                                        <button
                                            className="ghost-button"
                                            type="button"
                                            onClick={() =>
                                                navigate(isFreelancer ? '/create-gig' : '/home#gigs')
                                            }
                                        >
                                            {isFreelancer ? 'Create Gig' : 'View Applications'}
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Stats Cards */}
                            <section className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-label">Active Projects</div>
                                    <div className="stat-value">{projects.length}</div>
                                    <div className="stat-meta">
                                        {projects.length ? 'In progress' : 'No active work'}
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Total Earnings</div>
                                    <div className="stat-value">${earnings.totalEarned || 0}</div>
                                    <div className="stat-meta">All time</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Profile Rating</div>
                                    <div className="stat-value">
                                        {currentUser.rating ? currentUser.rating.toFixed(1) : '—'}
                                    </div>
                                    <div className="stat-meta">
                                        {currentUser.rating ? 'Last 90 days' : 'No ratings yet'}
                                    </div>
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
                                    {projects.length === 0 ? (
                                        <div className="empty-state">
                                            <div className="item-title">No active projects</div>
                                            <p className="item-meta">
                                                {isFreelancer
                                                    ? 'Start by browsing available gigs and applying to projects.'
                                                    : 'Post your first project to start hiring talent.'}
                                            </p>
                                            <div className="empty-actions">
                                                <button
                                                    className="primary-button"
                                                    type="button"
                                                    onClick={() => navigate('/home#gigs')}
                                                >
                                                    {isFreelancer ? 'Browse Gigs' : 'Post Project'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="item-list">
                                            {projects.map((project) => (
                                                <div key={project._id} className="item-row">
                                                    <div>
                                                        <div className="item-title">{project.title}</div>
                                                        <div className="item-meta">
                                                            {project.status || 'Active'}
                                                            {project.dueDate ? ` · Due ${project.dueDate}` : ''}
                                                        </div>
                                                    </div>
                                                    <div className="item-progress">
                                                        <div className="progress-track">
                                                            <div
                                                                className="progress-fill"
                                                                style={{ width: `${project.progress || 0}%` }}
                                                            ></div>
                                                        </div>
                                                        <span>{project.progress || 0}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Recent Activity */}
                                <div className="dashboard-section">
                                    <div className="section-title-row">
                                        <h3>Recent Activity</h3>
                                        <button className="ghost-button" type="button">
                                            View Log
                                        </button>
                                    </div>
                                    {messages.length === 0 ? (
                                        <div className="empty-state">
                                            <div className="item-title">No activity yet</div>
                                            <p className="item-meta">
                                                Your activity history will appear here once projects start.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="activity-list">
                                            {messages.map((thread) => (
                                                <div key={thread._id} className="activity-item">
                                                    <div>
                                                        <div className="item-title">{thread.subject}</div>
                                                        <div className="item-meta">
                                                            {thread.lastMessage || 'New update'}
                                                        </div>
                                                    </div>
                                                    <span className="item-meta">
                                                        {thread.unreadCount || 0} new
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Profile Completion & Quick Links */}
                            {!profileComplete ? (
                                <section className="dashboard-grid-2">
                                    <div className="dashboard-section">
                                        <div className="section-title-row">
                                            <h3>Profile Completion</h3>
                                            <span className="item-meta">
                                                {completionPercent}% complete
                                            </span>
                                        </div>
                                        <div className="profile-progress">
                                            {profileChecks.map((item) => (
                                                <div key={item.label} className="progress-item">
                                                    <span>{item.label}</span>
                                                    <span className="status-badge">
                                                        {item.done ? '✓ Added' : '○ Not Added'}
                                                    </span>
                                                </div>
                                            ))}
                                            <button
                                                className="primary-button"
                                                style={{ marginTop: '16px', width: '100%' }}
                                                type="button"
                                                onClick={() => navigate('/profile')}
                                            >
                                                Go to Profile
                                            </button>
                                        </div>
                                    </div>

                                    <div className="dashboard-section">
                                        <div className="section-title-row">
                                            <h3>Quick Links</h3>
                                        </div>
                                        <div className="quick-links">
                                            <button
                                                className="quick-link-item"
                                                type="button"
                                                onClick={() => setActiveNav('messages')}
                                            >
                                                <div>Messages</div>
                                                <span className="badge">{messages.length}</span>
                                            </button>
                                            <button className="quick-link-item" type="button">
                                                <div>Applications</div>
                                                <span className="badge">0</span>
                                            </button>
                                            <button className="quick-link-item" type="button">
                                                <div>Reviews</div>
                                                <span className="badge">0</span>
                                            </button>
                                            <button className="quick-link-item" type="button">
                                                <div>Support</div>
                                                <span className="badge">0</span>
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            ) : null}
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
                            {messages.length === 0 ? (
                                <div className="empty-state">
                                    <div className="item-title">No messages yet</div>
                                    <p className="item-meta">
                                        Your conversations will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="activity-list">
                                    {messages.map((thread) => (
                                        <div key={thread._id} className="activity-item">
                                            <div>
                                                <div className="item-title">{thread.subject}</div>
                                                <div className="item-meta">
                                                    {thread.lastMessage || 'New update'}
                                                </div>
                                            </div>
                                            <span className="item-meta">
                                                {thread.unreadCount || 0} new
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Earnings Tab */}
                    {activeNav === 'earnings' && (
                        <div className="dashboard-section">
                            <h2>Earnings</h2>
                            <div className="earnings-summary">
                                <div className="earning-stat">
                                    <div className="earning-label">Total Earned</div>
                                    <div className="earning-value">${earnings.totalEarned || 0}</div>
                                </div>
                                <div className="earning-stat">
                                    <div className="earning-label">This Month</div>
                                    <div className="earning-value">${earnings.monthEarned || 0}</div>
                                </div>
                                <div className="earning-stat">
                                    <div className="earning-label">Pending</div>
                                    <div className="earning-value">${earnings.pending || 0}</div>
                                </div>
                                <div className="earning-stat">
                                    <div className="earning-label">Available</div>
                                    <div className="earning-value">${earnings.available || 0}</div>
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
                    {/* Applications Tab */}
                    {activeNav === 'applications' && (
                        <div className="dashboard-section" style={{ minHeight: '50vh' }}>
                            <h2 style={{ margin: '0 0 20px', fontSize: '1.4rem' }}>Gig Applications</h2>
                            {applications.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>No one has applied to your gigs yet.</p>
                            ) : (
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {applications.map(app => (
                                        <div key={app._id} style={{ background: 'var(--panel-soft)', border: '1px solid var(--stroke)', padding: '20px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem' }}>{app.gigId?.title}</h3>
                                                <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    <strong>Budget:</strong> ${app.gigId?.price} &nbsp;|&nbsp; <strong>Delivery:</strong> {app.gigId?.deliveryTime}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--panel)', border: '1px solid var(--stroke)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                        {(app.applicantId?.name || 'A')[0].toUpperCase()}
                                                    </div>
                                                    <span style={{ fontSize: '0.95rem' }}>Applicant: <strong>{app.applicantId?.name}</strong></span>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '0.85rem', color: app.status === 'pending' ? '#ff9800' : app.status === 'approved' ? '#1dbf73' : '#f44336', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginRight: '10px' }}>
                                                    {app.status}
                                                </span>
                                                {app.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--stroke)', color: 'var(--text)', borderRadius: '8px', cursor: 'pointer', transition: 'border 0.2s' }}
                                                            onMouseOver={(e) => e.target.style.borderColor = '#f44336'}
                                                            onMouseOut={(e) => e.target.style.borderColor = 'var(--stroke)'}
                                                            onClick={async () => {
                                                                try {
                                                                    await updateApplication(app._id, 'rejected');
                                                                    setApplications(prev => prev.map(a => a._id === app._id ? { ...a, status: 'rejected' } : a));
                                                                } catch (err) { alert('Failed to reject'); }
                                                            }}
                                                        >
                                                            Reject
                                                        </button>
                                                        <button 
                                                            style={{ padding: '8px 16px', background: 'var(--accent)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}
                                                            onMouseOver={(e) => e.target.style.background = 'var(--accent-dark)'}
                                                            onMouseOut={(e) => e.target.style.background = 'var(--accent)'}
                                                            onClick={async () => {
                                                                try {
                                                                    await updateApplication(app._id, 'approved');
                                                                    setApplications(prev => prev.map(a => a._id === app._id ? { ...a, status: 'approved' } : a));
                                                                    alert('Application approved! A project has been created.');
                                                                } catch (err) { alert('Failed to approve'); }
                                                            }}
                                                        >
                                                            Approve
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default Dashboard
