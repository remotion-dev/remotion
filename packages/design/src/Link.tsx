import React from 'react';
import {cn} from './helpers/cn';

export const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({
	className,
	...props
}) => {
	return (
		<a
			{...props}
			className={cn(className, 'text-brand underline underline-offset-4')}
		>
			{props.children}
		</a>
	);
};
