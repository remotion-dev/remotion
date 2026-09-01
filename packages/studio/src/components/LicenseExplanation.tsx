import React from 'react';
import {LIGHT_TEXT} from '../helpers/colors';

const description: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
	margin: 0,
};

const descriptionLink: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: '21px',
};

const licenseExplanation: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 12,
};

const licenseExplanationRow: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 12,
};

const people: React.CSSProperties = {
	display: 'grid',
	gridTemplateColumns: 'repeat(4, 9px)',
	gap: 3,
	flexShrink: 0,
};

const person: React.CSSProperties = {
	display: 'block',
	height: 24,
	overflow: 'visible',
	width: 9,
};

const PersonIcon: React.FC<{
	readonly handsUp: boolean;
	readonly opacity: number;
}> = ({handsUp, opacity}) => {
	return (
		<svg
			aria-hidden="true"
			opacity={opacity}
			style={person}
			viewBox="0 0 192 512"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fill={LIGHT_TEXT}
				d="M128 64a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM32 64A64 64 0 1 1 160 64 64 64 0 1 1 32 64zm0 128l0 128 128 0 0-128-128 0zM0 160l192 0 0 192-32 0 0 160-32 0 0-160-64 0 0 160-32 0 0-160-32 0 0-192z"
			/>
			{handsUp ? (
				<path
					d="M10.667 192 0 -32 M181.333 192 192 -32"
					fill="none"
					stroke={LIGHT_TEXT}
					strokeWidth="32"
				/>
			) : null}
		</svg>
	);
};

export const LicenseExplanation: React.FC = () => {
	return (
		<div style={licenseExplanation}>
			<div style={licenseExplanationRow}>
				<div style={people}>
					<PersonIcon handsUp opacity={1} />
					<PersonIcon handsUp opacity={1} />
					<PersonIcon handsUp opacity={1} />
				</div>
				<p style={description}>
					Remotion is free to use if you are an individual or company of 3 or
					less.
				</p>
			</div>
			<div style={licenseExplanationRow}>
				<div style={people}>
					<PersonIcon handsUp={false} opacity={1} />
					<PersonIcon handsUp={false} opacity={1} />
					<PersonIcon handsUp={false} opacity={1} />
					<PersonIcon handsUp={false} opacity={1} />
				</div>
				<p style={description}>
					If used in an organization with 4+ people, you need a{' '}
					<a style={descriptionLink} href="https://remotion.pro/license">
						Company License
					</a>
					.
				</p>
			</div>
			<div style={licenseExplanationRow}>
				<div style={people}>
					<PersonIcon handsUp={false} opacity={1} />
					<PersonIcon handsUp={false} opacity={0.3} />
					<PersonIcon handsUp={false} opacity={0.3} />
					<PersonIcon handsUp={false} opacity={0.3} />
				</div>
				<p style={description}>
					The total headcount matters, not the amount of people using Remotion.
				</p>
			</div>
		</div>
	);
};
