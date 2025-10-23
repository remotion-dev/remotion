import React from 'react';
import {cn} from '~/lib/utils';

type TextButtonWithChevronProps = React.ComponentProps<'div'>;

export const TextButtonWithChevron: React.FC<TextButtonWithChevronProps> = ({
	className,
	...props
}) => {
	return (
		<div
			role="button"
			className={cn(
				'hover:text-brand cursor-pointer row inline-flex items-center gap-2',
				className,
			)}
			{...props}
		>
			{props.children}
			<svg className="h-3 " viewBox="0 0 320 512">
				<path
					fill="currentcolor"
					d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
				/>
			</svg>
		</div>
	);
};
