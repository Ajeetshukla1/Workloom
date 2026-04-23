import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import workloomLogo from '../assets/workloom-text.png'
import { getMe, getGigs, applyToGig } from '../lib/api.js'
import Navbar from '../components/Navbar'

const freelanceCategories = [
    { id: 'web-dev', name: 'Web Developer', riClass: 'ri-code-s-slash-line', description: 'Website & App Development' },
    { id: 'mobile-dev', name: 'Mobile Developer', riClass: 'ri-smartphone-line', description: 'iOS & Android Apps' },
    { id: 'designer', name: 'UI/UX Designer', riClass: 'ri-pencil-ruler-2-line', description: 'Design & Prototyping' },
    { id: 'motion', name: 'Motion Designer', riClass: 'ri-film-line', description: 'Animation & Motion' },
    { id: 'video', name: 'Video Editor', riClass: 'ri-vidicon-line', description: 'Video & Editing' },
    { id: 'copywriter', name: 'Copywriter', riClass: 'ri-quill-pen-line', description: 'Content & Writing' },
    { id: 'seo', name: 'SEO Specialist', riClass: 'ri-search-line', description: 'SEO & Marketing' },
    { id: 'consultant', name: 'Consultant', riClass: 'ri-lightbulb-line', description: 'Strategy & Advice' },
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
    const [allGigs, setAllGigs] = useState(mockGigs)
    const [filteredGigs, setFilteredGigs] = useState(mockGigs)
    const [appliedGigs, setAppliedGigs] = useState([])
    const [selectedGig, setSelectedGig] = useState(null)

    useEffect(() => {
        let isMounted = true

        const loadUser = async () => {
            try {
                const [user, liveGigs] = await Promise.all([
                    getMe(),
                    getGigs().catch(() => []) // Fallback to empty if gigs fail
                ])
                if (isMounted) {
                    setCurrentUser(user)
                    
                    // Format live gigs to match UI structure
                    const formattedLiveGigs = liveGigs.map(gig => ({
                        id: gig._id,
                        title: gig.title,
                        category: gig.category || 'web-dev',
                        budget: `$${gig.price || 0}`,
                        description: gig.description,
                        duration: gig.deliveryTime || 'Flexible',
                        freelancer: {
                            name: gig.userId?.name || 'Anonymous User',
                            avatar: (gig.userId?.name || 'A')[0].toUpperCase(),
                            rating: 5.0,
                            reviews: 0
                        }
                    }))

                    const combinedGigs = [...formattedLiveGigs, ...mockGigs]
                    setAllGigs(combinedGigs)
                    setFilteredGigs(combinedGigs)
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
            setFilteredGigs(allGigs)
        } else {
            setFilteredGigs(allGigs.filter(gig => gig.category === categoryId || gig.category.toLowerCase().includes(categoryId.toLowerCase())))
        }
    }

    const handleApply = async (gigId) => {
        if (!appliedGigs.includes(gigId)) {
            try {
                await applyToGig(gigId)
                setAppliedGigs(prev => [...prev, gigId])
                alert('Application submitted successfully!')
            } catch (error) {
                alert(error.message || 'Failed to apply')
            }
        }
    }

    const handleViewGig = (gig) => {
        setSelectedGig(gig)
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
            <Navbar currentUser={currentUser} />

            {/* Hero Section */}
            <section className="home-hero">
                <div className="hero-background">
                    <div className="hero-blur-sheet"></div>
                    <img
                        src={workloomLogo}
                        alt="Workloom"
                        className="hero-pixelated-title"
                        style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain', filter: 'invert(1)', mixBlendMode: 'screen' }}
                    />
                </div>
                <div className="hero-content">
                    <p className="hero-subtitle">Find expert freelancers for your projects or showcase your skills</p>
                    <div className="hero-search">
                        <input
                            type="text"
                            placeholder="Search for gigs, freelancers, or projects..."
                            className="search-input"
                        />
                        <button
                            className="search-btn"
                            type="button"
                            onClick={() => navigate('/create-gig')}
                        >
                            Post a Gig
                        </button>
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
                            <div className="category-icon"><i className="ri-layout-grid-line"></i></div>
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
                                    <div className="category-icon"><i className={category.riClass}></i></div>
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
                                                <span className="stars"><i className="ri-star-fill" style={{ color: 'var(--accent)', marginRight: '4px' }}></i> {gig.freelancer.rating}</span>
                                                <span className="reviews">({gig.freelancer.reviews} reviews)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="gig-actions">
                                        <button className="btn-view" type="button" onClick={() => handleViewGig(gig)}>View Gig</button>
                                        {appliedGigs.includes(gig.id) ? (
                                            <button className="btn-apply" type="button" style={{ background: '#1dbf73', cursor: 'default' }}>Applied ✓</button>
                                        ) : (
                                            <button className="btn-apply" type="button" onClick={() => handleApply(gig.id)}>Apply Now</button>
                                        )}
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

            {/* Gig Details Modal */}
            {selectedGig && (
                <div className="contact-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setSelectedGig(null)}>
                    <div className="contact-modal" style={{ maxWidth: '600px' }}>
                        <div className="contact-modal-header" style={{ marginBottom: '10px' }}>
                            <div className="contact-modal-title">
                                <div>
                                    <h3 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{selectedGig.title}</h3>
                                    <span className="budget-badge" style={{ display: 'inline-block' }}>{selectedGig.budget}</span>
                                </div>
                            </div>
                            <button className="contact-modal-close" type="button" onClick={() => setSelectedGig(null)}>
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <div className="gig-description" style={{ color: 'var(--text)', fontSize: '1rem', lineHeight: '1.6' }}>
                            {selectedGig.description}
                        </div>

                        <div className="contact-info-row" style={{ marginTop: '10px' }}>
                            <div className="contact-info-card">
                                <i className="ri-time-line"></i>
                                <div>
                                    <div className="cic-label">Duration</div>
                                    <div className="cic-value">{selectedGig.duration}</div>
                                </div>
                            </div>
                            <div className="contact-info-card">
                                <i className="ri-folder-open-line"></i>
                                <div>
                                    <div className="cic-label">Category</div>
                                    <div className="cic-value">{selectedGig.category}</div>
                                </div>
                            </div>
                        </div>

                        <div className="freelancer-info" style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="freelancer-avatar" style={{ width: '48px', height: '48px', fontSize: '1.1rem' }}>{selectedGig.freelancer.avatar}</div>
                            <div className="freelancer-details">
                                <p className="freelancer-name" style={{ fontSize: '1.05rem', marginBottom: '4px' }}>Posted by: {selectedGig.freelancer.name}</p>
                                <div className="freelancer-rating">
                                    <span className="stars"><i className="ri-star-fill" style={{ color: 'var(--accent)', marginRight: '4px' }}></i> {selectedGig.freelancer.rating}</span>
                                    <span className="reviews">({selectedGig.freelancer.reviews} reviews)</span>
                                </div>
                            </div>
                        </div>

                        <div className="contact-modal-actions" style={{ marginTop: '10px' }}>
                            <button className="contact-cancel-btn" type="button" onClick={() => setSelectedGig(null)}>
                                Close
                            </button>
                            {appliedGigs.includes(selectedGig.id) ? (
                                <button className="contact-submit-btn" type="button" style={{ background: '#1dbf73', cursor: 'default' }}>
                                    Applied ✓
                                </button>
                            ) : (
                                <button className="contact-submit-btn" type="button" onClick={() => { handleApply(selectedGig.id); setSelectedGig(null); }}>
                                    <i className="ri-briefcase-line"></i> Apply for this Gig
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home
