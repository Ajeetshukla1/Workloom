import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMe, updateMe } from '../lib/api.js'

const roleLabels = {
    seller: 'Freelancer',
    buyer: 'Client',
    admin: 'Admin',
}

const getInitials = (name) => {
    if (!name) {
        return '??'
    }

    const parts = name.trim().split(' ').filter(Boolean)
    const first = parts[0]?.[0] || ''
    const last = parts[parts.length - 1]?.[0] || ''
    return `${first}${last}`.toUpperCase() || '??'
}

const formatCurrency = (value) => {
    const amount = Number(value) || 0
    return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

const buildProfileForm = (user) => ({
    headline: user?.headline || '',
    bio: user?.bio || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : '',
    location: user?.location || '',
    hourlyRate: user?.hourlyRate ? String(user.hourlyRate) : '',
    portfolioUrl: user?.portfolioUrl || '',
})

const parseSkills = (value) =>
    value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

function Dashboard() {
    const [currentUser, setCurrentUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [profileForm, setProfileForm] = useState(null)
    const [profileStatus, setProfileStatus] = useState({ type: 'info', message: '' })

    useEffect(() => {
        let isMounted = true

        const loadUser = async () => {
            try {
                const user = await getMe()
                if (isMounted) {
                    setCurrentUser(user)
                    setLoadError('')
                }
            } catch (error) {
                if (isMounted) {
                    setLoadError('Sign in to view your dashboard.')
                    setCurrentUser(null)
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
    }, [])

    useEffect(() => {
        if (!currentUser || profileForm) {
            return
        }

        setProfileForm(buildProfileForm(currentUser))
    }, [currentUser, profileForm])

    const onProfileChange = (field) => (event) => {
        const value = event.target.value
        setProfileForm((prev) => ({
            ...(prev || buildProfileForm(currentUser)),
            [field]: value,
        }))
    }

    const onSaveProfile = async (event) => {
        event.preventDefault()

        if (!profileForm) {
            return
        }

        const payload = {
            headline: profileForm.headline.trim(),
            bio: profileForm.bio.trim(),
            skills: parseSkills(profileForm.skills || ''),
            location: profileForm.location.trim(),
            portfolioUrl: profileForm.portfolioUrl.trim(),
        }

        if (profileForm.hourlyRate) {
            const rate = Number(profileForm.hourlyRate)
            if (Number.isNaN(rate) || rate < 0) {
                setProfileStatus({
                    type: 'error',
                    message: 'Hourly rate must be a valid number.',
                })
                return
            }
            payload.hourlyRate = rate
        }

        setProfileStatus({ type: 'info', message: 'Saving profile...' })

        try {
            const user = await updateMe(payload)
            setCurrentUser(user)
            setProfileForm(buildProfileForm(user))
            setProfileStatus({ type: 'success', message: 'Profile updated.' })
        } catch (error) {
            setProfileStatus({ type: 'error', message: error.message })
        }
    }

    if (isLoading) {
        return (
            <div className="dashboard-shell">
                <div className="dashboard-empty">
                    <h1>Loading your dashboard...</h1>
                    <p>Fetching your workspace details.</p>
                </div>
            </div>
        )
    }

    if (!currentUser) {
        return (
            <div className="dashboard-shell">
                <div className="dashboard-empty">
                    <h1>Dashboard locked</h1>
                    <p>{loadError || 'Sign in to continue.'}</p>
                    <Link className="primary-button" to="/auth">
                        Go to sign in
                    </Link>
                </div>
            </div>
        )
    }

    const displayName = currentUser.name || 'Workspace member'
    const greetingName = displayName.split(' ')[0] || displayName
    const displayRole = roleLabels[currentUser.role] || 'Member'
    const avatarLabel = getInitials(displayName)
    const isFreelancer = currentUser.role === 'seller'
    const userProjects = Array.isArray(currentUser.projects) ? currentUser.projects : []
    const hasProjects = userProjects.length > 0
    const profileComplete =
        !isFreelancer ||
        (currentUser.headline &&
            currentUser.bio &&
            Array.isArray(currentUser.skills) &&
            currentUser.skills.length > 0)
    const needsProfile = isFreelancer && !profileComplete
    const showGigSearch = isFreelancer && !needsProfile && !hasProjects
    const heroCopy = needsProfile
        ? 'Complete your freelancer profile to unlock new projects and messages.'
        : isFreelancer
            ? 'Browse curated briefs and start building your next delivery.'
            : 'Post your first brief to begin hiring verified talent.'
    const inReview = userProjects.filter((project) =>
        (project.status || '').toLowerCase().includes('review')
    ).length
    const escrowTotal = userProjects.reduce(
        (total, project) => total + (Number(project.escrowAmount) || 0),
        0
    )
    const ratingValue = Number(currentUser.rating)
    const stats = [
        {
            label: 'Active projects',
            value: String(userProjects.length),
            meta: hasProjects ? 'Projects in progress' : 'No active projects',
        },
        {
            label: 'In review',
            value: String(inReview),
            meta: inReview ? 'Awaiting approvals' : 'Nothing in review',
        },
        {
            label: 'Escrow held',
            value: formatCurrency(escrowTotal),
            meta: escrowTotal ? 'Across active projects' : 'No escrow yet',
        },
        {
            label: 'Avg rating',
            value: Number.isFinite(ratingValue) && ratingValue > 0 ? ratingValue.toFixed(1) : '—',
            meta: ratingValue ? 'Last 90 days' : 'No ratings yet',
        },
    ]
    const highlightProject = userProjects[0]
    const milestoneProgress = Number.isFinite(highlightProject?.progress)
        ? Math.max(0, Math.min(100, highlightProject.progress))
        : null
    const milestoneTitle = highlightProject?.title || 'No milestones yet'
    const milestoneMeta = highlightProject?.dueDate
        ? `Due ${highlightProject.dueDate}`
        : hasProjects
            ? 'Track milestones in your projects'
            : 'Add a project to start tracking milestones'
    const activityItems = Array.isArray(currentUser.activity)
        ? currentUser.activity
        : []
    const taskItems = Array.isArray(currentUser.tasks) ? currentUser.tasks : []

    return (
        <div className="dashboard-shell">
            <header className="dashboard-header">
                <div className="dashboard-brand">Workloom</div>
                <div className="dashboard-search">
                    <input placeholder="Search briefs, messages, or sellers" />
                    <button type="button">Search</button>
                </div>
                <div className="dashboard-user">
                    <div className="dashboard-avatar">{avatarLabel}</div>
                    <div>
                        <div className="dashboard-name">{displayName}</div>
                        <div className="dashboard-role">{displayRole}</div>
                        <div className="dashboard-email">{currentUser.email}</div>
                    </div>
                    <Link className="dashboard-link" to="/auth">
                        Account
                    </Link>
                </div>
            </header>

            <div className="dashboard-body">
                <aside className="dashboard-nav">
                    <div className="nav-section">
                        <div className="nav-title">Workspace</div>
                        <button className="nav-item active" type="button">
                            Overview
                        </button>
                        <button className="nav-item" type="button">
                            Projects
                        </button>
                        <button className="nav-item" type="button">
                            Messages
                        </button>
                        <button className="nav-item" type="button">
                            Escrow
                        </button>
                    </div>
                    <div className="nav-section">
                        <div className="nav-title">Settings</div>
                        <button className="nav-item" type="button">
                            Profile
                        </button>
                        <button className="nav-item" type="button">
                            Team
                        </button>
                        <button className="nav-item" type="button">
                            Billing
                        </button>
                    </div>
                    <div className="nav-card">
                        <div className="nav-card-title">Escrow balance</div>
                        <div className="nav-card-value">{formatCurrency(escrowTotal)}</div>
                        <div className="nav-card-note">
                            {hasProjects
                                ? `${userProjects.length} project${
                                      userProjects.length === 1 ? '' : 's'
                                  } active`
                                : 'No escrow activity yet'}
                        </div>
                    </div>
                </aside>

                <main className="dashboard-main">
                    <section className="dashboard-hero">
                        <div>
                            <div className="dashboard-eyebrow">Overview</div>
                            <h1>Welcome back, {greetingName}</h1>
                            <p>{heroCopy}</p>
                            <div className="dashboard-actions">
                                {needsProfile ? (
                                    <>
                                        <a className="primary-button" href="#profile-section">
                                            Complete profile
                                        </a>
                                        <Link className="ghost-button" to="/">
                                            Browse briefs
                                        </Link>
                                    </>
                                ) : isFreelancer ? (
                                    <>
                                        <Link className="primary-button" to="/">
                                            Browse briefs
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <button className="primary-button" type="button">
                                            Post a brief
                                        </button>
                                        <button className="ghost-button" type="button">
                                            Invite teammate
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="dashboard-hero-card">
                            <strong>Next milestone</strong>
                            <div className="hero-card-title">{milestoneTitle}</div>
                            <div className="hero-card-meta">{milestoneMeta}</div>
                            {milestoneProgress !== null ? (
                                <>
                                    <div className="progress-track">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${milestoneProgress}%` }}
                                        ></div>
                                    </div>
                                    <div className="hero-card-meta">
                                        {milestoneProgress}% complete
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </section>

                    {needsProfile ? (
                        <section className="dashboard-section profile-section" id="profile-section">
                            <div className="section-title-row">
                                <h3>Complete your freelancer profile</h3>
                                <span className="item-meta">Required to take projects</span>
                            </div>
                            <form className="profile-form" onSubmit={onSaveProfile}>
                                <label htmlFor="profile-headline">Professional headline</label>
                                <input
                                    id="profile-headline"
                                    type="text"
                                    placeholder="Brand designer · Product storytelling"
                                    value={profileForm?.headline || ''}
                                    onChange={onProfileChange('headline')}
                                />

                                <label htmlFor="profile-bio">About you</label>
                                <textarea
                                    id="profile-bio"
                                    placeholder="Share your experience, specialties, and what makes you stand out."
                                    value={profileForm?.bio || ''}
                                    onChange={onProfileChange('bio')}
                                ></textarea>

                                <label htmlFor="profile-skills">Skills (comma separated)</label>
                                <input
                                    id="profile-skills"
                                    type="text"
                                    placeholder="UI/UX, Product Strategy, Motion"
                                    value={profileForm?.skills || ''}
                                    onChange={onProfileChange('skills')}
                                />

                                <div className="profile-grid">
                                    <div>
                                        <label htmlFor="profile-location">Location</label>
                                        <input
                                            id="profile-location"
                                            type="text"
                                            placeholder="Lagos, Nigeria"
                                            value={profileForm?.location || ''}
                                            onChange={onProfileChange('location')}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="profile-rate">Hourly rate (USD)</label>
                                        <input
                                            id="profile-rate"
                                            type="number"
                                            min="0"
                                            placeholder="40"
                                            value={profileForm?.hourlyRate || ''}
                                            onChange={onProfileChange('hourlyRate')}
                                        />
                                    </div>
                                </div>

                                <label htmlFor="profile-portfolio">Portfolio link</label>
                                <input
                                    id="profile-portfolio"
                                    type="url"
                                    placeholder="https://"
                                    value={profileForm?.portfolioUrl || ''}
                                    onChange={onProfileChange('portfolioUrl')}
                                />

                                <div className="profile-actions">
                                    <button className="primary-button" type="submit">
                                        Save profile
                                    </button>
                                </div>

                                {profileStatus.message ? (
                                    <div className={`status ${profileStatus.type}`}>
                                        {profileStatus.message}
                                    </div>
                                ) : null}
                            </form>
                        </section>
                    ) : null}

                    {showGigSearch ? (
                        <section className="dashboard-section">
                            <div className="section-title-row">
                                <h3>Find gigs</h3>
                                <span className="item-meta">Start your first project</span>
                            </div>
                            <div className="gig-search">
                                <p className="item-meta">
                                    Search briefs and gigs from the marketplace to start earning.
                                </p>
                                <div className="gig-search-row">
                                    <input
                                        type="text"
                                        placeholder="Search for a project type"
                                    />
                                    <Link className="primary-button" to="/">
                                        Open gig search
                                    </Link>
                                </div>
                            </div>
                        </section>
                    ) : null}

                    <section className="stats-grid">
                        {stats.map((stat) => (
                            <div key={stat.label} className="stat-card">
                                <div className="stat-label">{stat.label}</div>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-meta">{stat.meta}</div>
                            </div>
                        ))}
                    </section>

                    <section className="dashboard-grid-2">
                        <div className="dashboard-section">
                            <div className="section-title-row">
                                <h3>Active projects</h3>
                                <button className="ghost-button" type="button">
                                    View all
                                </button>
                            </div>
                            {needsProfile ? (
                                <div className="empty-state">
                                    <div className="item-title">Complete your profile</div>
                                    <p className="item-meta">
                                        Finish your freelancer profile to unlock new projects.
                                    </p>
                                    <a className="primary-button" href="#profile-section">
                                        Complete profile
                                    </a>
                                </div>
                            ) : !hasProjects ? (
                                <div className="empty-state">
                                    <div className="item-title">No projects yet</div>
                                    <p className="item-meta">
                                        {isFreelancer
                                            ? 'Take your first project by browsing curated briefs.'
                                            : 'Post a brief to start your first project.'}
                                    </p>
                                    <div className="empty-actions">
                                        <Link className="primary-button" to="/">
                                            {isFreelancer ? 'Take a project' : 'Post a brief'}
                                        </Link>
                                        <Link className="ghost-button" to="/">
                                            {isFreelancer ? 'Explore briefs' : 'View talent'}
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="item-list">
                                    {userProjects.map((project, index) => (
                                        <div
                                            key={project._id || project.title || index}
                                            className="item-row"
                                        >
                                            <div>
                                                <div className="item-title">
                                                    {project.title || 'Untitled project'}
                                                </div>
                                                <div className="item-meta">
                                                    {(project.status || 'Active') +
                                                        (project.dueDate
                                                            ? ` · Due ${project.dueDate}`
                                                            : '')}
                                                </div>
                                            </div>
                                            {Number.isFinite(project.progress) ? (
                                                <div className="item-progress">
                                                    <div className="progress-track">
                                                        <div
                                                            className="progress-fill"
                                                            style={{
                                                                width: `${Math.max(
                                                                    0,
                                                                    Math.min(100, project.progress)
                                                                )}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span>
                                                        {Math.max(
                                                            0,
                                                            Math.min(100, project.progress)
                                                        )}%
                                                    </span>
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="dashboard-section">
                            <div className="section-title-row">
                                <h3>Recent activity</h3>
                                <button className="ghost-button" type="button">
                                    View log
                                </button>
                            </div>
                            {activityItems.length === 0 ? (
                                <div className="empty-state">
                                    <div className="item-title">No activity yet</div>
                                    <p className="item-meta">
                                        Activity will appear once your projects start moving.
                                    </p>
                                </div>
                            ) : (
                                <div className="activity-list">
                                    {activityItems.map((item, index) => (
                                        <div key={item.id || item.title || index} className="activity-item">
                                            <div>
                                                <div className="item-title">{item.title}</div>
                                                <div className="item-meta">{item.detail}</div>
                                            </div>
                                            <span className="item-meta">{item.time}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="dashboard-section tasks">
                                <div className="section-title-row">
                                    <h3>Upcoming tasks</h3>
                                    <span className="item-meta">
                                        {taskItems.length} task{taskItems.length === 1 ? '' : 's'}
                                    </span>
                                </div>
                                {taskItems.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="item-title">No tasks yet</div>
                                        <p className="item-meta">
                                            Tasks will show here once you have active work.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="item-list">
                                        {taskItems.map((task, index) => (
                                            <div
                                                key={task.id || task.title || index}
                                                className="item-row compact"
                                            >
                                                <div>
                                                    <div className="item-title">{task.title}</div>
                                                    <div className="item-meta">
                                                        {task.due ? `Due ${task.due}` : 'No due date'}
                                                    </div>
                                                </div>
                                                <button className="ghost-button" type="button">
                                                    Review
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}

export default Dashboard
