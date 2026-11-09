import React from 'react';
import {cn} from './helpers/cn';

export type ChoiceButtonProps = Omit<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	'type'
> & {
	readonly selected: boolean;
	readonly description: React.ReactNode | null;
};

export const ChoiceButton = React.forwardRef<
	HTMLButtonElement,
	ChoiceButtonProps
>(({selected, description, children, className, ...rest}, ref) => {
	return (
		<button
			ref={ref}
			type="button"
			aria-pressed={selected}
			className={cn(
				'font-brand text-text text-left text-[1em] bg-button-bg rounded-lg border-2 border-solid border-black border-b-4 px-4 py-3 cursor-pointer flex flex-col gap-0.5 min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
				selected
					? 'bg-brand text-white'
					: 'hover:bg-gray-100 dark:hover:bg-[#5b5c5e]',
				className,
			)}
			{...rest}
		>
			<span className="font-medium">{children}</span>
			{description ? (
				<span className={cn(selected ? 'text-white/85' : 'opacity-70')}>
					{description}
				</span>
			) : null}
		</button>
	);
});

ChoiceButton.displayName = 'ChoiceButton';
