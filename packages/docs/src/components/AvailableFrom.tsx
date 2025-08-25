import React from 'react';
import {NoReactInternals} from 'remotion/no-react';

const link: React.CSSProperties = {
	textDecoration: 'none',
	fontSize: 16,
	marginLeft: 8,
};

const label: React.CSSProperties = {
	fontSize: '0.9em',
	fontFeatureSettings: "'ss03' on",
	border: '1px solid var(--ifm-color-emphasis-300)',
	color: 'var(--ifm-color-emphasis-600)',
	fontFamily: 'GTPlanar',
	paddingLeft: 6,
	paddingRight: 6,
	borderRadius: 3,
	paddingTop: 2,
	paddingBottom: 2,
};

export const AvailableFrom: React.FC<{
	readonly v: string;
}> = ({v}) => {
	if (!v) {
		throw new Error('v is required');
	}

	if (v.startsWith('v')) {
		v = v.slice(1);
	}

	return (
		<a
			target={'_blank'}
			style={link}
			href={`https://github.com/remotion-dev/remotion/releases/v${v}`}
		>
			<span style={label} title={`Added in v${v}`}>
				v{v}
			</span>
		</a>
	);
};

export const MinNodeVersion: React.FC = () => {
	return <span>{NoReactInternals.MIN_NODE_VERSION}</span>;
};

export const MinBunVersion: React.FC = () => {
	return <span>{NoReactInternals.MIN_BUN_VERSION}</span>;
};
