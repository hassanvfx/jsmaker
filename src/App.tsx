import { useState, useEffect } from 'react'
import { filesystemService } from './services/filesystem'
import type { Project } from './types'
import { LyricEditor } from './components/LyricEditor'
import { StyleSelector } from './components/StyleSelector'
import { GenerationControl } from './components/GenerationControl'
import { AudioPlayer } from './components/AudioPlayer'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Project editor state
  const [enhancedLyrics, setEnhancedLyrics] = useState('')
  const [referenceAudioUrl, setReferenceAudioUrl] = useState<string | undefined>()
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | undefined>()
  const [generatedSunoId, setGeneratedSunoId] = useState<string | undefined>()

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    // Load project data when selected
    if (selectedProject) {
      loadProjectData(selectedProject.id)
    }
  }, [selectedProject?.id])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const projectList = await filesystemService.listProjects()
      setProjects(projectList)
      setError(null)
    } catch (err) {
      setError('Failed to load projects: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const loadProjectData = async (projectId: string) => {
    try {
      const projectData = await filesystemService.getProject(projectId)
      if (projectData.enhancedLyrics) {
        setEnhancedLyrics(projectData.enhancedLyrics)
      }
    } catch (err) {
      console.error('Failed to load project data:', err)
    }
  }

  const createNewProject = async () => {
    try {
      const project = await filesystemService.createProject({
        name: 'New Corrido Project',
        style: 'corrido'
      })
      setProjects([...projects, project])
      setSelectedProject(project)
    } catch (err) {
      setError('Failed to create project: ' + (err as Error).message)
    }
  }

  const handleStyleSelect = (styleId: string, audioUrl?: string) => {
    setReferenceAudioUrl(audioUrl)
  }

  const handleGenerationComplete = (audioUrl: string, sunoId: string) => {
    setGeneratedAudioUrl(audioUrl)
    setGeneratedSunoId(sunoId)
  }

  const handleBackToProjects = () => {
    setSelectedProject(null)
    setEnhancedLyrics('')
    setReferenceAudioUrl(undefined)
    setGeneratedAudioUrl(undefined)
    setGeneratedSunoId(undefined)
    loadProjects() // Refresh project list
  }

  // Project Editor View
  if (selectedProject) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <header style={{
          marginBottom: '30px',
          borderBottom: '2px solid #333',
          paddingBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '28px', margin: '0 0 8px 0' }}>
                {selectedProject.name}
              </h1>
              <p style={{ color: '#999', margin: 0, fontSize: '14px' }}>
                {selectedProject.style} • Created {new Date(selectedProject.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handleBackToProjects}
              style={{
                padding: '10px 20px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← Back to Projects
            </button>
          </div>
        </header>

        <main style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          maxWidth: '1800px',
          margin: '0 auto'
        }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <LyricEditor 
              project={selectedProject}
              onLyricsChange={(lyrics) => {
                setEnhancedLyrics(lyrics)
              }}
            />
            
            <StyleSelector
              projectId={selectedProject.id}
              currentStyle={selectedProject.style}
              onStyleSelect={handleStyleSelect}
            />
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <GenerationControl
              project={selectedProject}
              enhancedLyrics={enhancedLyrics}
              referenceAudioUrl={referenceAudioUrl}
              onGenerationComplete={handleGenerationComplete}
            />
            
            <AudioPlayer
              project={selectedProject}
              currentAudioUrl={generatedAudioUrl}
              currentSunoId={generatedSunoId}
            />
          </div>
        </main>
      </div>
    )
  }

  // Project List View
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{
        marginBottom: '40px',
        borderBottom: '2px solid #333',
        paddingBottom: '20px'
      }}>
        <h1 style={{ fontSize: '32px', margin: 0 }}>
          🎵 SunoMaker
        </h1>
        <p style={{ color: '#999', marginTop: '8px' }}>
          Adaptive AI Remixing System for Corrido Production
        </p>
      </header>

      <main>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '24px', margin: 0 }}>Projects</h2>
          <button
            onClick={createNewProject}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            + New Project
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ff4444',
            color: 'white',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            border: '2px dashed #444'
          }}>
            <p style={{ fontSize: '18px', color: '#999', marginBottom: '20px' }}>
              No projects yet. Create your first corrido!
            </p>
            <button
              onClick={createNewProject}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                style={{
                  backgroundColor: '#2a2a2a',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #444',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#4CAF50'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#444'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>
                  {project.name}
                </h3>
                <p style={{ color: '#999', fontSize: '14px', margin: '5px 0' }}>
                  Style: {project.style}
                </p>
                <p style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  )
}

export default App
