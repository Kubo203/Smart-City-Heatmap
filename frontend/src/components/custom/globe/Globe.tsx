import { useEffect, useRef } from "react"
import Globe, { type GlobeMethods } from "react-globe.gl"
import * as THREE from "three"
import cloudsImage from "./clouds.png"

interface GlobeProps {
  containerId?: string
}

function GlobeVisualization({ 
  containerId = "globe-container"
}: GlobeProps) {
  const globeEl = useRef<GlobeMethods>(undefined)
  const cloudsRotationRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!globeEl.current || !containerRef.current) return

    const globe = globeEl.current
    const container = containerRef.current

    // Function to check if container is visible and has dimensions
    const isContainerReady = () => {
      if (!container) return false
      const rect = container.getBoundingClientRect()
      // Check if container has valid dimensions (getBoundingClientRect accounts for parent visibility)
      return rect.width > 0 && rect.height > 0
    }

    // Function to update renderer and camera size
    const updateRendererSize = () => {
      if (!isContainerReady()) return
      
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      
      if (containerWidth > 0 && containerHeight > 0) {
        const renderer = globe.renderer()
        if (renderer) {
          // Get device pixel ratio for high-DPI displays
          const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
          
          // Set renderer size - this updates both canvas size and resolution
          renderer.setSize(containerWidth, containerHeight, true)
          renderer.setPixelRatio(pixelRatio)
          
          // Update camera aspect ratio
          const camera = globe.camera()
          if (camera && camera instanceof THREE.PerspectiveCamera) {
            camera.aspect = containerWidth / containerHeight
            camera.updateProjectionMatrix()
            
            // Force a render to ensure the canvas is updated
            renderer.render(globe.scene(), camera)
          }
        }
      }
    }

    // Function to adjust camera based on container size
    const adjustCamera = () => {
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      const minDimension = Math.min(containerWidth, containerHeight)
      
      // Skip if container has no dimensions
      if (minDimension <= 0) return
      
      // Calculate altitude based on container size
      // Smaller container = higher altitude (further away)
      // Base altitude of 2.5, adjust based on size
      const baseAltitude = 2.5
      const sizeFactor = 800 // Reference size
      const altitude = baseAltitude + (sizeFactor / minDimension) * 1.5
      
      // Get current point of view to preserve rotation
      const currentPov = globe.pointOfView()
      globe.pointOfView(
        {
          lat: currentPov.lat || 0,
          lng: currentPov.lng || 0,
          altitude: Math.max(altitude, 2.0), // Minimum altitude of 2.0
        },
        0
      )
    }

    // Initial setup - wait for container to be properly sized and visible
    let retryCount = 0
    const maxRetries = 50 // Maximum 5 seconds of retries (50 * 100ms)
    const initializeGlobe = () => {
      if (!isContainerReady()) {
        retryCount++
        if (retryCount < maxRetries) {
          // Retry if container is not ready yet
          setTimeout(initializeGlobe, 100)
        }
        return
      }
      updateRendererSize()
      adjustCamera()
    }
    
    const initTimeout = setTimeout(initializeGlobe, 100)

    // Auto-rotate
    globe.controls().autoRotate = true
    globe.controls().autoRotateSpeed = 0.55

    // Add clouds sphere using local image
    const CLOUDS_ALT = 0.015
    const CLOUDS_ROTATION_SPEED = -0.006 // deg/frame

    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(
      cloudsImage,
      (cloudsTexture: THREE.Texture) => {
        const clouds = new THREE.Mesh(
          new THREE.SphereGeometry(
            globe.getGlobeRadius() * (1 + CLOUDS_ALT),
            75,
            75
          ),
          new THREE.MeshPhongMaterial({
            map: cloudsTexture,
            transparent: true,
          })
        )
        globe.scene().add(clouds)

        const rotateClouds = () => {
          clouds.rotation.y += (CLOUDS_ROTATION_SPEED * Math.PI) / 180
          cloudsRotationRef.current = requestAnimationFrame(rotateClouds)
        }
        rotateClouds()
      },
      undefined,
      (error: unknown) => {
        console.debug("Clouds texture not loaded:", error)
      }
    )

    // Handle window resize with debouncing
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null
    const handleResize = () => {
      if (!globeEl.current || !containerRef.current) return
      
      // Skip if container is not ready
      if (!isContainerReady()) return
      
      // Clear existing timeout
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      
      // Debounce resize to avoid too many calls
      resizeTimeout = setTimeout(() => {
        updateRendererSize()
        adjustCamera()
      }, 150)
    }
    
    window.addEventListener("resize", handleResize)
    // Also use ResizeObserver for more accurate container size tracking
    const resizeObserver = new ResizeObserver((entries) => {
      // Only handle resize if container is visible
      for (const entry of entries) {
        if (entry.target === container && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          handleResize()
        }
      }
    })
    resizeObserver.observe(container)

    // Use IntersectionObserver to detect when container becomes visible
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            // Container is now visible, ensure globe is properly sized
            setTimeout(() => {
              updateRendererSize()
              adjustCamera()
            }, 50)
          }
        }
      },
      { threshold: 0.01 }
    )
    intersectionObserver.observe(container)

    return () => {
      clearTimeout(initTimeout)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      window.removeEventListener("resize", handleResize)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      if (cloudsRotationRef.current) {
        cancelAnimationFrame(cloudsRotationRef.current)
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="h-full w-full overflow-hidden" 
      id={containerId}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100%',
        position: 'relative',
      }}
    >
      <Globe
        ref={globeEl}
        animateIn={false}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere={true}
        atmosphereColor="#f6e9f7"
        atmosphereAltitude={0.15}
        enablePointerInteraction={false}
      />
    </div>
  )
}

export default GlobeVisualization

