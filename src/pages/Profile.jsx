import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, logoutUser, updateMe } from '../lib/api.js'

function Profile() {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        headline: '',
        bio: '',
        location: '',
        phone: '',
        hourlyRate: '',
        portfolioUrl: '',
        skills: '',
    })

    useEffect(() => {
        let isMounted = true

        const loadUser = async () => {
            try {
                const user = await getMe()
                if (isMounted) {
                    setCurrentUser(user)
                    setFormData({
                        name: user.name || '',
                        headline: user.headline || '',
                        bio: user.bio || '',
                        location: user.location || '',
                        phone: user.phone || '',
                        hourlyRate: user.hourlyRate || '',
                        portfolioUrl: user.portfolioUrl || '',
                        skills: (user.skills || []).join(', '),
                    })
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

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSaveProfile = async () => {
        setIsSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const updates = {
                name: formData.name,
                headline: formData.headline,
                bio: formData.bio,
                location: formData.location,
                phone: formData.phone,
                hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : '',
                portfolioUrl: formData.portfolioUrl,
                skills: formData.skills
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0),
            }

            const updatedUser = await updateMe(updates)
            setCurrentUser(updatedUser)
            setSuccess('Profile updated successfully!')
            setIsEditing(false)

            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError(err.message || 'Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handleLinkGithub = () => {
        const clientId = 'YOUR_GITHUB_CLIENT_ID'
        const redirectUri = `${window.location.origin}/auth/github/callback`
        const state = Math.random().toString(36).substring(7)
        localStorage.setItem('github_auth_state', state)

        const scope = 'user:email'
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`
        window.location.href = authUrl
    }

    if (isLoading) {
        return (
            <div className="profile-shell">
                <div className="profile-empty">
                    <h1>Loading profile...</h1>
                </div>
            </div>
        )
    }

    if (!currentUser) {
        navigate('/auth', { replace: true })
        return null
    }

    const roleLabels = {
        seller: 'Freelancer',
        buyer: 'Client',
        admin: 'Admin',
    }

    const displayName = currentUser.name || 'User'
    const displayRole = roleLabels[currentUser.role] || 'Member'
    const avatarInitials = displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const avatarUrl = currentUser.githubAvatarUrl || currentUser.avatarUrl

    return (
        <div className="profile-shell">
            {/* Navigation Bar */}
            <nav className="profile-navbar">
                <div className="navbar-inner">
                    <div className="navbar-brand">Workloom</div>

                    <ul className="navbar-menu">
                        <li>
                            <a href="/home">Home</a>
                        </li>
                        <li>
                            <a href="/dashboard">Dashboard</a>
                        </li>
                        <li>
                            <a href="/profile" className="active">
                                Profile
                            </a>
                        </li>
                    </ul>

                    <div className="navbar-actions">
                        <div className="navbar-user">
                            <div className="user-avatar">{avatarInitials}</div>
                            <div className="user-menu">
                                <span className="user-name">{displayName}</span>
                                <button className="logout-btn" type="button" onClick={onLogout}>
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Profile Content */}
            <div className="profile-container">
                {/* Success/Error Messages */}
                {success && <div className="profile-success">{success}</div>}
                {error && <div className="profile-error">{error}</div>}

                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-banner"></div>
                    <div className="profile-info">
                        <div className="profile-avatar-large">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={displayName} />
                            ) : (
                                <div className="avatar-initials">{avatarInitials}</div>
                            )}
                        </div>
                        <div className="profile-details">
                            <h1>{displayName}</h1>
                            <p className="profile-role">{displayRole}</p>
                            <p className="profile-email">{currentUser.email}</p>
                            {currentUser.githubUsername && (
                                <p className="profile-github">
                                    <a href={currentUser.githubProfileUrl} target="_blank" rel="noreferrer">
                                        @{currentUser.githubUsername}
                                    </a>
                                </p>
                            )}
                        </div>
                        <button
                            className="edit-profile-btn"
                            type="button"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                <div className="profile-content">
                    {/* About Section */}
                    <section className="profile-section">
                        <h2>About</h2>
                        {isEditing ? (
                            <div className="profile-form">
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Headline</label>
                                    <input
                                        type="text"
                                        name="headline"
                                        placeholder="e.g., Full Stack Developer"
                                        value={formData.headline}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Bio</label>
                                    <textarea
                                        name="bio"
                                        placeholder="Tell clients about yourself"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        rows="4"
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="e.g., New York, USA"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="profile-form">
                                <div className="form-group">
                                    <label>Headline</label>
                                    <p className="form-value">{currentUser.headline || 'Not provided'}</p>
                                </div>

                                <div className="form-group">
                                    <label>Bio</label>
                                    <p className="form-value">{currentUser.bio || 'Not provided'}</p>
                                </div>

                                <div className="form-group">
                                    <label>Location</label>
                                    <p className="form-value">{currentUser.location || 'Not provided'}</p>
                                </div>

                                <div className="form-group">
                                    <label>Phone</label>
                                    <p className="form-value">{currentUser.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Skills Section */}
                    <section className="profile-section">
                        <h2>Skills</h2>
                        {isEditing ? (
                            <div className="form-group">
                                <label>Skills (comma-separated)</label>
                                <input
                                    type="text"
                                    name="skills"
                                    placeholder="e.g., React, Node.js, Python"
                                    value={formData.skills}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                        ) : (
                            <div className="skills-container">
                                {currentUser.skills && currentUser.skills.length > 0 ? (
                                    <div className="skills-list">
                                        {currentUser.skills.map((skill, index) => (
                                            <span key={index} className="skill-badge">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="empty-text">No skills added yet</p>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Rates Section */}
                    <section className="profile-section">
                        <h2>Rates</h2>
                        {isEditing ? (
                            <div className="form-group">
                                <label>Hourly Rate ($)</label>
                                <input
                                    type="number"
                                    name="hourlyRate"
                                    min="0"
                                    step="0.01"
                                    placeholder="e.g., 50"
                                    value={formData.hourlyRate}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                        ) : (
                            <div className="rates-container">
                                <div className="rate-item">
                                    <label>Hourly Rate</label>
                                    <p className="rate-value">
                                        {currentUser.hourlyRate
                                            ? `$${currentUser.hourlyRate}/hr`
                                            : 'Not provided'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Links Section */}
                    <section className="profile-section">
                        <h2>Links</h2>
                        {isEditing ? (
                            <div className="form-group">
                                <label>Portfolio URL</label>
                                <input
                                    type="url"
                                    name="portfolioUrl"
                                    placeholder="https://yourportfolio.com"
                                    value={formData.portfolioUrl}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                        ) : (
                            <div className="links-container">
                                {currentUser.portfolioUrl ? (
                                    <a
                                        href={currentUser.portfolioUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="profile-link"
                                    >
                                        Portfolio
                                    </a>
                                ) : (
                                    <p className="empty-text">Portfolio link not provided</p>
                                )}

                                {currentUser.githubProfileUrl ? (
                                    <a
                                        href={currentUser.githubProfileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="profile-link github-link"
                                    >
                                        GitHub Profile
                                    </a>
                                ) : null}
                            </div>
                        )}
                    </section>

                    {/* GitHub Section */}
                    <section className="profile-section">
                        <h2>GitHub Integration</h2>
                        <div className="github-section">
                            {currentUser.githubConnected ? (
                                <div className="github-connected">
                                    <div className="github-status">
                                        <span className="github-icon">✓</span>
                                        <div className="github-info">
                                            <p className="github-username">@{currentUser.githubUsername}</p>
                                            <p className="github-url">
                                                <a
                                                    href={currentUser.githubProfileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {currentUser.githubProfileUrl}
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    className="github-connect-btn"
                                    type="button"
                                    onClick={handleLinkGithub}
                                >
                                    <span className="github-icon">🔗</span>
                                    Connect GitHub Account
                                </button>
                            )}
                        </div>
                    </section>

                    {/* Stats Section */}
                    <section className="profile-section">
                        <h2>Stats</h2>
                        <div className="stats-container">
                            <div className="stat-item">
                                <label>Rating</label>
                                <p className="stat-value">
                                    {currentUser.rating
                                        ? `${currentUser.rating.toFixed(1)} ⭐`
                                        : 'No ratings yet'}
                                </p>
                            </div>
                            <div className="stat-item">
                                <label>Member Since</label>
                                <p className="stat-value">
                                    {new Date(currentUser.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Save Button */}
                    {isEditing && (
                        <div className="profile-actions">
                            <button
                                className="save-btn"
                                type="button"
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                className="cancel-btn"
                                type="button"
                                onClick={() => {
                                    setIsEditing(false)
                                    setFormData({
                                        name: currentUser.name || '',
                                        headline: currentUser.headline || '',
                                        bio: currentUser.bio || '',
                                        location: currentUser.location || '',
                                        phone: currentUser.phone || '',
                                        hourlyRate: currentUser.hourlyRate || '',
                                        portfolioUrl: currentUser.portfolioUrl || '',
                                        skills: (currentUser.skills || []).join(', '),
                                    })
                                }}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="profile-footer">
                <p>&copy; 2026 Workloom. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default Profile
