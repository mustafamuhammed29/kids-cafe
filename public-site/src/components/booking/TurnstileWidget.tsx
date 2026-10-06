import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          language?: string;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerify,
  onExpire,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const isMockMode = !siteKey || siteKey.includes('XXXX') || siteKey.includes('your-');

  useEffect(() => {
    if (isMockMode) {
      // In local mock mode, bypass without blocking user
      return;
    }

    let scriptElement: HTMLScriptElement | null = null;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current || widgetIdRef.current) return;

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            onVerify(token);
          },
          'expired-callback': () => {
            onExpire?.();
          },
          'error-callback': () => {
            onError?.();
          },
          theme: 'light',
          language: 'de',
        });
        widgetIdRef.current = id;
        setIsLoaded(true);
      } catch (err) {
        console.warn('[TURNSTILE] Failed to render widget:', err);
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const existingScript = document.querySelector('script[src*="turnstile/v0/api.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', renderWidget);
      } else {
        scriptElement = document.createElement('script');
        scriptElement.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        scriptElement.async = true;
        scriptElement.defer = true;
        scriptElement.onload = renderWidget;
        document.head.appendChild(scriptElement);
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [siteKey, isMockMode, onVerify, onExpire, onError]);

  if (isMockMode) {
    return (
      <div className="flex items-center justify-center gap-2 p-3 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Spamschutz aktiv (Cloudflare Turnstile)</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-3 min-h-[65px]">
      <div ref={containerRef} />
      {!isLoaded && (
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <ShieldCheck className="w-4 h-4 animate-pulse text-primary" />
          <span>Sicherheitsüberprüfung wird geladen...</span>
        </div>
      )}
    </div>
  );
};
