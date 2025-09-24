export default function ThemeToggle(){
  const isDark = document.documentElement.classList.contains('dark');
  function toggle(){
    const el = document.documentElement;
    el.classList.toggle('dark');
    localStorage.setItem('theme', el.classList.contains('dark') ? 'dark' : 'light');
  }
  return (
    <button onClick={toggle}
      title="Toggle theme"
      className="workspace-theme-toggle">
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
