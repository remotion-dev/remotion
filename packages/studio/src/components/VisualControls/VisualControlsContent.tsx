import React, {useContext, useState} from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {VisualControlsContext} from '../../visual-controls/VisualControls';
import {SchemaSeparationLine} from '../RenderModal/SchemaEditor/SchemaSeparationLine';
import {VisualControlHandle} from './VisualControlHandle';

const compactExplanation: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 12,
	lineHeight: 1.4,
	padding: '0 12px 8px',
};

const compactHelpLink: React.CSSProperties = {
	alignItems: 'center',
	border: '1px solid currentColor',
	borderRadius: '50%',
	color: 'inherit',
	cursor: 'default',
	display: 'inline-flex',
	fontFamily: 'sans-serif',
	fontSize: 10,
	fontWeight: 700,
	height: 13,
	justifyContent: 'center',
	lineHeight: '13px',
	marginLeft: 3,
	opacity: 0.45,
	textDecoration: 'none',
	verticalAlign: 'text-bottom',
	width: 13,
};

const compactHelpLinkHovered: React.CSSProperties = {
	...compactHelpLink,
	opacity: 0.85,
};

const VisualControlsHelpLink = () => {
	const [hovered, setHovered] = useState(false);

	return (
		<a
			href="https://www.remotion.dev/docs/studio/visual-control"
			target="_blank"
			rel="noopener noreferrer"
			style={hovered ? compactHelpLinkHovered : compactHelpLink}
			aria-label="Learn more about visual controls"
			title="Learn more"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			?
		</a>
	);
};

export const VisualControlsContent = () => {
	const {handles} = useContext(VisualControlsContext);

	const entries = Object.entries(handles);

	if (entries.length === 0) {
		return (
			<div style={compactExplanation}>
				Not set up
				<VisualControlsHelpLink />
			</div>
		);
	}

	return (
		<div>
			{entries.map(([key, value], i) => {
				return (
					<React.Fragment key={key}>
						<VisualControlHandle keyName={key} value={value} />
						{i === entries.length - 1 ? null : <SchemaSeparationLine />}
					</React.Fragment>
				);
			})}
		</div>
	);
};
