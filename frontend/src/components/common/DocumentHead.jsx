import { useEffect } from 'react'

const DocumentHead = ({ title, description, keywords }) => {
  useEffect(() => {
    // Update document title
    document.title = title || 'Taskly App'
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description || '')
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords || '')
    }
  }, [title, description, keywords])

  return null
}

export default DocumentHead