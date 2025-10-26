// SEO Optimization utilities

// Generate structured data for tasks
export const generateTaskStructuredData = (task) => {
  return {
    "@context": "https://schema.org",
    "@type": "Action",
    "name": task.title,
    "description": task.description,
    "startTime": task.createdAt,
    "endTime": task.due,
    "actionStatus": task.status === 'completed' ? 'CompletedActionStatus' : 'PotentialActionStatus',
    "agent": {
      "@type": "Person",
      "name": task.user?.fullname || task.user?.username
    }
  }
}

// Generate structured data for user profiles
export const generateUserStructuredData = (user) => {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": user.fullname || user.username,
    "image": user.avatar,
    "description": user.bio || `${user.fullname || user.username} is a productive member of Taskly`,
    "memberOf": {
      "@type": "Organization",
      "name": "Taskly"
    }
  }
}

// Generate Open Graph meta tags
export const generateOpenGraphTags = (page) => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://taskly.com'
  
  const ogTags = {
    'og:site_name': 'Taskly',
    'og:type': 'website',
    'og:locale': 'en_US',
    'og:url': `${baseUrl}${page.path}`,
    'og:title': page.title,
    'og:description': page.description,
    'og:image': page.image || `${baseUrl}/img/og-default.jpg`,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': page.imageAlt || page.title
  }

  return ogTags
}

// Generate Twitter Card meta tags
export const generateTwitterCardTags = (page) => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://taskly.com'
  
  const twitterTags = {
    'twitter:card': 'summary_large_image',
    'twitter:site': '@TasklyApp',
    'twitter:creator': '@TasklyApp',
    'twitter:title': page.title,
    'twitter:description': page.description,
    'twitter:image': page.image || `${baseUrl}/img/twitter-card.jpg`,
    'twitter:image:alt': page.imageAlt || page.title
  }

  return twitterTags
}

// Generate canonical URL
export const generateCanonicalUrl = (path) => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://taskly.com'
  return `${baseUrl}${path}`
}

// Generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (breadcrumbs) => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://taskly.com'
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${baseUrl}${crumb.path}`
    }))
  }
}

// Generate FAQ structured data
export const generateFAQStructuredData = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

// Generate organization structured data
export const generateOrganizationStructuredData = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://taskly.com'
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Taskly",
    "description": "A modern task management application to help you stay organized and productive",
    "url": baseUrl,
    "logo": `${baseUrl}/img/logo.png`,
    "sameAs": [
      "https://twitter.com/TasklyApp",
      "https://facebook.com/TasklyApp",
      "https://linkedin.com/company/taskly"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@taskly.com"
    }
  }
}

// Inject structured data into page
export const injectStructuredData = (data) => {
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
  
  return () => {
    if (script.parentNode) {
      script.parentNode.removeChild(script)
    }
  }
}

// Generate meta tags for better SEO
export const generateMetaTags = (page) => {
  const tags = [
    { name: 'description', content: page.description },
    { name: 'keywords', content: page.keywords },
    { name: 'author', content: 'Taskly Team' },
    { name: 'robots', content: 'index, follow' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'theme-color', content: '#007bff' },
    { name: 'msapplication-TileColor', content: '#007bff' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'Taskly' }
  ]

  return tags
}

// Preload critical resources
export const preloadCriticalResources = () => {
  const resources = [
    { href: '/img/task--main.webp', as: 'image', type: 'image/webp' },
    { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }
  ]

  resources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource.href
    link.as = resource.as
    if (resource.type) link.type = resource.type
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin
    document.head.appendChild(link)
  })
}