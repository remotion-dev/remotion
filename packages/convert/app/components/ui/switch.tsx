export const Switch: React.FC<{
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
				className="h-4 w-4 left-[2px] transition-all rounded-full bg-white border-2 border-black absolute data-[active=true]:left-[calc(100%-1rem-2px)]"
			/>
		</div>
	);
};
