import React from 'react';
import {cn} from './helpers/cn';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({className, style, ...props}, ref) => {
		return (
			<textarea
				ref={ref}
				className={cn(
					'w-full bg-white dark:bg-[#121212] rounded-lg border-2 border-b-4 border-black outline-none px-3 py-3 fontbrand text-lg box-border field-sizing-content min-h-[90px]',
					className,
				)}
				style={{
					...style,
				}}
				{...props}
			/>
		);
	},
);

Textarea.displayName = 'Textarea';
