import { useState, useEffect } from 'react'
import { filesystemService } from '../services/filesystem'
import type { Project } from '../types'

interface LyricEditorProps {
  project: Project
  onLyricsChange?: (lyrics: string) => void
}

export function LyricEditor({ project, onLyricsChange }: LyricEditorProps) {
  const [rawLyrics, setRawLyrics] = useState('')
  const [enhancedLyrics, setEnhancedLyrics] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'raw' | 'enhanced'>('raw')

  useEffect(() => {
    loadLyrics()
  }, [project.id])

  const loadLyrics = async () => {
    try {
      // Load full project data which includes lyrics
      const projectData = await filesystemService.getProject(project.id)
      
      if (projectData.rawLyrics) {
        setRawLyrics(projectData.rawLyrics)
      }
      
      if (projectData.enhancedLyrics) {
        setEnhancedLyrics(projectData.enhancedLyrics)
      }
    } catch (err) {
      console.log('No existing lyrics found:', err)
    }
  }

  const handleRawLyricsChange = (value: string) => {
    setRawLyrics(value)
    onLyricsChange?.(value)
  }

  const saveRawLyrics = async () => {
    try {
      await filesystemService.updateProject(project.id, { rawLyrics })
      setError(null)
      alert('Raw lyrics saved!')
    } catch (err) {
      setError('Failed to save lyrics: ' + (err as Error).message)
    }
  }

  const enhanceWithGPT = async () => {
    if (!rawLyrics.trim()) {
      setError('Please enter some lyrics first')
      return
    }

    setIsEnhancing(true)
    setError(null)

    try {
      // Load GPT prompt template
      const gptPrompt = await filesystemService.getGPTPrompt()
      
      // Call OpenAI service
      const { openaiService } = await import('../services/openai')
      const response = await openaiService.enhanceLyrics(rawLyrics, gptPrompt, project.style)
      
      // Extract just the enhanced lyrics text
      const enhancedText = response.enhancedLyrics
      setEnhancedLyrics(enhancedText)
      
      // Save enhanced lyrics
      await filesystemService.updateProject(project.id, { enhancedLyrics: enhancedText })
      
      // IMPORTANT: Notify parent component that enhanced lyrics are ready
      onLyricsChange?.(enhancedText)
      
      // Switch to enhanced tab to show result
      setActiveTab('enhanced')
    } catch (err) {
      setError('Failed to enhance lyrics: ' + (err as Error).message)
    } finally {
      setIsEnhancing(false)
    }
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
        <h3 style={{ margin: 0, fontSize: '18px' }}>📝 Lyrics Editor</h3>
        <button
          onClick={enhanceWithGPT}
          disabled={isEnhancing || !rawLyrics.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: isEnhancing ? '#666' : '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isEnhancing || !rawLyrics.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            opacity: isEnhancing || !rawLyrics.trim() ? 0.6 : 1
          }}
        >
          {isEnhancing ? '✨ Enhancing...' : '✨ Enhance with GPT'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #444',
        backgroundColor: '#1a1a1a'
      }}>
        <button
          onClick={() => setActiveTab('raw')}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: activeTab === 'raw' ? '#2a2a2a' : 'transparent',
            color: activeTab === 'raw' ? '#fff' : '#999',
            border: 'none',
            borderBottom: activeTab === 'raw' ? '2px solid #4CAF50' : 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'raw' ? 'bold' : 'normal'
          }}
        >
          Raw Lyrics
        </button>
        <button
          onClick={() => setActiveTab('enhanced')}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: activeTab === 'enhanced' ? '#2a2a2a' : 'transparent',
            color: activeTab === 'enhanced' ? '#fff' : '#999',
            border: 'none',
            borderBottom: activeTab === 'enhanced' ? '2px solid #9C27B0' : 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'enhanced' ? 'bold' : 'normal'
          }}
        >
          Enhanced Lyrics {enhancedLyrics && '✓'}
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

      {/* Content Area */}
      <div style={{ padding: '20px' }}>
        {activeTab === 'raw' ? (
          <div>
            <textarea
              value={rawLyrics}
              onChange={(e) => handleRawLyricsChange(e.target.value)}
              placeholder="Paste or write your corrido lyrics here...&#10;&#10;Example:&#10;En el rancho de mi padre&#10;Donde nací y crecí&#10;Entre caballos y ganado&#10;Mi historia va a seguir..."
              style={{
                width: '100%',
                minHeight: '400px',
                padding: '15px',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
                lineHeight: '1.6',
                resize: 'vertical'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '15px'
            }}>
              <span style={{ color: '#999', fontSize: '12px' }}>
                {rawLyrics.length} characters
              </span>
              <button
                onClick={saveRawLyrics}
                disabled={!rawLyrics.trim()}
                style={{
                  padding: '8px 20px',
                  backgroundColor: rawLyrics.trim() ? '#4CAF50' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: rawLyrics.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                💾 Save Raw Lyrics
              </button>
            </div>
          </div>
        ) : (
          <div>
            {enhancedLyrics ? (
              <div>
                <pre style={{
                  width: '100%',
                  minHeight: '400px',
                  padding: '15px',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflow: 'auto'
                }}>
                  {enhancedLyrics}
                </pre>
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  backgroundColor: '#1a1a1a',
                  borderRadius: '4px',
                  border: '1px solid #444'
                }}>
                  <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>
                    ℹ️ <strong>Enhanced with GPT</strong> - Includes Suno annotations ([Intro], [Verse], etc.) 
                    and phonetic hints for proper Spanish pronunciation.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#999'
              }}>
                <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                  No enhanced lyrics yet
                </p>
                <p style={{ fontSize: '14px' }}>
                  Write some raw lyrics and click "Enhance with GPT" to get started
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
