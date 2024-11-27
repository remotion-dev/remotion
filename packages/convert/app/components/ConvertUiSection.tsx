import React, {useCallback} from 'react';

const Switch: React.FC<{
	readonly active: boolean;
	readonly onToggle: () => void;
}> = ({active, onToggle}) => {
	return (
		<div
			data-active={active}
			className="h-6 transition-all rounded-full w-12 border-2 bg-gray-200 p-[2px] cursor-pointer data-[active=true]:bg-brand border-black relative"
			onClick={onToggle}
		>
			<div
				data-active={active}
				className="h-4 w-4 left-[2px] transition-all rounded-full bg-white border-[2px] border-black absolute data-[active=true]:left-[calc(100%-1rem-2px)]"
			/>
		</div>
	);
};

export const ConvertUiSection: React.FC<{
	readonly children: React.ReactNode;
	readonly active: boolean;
	readonly setActive: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({children, active, setActive}) => {
	const onToggle = useCallback(() => {
		setActive((e) => !e);
	}, [setActive]);

	return (
		<div className="flex flex-row items-center">
			<Switch active={active} onToggle={onToggle} />
			<div className="w-2" />
			<div className="font-semibold tracking-tight text-ellipsis font-brand overflow-x-hidden text-xl">
				{children}
			</div>
		</div>
	);
};
