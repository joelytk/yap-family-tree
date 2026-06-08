import { HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { FamilyTree } from '@/components/FamilyTree';
import { HelpModal } from '@/components/HelpModal';
import { ThemeToggle } from '@/components/ThemeToggle';

import { useTheme } from '@/hooks/useTheme';

import type { FamilyMember } from '@/types/family';

const VERSION = '2.0.1';
const LAST_UPDATED = '8 June 2026';

export default function App() {
	const { theme, toggle } = useTheme();
	const [data, setData] = useState<FamilyMember[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [helpOpen, setHelpOpen] = useState(false);

	useEffect(() => {
		fetch('./data.json')
			.then(res => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json();
			})
			.then(setData)
			.catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load data'));
	}, []);

	const isDark = theme === 'dark';

	return (
		<div
			className={`relative w-screen h-dvh flex flex-col overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'} transition-colors duration-300`}
		>
			{/* Header */}
			<header
				className={`border-b ${isDark ? 'border-slate-700/60' : 'border-slate-200'} px-3 py-2 flex items-center justify-between`}
			>
				<h1 className={`text-lg font-semibold tracking-wide ${isDark ? 'text-white/70' : 'text-slate-500'}`}>
					Yap Family Tree
				</h1>
				{/* Top-right controls: help + theme toggle */}
				<div className="flex gap-2">
					<button onClick={() => setHelpOpen(true)} aria-label="Help" title="Help" className="btn">
						<HelpCircle className="w-4 h-4" />
					</button>
					<ThemeToggle theme={theme} onToggle={toggle} />
				</div>
			</header>

			{/* Main content */}
			{error ? (
				<main className="flex flex-1 items-center justify-center w-full h-full">
					<p className="text-red-400 font-medium">Error: {error}</p>
				</main>
			) : data.length === 0 ? (
				<main className="flex flex-1 items-center justify-center w-full h-full">
					<p className={`${isDark ? 'text-white/40' : 'text-slate-400'} text-sm`}>Loading family tree…</p>
				</main>
			) : (
				<FamilyTree data={data} isDark={isDark} />
			)}

			{/* Footer – version + last updated */}
			<footer className={`border-t ${isDark ? 'border-slate-700/60' : 'border-slate-200'} p-2 text-center`}>
				<p className={`text-[10px] select-none ${isDark ? 'text-white/40' : 'text-slate-500/70'}`}>
					v{VERSION} · Updated {LAST_UPDATED}
				</p>
			</footer>

			{/* Help modal */}
			<HelpModal isOpen={helpOpen} isDark={isDark} onClose={() => setHelpOpen(false)} />
		</div>
	);
}
