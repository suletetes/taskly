import React from 'react'

// Base skeleton component
const Skeleton = ({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = '4px',
  className = '',
  animated = true 
}) => {
  const style = {
    width,
    height,
    borderRadius
  }

  const skeletonClass = [
    'skeleton',
    animated && 'skeleton-animated',
    className
  ].filter(Boolean).join(' ')

  return <div className={skeletonClass} style={style} />
}

// Text skeleton
export const SkeletonText = ({ 
  lines = 1, 
  width = '100%',
  className = '' 
}) => {
  if (lines === 1) {
    return <Skeleton width={width} height="1rem" className={className} />
  }

  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '75%' : '100%'}
          height="1rem"
          className="skeleton-text-line"
        />
      ))}
    </div>
  )
}

// Avatar skeleton
export const SkeletonAvatar = ({ 
  size = 'medium',
  shape = 'circle',
  className = '' 
}) => {
  const sizeMap = {
    small: '32px',
    medium: '48px',
    large: '64px',
    xlarge: '96px'
  }

  const borderRadius = shape === 'circle' ? '50%' : '8px'

  return (
    <Skeleton
      width={sizeMap[size]}
      height={sizeMap[size]}
      borderRadius={borderRadius}
      className={`skeleton-avatar ${className}`}
    />
  )
}

// Card skeleton
export const SkeletonCard = ({ 
  hasAvatar = false,
  hasImage = false,
  lines = 3,
  className = '' 
}) => {
  return (
    <div className={`skeleton-card ${className}`}>
      {hasImage && (
        <Skeleton 
          width="100%" 
          height="200px" 
          className="skeleton-card-image"
        />
      )}
      <div className="skeleton-card-content">
        {hasAvatar && (
          <div className="skeleton-card-header">
            <SkeletonAvatar size="medium" />
            <div className="skeleton-card-header-text">
              <Skeleton width="120px" height="1rem" />
              <Skeleton width="80px" height="0.875rem" />
            </div>
          </div>
        )}
        <SkeletonText lines={lines} />
      </div>
    </div>
  )
}

// Table skeleton
export const SkeletonTable = ({ 
  rows = 5, 
  columns = 4,
  hasHeader = true,
  className = '' 
}) => {
  return (
    <div className={`skeleton-table ${className}`}>
      {hasHeader && (
        <div className="skeleton-table-header">
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton
              key={index}
              width="80px"
              height="1rem"
              className="skeleton-table-header-cell"
            />
          ))}
        </div>
      )}
      <div className="skeleton-table-body">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="skeleton-table-row">
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton
                key={colIndex}
                width="100%"
                height="1rem"
                className="skeleton-table-cell"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// List skeleton
export const SkeletonList = ({ 
  items = 5,
  hasAvatar = false,
  hasIcon = false,
  className = '' 
}) => {
  return (
    <div className={`skeleton-list ${className}`}>
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="skeleton-list-item">
          {hasAvatar && <SkeletonAvatar size="small" />}
          {hasIcon && (
            <Skeleton 
              width="24px" 
              height="24px" 
              borderRadius="4px"
              className="skeleton-list-icon"
            />
          )}
          <div className="skeleton-list-content">
            <Skeleton width="60%" height="1rem" />
            <Skeleton width="40%" height="0.875rem" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Form skeleton
export const SkeletonForm = ({ 
  fields = 4,
  hasSubmitButton = true,
  className = '' 
}) => {
  return (
    <div className={`skeleton-form ${className}`}>
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="skeleton-form-field">
          <Skeleton width="120px" height="1rem" className="skeleton-form-label" />
          <Skeleton width="100%" height="40px" className="skeleton-form-input" />
        </div>
      ))}
      {hasSubmitButton && (
        <Skeleton 
          width="120px" 
          height="40px" 
          className="skeleton-form-button"
        />
      )}
    </div>
  )
}

export default Skeleton