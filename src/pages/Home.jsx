import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, logoutUser, sendContactMessage } from '../lib/api.js'

const freelanceCategories = [
    { id: 'web-dev', name: 'Web Developer', icon: '⌨', description: 'Website & App Development' },
    { id: 'mobile-dev', name: 'Mobile Developer', icon: '◉', description: 'iOS & Android Apps' },
    { id: 'designer', name: 'UI/UX Designer', icon: '◈', description: 'Design & Prototyping' },
    { id: 'motion', name: 'Motion Designer', icon: '▶', description: 'Animation & Motion' },
    { id: 'video', name: 'Video Editor', icon: '◆', description: 'Video & Editing' },
    { id: 'copywriter', name: 'Copywriter', icon: '✏', description: 'Content & Writing' },
    { id: 'seo', name: 'SEO Specialist', icon: '⬈', description: 'SEO & Marketing' },
    { id: 'consultant', name: 'Consultant', icon: '◮', description: 'Strategy & Advice' },
]

const mockGigs = [
    {
        id: 1,
        title: 'E-commerce Website Development',
        category: 'web-dev',
        budget: '$2000-3000',
        freelancer: { name: 'John Dev', avatar: 'JD', rating: 4.9, reviews: 125 },
        description: 'Build a modern e-commerce platform with payment integration',
        duration: '4-6 weeks',
    },
    {
        id: 2,
        title: 'Mobile App UI Design',
        category: 'designer',
        budget: '$1500-2000',
        freelancer: { name: 'Sarah Design', avatar: 'SD', rating: 5, reviews: 89 },
        description: 'Design beautiful and intuitive UI for mobile application',
        duration: '2-3 weeks',
    },
    {
        id: 3,
        title: 'React App Development',
        category: 'web-dev',
        budget: '$1800-2500',
        freelancer: { name: 'Mike Code', avatar: 'MC', rating: 4.8, reviews: 156 },
        description: 'Build interactive React component library',
        duration: '3-4 weeks',
    },
    {
        id: 4,
        title: 'Brand Animation Video',
        category: 'motion',
        budget: '$3000-4000',
        freelancer: { name: 'Alex Motion', avatar: 'AM', rating: 4.95, reviews: 76 },
        description: 'Create engaging brand animation for product launch',
        duration: '2-3 weeks',
    },
    {
        id: 5,
        title: 'iOS App Development',
        category: 'mobile-dev',
        budget: '$2500-3500',
        freelancer: { name: 'Emma Mobile', avatar: 'EM', rating: 4.9, reviews: 95 },
        description: 'Build full-featured iOS application with native code',
        duration: '6-8 weeks',
    },
    {
        id: 6,
        title: 'Product Photography Editing',
        category: 'video',
        budget: '$800-1200',
        freelancer: { name: 'Lisa Visual', avatar: 'LV', rating: 4.85, reviews: 142 },
        description: 'Edit and retouch 50+ product photos for e-commerce store',
        duration: '1-2 weeks',
    },
]

function Home() {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [filteredGigs, setFilteredGigs] = useState(mockGigs)
    const [isContactOpen, setIsContactOpen] = useState(false)
    const [contactStatus, setContactStatus] = useState({ type: 'info', message: '' })
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })

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

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId)
        if (categoryId === null) {
            setFilteredGigs(mockGigs)
        } else {
            setFilteredGigs(mockGigs.filter(gig => gig.category === categoryId))
        }
    }

    const onLogout = async () => {
        try {
            await logoutUser()
            setCurrentUser(null)
            navigate('/', { replace: true })
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const onContactChange = (event) => {
        const { name, value } = event.target
        setContactForm((prev) => ({ ...prev, [name]: value }))
    }

    const onSubmitContact = async (event) => {
        event.preventDefault()
        setContactStatus({ type: 'info', message: 'Sending message...' })

        try {
            await sendContactMessage(contactForm)
            setContactStatus({ type: 'success', message: 'Message sent successfully.' })
            setContactForm({ name: '', email: '', message: '' })
        } catch (error) {
            setContactStatus({ type: 'error', message: error.message })
        }
    }

    if (isLoading) {
        return (
            <div className="home-shell">
                <div className="home-empty">
                    <h1>Loading...</h1>
                </div>
            </div>
        )
    }

    if (!currentUser) {
        navigate('/auth', { replace: true })
        return null
    }

    const displayName = currentUser.name || 'User'
    const avatarInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className="home-shell">
            {/* Navigation Bar */}
            <nav className="home-navbar">
                <div className="navbar-inner">
                    <div className="navbar-brand">Workloom</div>

                    <ul className="navbar-menu">
                        <li><a href="#categories">Categories</a></li>
                        <li><a href="#gigs">Browse Gigs</a></li>
                        <li><a href="#footer">How it Works</a></li>
                        <li>
                            <button
                                className="nav-contact-btn"
                                type="button"
                                onClick={() => setIsContactOpen(true)}
                            >
                                Contact
                            </button>
                        </li>
                    </ul>

                    <div className="navbar-actions">
                        <button
                            className="nav-link-btn"
                            type="button"
                            onClick={() => navigate('/dashboard')}
                        >
                            Dashboard
                        </button>
                        <button
                            className="nav-link-btn"
                            type="button"
                            onClick={() => navigate('/profile')}
                        >
                            Profile
                        </button>
                        <div className="navbar-user">
                            <div className="user-avatar">{avatarInitials}</div>
                            <div className="user-menu">
                                <span className="user-name">{displayName}</span>
                                <button
                                    className="logout-btn"
                                    type="button"
                                    onClick={onLogout}
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="home-hero">
                <div className="hero-background">
                    <div className="hero-blur-sheet"></div>
                    <h1 className="hero-pixelated-title">FREELANCE</h1>
                </div>
                <div className="hero-content">
                    <p className="hero-subtitle">Find expert freelancers for your projects or showcase your skills</p>
                    <div className="hero-search">
                        <input
                            type="text"
                            placeholder="Search for gigs, freelancers, or projects..."
                            className="search-input"
                        />
                        <button className="search-btn">Search</button>
                    </div>
                </div>
            </section>

            {/* Section 1: Categories */}
            <section className="categories-section" id="categories">
                <div className="section-container">
                    <div className="section-header">
                        <h2>Popular Categories</h2>
                        <p>Find expert freelancers for any project</p>
                    </div>

                    <div className="categories-grid">
                        <button
                            className={`category-card ${selectedCategory === null ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(null)}
                            type="button"
                        >
                            <div className="category-icon">🌐</div>
                            <h3>All Categories</h3>
                            <p>{mockGigs.length} gigs</p>
                        </button>

                        {freelanceCategories.map((category) => {
                            const categoryGigCount = mockGigs.filter(g => g.category === category.id).length
                            return (
                                <button
                                    key={category.id}
                                    className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                                    onClick={() => handleCategoryClick(category.id)}
                                    type="button"
                                >
                                    <div className="category-icon">{category.icon}</div>
                                    <h3>{category.name}</h3>
                                    <p>{category.description}</p>
                                    <span className="gig-count">{categoryGigCount} gigs</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Section 2: Filtered Gigs */}
            <section className="gigs-section" id="gigs">
                <div className="section-container">
                    <div className="section-header">
                        <h2>
                            {selectedCategory
                                ? freelanceCategories.find(c => c.id === selectedCategory)?.name + ' Gigs'
                                : 'All Available Gigs'}
                        </h2>
                        <p>Browse and apply to projects that match your skills</p>
                    </div>

                    {filteredGigs.length > 0 ? (
                        <div className="gigs-grid">
                            {filteredGigs.map((gig) => (
                                <div key={gig.id} className="gig-card">
                                    <div className="gig-header">
                                        <h3>{gig.title}</h3>
                                        <span className="budget-badge">{gig.budget}</span>
                                    </div>

                                    <p className="gig-description">{gig.description}</p>

                                    <div className="gig-meta">
                                        <span className="duration">
                                            <strong>Duration:</strong> {gig.duration}
                                        </span>
                                    </div>

                                    <div className="freelancer-info">
                                        <div className="freelancer-avatar">{gig.freelancer.avatar}</div>
                                        <div className="freelancer-details">
                                            <p className="freelancer-name">{gig.freelancer.name}</p>
                                            <div className="freelancer-rating">
                                                <span className="stars">⭐ {gig.freelancer.rating}</span>
                                                <span className="reviews">({gig.freelancer.reviews} reviews)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="gig-actions">
                                        <button className="btn-view" type="button">View Gig</button>
                                        <button className="btn-apply" type="button">Apply Now</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No gigs found in this category</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Section 3: Footer */}
            <footer className="home-footer" id="footer">
                <div className="footer-container">
                    <div className="footer-content">
                        <div className="footer-column">
                            <h4>Categories</h4>
                            <ul>
                                <li><a href="#web-dev">Web Development</a></li>
                                <li><a href="#mobile-dev">Mobile Development</a></li>
                                <li><a href="#design">Design</a></li>
                                <li><a href="#video">Video & Animation</a></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h4>For Freelancers</h4>
                            <ul>
                                <li><a href="#browse">Browse Gigs</a></li>
                                <li><a href="#profile">Build Profile</a></li>
                                <li><a href="#portfolio">Add Portfolio</a></li>
                                <li><a href="#earnings">Track Earnings</a></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h4>For Clients</h4>
                            <ul>
                                <li><a href="#post-project">Post Project</a></li>
                                <li><a href="#find-talent">Find Talent</a></li>
                                <li><a href="#manage">Manage Projects</a></li>
                                <li><a href="#payments">Payments</a></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="#about">About Us</a></li>
                                <li><a href="#blog">Blog</a></li>
                                <li><a href="#careers">Careers</a></li>
                                <li><a href="#press">Press</a></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h4>Contact & Social</h4>
                            <div className="contact-info">
                                <button
                                    className="contact-dialog-trigger"
                                    type="button"
                                    onClick={() => setIsContactOpen(true)}
                                >
                                    Open Contact
                                </button>
                                <p><strong>Email:</strong> support@workloom.com</p>
                                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                            </div>
                            <div className="social-links">
                                <a href="#twitter" className="social-link">Twitter</a>
                                <a href="#linkedin" className="social-link">LinkedIn</a>
                                <a href="#facebook" className="social-link">Facebook</a>
                                <a href="#instagram" className="social-link">Instagram</a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2026 Workloom. All rights reserved.</p>
                        <div className="footer-links">
                            <a href="#privacy">Privacy Policy</a>
                            <a href="#terms">Terms of Service</a>
                            <a href="#cookies">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>

            {isContactOpen ? (
                <div className="contact-dialog-overlay" role="dialog" aria-modal="true">
                    <div className="contact-dialog">
                        <div className="contact-dialog-header">
                            <div>
                                <h3>Contact Workloom</h3>
                                <p>We usually reply within one business day.</p>
                            </div>
                            <button
                                className="contact-dialog-close"
                                type="button"
                                onClick={() => setIsContactOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="contact-dialog-icons">
                            <div className="contact-icon-card">
                                <span className="contact-icon">✉</span>
                                <div>
                                    <div className="contact-icon-label">Email</div>
                                    <div className="contact-icon-value">support@workloom.com</div>
                                </div>
                            </div>
                            <div className="contact-icon-card">
                                <span className="contact-icon">☎</span>
                                <div>
                                    <div className="contact-icon-label">Phone</div>
                                    <div className="contact-icon-value">+1 (555) 123-4567</div>
                                </div>
                            </div>
                            <div className="contact-icon-card">
                                <span className="contact-icon">📍</span>
                                <div>
                                    <div className="contact-icon-label">Location</div>
                                    <div className="contact-icon-value">Remote, Worldwide</div>
                                </div>
                            </div>
                        </div>
                        <form className="contact-dialog-form" onSubmit={onSubmitContact}>
                            <div className="contact-field-grid">
                                <div>
                                    <label htmlFor="contact-name">Name</label>
                                    <input
                                        id="contact-name"
                                        name="name"
                                        type="text"
                                        value={contactForm.name}
                                        onChange={onContactChange}
                                        placeholder="Your name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-email">Email</label>
                                    <input
                                        id="contact-email"
                                        name="email"
                                        type="email"
                                        value={contactForm.email}
                                        onChange={onContactChange}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            <label htmlFor="contact-message">Message</label>
                            <textarea
                                id="contact-message"
                                name="message"
                                rows="4"
                                value={contactForm.message}
                                onChange={onContactChange}
                                placeholder="Tell us how we can help"
                                required
                            ></textarea>
                            {contactStatus.message ? (
                                <div className={`status ${contactStatus.type}`}>
                                    {contactStatus.message}
                                </div>
                            ) : null}
                            <div className="contact-dialog-actions">
                                <button className="ghost-button" type="button" onClick={() => setIsContactOpen(false)}>
                                    Cancel
                                </button>
                                <button className="primary-button" type="submit">
                                    Send message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export default Home
