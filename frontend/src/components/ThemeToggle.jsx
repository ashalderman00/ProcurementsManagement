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
      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
