import React, { useEffect, useState } from 'react';

const themes = ['light', 'dark', 'blue', 'green'];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const themeClasses = themes.map((t) => `theme-${t}`);
    const root = document.documentElement;
    root.classList.remove(...themeClasses);
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <div style={{ position: 'absolute', top: 20, right: 20 }}>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        {themes.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
