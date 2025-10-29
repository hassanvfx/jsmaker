import { useState } from 'react'
import { filesystemService } from '../services/filesystem'
import { StyleBrowserModal } from './StyleBrowserModal'

interface StyleSelectorProps {
  projectId: string
  currentStyle?: string
  onStyleSelect: (styleId: string, referenceAudioUrl?: string) => void
}

export function StyleSelector({ projectId, currentStyle, onStyleSelect }: StyleSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>(currentStyle || '')
  const [selectedTrackName, setSelectedTrackName] = useState<string>('')
  const [customAudioUrl, setCustomAudioUrl] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTrackSelect = (url: string, track: any) => {
    handleStyleSelect(track.id, url, track.title)
    setIsModalOpen(false)
  }

  const handleStyleSelect = (styleId: string, audioUrl?: string, trackName?: string) => {
    setSelectedStyle(styleId)
    if (trackName) {
      setSelectedTrackName(trackName)
    }
    onStyleSelect(styleId, audioUrl)
    
    // Update project style
    filesystemService.updateProject(projectId, { style: styleId }).catch(err => {
      console.error('Failed to update project style:', err)
    })
  }

  const handleCustomUrlSubmit = () => {
    if (!customAudioUrl.trim()) {
      setError('Please enter a valid audio URL')
      return
    }
    
    // Validate URL format
    try {
      new URL(customAudioUrl)
    } catch {
      setError('Invalid URL format')
      return
    }

    handleStyleSelect('custom', customAudioUrl, 'Custom Reference')
    setError(null)
    setIsCustomMode(false)
  }

  return (
    <>
      <div style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '8px',
        border: '1px solid #444',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #444'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>🎸 Style Selection</h3>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            margin: '15px',
            padding: '12px',
            backgroundColor: '#ff4444',
            color: 'white',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {isCustomMode ? (
            // Custom URL Mode
            <div>
              <div style={{ marginBottom: '15px' }}>
                <button
                  onClick={() => setIsCustomMode(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginBottom: '15px'
                  }}
                >
                  ← Back
                </button>
              </div>

              <p style={{ color: '#999', marginBottom: '15px', fontSize: '14px' }}>
                Provide a URL to your own reference audio file:
              </p>
              
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  value={customAudioUrl}
                  onChange={(e) => setCustomAudioUrl(e.target.value)}
                  placeholder="https://example.com/reference-audio.mp3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <button
                onClick={handleCustomUrlSubmit}
                disabled={!customAudioUrl.trim()}
                style={{
                  padding: '12px 20px',
                  backgroundColor: customAudioUrl.trim() ? '#4CAF50' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: customAudioUrl.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  width: '100%',
                  fontWeight: 'bold'
                }}
              >
                Use This Reference
              </button>
            </div>
          ) : (
            // Main Selection Mode
            <div>
              {/* Current Selection */}
              {selectedStyle && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#1a1a1a',
                  borderRadius: '4px',
                  border: '1px solid #4CAF50',
                  marginBottom: '20px'
                }}>
                  <div style={{ color: '#4CAF50', fontSize: '13px', marginBottom: '5px' }}>
                    ✓ Currently Selected:
                  </div>
                  <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
                    {selectedTrackName || selectedStyle}
                  </div>
                </div>
              )}

              {/* Browse Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                🔍 Browse 34 Reference Tracks
              </button>

              {/* Custom URL Button */}
              <button
                onClick={() => setIsCustomMode(true)}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🎵 Use Custom Reference URL
              </button>

              {/* Info */}
              <div style={{
                marginTop: '20px',
                padding: '12px',
                backgroundColor: '#1a1a1a',
                borderRadius: '4px',
                border: '1px solid #444'
              }}>
                <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>
                  💡 Browse organized tracks by style (Norteño, Banda, Tumbado, Trap, Rap) 
                  or provide your own reference URL
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <StyleBrowserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleTrackSelect}
      />
    </>
  )
}
