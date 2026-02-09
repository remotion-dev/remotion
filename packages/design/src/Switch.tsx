import React from 'react';

export const Switch: React.FC<{
	readonly active: boolean;
	readonly onToggle: () => void;
}> = ({active, onToggle}) => {
	return (
		<div
			data-active={active}
			className="h-[34px] transition-all rounded-full w-[56px] border-2 border-b-4 bg-gray-200 p-[2px] cursor-pointer data-[active=true]:bg-brand border-black relative shrink-0"
			onClick={onToggle}
		>
			<div
				data-active={active}
				className="h-[20px] w-[20px] box-content left-[4px] top-[4px] transition-all rounded-full bg-white border-2 border-black absolute data-[active=true]:left-[calc(100%-24px)]"
			/>
		</div>
	);
};
