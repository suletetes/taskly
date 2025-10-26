import React, { useState } from 'react'

const SafeImage = ({ 
  src, 
  fallbackSrc = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/img/placeholder-user.png`,
  alt, 
  className = '',
  width,
  height,
  style = {},
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      console.warn(`Image failed to load: ${imageSrc}, using fallback: ${fallbackSrc}`)
      setImageSrc(fallbackSrc)
      setHasError(true)
    } else {
      console.error(`Both primary and fallback images failed to load for: ${alt}`)
      setIsLoading(false)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // If both images failed, show a placeholder div
  if (hasError && imageSrc === fallbackSrc && !isLoading) {
    return (
      <div
        className={`image-placeholder ${className}`}
        style={{
          width: width || '100%',
          height: height || '200px',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed #dee2e6',
          borderRadius: '8px',
          color: '#6c757d',
          fontSize: '14px',
          textAlign: 'center',
          ...style
        }}
        {...props}
      >
        <div>
          <i className="fa fa-image" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}></i>
          Image not available
        </div>
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div
          className="image-loading"
          style={{
            width: width || '100%',
            height: height || '200px',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1
          }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        style={{
          ...style,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </>
  )
}

export default SafeImage