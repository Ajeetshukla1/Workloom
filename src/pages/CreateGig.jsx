import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGig, getMe } from '../lib/api.js'
import Navbar from '../components/Navbar'

const initialForm = {
    title: '',
    category: '',
    description: '',
    price: '',
    deliveryTime: '',
    tags: '',
}

function CreateGig() {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState(null)
    const [form, setForm] = useState(initialForm)
    const [status, setStatus] = useState({ type: 'info', message: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        let isMounted = true
        const loadUser = async () => {
            try {
                const user = await getMe()
                if (isMounted) setCurrentUser(user)
            } catch (error) {
                if (isMounted) navigate('/auth', { replace: true })
            }
        }
        loadUser()
        return () => { isMounted = false }
    }, [navigate])

    const onChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const onSubmit = async (event) => {
        event.preventDefault()
        setIsSubmitting(true)
        setStatus({ type: 'info', message: 'Publishing gig...' })

        try {
            const payload = {
                title: form.title.trim(),
                category: form.category.trim(),
                description: form.description.trim(),
                price: Number(form.price),
                deliveryTime: form.deliveryTime.trim(),
                tags: form.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
            }

            await createGig(payload)
            setStatus({ type: 'success', message: 'Gig created successfully!' })
            setForm(initialForm)
            setTimeout(() => navigate('/home#gigs'), 800)
        } catch (error) {
            setStatus({ type: 'error', message: error.message })
            setIsSubmitting(false)
        }
    }

    return (
        <div className="home-shell">
            <Navbar currentUser={currentUser} />

            <div className="profile-container" style={{ maxWidth: '800px', padding: '60px 24px', margin: '0 auto', width: '100%' }}>
                <div className="profile-header" style={{ marginBottom: '32px' }}>
                    <div className="profile-details">
                        <h1 style={{ fontSize: '2.2rem', margin: '0 0 8px 0', textShadow: '0 6px 18px rgba(0, 0, 0, 0.4)' }}>Post a New Gig</h1>
                        <p className="profile-role" style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 'normal' }}>
                            Describe your service and publish it for clients to see.
                        </p>
                    </div>
                </div>

                <div className="profile-section" style={{ padding: '32px', background: 'var(--panel)', border: '1px solid var(--stroke)', borderRadius: '16px' }}>
                    <form className="profile-form" onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>Gig Title *</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                className="form-input"
                                value={form.title}
                                onChange={onChange}
                                placeholder="e.g., I will design a modern landing page"
                                required
                            />
                        </div>

                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>Category *</label>
                            <input
                                id="category"
                                name="category"
                                type="text"
                                className="form-input"
                                value={form.category}
                                onChange={onChange}
                                placeholder="e.g., Web Development"
                                required
                            />
                        </div>

                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                rows="6"
                                className="form-input"
                                value={form.description}
                                onChange={onChange}
                                placeholder="Explain deliverables, timeline, and what clients will receive..."
                                required
                            ></textarea>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>Starting Price (USD) *</label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="1"
                                    className="form-input"
                                    value={form.price}
                                    onChange={onChange}
                                    placeholder="e.g., 50"
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>Delivery Time</label>
                                <input
                                    id="deliveryTime"
                                    name="deliveryTime"
                                    type="text"
                                    className="form-input"
                                    value={form.deliveryTime}
                                    onChange={onChange}
                                    placeholder="e.g., 3-5 days"
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>Tags (comma separated)</label>
                            <input
                                id="tags"
                                name="tags"
                                type="text"
                                className="form-input"
                                value={form.tags}
                                onChange={onChange}
                                placeholder="e.g., React, Node.js, Frontend"
                            />
                        </div>

                        {status.message && (
                            <div className={status.type === 'error' ? 'profile-error' : 'profile-success'} style={{ marginTop: '10px', marginBottom: 0 }}>
                                {status.message}
                            </div>
                        )}

                        <div className="profile-actions" style={{ borderTop: 'none', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                className="cancel-btn"
                                type="button"
                                onClick={() => navigate('/home')}
                                disabled={isSubmitting}
                                style={{ margin: 0 }}
                            >
                                Cancel
                            </button>
                            <button
                                className="save-btn"
                                type="submit"
                                disabled={isSubmitting}
                                style={{ margin: 0 }}
                            >
                                {isSubmitting ? 'Publishing...' : 'Publish Gig'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateGig
