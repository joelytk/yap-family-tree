import { Moon, Sun } from 'lucide-react';

type Theme = 'dark' | 'light';

export function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
	const isDark = theme === 'dark';
	return (
		<button
			onClick={onToggle}
			aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
			title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
			className="btn"
		>
			{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
		</button>
	);
}
