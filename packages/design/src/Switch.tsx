import React from 'react';

export const Switch: React.FC<{
	readonly active: boolean;
	readonly onToggle: () => void;
	readonly 'aria-label'?: string;
}> = ({active, onToggle, 'aria-label': ariaLabel}) => {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={active}
			aria-label={ariaLabel}
			data-active={active}
			className="h-[34px] transition-none rounded-full w-[56px] border-2 border-b-4 bg-gray-200 dark:bg-[#424243] p-[2px] cursor-pointer before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-brand before:opacity-0 before:transition-opacity data-[active=true]:before:opacity-100 border-black relative shrink-0"
			onClick={onToggle}
		>
			<div
				data-active={active}
				className="h-[20px] w-[20px] left-[4px] top-[4px] transition-[left] rounded-full bg-white dark:bg-[#aaa] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-white before:opacity-0 before:transition-opacity data-[active=true]:before:opacity-100 border-2 border-black absolute data-[active=true]:left-[calc(100%-24px)]"
			/>
		</button>
	);
};
