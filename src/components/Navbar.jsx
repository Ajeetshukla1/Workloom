import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutUser, sendContactMessage } from '../lib/api.js'

function Navbar({ currentUser, onUserLogout }) {
    const navigate = useNavigate()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isContactOpen, setIsContactOpen] = useState(false)
    const [contactForm, setContactForm] = useState({ 
        name: currentUser?.name || '', 
        email: currentUser?.email || '', 
        message: '' 
    })
    const [contactStatus, setContactStatus] = useState({ type: '', message: '' })
    const profileRef = useRef(null)

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [])

    const onLogout = async () => {
        try {
            await logoutUser()
            if (onUserLogout) {
                onUserLogout()
            }
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
            setTimeout(() => {
                setIsContactOpen(false)
                setContactStatus({ type: 'info', message: '' })
            }, 800)
        } catch (error) {
            setContactStatus({ type: 'error', message: error.message })
        }
    }

    const displayName = currentUser?.name || 'User'
    const avatarInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <>
            <nav className="home-navbar">
                <div className="navbar-inner">
                    <div className="navbar-brand" style={{cursor: 'pointer'}} onClick={() => navigate('/home')}>Workloom</div>

                    <ul className="navbar-menu">
                        <li><a href="/home#gigs">Browse Gigs</a></li>
                        <li>
                            <button className="nav-contact-btn" type="button" onClick={() => navigate('/create-gig')}>
                                Create Gig
                            </button>
                        </li>
                        <li>
                            <button className="nav-contact-btn" type="button" onClick={() => navigate('/dashboard')}>
                                Dashboard
                            </button>
                        </li>
                        <li>
                            <button className="nav-contact-btn" type="button" onClick={() => setIsContactOpen(true)}>
                                Contact
                            </button>
                        </li>
                    </ul>

                    <div className="navbar-actions">
                        <div className="navbar-user" ref={profileRef}>
                            <div
                                className="user-avatar"
                                onClick={() => setIsProfileOpen((prev) => !prev)}
                                title="View profile"
                                style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}
                            >
                                {currentUser?.githubAvatarUrl ? (
                                    <img
                                        src={currentUser.githubAvatarUrl}
                                        alt={displayName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }}
                                    />
                                ) : (
                                    avatarInitials
                                )}
                            </div>
                            {isProfileOpen && (
                                <div className="user-menu">
                                    <span className="user-name">{displayName}</span>
                                    <button
                                        className="dropdown-item-btn"
                                        type="button"
                                        onClick={() => { setIsProfileOpen(false); navigate('/profile') }}
                                    >
                                        <i className="ri-user-line"></i> Profile
                                    </button>
                                    <button
                                        className="dropdown-item-btn logout"
                                        type="button"
                                        onClick={onLogout}
                                    >
                                        <i className="ri-logout-box-r-line"></i> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {isContactOpen && (
                <div className="contact-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setIsContactOpen(false)}>
                    <div className="contact-modal">
                        <div className="contact-modal-header">
                            <div className="contact-modal-title">
                                <i className="ri-customer-service-2-line"></i>
                                <div>
                                    <h3>Contact Workloom</h3>
                                    <p>We usually reply within one business day.</p>
                                </div>
                            </div>
                            <button className="contact-modal-close" type="button" onClick={() => setIsContactOpen(false)}>
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <div className="contact-info-row">
                            <div className="contact-info-card">
                                <i className="ri-mail-line"></i>
                                <div>
                                    <div className="cic-label">Email</div>
                                    <div className="cic-value">support@workloom.com</div>
                                </div>
                            </div>
                            <div className="contact-info-card">
                                <i className="ri-phone-line"></i>
                                <div>
                                    <div className="cic-label">Phone</div>
                                    <div className="cic-value">+1 (555) 123-4567</div>
                                </div>
                            </div>
                            <div className="contact-info-card">
                                <i className="ri-map-pin-line"></i>
                                <div>
                                    <div className="cic-label">Location</div>
                                    <div className="cic-value">Remote, Worldwide</div>
                                </div>
                            </div>
                        </div>

                        <form className="contact-modal-form" onSubmit={onSubmitContact}>
                            <div className="contact-fields-row">
                                <div className="contact-field">
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
                                <div className="contact-field">
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
                            <div className="contact-field">
                                <label htmlFor="contact-message">Message</label>
                                <textarea
                                    id="contact-message"
                                    name="message"
                                    rows="5"
                                    value={contactForm.message}
                                    onChange={onContactChange}
                                    placeholder="Tell us how we can help..."
                                    required
                                ></textarea>
                            </div>
                            {contactStatus.message && (
                                <div className={`contact-status ${contactStatus.type}`}>
                                    <i className={contactStatus.type === 'success' ? 'ri-check-line' : contactStatus.type === 'error' ? 'ri-error-warning-line' : 'ri-loader-4-line'}></i>
                                    {contactStatus.message}
                                </div>
                            )}
                            <div className="contact-modal-actions">
                                <button className="contact-cancel-btn" type="button" onClick={() => setIsContactOpen(false)}>
                                    Cancel
                                </button>
                                <button className="contact-submit-btn" type="submit">
                                    <i className="ri-send-plane-line"></i> Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar
