import type {ComponentProps} from 'react';
import type {SpeedLines} from './speed-lines';

export const speedLinesInitialProps = {
	color: '#ffffff',
} satisfies ComponentProps<typeof SpeedLines>;
