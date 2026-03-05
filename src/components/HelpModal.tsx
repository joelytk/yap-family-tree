import { Hand, Map, Maximize, Sun, X, ZoomIn } from 'lucide-react';
import { useEffect } from 'react';

const items = [
	{
		icon: Hand,
		title: 'Pan',
		desc: 'Click and drag (or swipe with one finger on mobile) to move around the tree.'
	},
	{
		icon: ZoomIn,
		title: 'Zoom',
		desc: 'Scroll with the mouse wheel, or pinch with two fingers on mobile to zoom in and out.'
	},
	{
		icon: ZoomIn,
		title: 'Zoom buttons',
		desc: 'Use the + and − buttons in the bottom-right corner to step zoom in or out.'
	},
	{
		icon: Maximize,
		title: 'Fit to screen',
		desc: 'Press the expand button (bottom-right) to reset the view and fit the entire tree on screen.'
	},
	{
		icon: Sun,
		title: 'Theme',
		desc: 'Toggle between light and dark mode with the sun / moon button in the top-right corner.'
	},
	{
		icon: Map,
		title: 'Minimap',
		desc: 'The minimap in the bottom-left shows an overview of the whole tree. Click anywhere on it to jump to that area.'
	}
];

export function HelpModal({ isOpen, isDark, onClose }: { isOpen: boolean; isDark: boolean; onClose: () => void }) {
	// Close on Escape
	useEffect(() => {
		if (!isOpen) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const bg = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200';
	const text = isDark ? 'text-white' : 'text-slate-900';
	const sub = isDark ? 'text-slate-400' : 'text-slate-500';
	const divider = isDark ? 'divide-slate-700/50' : 'divide-slate-100';
	const iconColor = isDark ? 'text-slate-400' : 'text-slate-500';

	return (
		/* Backdrop */
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
			onClick={onClose}
		>
			{/* Dialog */}
			<div
				className={`relative w-full max-w-sm max-h-[85vh] overflow-hidden rounded-2xl border shadow-2xl ${bg}`}
				onClick={e => e.stopPropagation()}
			>
				{/* Header */}
				<div
					className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}
				>
					<div>
						<h2 className={`text-base font-semibold ${text}`}>How to use</h2>
						<p className={`text-xs mt-0.5 ${sub}`}>Yap Family Tree</p>
					</div>
					<button onClick={onClose} aria-label="Close" className="shrink-0">
						<X className={`w-4 h-4 ${iconColor}`} />
					</button>
				</div>

				{/* Feature list */}
				<ul className={`divide-y ${divider} px-5 pb-5 max-h-[calc(85vh-75px)] overflow-y-auto`}>
					{items.map(({ icon: Icon, title, desc }) => (
						<li key={title} className="flex gap-3 py-3">
							<div className={`mt-0.5 shrink-0 ${iconColor}`}>
								<Icon className="w-4 h-4" />
							</div>
							<div>
								<p className={`text-sm font-medium ${text}`}>{title}</p>
								<p className={`text-xs mt-0.5 leading-relaxed ${sub}`}>{desc}</p>
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
