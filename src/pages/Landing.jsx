import { useState } from 'react'
import { Link } from 'react-router-dom'

const GREEN = '#1dbf73'
const GREEN_DARK = '#19a463'

const NAV_LINKS = ['Explore', 'How it works', 'Business', 'Become a seller']

const CATEGORIES = [
    { name: 'Design', icon: 'design' },
    { name: 'Development', icon: 'code' },
    { name: 'Writing', icon: 'writing' },
    { name: 'Marketing', icon: 'marketing' },
    { name: 'Video', icon: 'video' },
    { name: 'Music', icon: 'music' },
    { name: 'Data', icon: 'data' },
    { name: 'AI Services', icon: 'ai' },
]

const POPULAR_TAGS = [
    'Logo Design',
    'WordPress',
    'Video Editing',
    'React Dev',
    'Copywriting',
]

const GIGS = [
    {
        id: 1,
        seller: 'studio_kira',
        initials: 'SK',
        avatarColor: '#7f77dd',
        title: 'I will design a modern brand identity with logo and guidelines',
        rating: 5,
        reviews: '2.4k',
        price: 49,
        badge: 'TOP RATED',
        bgColor: '#1a1a2e',
        imgUrl:
            'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80',
        category: 'Design',
    },
    {
        id: 2,
        seller: 'alex_vue',
        initials: 'AV',
        avatarColor: '#1dbf73',
        title: 'I will build a full-stack React + Node.js web application',
        rating: 5,
        reviews: '1.1k',
        price: 120,
        badge: 'BESTSELLER',
        bgColor: '#0d1a13',
        imgUrl:
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
        category: 'Development',
    },
    {
        id: 3,
        seller: 'motion_pro',
        initials: 'MP',
        avatarColor: '#d85a30',
        title: 'I will create cinematic video edits and reels for your brand',
        rating: 4,
        reviews: '876',
        price: 35,
        badge: null,
        bgColor: '#1a0d0d',
        imgUrl:
            'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=80',
        category: 'Video',
    },
    {
        id: 4,
        seller: 'zena_ai',
        initials: 'ZN',
        avatarColor: '#534ab7',
        title: 'I will build custom AI chatbots and automation workflows',
        rating: 5,
        reviews: '340',
        price: 89,
        badge: 'NEW',
        bgColor: '#0d0d1a',
        imgUrl:
            'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80',
        category: 'AI Services',
    },
    {
        id: 5,
        seller: 'lena_writes',
        initials: 'LW',
        avatarColor: '#ba7517',
        title: 'I will write SEO blog posts and long-form content that converts',
        rating: 5,
        reviews: '3.2k',
        price: 25,
        badge: null,
        bgColor: '#1a1200',
        imgUrl:
            'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80',
        category: 'Writing',
    },
    {
        id: 6,
        seller: 'reach_digital',
        initials: 'RD',
        avatarColor: '#0f6e56',
        title: 'I will run targeted Meta and Google ad campaigns for your business',
        rating: 4,
        reviews: '512',
        price: 60,
        badge: null,
        bgColor: '#0d1a1a',
        imgUrl:
            'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80',
        category: 'Marketing',
    },
    {
        id: 7,
        seller: 'beatmaker_jz',
        initials: 'BM',
        avatarColor: '#993556',
        title: 'I will produce original background music and sound design',
        rating: 5,
        reviews: '720',
        price: 40,
        badge: null,
        bgColor: '#1a0d14',
        imgUrl:
            'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80',
        category: 'Music',
    },
    {
        id: 8,
        seller: 'data_tomas',
        initials: 'DT',
        avatarColor: '#5f5e5a',
        title: 'I will build Power BI and Tableau dashboards from your data',
        rating: 5,
        reviews: '198',
        price: 75,
        badge: null,
        bgColor: '#111',
        imgUrl:
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
        category: 'Data',
    },
]

const STATS = [
    { num: '500K+', label: 'Verified professionals' },
    { num: '2M+', label: 'Projects completed' },
    { num: '98%', label: 'Satisfaction rate' },
    { num: '150+', label: 'Countries represented' },
]

function SearchIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    )
}

function StarIcon({ filled }) {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={filled ? '#f5a623' : 'none'}
            stroke="#f5a623"
            strokeWidth="2"
        >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
    )
}

function CategoryIcon({ type }) {
    const icons = {
        design: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <circle cx="17.5" cy="17.5" r="3.5" />
            </>
        ),
        code: (
            <>
                <polyline points="16,18 22,12 16,6" />
                <polyline points="8,6 2,12 8,18" />
            </>
        ),
        writing: (
            <>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </>
        ),
        marketing: (
            <>
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </>
        ),
        video: (
            <>
                <polygon points="23,7 16,12 23,17" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
            </>
        ),
        music: (
            <>
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
            </>
        ),
        data: (
            <>
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12" />
                <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
            </>
        ),
        ai: (
            <>
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z" />
                <circle cx="9" cy="14" r="1" />
                <circle cx="15" cy="14" r="1" />
            </>
        ),
    }

    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {icons[type]}
        </svg>
    )
}

function Stars({ rating }) {
    return (
        <span style={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} filled={i <= rating} />
            ))}
        </span>
    )
}

function GigCard({ gig }) {
    const [hovered, setHovered] = useState(false)

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: '#141414',
                border: `1px solid ${hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'
                    }`,
                borderRadius: 14,
                overflow: 'hidden',
                cursor: 'pointer',
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all 0.22s ease',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div style={{ position: 'relative', height: 170, overflow: 'hidden' }}>
                <img
                    src={gig.imgUrl}
                    alt={gig.category}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: hovered ? 'scale(1.05)' : 'scale(1)',
                        transition: 'transform 0.4s ease',
                    }}
                    onError={(event) => {
                        event.target.style.background = gig.bgColor
                        event.target.style.display = 'none'
                    }}
                />
                {gig.badge ? (
                    <div
                        style={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            background: GREEN,
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 5,
                            letterSpacing: 0.5,
                        }}
                    >
                        {gig.badge}
                    </div>
                ) : null}
            </div>
            <div
                style={{
                    padding: '14px 16px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                        style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            background: gig.avatarColor,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 700,
                            flexShrink: 0,
                        }}
                    >
                        {gig.initials}
                    </div>
                    <span style={{ fontSize: 12, color: '#777' }}>{gig.seller}</span>
                </div>
                <p
                    style={{
                        fontSize: 13.5,
                        color: '#e0ddd8',
                        lineHeight: 1.45,
                        fontWeight: 400,
                        flex: 1,
                    }}
                >
                    {gig.title}
                </p>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        paddingTop: 10,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Stars rating={gig.rating} />
                        <span style={{ fontSize: 11, color: '#555' }}>({gig.reviews})</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#f0ede8' }}>
                        <span style={{ fontSize: 11, color: '#555', marginRight: 2 }}>
                            From{' '}
                        </span>
                        ${gig.price}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function FreelanceMarketplace() {
    const [search, setSearch] = useState('')
    const [activeTag, setActiveTag] = useState(null)

    const filteredGigs = GIGS.filter((gig) => {
        const query = search.toLowerCase()

        return (
            (!activeTag ||
                gig.category === activeTag ||
                POPULAR_TAGS.indexOf(activeTag) === -1) &&
            (gig.title.toLowerCase().includes(query) ||
                gig.seller.toLowerCase().includes(query) ||
                gig.category.toLowerCase().includes(query))
        )
    })

    return (
        <div
            style={{
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                background: '#0a0a0a',
                color: '#f0ede8',
                minHeight: '100vh',
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        input:focus { outline: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease both; }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>

            <nav
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 40px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(10,10,10,0.97)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    backdropFilter: 'blur(12px)',
                }}
            >
                <Link
                    to="/"
                    style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 22,
                        fontWeight: 700,
                        letterSpacing: -0.5,
                        color: '#f0ede8',
                    }}
                >
                    free<span style={{ color: GREEN }}>lance</span>
                </Link>

                <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
                    {NAV_LINKS.map((label) => (
                        <span
                            key={label}
                            style={{
                                fontSize: 14,
                                color: '#777',
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={(event) => {
                                event.target.style.color = '#f0ede8'
                            }}
                            onMouseLeave={(event) => {
                                event.target.style.color = '#777'
                            }}
                        >
                            {label}
                        </span>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Link to="/auth" style={{ fontSize: 14, color: '#777' }}>
                        Sign in
                    </Link>
                    <Link
                        to="/auth"
                        style={{
                            background: GREEN,
                            color: '#fff',
                            border: 'none',
                            padding: '9px 20px',
                            borderRadius: 7,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'background 0.2s',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={(event) => {
                            event.currentTarget.style.background = GREEN_DARK
                        }}
                        onMouseLeave={(event) => {
                            event.currentTarget.style.background = GREEN
                        }}
                    >
                        Join Free
                    </Link>
                </div>
            </nav>

            <section
                style={{
                    padding: '90px 40px 70px',
                    textAlign: 'center',
                    background:
                        'radial-gradient(ellipse at 50% 0%, rgba(29,191,115,0.07) 0%, transparent 70%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.03,
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                        pointerEvents: 'none',
                    }}
                />

                <div
                    className="fade-up"
                    style={{
                        display: 'inline-block',
                        background: 'rgba(29,191,115,0.1)',
                        color: GREEN,
                        fontSize: 12,
                        fontWeight: 500,
                        padding: '5px 14px',
                        borderRadius: 20,
                        border: '1px solid rgba(29,191,115,0.2)',
                        marginBottom: 24,
                        letterSpacing: 0.5,
                    }}
                >
                    500K+ verified professionals
                </div>

                <h1
                    className="fade-up"
                    style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 58,
                        fontWeight: 700,
                        lineHeight: 1.08,
                        letterSpacing: -2,
                        marginBottom: 18,
                        animationDelay: '0.1s',
                    }}
                >
                    Find the perfect
                    <br />
                    <span style={{ color: GREEN }}>freelance service</span>
                </h1>

                <p
                    className="fade-up"
                    style={{
                        fontSize: 17,
                        color: '#777',
                        maxWidth: 460,
                        margin: '0 auto 38px',
                        lineHeight: 1.65,
                        animationDelay: '0.2s',
                    }}
                >
                    Work with talented professionals for any project. Delivered fast, done
                    right.
                </p>

                <div
                    className="fade-up"
                    style={{
                        display: 'flex',
                        maxWidth: 580,
                        margin: '0 auto',
                        background: '#1a1a1a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        overflow: 'hidden',
                        animationDelay: '0.3s',
                        boxShadow: '0 0 40px rgba(29,191,115,0.06)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: 16,
                            color: '#555',
                        }}
                    >
                        <SearchIcon />
                    </div>
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search any service - UI design, coding, writing..."
                        style={{
                            flex: 1,
                            background: 'none',
                            border: 'none',
                            padding: '15px 14px',
                            fontSize: 15,
                            color: '#f0ede8',
                            fontFamily: 'inherit',
                        }}
                    />
                    <button
                        style={{
                            background: GREEN,
                            border: 'none',
                            color: '#fff',
                            padding: '15px 26px',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(event) => {
                            event.target.style.background = GREEN_DARK
                        }}
                        onMouseLeave={(event) => {
                            event.target.style.background = GREEN
                        }}
                    >
                        Search
                    </button>
                </div>

                <div
                    className="fade-up"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        justifyContent: 'center',
                        marginTop: 22,
                        flexWrap: 'wrap',
                        animationDelay: '0.4s',
                    }}
                >
                    <span style={{ fontSize: 13, color: '#444' }}>Popular:</span>
                    {POPULAR_TAGS.map((tag) => (
                        <span
                            key={tag}
                            onClick={() =>
                                setActiveTag(activeTag === tag ? null : tag)
                            }
                            style={{
                                background:
                                    activeTag === tag ? 'rgba(29,191,115,0.15)' : '#161616',
                                border: `1px solid ${activeTag === tag
                                        ? 'rgba(29,191,115,0.4)'
                                        : 'rgba(255,255,255,0.08)'
                                    }`,
                                color: activeTag === tag ? GREEN : '#666',
                                padding: '5px 13px',
                                borderRadius: 20,
                                fontSize: 12,
                                cursor: 'pointer',
                                transition: 'all 0.18s',
                            }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </section>

            <section style={{ padding: '48px 40px 36px' }}>
                <h2
                    style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 22,
                        fontWeight: 500,
                        marginBottom: 20,
                    }}
                >
                    Browse categories
                </h2>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(8, 1fr)',
                        gap: 10,
                    }}
                >
                    {CATEGORIES.map((category) => (
                        <div
                            key={category.name}
                            style={{
                                background: '#141414',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: 12,
                                padding: '20px 10px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(event) => {
                                event.currentTarget.style.borderColor = GREEN
                                event.currentTarget.style.transform = 'translateY(-3px)'
                            }}
                            onMouseLeave={(event) => {
                                event.currentTarget.style.borderColor =
                                    'rgba(255,255,255,0.07)'
                                event.currentTarget.style.transform = 'translateY(0)'
                            }}
                        >
                            <div
                                style={{
                                    color: GREEN,
                                    marginBottom: 10,
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <CategoryIcon type={category.icon} />
                            </div>
                            <div style={{ fontSize: 12, color: '#777' }}>
                                {category.name}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ padding: '8px 40px 70px' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 20,
                    }}
                >
                    <h2
                        style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: 22,
                            fontWeight: 500,
                        }}
                    >
                        Featured gigs
                    </h2>
                    {search ? (
                        <span style={{ fontSize: 13, color: '#555' }}>
                            {filteredGigs.length} result
                            {filteredGigs.length !== 1 ? 's' : ''}
                        </span>
                    ) : null}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
                    {filteredGigs.map((gig, index) => (
                        <div
                            key={gig.id}
                            style={{ animationDelay: `${index * 0.06}s` }}
                            className="fade-up"
                        >
                            <GigCard gig={gig} />
                        </div>
                    ))}
                    {filteredGigs.length === 0 ? (
                        <div
                            style={{
                                gridColumn: '1/-1',
                                textAlign: 'center',
                                padding: '60px 0',
                                color: '#444',
                            }}
                        >
                            No gigs found for "{search}"
                        </div>
                    ) : null}
                </div>
            </section>

            <div
                style={{
                    background: '#111',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    padding: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 80,
                }}
            >
                {STATS.map((stat) => (
                    <div key={stat.num} style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                fontFamily: "'Syne', sans-serif",
                                fontSize: 34,
                                fontWeight: 700,
                                color: GREEN,
                            }}
                        >
                            {stat.num}
                        </div>
                        <div style={{ fontSize: 13, color: '#555', marginTop: 5 }}>
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            <section style={{ padding: '48px 40px', textAlign: 'center' }}>
                <p
                    style={{
                        fontSize: 13,
                        color: '#444',
                        marginBottom: 24,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                    }}
                >
                    Trusted by teams at
                </p>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 48,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    {['Meta', 'Google', 'Netflix', 'Spotify', 'Airbnb', 'Stripe'].map(
                        (brand) => (
                            <span
                                key={brand}
                                style={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: '#2a2a2a',
                                    letterSpacing: -0.5,
                                }}
                            >
                                {brand}
                            </span>
                        )
                    )}
                </div>
            </section>

            <footer
                style={{
                    padding: '28px 40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <div
                    style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 18,
                        fontWeight: 700,
                    }}
                >
                    free<span style={{ color: GREEN }}>lance</span>
                </div>
                <div style={{ fontSize: 12, color: '#333' }}>
                    (c) 2026 Freelance Inc. - All rights reserved
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                    {['Privacy', 'Terms', 'Support'].map((label) => (
                        <span
                            key={label}
                            style={{ fontSize: 12, color: '#333', cursor: 'pointer' }}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            </footer>
        </div>
    )
}
