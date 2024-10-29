import { useState, useEffect } from 'react';
import api from '../config/api';

type Theme = 'dark' | 'light' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'dark';
  });

  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = (theme: Theme) => {
      const isDark = theme === 'dark' || 
        (theme === 'system' && systemTheme.matches);
      
      document.documentElement.classList.toggle('dark', isDark);
    };

    updateTheme(theme);
    localStorage.setItem('theme', theme);

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        updateTheme('system');
      }
    };

    systemTheme.addEventListener('change', handleSystemThemeChange);
    return () => systemTheme.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  const updateTheme = async (newTheme: Theme) => {
    try {
      await api.patch('/api/users/me', { theme: newTheme });
      setTheme(newTheme);
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  return { theme, updateTheme };
}