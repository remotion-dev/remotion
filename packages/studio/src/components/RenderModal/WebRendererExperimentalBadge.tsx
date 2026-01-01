import {LIGHT_TEXT, WARNING_COLOR} from '../../helpers/colors';
import {WarningTriangle} from '../NewComposition/ValidationMessage';

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
};

const text: React.CSSProperties = {
	fontSize: 14,
	fontFamily: 'sans-serif',
	color: LIGHT_TEXT,
};

const icon: React.CSSProperties = {
	width: 14,
	height: 14,
	flexShrink: 0,
	fill: WARNING_COLOR,
	marginRight: 8,
};

const link: React.CSSProperties = {
	color: 'inherit',
	textDecoration: 'underline',
	fontSize: 14,
};

export const WebRendererExperimentalBadge: React.FC = () => {
	return (
		<div style={row}>
			<WarningTriangle type="warning" style={icon} />
			<div style={text}>
				The Remotion Web Renderer is experimental.{' '}
				<a
					href="https://github.com/remotion-dev/remotion/issues/5913"
					target="_blank"
					rel="noopener noreferrer"
					style={link}
				>
					Track progress on GitHub
				</a>{' '}
				and discuss in the{' '}
				<a
					href="https://remotion.dev/discord"
					target="_blank"
					rel="noopener noreferrer"
					style={link}
				>
					#web-renderer
				</a>{' '}
				channel on Discord.
			</div>
		</div>
	);
};
