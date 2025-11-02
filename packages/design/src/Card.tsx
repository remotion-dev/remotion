import React from 'react';
import {cn} from './helpers/cn';

export const Card = React.forwardRef<
	HTMLDivElement,
	React.ComponentPropsWithoutRef<'div'>
>(({children, className, ...rest}, ref) => {
	return (
		<div
			ref={ref}
			className={cn(
				'rounded-lg border-2 border-black bg-card-bg text-text border-b-4',
				className,
			)}
			{...rest}
		>
			{children}
		</div>
	);
});

Card.displayName = 'Card';
