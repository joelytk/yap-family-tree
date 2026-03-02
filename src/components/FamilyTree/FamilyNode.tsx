import type { SyntheticEvent } from 'react';

import type { FamilyMember } from '@/types/family';

import { NODE_H, NODE_W } from '@/utils/treeLayout';

interface Props {
	member: FamilyMember;
	x: number;
	y: number;
}

export function FamilyNode({ member, x, y }: Props) {
	const isMale = member.gender === 'm';

	return (
		<div
			className={[
				'absolute flex flex-col items-center rounded-2xl overflow-hidden',
				'shadow-lg border select-none transition-shadow duration-200 hover:shadow-xl',
				isMale
					? 'border-sky-500/40 bg-sky-100/90 dark:bg-sky-950/80'
					: 'border-pink-500/40 bg-pink-100/90 dark:bg-pink-950/80',
				'dark:text-white text-slate-900'
			].join(' ')}
			style={{
				left: x,
				top: y,
				width: NODE_W,
				height: NODE_H,
				backdropFilter: 'blur(6px)'
			}}
		>
			{/* Avatar */}
			<div
				className={[
					'w-full flex-1 overflow-hidden',
					isMale ? 'bg-sky-200/50 dark:bg-sky-900/50' : 'bg-pink-200/50 dark:bg-pink-900/50'
				].join(' ')}
			>
				<img
					src={`${import.meta.env.BASE_URL}${member.img.slice(1)}`}
					alt={member.name}
					className="w-full h-full object-cover object-top"
					loading="lazy"
					onError={(e: SyntheticEvent<HTMLImageElement>) => {
						(e.currentTarget as HTMLImageElement).src =
							`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&size=120`;
					}}
				/>
			</div>

			{/* Name badge */}
			<div
				className={[
					'w-full px-2 py-1.5 text-center',
					isMale ? 'bg-sky-200/80 dark:bg-sky-800/70' : 'bg-pink-200/80 dark:bg-pink-800/70'
				].join(' ')}
			>
				<p className="text-[11px] font-semibold leading-tight truncate">{member.name}</p>
			</div>
		</div>
	);
}
