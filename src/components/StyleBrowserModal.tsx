import { useState, useEffect } from 'react'

interface Track {
  id: string
  filename: string
  title: string
  style: string
  artist: string | null
  subgenre: string | null
  url: string
}

interface Category {
  name: string
  emoji: string
  description: string
  tracks: Track[]
}

interface Catalog {
  version: string
  totalTracks: number
  categories: Record<string, Category>
}

interface StyleBrowserModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string, track: Track) => void
}

export function StyleBrowserModal({ isOpen, onClose, onSelect }: StyleBrowserModalProps) {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [activeTab, setActiveTab] = useState('norteno')
  const [searchTerm, setSearchTerm] = useState('')
  const [playingTrack, setPlayingTrack] = useState<string | null>(null)

  useEffect(() => {
    // Load catalog
    fetch('/data/styles/catalog.json')
      .then(res => res.json())
      .then(data => setCatalog(data))
      .catch(err => console.error('Failed to load catalog:', err))
  }, [])

  if (!isOpen || !catalog) return null

  // Filter tracks based on search and active tab
  const activeCategory = catalog.categories[activeTab]
  const filteredTracks = activeCategory?.tracks.filter(track => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      track.title.toLowerCase().includes(search) ||
      track.artist?.toLowerCase().includes(search) ||
      track.style.toLowerCase().includes(search)
    )
  }) || []

  const handlePlay = (trackId: string) => {
    setPlayingTrack(playingTrack === trackId ? null : trackId)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #444',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>
            🎵 Browse Reference Audio
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px 10px'
            }}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '20px', borderBottom: '1px solid #444' }}>
          <input
            type="text"
            placeholder="🔍 Search tracks, artists, styles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '5px',
          padding: '15px 20px',
          borderBottom: '1px solid #444',
          overflowX: 'auto'
        }}>
          {Object.entries(catalog.categories).map(([id, category]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === id ? '#4CAF50' : '#2a2a2a',
                color: activeTab === id ? '#fff' : '#ccc',
                border: `1px solid ${activeTab === id ? '#4CAF50' : '#444'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === id ? 'bold' : 'normal',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {category.emoji} {category.name} ({category.tracks.length})
            </button>
          ))}
        </div>

        {/* Track Grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '15px',
          alignContent: 'start'
        }}>
          {filteredTracks.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '40px',
              color: '#666'
            }}>
              No tracks found matching "{searchTerm}"
            </div>
          ) : (
            filteredTracks.map(track => (
              <div
                key={track.id}
                style={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  padding: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Track Info */}
                <div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    color: '#fff'
                  }}>
                    {activeCategory.emoji} {track.title}
                  </div>
                  {track.artist && (
                    <div style={{ fontSize: '13px', color: '#999' }}>
                      {track.artist}
                    </div>
                  )}
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    marginTop: '5px'
                  }}>
                    {track.style}
                    {track.subgenre && ` • ${track.subgenre}`}
                  </div>
                </div>

                {/* Audio Preview */}
                {playingTrack === track.id && (
                  <audio
                    src={track.url}
                    controls
                    autoPlay
                    style={{ width: '100%', height: '30px' }}
                    onEnded={() => setPlayingTrack(null)}
                  />
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handlePlay(track.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: playingTrack === track.id ? '#FF9800' : '#444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {playingTrack === track.id ? '⏸️ Stop' : '▶️ Preview'}
                  </button>
                  <button
                    onClick={() => onSelect(track.url, track)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#4CAF50',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    ✓ Select
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '15px 20px',
          borderTop: '1px solid #444',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          color: '#666'
        }}>
          <div>
            {filteredTracks.length} of {catalog.totalTracks} tracks
          </div>
          <div>
            {activeCategory.description}
          </div>
        </div>
      </div>
    </div>
  )
}
