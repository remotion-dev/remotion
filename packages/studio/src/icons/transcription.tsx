import type {SVGProps} from 'react';
import {CURRENT_COLOR_LOWERCASE} from '../helpers/colors';

export const TranscriptionIcon = ({
	color,
	...props
}: SVGProps<SVGSVGElement> & {readonly color?: string}) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
		<path
			d="M12 15.75a4 4 0 0 0 4-4V7a4 4 0 0 0-8 0v4.75a4 4 0 0 0 4 4Zm-1.9-8.5V7a1.9 1.9 0 0 1 3.8 0v4.75a1.9 1.9 0 0 1-3.8 0v-.25h1.15a1.05 1.05 0 1 0 0-2.1H10.1V7.25Zm7.45 3.45a1.05 1.05 0 0 1 1.05 1.05 6.6 6.6 0 0 1-5.55 6.52v1.63h2.2a1.05 1.05 0 1 1 0 2.1h-6.5a1.05 1.05 0 1 1 0-2.1h2.2v-1.63a6.6 6.6 0 0 1-5.55-6.52 1.05 1.05 0 1 1 2.1 0 4.5 4.5 0 0 0 9 0 1.05 1.05 0 0 1 1.05-1.05Z"
			fill={color ?? CURRENT_COLOR_LOWERCASE}
		/>
	</svg>
);
