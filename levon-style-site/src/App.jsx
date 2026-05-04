import { useState, useEffect } from 'react'
import './App.css'

const bentoColumns = [
  [
    { id: 1, src: '/photos/work/IMG_0700.JPG', alt: 'Work' },
    { id: 2, src: '/photos/work/IMG_0636.JPG', alt: 'Work' },
    { id: 3, src: '/photos/work/IMG_0804.JPG', alt: 'Work' },
  ],
  [
    { id: 4, src: '/photos/work/IMG_0625.JPG', alt: 'Work' },
    { id: 5, src: '/photos/work/IMG_0652.JPG', alt: 'Work' },
    { id: 6, src: '/photos/work/IMG_0074.JPG', alt: 'Work' },
  ],
  [
    { id: 7, src: '/photos/work/IMG_0638.JPG', alt: 'Work' },
    { id: 8, src: '/photos/work/IMG_0623.JPG', alt: 'Work' },
  ],
]

const workPhotos = bentoColumns.flat().map(p => p.src)

const albums = [
  {
    id: 1,
    title: 'Snow Angels',
    year: '2024',
    cover: '/photos/snow-angel/cover.JPG',
    coverPosition: '50% 50%',
    columns: [
      ['/photos/snow-angel/IMG_0016.JPG', '/photos/snow-angel/IMG_0018.JPG'],
      ['/photos/snow-angel/IMG_0011.JPG', '/photos/snow-angel/IMG_0029.JPG'],
      ['/photos/snow-angel/IMG_0014.JPG', '/photos/snow-angel/IMG_0020.JPG'],
    ],
  },
  {
    id: 2,
    title: 'Hogle Zoology',
    year: '2024',
    cover: '/photos/hogle-zoo/cover.JPG',
    coverPosition: '35% 40%',
    columns: [
      [
        '/photos/hogle-zoo/IMG_0135.JPG',
        '/photos/hogle-zoo/IMG_0544.JPG',
        '/photos/hogle-zoo/IMG_0303.JPG',
        '/photos/hogle-zoo/IMG_0247.JPG',
        '/photos/hogle-zoo/IMG_0515.JPG',
      ],
      [
        '/photos/hogle-zoo/IMG_0565.JPG',
        '/photos/hogle-zoo/IMG_0168.JPG',
        '/photos/hogle-zoo/IMG_0395.JPG',
        '/photos/hogle-zoo/IMG_0545.JPG',
      ],
      [
        '/photos/hogle-zoo/IMG_0576.JPG',
        '/photos/hogle-zoo/IMG_0161.JPG',
        '/photos/hogle-zoo/IMG_0522.JPG',
        '/photos/hogle-zoo/IMG_0566.JPG',
      ],
    ],
  },
  {
    id: 3,
    title: 'Fuyuzare Landscapes',
    year: '2024',
    cover: '/photos/utah/cover.JPG',
    columns: [
      ['/photos/utah/IMG_0069.JPG', '/photos/utah/IMG_0531.JPG'],
      ['/photos/utah/IMG_0535.JPG', '/photos/utah/IMG_0523.JPG'],
      ['/photos/utah/IMG_0075.JPG', '/photos/utah/IMG_0570.JPG'],
    ],
  },
]

const albumCoverPhotos = albums.map(album => album.cover)
const aboutPhoto = '/photos/about/IMG%200059%20from%20Google%20Drive.JPG'
const displayPhoto = src => src.replace('/photos/', '/photos-optimized/')
const preloadImage = src => {
  const image = new Image()
  image.decoding = 'async'
  image.src = src
}

function GalleryImage({ className = '', ...props }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <img
      {...props}
      className={`${className} gallery-image ${loaded ? 'loaded' : ''}`}
      onLoad={(event) => {
        setLoaded(true)
        props.onLoad?.(event)
      }}
    />
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState('works')
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [lightboxImageLoaded, setLightboxImageLoaded] = useState(false)

  function goToPage(page) {
    setCurrentPage(page)
    setSelectedAlbum(null)
  }

  function openLightbox(photos, index) {
    setLightbox({ photos, index })
    setLightboxImageLoaded(false)
  }

  function closeLightbox() {
    setLightbox(null)
    setLightboxImageLoaded(false)
  }

  function lightboxNext() {
    setLightboxImageLoaded(false)
    setLightbox(lb => ({ ...lb, index: (lb.index + 1) % lb.photos.length }))
  }

  function lightboxPrev() {
    setLightboxImageLoaded(false)
    setLightbox(lb => ({ ...lb, index: (lb.index - 1 + lb.photos.length) % lb.photos.length }))
  }

  useEffect(() => {
    if (!lightbox) return
    function handleKey(e) {
      if (e.key === 'ArrowRight') lightboxNext()
      else if (e.key === 'ArrowLeft') lightboxPrev()
      else if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox])

  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/photo-cache-sw.js').catch(() => {})
    }

    const idleId = window.requestIdleCallback?.(() => {
      albumCoverPhotos.map(displayPhoto).forEach(preloadImage)
    }, { timeout: 2500 })
    const timeoutId = idleId ? null : window.setTimeout(() => {
      albumCoverPhotos.map(displayPhoto).forEach(preloadImage)
    }, 1200)

    return () => {
      if (idleId) window.cancelIdleCallback?.(idleId)
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (!selectedAlbum) return

    const preload = () => {
      selectedAlbum.columns.flat().map(displayPhoto).forEach(preloadImage)
    }
    const idleId = window.requestIdleCallback?.(preload, { timeout: 500 })
    const timeoutId = idleId ? null : window.setTimeout(preload, 150)

    return () => {
      if (idleId) window.cancelIdleCallback?.(idleId)
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [selectedAlbum])

  useEffect(() => {
    if (!lightbox) return

    const previousIndex = (lightbox.index - 1 + lightbox.photos.length) % lightbox.photos.length
    const nextIndex = (lightbox.index + 1) % lightbox.photos.length
    preloadImage(lightbox.photos[previousIndex])
    preloadImage(lightbox.photos[nextIndex])
  }, [lightbox])

  return (
    <div className="app">
      <header className="header">
        <div className="header-container">
          <h1 className="site-title" onClick={() => goToPage('works')}>Mithani Photography</h1>
          <div className="header-right">
            <nav className="main-nav">
              <button
                className={`nav-link ${currentPage === 'works' ? 'active' : ''}`}
                onClick={() => goToPage('works')}
              >
                Work
              </button>
              <button
                className={`nav-link ${currentPage === 'albums' ? 'active' : ''}`}
                onClick={() => goToPage('albums')}
              >
                Albums
              </button>
              <button
                className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
                onClick={() => goToPage('about')}
              >
                About
              </button>
              <button
                className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`}
                onClick={() => goToPage('contact')}
              >
                Contact
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="main-content">
        {currentPage === 'works' && (
          <section className="works-section">
            <div className="bento-grid">
              {bentoColumns.map((col, colIdx) => (
                <div key={colIdx} className="bento-col">
                  {col.map((photo) => (
                    <div
                      key={photo.id}
                      className="bento-item"
                      onClick={() => openLightbox(workPhotos, workPhotos.indexOf(photo.src))}
                    >
                      <GalleryImage
                        src={displayPhoto(photo.src)}
                        alt={photo.alt}
                        loading={photo.id <= 3 ? 'eager' : 'lazy'}
                        decoding="async"
                        fetchPriority={photo.id <= 3 ? 'high' : 'auto'}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        {currentPage === 'albums' && (
          <section className="albums-section">
            {!selectedAlbum ? (
              <div className="albums-grid">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="album-card"
                    onClick={() => setSelectedAlbum(album)}
                  >
                    <div className="album-preview">
                      <GalleryImage
                        src={displayPhoto(album.cover)}
                        alt={album.title}
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        style={{ objectPosition: album.coverPosition || 'center 20%' }}
                      />
                      <div className="album-info">
                        <h3>{album.title}</h3>
                        <span>{album.year}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="album-view">
                <button className="back-button" onClick={() => setSelectedAlbum(null)}>
                  ← Back
                </button>
                <div className="album-view-header">
                  <h2>{selectedAlbum.title}</h2>
                  <span className="album-year">{selectedAlbum.year}</span>
                </div>
                <div className="album-bento-grid">
                  {selectedAlbum.columns.map((col, colIdx) => {
                    const albumPhotos = selectedAlbum.columns.flat()
                    return (
                      <div key={colIdx} className="bento-col">
                        {col.map((img, idx) => (
                          <div
                            key={idx}
                            className="bento-item"
                            onClick={() => openLightbox(albumPhotos, albumPhotos.indexOf(img))}
                          >
                            <GalleryImage src={displayPhoto(img)} alt={`${selectedAlbum.title} ${idx + 1}`} loading="lazy" decoding="async" />
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {currentPage === 'about' && (
          <section className="about-section">
            <div className="about-photo">
              <GalleryImage
                src={displayPhoto(aboutPhoto)}
                alt="Photographer portrait"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about-bio">
              <h2>Muhammad Mithani</h2>
              <p>
                I'm a Chicago-based photographer drawn to the honesty of raw, unedited
                images. My work focuses on capturing the true colors of the world as
                they naturally exist—unfiltered and real. I'm especially passionate
                about animal, landscape, and portrait photography, where I can preserve
                genuine moments and authentic emotion in every frame.
              </p>
            </div>
          </section>
        )}

        {currentPage === 'contact' && (
          <section className="contact-section">
            <p className="contact-intro">Get in touch</p>
            <a href="mailto:mmithani2330@gmail.com" className="contact-email">
              mmithani2330@gmail.com
            </a>
            <a href="https://www.instagram.com/lenzofmo1/" target="_blank" rel="noopener noreferrer" className="contact-instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
            </a>
          </section>
        )}
      </main>

      {lightbox && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>✕</button>
          <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); lightboxPrev() }}>‹</button>
          <div
            className={`lightbox-content ${lightboxImageLoaded ? 'loaded' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={lightbox.photos[lightbox.index]}
              src={lightbox.photos[lightbox.index]}
              alt=""
              decoding="async"
              onLoad={() => setLightboxImageLoaded(true)}
            />
          </div>
          <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); lightboxNext() }}>›</button>
          <div className="lightbox-counter">{lightbox.index + 1} / {lightbox.photos.length}</div>
        </div>
      )}
    </div>
  )
}

export default App
