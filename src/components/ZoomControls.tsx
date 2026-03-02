import { Maximize, ZoomIn, ZoomOut } from 'lucide-react';

interface Props {
	onZoomIn: () => void;
	onZoomOut: () => void;
	onFit: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut, onFit }: Props) {
	return (
		<div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-20">
			<button onClick={onFit} className="btn" title="Fit to screen" aria-label="Fit to screen">
				<Maximize className="w-4 h-4" />
			</button>
			<button onClick={onZoomIn} className="btn" title="Zoom in" aria-label="Zoom in">
				<ZoomIn className="w-4 h-4" />
			</button>
			<button onClick={onZoomOut} className="btn" title="Zoom out" aria-label="Zoom out">
				<ZoomOut className="w-4 h-4" />
			</button>
		</div>
	);
}
