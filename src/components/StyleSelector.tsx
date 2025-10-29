import { useState, useEffect } from 'react'
import { filesystemService } from '../services/filesystem'
import type { Style } from '../types'

interface StyleSelectorProps {
  projectId: string
  currentStyle?: string
  onStyleSelect: (styleId: string, referenceAudioUrl?: string) => void
}

export function StyleSelector({ projectId, currentStyle, onStyleSelect }: StyleSelectorProps) {
  const [styles, setStyles] = useState<Style[]>([])
  const [selectedStyle, setSelectedStyle] = useState<string>(currentStyle || '')
  const [customAudioUrl, setCustomAudioUrl] = useState('')
  const [isUploadMode, setIsUploadMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStyles()
  }, [])

  const loadStyles = async () => {
    try {
      setLoading(true)
      const styleList = await filesystemService.listStyles()
      setStyles(styleList)
      setError(null)
    } catch (err) {
      console.log('No styles found:', err)
      setStyles([])
    } finally {
      setLoading(false)
    }
  }

  const handleStyleSelect = (styleId: string, audioUrl?: string) => {
    setSelectedStyle(styleId)
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

    handleStyleSelect('custom', customAudioUrl)
    setError(null)
  }

  return (
    <div style={{
      backgroundColor: '#2a2a2a',
      borderRadius: '8px',
      border: '1px solid #444',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px 20px',
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>🎸 Style Selection</h3>
        <button
          onClick={() => setIsUploadMode(!isUploadMode)}
          style={{
            padding: '8px 16px',
            backgroundColor: isUploadMode ? '#666' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {isUploadMode ? '← Back to Styles' : '🎵 Custom Reference'}
        </button>
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
        {isUploadMode ? (
          // Custom Reference Audio Mode
          <div>
            <p style={{ color: '#999', marginBottom: '15px', fontSize: '14px' }}>
              Provide a URL to a reference audio file that captures the style you want. 
              Suno will analyze and remix your lyrics in this style.
            </p>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px' }}>
                Reference Audio URL:
              </label>
              <input
                type="text"
                value={customAudioUrl}
                onChange={(e) => setCustomAudioUrl(e.target.value)}
                placeholder="https://example.com/reference-audio.mp3"
                style={{
                  width: '100%',
                  padding: '10px',
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
                padding: '10px 20px',
                backgroundColor: customAudioUrl.trim() ? '#FF9800' : '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: customAudioUrl.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                width: '100%'
              }}
            >
              Use This Reference Audio
            </button>

            <div style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#1a1a1a',
              borderRadius: '4px',
              border: '1px solid #444'
            }}>
              <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>
                💡 <strong>Tip:</strong> The reference audio should be a clear example of the musical 
                style you want. Suno will analyze the instrumental patterns, vocals, and production 
                style to create your corrido.
              </p>
            </div>
          </div>
        ) : loading ? (
          // Loading State
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Loading styles...
          </div>
        ) : styles.length === 0 ? (
          // Empty State
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
              No preset styles available
            </p>
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>
              The <code style={{ backgroundColor: '#1a1a1a', padding: '2px 6px', borderRadius: '3px' }}>
                data/styles/
              </code> directory is empty.
            </p>
            <button
              onClick={() => setIsUploadMode(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Use Custom Reference Audio
            </button>
          </div>
        ) : (
          // Style Grid
          <div>
            <p style={{ color: '#999', marginBottom: '15px', fontSize: '14px' }}>
              Select a musical style for your corrido:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              {styles.map((style) => (
                <div
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id, style.referenceAudio)}
                  style={{
                    padding: '20px',
                    backgroundColor: selectedStyle === style.id ? '#4CAF50' : '#1a1a1a',
                    border: `2px solid ${selectedStyle === style.id ? '#4CAF50' : '#444'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedStyle !== style.id) {
                      e.currentTarget.style.borderColor = '#666'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedStyle !== style.id) {
                      e.currentTarget.style.borderColor = '#444'
                    }
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                    🎵
                  </div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
                    {style.name}
                  </h4>
                  {style.description && (
                    <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
                      {style.description}
                    </p>
                  )}
                  {selectedStyle === style.id && (
                    <div style={{
                      marginTop: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      ✓ Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      {!isUploadMode && styles.length > 0 && (
        <div style={{
          margin: '0 20px 20px 20px',
          padding: '12px',
          backgroundColor: '#1a1a1a',
          borderRadius: '4px',
          border: '1px solid #444'
        }}>
          <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>
            ℹ️ These styles use pre-configured reference audio to guide the musical generation. 
            Want something different? Click "Custom Reference" above.
          </p>
        </div>
      )}
    </div>
  )
}
