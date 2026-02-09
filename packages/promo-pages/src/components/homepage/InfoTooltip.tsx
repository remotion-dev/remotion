import React, {useState} from 'react';

interface InfoTooltipProps {
	readonly children: React.ReactNode;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({children}) => {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<span
			className="relative inline-block ml-1 text-gray-600 cursor-default"
			onPointerEnter={() => setIsVisible(true)}
			onMouseLeave={() => setIsVisible(false)}
		>
			<span className="font-bold" style={{fontSize: '1rem'}}>
				ⓘ
			</span>
			{isVisible && (
			<span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-500 text-white p-2 rounded text-sm z-10 cursor-default font-normal w-[300px] inline-block text-wrap">
				{children}
				<span className="absolute top-full left-1/2 transform -translate-x-1/2 border-5 border-solid border-gray-500 border-t-transparent border-r-transparent border-b-transparent border-l-transparent cursor-default" />
				</span>
			)}
		</span>
	);
};
