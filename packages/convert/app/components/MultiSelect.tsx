import React from 'react';

export const MultiSelectItem: React.FC<{
	readonly children: React.ReactNode;
	readonly active: boolean;
	readonly onClick: () => void;
	readonly disabled: boolean;
}> = ({active, children, onClick, disabled}) => {
	return (
		<button
			type="button"
			disabled={disabled}
			data-active={active}
			className="flex-1 border-black border-2 rounded-md flex flex-col items-center p-2 bg-white border-b-4 data-[active=true]:bg-brand data-[active=true]:text-white enabled:cursor-pointer disabled:opacity-50"
			onClick={onClick}
		>
			{children}
		</button>
	);
};
