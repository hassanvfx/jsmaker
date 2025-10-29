import { useState } from 'react'
import { sunoService } from '../services/suno'
import { filesystemService } from '../services/filesystem'
import type { Project } from '../types'

interface GenerationControlProps {
  project: Project
  enhancedLyrics: string
  referenceAudioUrl?: string
  onGenerationComplete: (audioUrl: string, sunoId: string) => void
}

type GenerationMode = 'custom' | 'remix'

export function GenerationControl({
  project,
  enhancedLyrics,
  referenceAudioUrl,
  onGenerationComplete
}: GenerationControlProps) {
  const [mode, setMode] = useState<GenerationMode>('custom')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)

  const canGenerate = enhancedLyrics.trim().length > 0
  const canUseRemix = referenceAudioUrl && referenceAudioUrl.trim().length > 0

  const handleGenerate = async () => {
    console.log('🎵 Generation started', {
      mode,
      hasEnhancedLyrics: !!enhancedLyrics,
      enhancedLyricsLength: enhancedLyrics.length,
      hasReferenceAudio: !!referenceAudioUrl,
      projectName: project.name
    })

    if (!canGenerate) {
      setError('Please enhance your lyrics first')
      console.error('❌ Generation blocked: No enhanced lyrics')
      return
    }

    if (mode === 'remix' && !canUseRemix) {
      setError('Please select a style with reference audio or provide a custom reference URL')
      console.error('❌ Generation blocked: Remix mode but no reference audio')
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress('Starting generation...')

    try {
      let sunoId: string

      if (mode === 'custom') {
        // Custom mode: Just lyrics, no reference audio
        setProgress('Generating music from lyrics...')
        console.log('🎼 Calling Suno generateMusic API...')
        sunoId = await sunoService.generateMusic({
          title: project.name,
          prompt: enhancedLyrics,
          style: `Regional Mexican corrido, ${project.style || 'traditional style'}`,
          customMode: true,
          instrumental: false
        })
        console.log('✅ Suno responded with task ID:', sunoId)
      } else {
        // Remix mode: With reference audio
        setProgress('Creating remix with reference audio...')
        console.log('🎸 Calling Suno uploadAndCover API with reference:', referenceAudioUrl)
        if (!referenceAudioUrl) {
          throw new Error('Reference audio URL is required for remix mode')
        }
        sunoId = await sunoService.uploadAndCover({
          uploadUrl: referenceAudioUrl,
          title: project.name,
          prompt: enhancedLyrics,
          style: `Regional Mexican corrido, ${project.style || 'traditional style'}`,
          customMode: true,
          instrumental: false
        })
        console.log('✅ Suno responded with task ID:', sunoId)
      }

      // Poll for completion - with progressive audio delivery
      setProgress(`Waiting for Suno to complete generation (ID: ${sunoId})...`)
      console.log('⏳ Polling Suno API for completion...')
      
      let streamingAudioDelivered = false
      let finalAudioUrl: string | null = null
      
      // Custom polling loop to deliver streaming audio first
      for (let attempt = 0; attempt < 60; attempt++) {
        const details = await sunoService.getMusicDetails(sunoId)
        console.log(`Polling attempt ${attempt + 1}: status=${details.status}`)
        
        // Check for streaming audio at TEXT_SUCCESS (lyrics done, audio streaming)
        if (!streamingAudioDelivered && 
            (details.status === 'TEXT_SUCCESS' || details.status === 'FIRST_SUCCESS' || details.status === 'SUCCESS')) {
          const streamAudioUrl = details.response?.sunoData?.[0]?.streamAudioUrl
          if (streamAudioUrl) {
            console.log('🎵 Streaming audio available!', streamAudioUrl)
            setProgress('🎵 Audio streaming ready! Playing while final version processes...')
            
            // Deliver streaming audio immediately
            await filesystemService.saveGeneration(project.id, {
              sunoId,
              status: 'streaming',
              audioUrl: streamAudioUrl,
              mode,
              referenceAudioUrl: mode === 'remix' ? referenceAudioUrl : undefined,
              lyrics: enhancedLyrics
            })
            
            onGenerationComplete(streamAudioUrl, sunoId)
            streamingAudioDelivered = true
            console.log('✅ Streaming audio delivered to UI')
          }
        }
        
        // Check for final audio at SUCCESS (final high-quality audio ready)
        if (details.status === 'SUCCESS') {
          finalAudioUrl = details.response?.sunoData?.[0]?.audioUrl || details.response?.sunoData?.[0]?.streamAudioUrl
          if (finalAudioUrl) {
            console.log('✅ Final audio ready!', finalAudioUrl)
            setProgress('✨ Final high-quality audio ready!')
            
            // Update with final audio
            await filesystemService.saveGeneration(project.id, {
              sunoId,
              status: 'completed',
              audioUrl: finalAudioUrl,
              mode,
              referenceAudioUrl: mode === 'remix' ? referenceAudioUrl : undefined,
              lyrics: enhancedLyrics
            })
            
            // If we already delivered streaming audio, update it
            if (streamingAudioDelivered && finalAudioUrl !== details.response?.sunoData?.[0]?.streamAudioUrl) {
              console.log('🔄 Updating UI with final audio URL')
              onGenerationComplete(finalAudioUrl, sunoId)
            } else if (!streamingAudioDelivered) {
              // Edge case: went straight to SUCCESS without TEXT_SUCCESS
              onGenerationComplete(finalAudioUrl, sunoId)
            }
            
            break
          }
        }
        
        // Check for errors
        if (details.status.includes('FAILED') || details.status.includes('ERROR')) {
          throw new Error(`Generation failed with status: ${details.status}`)
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
      
      // Verify we got some audio
      if (!streamingAudioDelivered && !finalAudioUrl) {
        throw new Error('Generation timeout: no audio URL received after 5 minutes')
      }

      setProgress('Generation complete!')
      
      // Clear progress after a delay
      setTimeout(() => {
        setProgress('')
        setIsGenerating(false)
      }, 2000)
    } catch (err) {
      console.error('❌ Generation failed:', err)
      setError('Generation failed: ' + (err as Error).message)
      setIsGenerating(false)
      setProgress('')
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
        borderBottom: '1px solid #444'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>🎼 Generate Music</h3>
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

      {/* Progress Message */}
      {progress && (
        <div style={{
          margin: '15px',
          padding: '12px',
          backgroundColor: '#2196F3',
          color: 'white',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {progress}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* Mode Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', color: '#ccc', fontSize: '14px' }}>
            Generation Mode:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setMode('custom')}
              disabled={isGenerating}
              style={{
                flex: 1,
                padding: '15px',
                backgroundColor: mode === 'custom' ? '#4CAF50' : '#1a1a1a',
                color: mode === 'custom' ? '#fff' : '#999',
                border: `2px solid ${mode === 'custom' ? '#4CAF50' : '#444'}`,
                borderRadius: '8px',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>📝</div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Custom</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                Generate from lyrics only
              </div>
            </button>
            <button
              onClick={() => setMode('remix')}
              disabled={isGenerating || !canUseRemix}
              style={{
                flex: 1,
                padding: '15px',
                backgroundColor: mode === 'remix' ? '#FF9800' : '#1a1a1a',
                color: mode === 'remix' ? '#fff' : canUseRemix ? '#999' : '#666',
                border: `2px solid ${mode === 'remix' ? '#FF9800' : '#444'}`,
                borderRadius: '8px',
                cursor: isGenerating || !canUseRemix ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s',
                opacity: canUseRemix ? 1 : 0.5
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>🎸</div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Remix</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {canUseRemix ? 'Use reference audio' : 'No reference audio'}
              </div>
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          padding: '12px',
          backgroundColor: '#1a1a1a',
          borderRadius: '4px',
          border: '1px solid #444',
          marginBottom: '20px'
        }}>
          <p style={{ margin: '0 0 8px 0', color: '#ccc', fontSize: '13px', fontWeight: 'bold' }}>
            {mode === 'custom' ? 'Custom Mode' : 'Remix Mode'}
          </p>
          <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>
            {mode === 'custom' 
              ? 'Suno will generate original music based on your enhanced lyrics and the style description.'
              : 'Suno will analyze your reference audio and create a new track with the same musical style, using your enhanced lyrics.'}
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !canGenerate || (mode === 'remix' && !canUseRemix)}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: isGenerating 
              ? '#666' 
              : canGenerate && (mode === 'custom' || canUseRemix)
                ? '#4CAF50'
                : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isGenerating || !canGenerate || (mode === 'remix' && !canUseRemix)
              ? 'not-allowed'
              : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            opacity: isGenerating || !canGenerate || (mode === 'remix' && !canUseRemix) ? 0.6 : 1
          }}
        >
          {isGenerating ? '⏳ Generating...' : '🚀 Generate Music'}
        </button>

        {/* Warning Messages */}
        {!canGenerate && (
          <div style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: '#ff9800',
            color: '#fff',
            borderRadius: '4px',
            fontSize: '13px'
          }}>
            ⚠️ Please enhance your lyrics with GPT first
          </div>
        )}
        {mode === 'remix' && !canUseRemix && (
          <div style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: '#ff9800',
            color: '#fff',
            borderRadius: '4px',
            fontSize: '13px'
          }}>
            ⚠️ Please select a style with reference audio or provide a custom reference URL
          </div>
        )}
      </div>

      {/* Technical Details */}
      {!isGenerating && (
        <div style={{
          margin: '0 20px 20px 20px',
          padding: '12px',
          backgroundColor: '#1a1a1a',
          borderRadius: '4px',
          border: '1px solid #444'
        }}>
          <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
            💡 <strong>Note:</strong> Generation typically takes 1-2 minutes. 
            The system will poll Suno's API every 5 seconds until your corrido is ready.
          </p>
        </div>
      )}
    </div>
  )
}
