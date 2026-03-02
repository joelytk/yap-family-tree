import { useCallback, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'yap-tree-theme';

export function useTheme() {
	const [theme, setTheme] = useState<Theme>(() => {
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		return stored ?? 'dark';
	});

	useEffect(() => {
		const root = document.documentElement;
		root.classList.toggle('dark', theme === 'dark');
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	const toggle = useCallback(() => {
		setTheme(t => (t === 'dark' ? 'light' : 'dark'));
	}, []);

	return { theme, toggle };
}
