import React from 'react';

export default function ThemeSwitcher({ theme, setTheme, themes }) {
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
