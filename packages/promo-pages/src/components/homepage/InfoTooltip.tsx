import React, {useState} from 'react';

interface InfoTooltipProps {
	readonly text: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({text}) => {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<span
			className="relative inline-block ml-1 text-gray-600 cursor-default"
			onMouseEnter={() => setIsVisible(true)}
			onMouseLeave={() => setIsVisible(false)}
		>
			<span style={{fontSize: '1rem'}}>ⓘ</span>
			{isVisible && (
				<span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-2 rounded text-xs whitespace-nowrap z-10 cursor-default">
					{text}
					<span className="absolute top-full left-1/2 transform -translate-x-1/2 border-5 border-solid border-gray-800 border-t-transparent border-r-transparent border-b-transparent border-l-transparent cursor-default" />
				</span>
			)}
		</span>
	);
};
