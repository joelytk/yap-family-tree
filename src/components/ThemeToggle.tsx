import { Moon, Sun } from 'lucide-react';

type Theme = 'dark' | 'light';

interface Props {
	theme: Theme;
	onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: Props) {
	const isDark = theme === 'dark';
	return (
		<button
			onClick={onToggle}
			aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
			title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
			className="btn absolute top-4 right-4 z-20"
		>
			{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
		</button>
	);
}
