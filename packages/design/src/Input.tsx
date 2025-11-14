import React from 'react';
import {cn} from './helpers/cn';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({className, ...props}, ref) => {
		return (
			<input
				ref={ref}
				className={cn(
					'w-full dark:bg-[#121212] rounded-lg border-2 border-b-4 border-black outline-none h-14 px-3 fontbrand text-lg box-border',
					className,
				)}
				{...props}
			/>
		);
	},
);

Input.displayName = 'Input';
