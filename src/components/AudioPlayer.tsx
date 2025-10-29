import { useState, useEffect, useRef } from 'react'
import { filesystemService } from '../services/filesystem'
import type { Project, Generation } from '../types'

interface AudioPlayerProps {
  project: Project
  currentAudioUrl?: string
  currentSunoId?: string
}

export function AudioPlayer({ project, currentAudioUrl, currentSunoId }: AudioPlayerProps) {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    loadGenerations()
  }, [project.id])

  useEffect(() => {
    // If a new audio URL is provided, add it to the list
    if (currentAudioUrl && currentSunoId) {
      const newGen: Generation = {
        attempt: generations.length + 1,
        timestamp: new Date().toISOString(),
        sunoId: currentSunoId,
        status: 'completed',
        audioUrl: currentAudioUrl
      }
      setGenerations([newGen, ...generations])
      setSelectedGeneration(newGen)
    }
  }, [currentAudioUrl, currentSunoId])

  const loadGenerations = async () => {
    try {
      const projectData = await filesystemService.getProject(project.id)
      if (projectData.generations && projectData.generations.length > 0) {
        setGenerations(projectData.generations.reverse()) // Most recent first
        setSelectedGeneration(projectData.generations[projectData.generations.length - 1])
      }
    } catch (err) {
      console.log('No generations found:', err)
    }
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleGenerationSelect = (gen: Generation) => {
    setSelectedGeneration(gen)
    setIsPlaying(false)
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
        borderBottom: '1px solid #444'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>🎧 Audio Player</h3>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {selectedGeneration && selectedGeneration.audioUrl ? (
          <div>
            {/* Main Player */}
            <div style={{
              padding: '20px',
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
              border: '1px solid #444',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <button
                  onClick={handlePlayPause}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.1s'
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                    {project.name}
                  </h4>
                  <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
                    Attempt #{selectedGeneration.attempt} • {formatDate(selectedGeneration.timestamp)}
                  </p>
                </div>
              </div>

              {/* Audio Element */}
              <audio
                ref={audioRef}
                src={selectedGeneration.audioUrl}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls
                style={{
                  width: '100%',
                  marginTop: '10px'
                }}
              />

              {/* Metadata */}
              <div style={{
                marginTop: '15px',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#999' }}>Suno ID: </span>
                  <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '12px' }}>
                    {selectedGeneration.sunoId}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#999' }}>Status: </span>
                  <span style={{
                    color: selectedGeneration.status === 'completed' ? '#4CAF50' : '#ff9800',
                    fontWeight: 'bold'
                  }}>
                    {selectedGeneration.status}
                  </span>
                </div>
              </div>

              {/* Download Link */}
              <a
                href={selectedGeneration.audioUrl}
                download={`${project.name}-attempt-${selectedGeneration.attempt}.mp3`}
                style={{
                  display: 'block',
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  textAlign: 'center',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ⬇️ Download Audio
              </a>
            </div>

            {/* Generation History */}
            {generations.length > 1 && (
              <div>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#ccc' }}>
                  Generation History ({generations.length} attempts)
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {generations.map((gen) => (
                    <div
                      key={gen.attempt}
                      onClick={() => handleGenerationSelect(gen)}
                      style={{
                        padding: '15px',
                        backgroundColor: selectedGeneration?.attempt === gen.attempt ? '#4CAF50' : '#1a1a1a',
                        border: `1px solid ${selectedGeneration?.attempt === gen.attempt ? '#4CAF50' : '#444'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedGeneration?.attempt !== gen.attempt) {
                          e.currentTarget.style.borderColor = '#666'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedGeneration?.attempt !== gen.attempt) {
                          e.currentTarget.style.borderColor = '#444'
                        }
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '3px' }}>
                            Attempt #{gen.attempt}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {formatDate(gen.timestamp)}
                          </div>
                        </div>
                        {selectedGeneration?.attempt === gen.attempt && (
                          <div style={{ fontSize: '20px' }}>▶️</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Empty State
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎵</div>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
              No audio generated yet
            </p>
            <p style={{ fontSize: '14px' }}>
              Generate your first corrido to see it here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
