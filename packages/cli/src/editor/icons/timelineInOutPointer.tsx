import React, {SVGProps} from 'react';

export const TimelineInOutPointer: React.FC<SVGProps<SVGSVGElement>> = (
	props
) => {
	return (
		<svg viewBox="0 0 50 150" {...props}>
			<polygon
				fill={props.style?.color}
				points="26.012 8.916 43.845 8.916 43.845 0 17.096 0 17.096 60.339 7.222 67.494 0.802 72.153 0 72.733 0.201 73 0 73.267 0.802 73.847 7.222 78.506 17.096 85.661 17.096 146 43.845 146 43.845 137.084 26.012 137.084 26.012 81.114 14.823 73 26.012 64.886 26.012 8.916"
			/>
		</svg>
	);
};
