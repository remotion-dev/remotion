import {BACKGROUND, LIGHT_TEXT} from '../helpers/colors';
import {inlineCodeSnippet} from './Menu/styles';
import {Spinner} from './Spinner';
import {Spacing} from './layout';

export const loaderLabel: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
};

const container: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	display: 'inline-flex',
	justifyContent: 'center',
	alignItems: 'center',
	flexDirection: 'row',
	padding: 20,
};

export const RunningCalculateMetadata: React.FC = () => {
	return (
		<div style={container}>
			<Spinner size={24} duration={1} />
			<Spacing x={2} />
			<div style={loaderLabel}>
				Running <code style={inlineCodeSnippet}>calculateMetadata()</code>...
			</div>
		</div>
	);
};
