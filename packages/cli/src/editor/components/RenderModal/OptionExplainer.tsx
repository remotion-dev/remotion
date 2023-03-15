import type {RemotionOption} from '@remotion/renderer';
import {Spacing} from '../layout';
import {MenuDivider} from '../Menu/MenuDivider';

const container: React.CSSProperties = {
	fontSize: 14,
};

const title: React.CSSProperties = {
	fontSize: 14,
};

const description: React.CSSProperties = {
	fontSize: 14,
	maxWidth: 200,
};

const link: React.CSSProperties = {
	fontSize: 14,
	maxWidth: 200,
	color: '#0b84f3',
	wordWrap: 'break-word',
};

// TODO: No style of <code>
export const OptionExplainer: React.FC<{
	option: RemotionOption;
}> = ({option}) => {
	return (
		<div style={container}>
			<div>
				<strong style={title}>{option.name}</strong>
			</div>
			<div style={description}>{option.description}</div>
			<Spacing block y={0.5} />
			<MenuDivider />
			<div style={description}>CLI flag: {option.cliFlag}</div>
			<div style={description}>Node.JS option: {option.ssrName}</div>
			<div style={description}>
				Docs:{' '}
				<a style={link} href={option.docLink} target="_blank">
					{option.docLink}
				</a>
			</div>
		</div>
	);
};
