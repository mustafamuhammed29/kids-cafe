import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  canonicalPath?: string;
  noIndex?: boolean;
}

export function usePageSeo({ title, description, canonicalPath = '', noIndex = false }: SeoProps) {
  useEffect(() => {
    // 1. Update document title
    const fullTitle = title.includes('Haven Kids') ? title : `${title} | Haven Kids Café Berlin`;
    document.title = fullTitle;

    // 2. Update meta description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', description);

    // 3. Update canonical link (Strict production base URL pattern - never localhost)
    const productionBase = ((import.meta as any).env?.VITE_SITE_URL as string)?.trim() || 'https://havenkidscafe.de';
    const cleanBase = productionBase.replace(/\/$/, '');
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${cleanBase}${cleanPath}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 4. Update OpenGraph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

    // 5. Update robots tag if noIndex
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (robotsMeta && robotsMeta.getAttribute('content') === 'noindex, nofollow') {
      robotsMeta.setAttribute('content', 'index, follow');
    }
  }, [title, description, canonicalPath, noIndex]);
}
