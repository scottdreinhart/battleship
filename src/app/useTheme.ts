/**
 * Theme / mode / colorblind persistence + DOM sync.
 */

import { useCallback, useEffect, useState } from 'react'

import { getLayerStack, layerStackToCssVars } from '../domain/layers.ts'
import { getBackgroundCssValue, preloadAllSprites } from '../domain/sprites.ts'
import { COLOR_THEMES, DEFAULT_SETTINGS } from '../domain/themes.ts'
import type { ThemeSettings } from '../domain/types.ts'
import { load, save } from './storageService.ts'

const STORAGE_KEY = 'nim-theme-settings'

/**
 * Theme color palettes — maps theme ID to color definitions.
 * Used to set CSS custom properties for coordinated theming across all UI.
 */
const THEME_COLORS: Record<string, Record<string, string>> = {
  classic: {
    '--theme-primary': '#667eea',
    '--theme-secondary': '#764ba2',
    '--theme-accent': '#667eea',
    '--theme-bg': '#1a1a2e',
    '--theme-fg': '#e0e0e0',
    '--theme-card': '#2d2d44',
    '--theme-border': '#3d3d5c',
  },
  chiba: {
    '--theme-primary': '#00ff41',
    '--theme-secondary': '#00cc33',
    '--theme-accent': '#00ff41',
    '--theme-bg': '#0a0e27',
    '--theme-fg': '#e0e0e0',
    '--theme-card': '#1a1f3a',
    '--theme-border': '#00ff41',
  },
  ocean: {
    '--theme-primary': '#0ea5e9',
    '--theme-secondary': '#06b6d4',
    '--theme-accent': '#0ea5e9',
    '--theme-bg': '#0f172a',
    '--theme-fg': '#e0e7ff',
    '--theme-card': '#1e293b',
    '--theme-border': '#0ea5e9',
  },
  sunset: {
    '--theme-primary': '#f97316',
    '--theme-secondary': '#ea580c',
    '--theme-accent': '#f97316',
    '--theme-bg': '#1f1b1a',
    '--theme-fg': '#fde68a',
    '--theme-card': '#3d2c27',
    '--theme-border': '#f97316',
  },
  forest: {
    '--theme-primary': '#22c55e',
    '--theme-secondary': '#16a34a',
    '--theme-accent': '#22c55e',
    '--theme-bg': '#0f2818',
    '--theme-fg': '#dcfce7',
    '--theme-card': '#1b4332',
    '--theme-border': '#22c55e',
  },
  rose: {
    '--theme-primary': '#f43f5e',
    '--theme-secondary': '#e11d48',
    '--theme-accent': '#f43f5e',
    '--theme-bg': '#1f0f1a',
    '--theme-fg': '#ffe4e6',
    '--theme-card': '#3d1a28',
    '--theme-border': '#f43f5e',
  },
  midnight: {
    '--theme-primary': '#a78bfa',
    '--theme-secondary': '#9333ea',
    '--theme-accent': '#a78bfa',
    '--theme-bg': '#1e1b4b',
    '--theme-fg': '#e9d5ff',
    '--theme-card': '#312e81',
    '--theme-border': '#a78bfa',
  },
  highcontrast: {
    '--theme-primary': '#ffcc00',
    '--theme-secondary': '#ffaa00',
    '--theme-accent': '#ffcc00',
    '--theme-bg': '#000000',
    '--theme-fg': '#ffffff',
    '--theme-card': '#333333',
    '--theme-border': '#ffcc00',
  },
}

const themeLoaders = import.meta.glob('../themes/*.css', {
  query: '?inline',
  import: 'default',
}) as Record<string, () => Promise<string>>

let activeThemeStyle: HTMLStyleElement | null = null
const preloadedThemes = new Map<string, string>()

const preloadTheme = async (themeId: string): Promise<void> => {
  if (preloadedThemes.has(themeId) || themeId === 'classic') {
    return
  }

  const loader = themeLoaders[`../themes/${themeId}.css`]
  if (loader) {
    try {
      const css = await loader()
      preloadedThemes.set(themeId, css)
    } catch {
      // Theme file not found — skip preload
    }
  }
}

const preloadAllThemes = (): void => {
  COLOR_THEMES.forEach(({ id }) => {
    if (id !== 'classic') {
      preloadTheme(id).catch(() => {})
    }
  })
}

const applyThemeCSS = async (themeId: string): Promise<void> => {
  if (activeThemeStyle) {
    activeThemeStyle.remove()
    activeThemeStyle = null
  }
  if (themeId === 'classic') {
    return
  }

  let css = preloadedThemes.get(themeId)
  if (!css) {
    const loader = themeLoaders[`../themes/${themeId}.css`]
    if (!loader) {
      return
    }
    css = await loader()
  }

  const el = document.createElement('style')
  el.setAttribute('data-theme-chunk', themeId)
  el.textContent = css
  document.head.appendChild(el)
  activeThemeStyle = el
}

const loadSettings = (): ThemeSettings => {
  const parsed = load<ThemeSettings>(STORAGE_KEY, DEFAULT_SETTINGS)
  return { ...DEFAULT_SETTINGS, ...parsed }
}

const saveSettings = (settings: ThemeSettings): void => {
  save(STORAGE_KEY, settings)
}

const applyToDOM = (settings: ThemeSettings): void => {
  const root = document.documentElement

  root.setAttribute('data-theme', settings.colorTheme)

  if (settings.mode === 'system') {
    root.removeAttribute('data-mode')
  } else {
    root.setAttribute('data-mode', settings.mode)
  }

  if (settings.colorblind === 'none') {
    root.removeAttribute('data-colorblind')
  } else {
    root.setAttribute('data-colorblind', settings.colorblind)
  }

  // Sprite Manager — set background image from central registry
  root.style.setProperty('--bg-image', getBackgroundCssValue(settings.colorTheme))

  // Layer Manager — apply layer stack CSS custom properties
  const layerVars = layerStackToCssVars(getLayerStack(settings.colorTheme))
  for (const [prop, value] of Object.entries(layerVars)) {
    root.style.setProperty(prop, value)
  }

  // Theme Colors — apply color palette CSS custom properties
  const themeColors = THEME_COLORS[settings.colorTheme] ?? THEME_COLORS.classic
  for (const [prop, value] of Object.entries(themeColors)) {
    root.style.setProperty(prop, value)
  }
}

export interface UseThemeReturn {
  settings: ThemeSettings
  setColorTheme: (id: string) => void
  setMode: (mode: string) => void
  setColorblind: (id: string) => void
}

const useTheme = (): UseThemeReturn => {
  const [settings, setSettings] = useState<ThemeSettings>(loadSettings)

  useEffect(() => {
    preloadAllThemes()
    preloadAllSprites()
  }, [])

  useEffect(() => {
    applyToDOM(settings)
    applyThemeCSS(settings.colorTheme)
    saveSettings(settings)
  }, [settings])

  const setColorTheme = useCallback((id: string) => {
    setSettings((prev) => ({ ...prev, colorTheme: id }))
  }, [])

  const setMode = useCallback((mode: string) => {
    setSettings((prev) => ({ ...prev, mode }))
  }, [])

  const setColorblind = useCallback((id: string) => {
    setSettings((prev) => ({ ...prev, colorblind: id }))
  }, [])

  return { settings, setColorTheme, setMode, setColorblind }
}

export default useTheme
