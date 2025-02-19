import type {SVGProps} from 'react';
import React from 'react';

export const FilmIcon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
			<path
				fill={color}
				d="M448 32H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h384c35.35 0 64-28.65 64-64V96C512 60.65 483.3 32 448 32zM384 64v176H128V64H384zM32 96c0-17.64 14.36-32 32-32h32v80H32V96zM32 176h64v64H32V176zM32 272h64v64H32V272zM64 448c-17.64 0-32-14.36-32-32v-48h64V448H64zM128 448V272h256V448H128zM480 416c0 17.64-14.36 32-32 32h-32v-80h64V416zM480 336h-64v-64h64V336zM480 240h-64v-64h64V240zM480 144h-64V64h32c17.64 0 32 14.36 32 32V144z"
			/>
		</svg>
	);
};
