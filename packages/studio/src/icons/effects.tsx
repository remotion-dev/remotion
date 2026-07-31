import type {SVGProps} from 'react';
import React from 'react';

export const EffectsIcon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	return (
		<svg {...props} viewBox="0 0 16 16">
			<path
				fill={color}
				d="M4.405 4.48C4.575 3.82 4.865 3.325 5.275 2.995C5.695 2.665 6.25 2.5 6.94 2.5H9.235V4.06H7.045C6.555 4.06 6.235 4.3 6.085 4.78L5.83 5.68H7.975V7.255H5.395L3.805 13H2.02L3.625 7.255H1.96V5.68H4.075L4.405 4.48ZM8.57102 9.085L6.87602 5.68H8.79602L9.86102 7.99L11.991 5.68H14.331L10.686 9.415L12.426 13H10.491L9.35102 10.585L7.02602 13H4.68602L8.57102 9.085Z"
			/>
		</svg>
	);
};
