import {useState, type CSSProperties, type ReactNode} from 'react';
import {CURRENT_COLOR, LIGHT_TEXT, WHITE} from '../helpers/colors';

const compactExplanation: CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 12,
	lineHeight: 1.4,
	padding: '0 12px 8px',
};

const compactHelpLink: CSSProperties = {
	alignItems: 'center',
	color: 'inherit',
	cursor: 'default',
	display: 'inline-flex',
	height: 13,
	justifyContent: 'center',
	marginLeft: 8,
	opacity: 1,
	textDecoration: 'none',
	verticalAlign: 'text-bottom',
	width: 13,
};

const compactHelpLinkHovered: CSSProperties = {
	...compactHelpLink,
	color: WHITE,
};

const compactHelpIcon: CSSProperties = {
	color: 'inherit',
	display: 'block',
	fill: CURRENT_COLOR,
	height: 13,
	width: 13,
};

const compactHelpIconPath: CSSProperties = {
	color: 'inherit',
};

const CompactHelpLink = ({
	href,
	ariaLabel,
	title,
}: {
	readonly href: string;
	readonly ariaLabel: string;
	readonly title: string;
}) => {
	const [hovered, setHovered] = useState(false);

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			style={hovered ? compactHelpLinkHovered : compactHelpLink}
			aria-label={ariaLabel}
			title={title}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 512 512"
				style={compactHelpIcon}
				aria-hidden="true"
			>
				<path
					style={compactHelpIconPath}
					fill={CURRENT_COLOR}
					d="M464 256a208 208 0 1 0 -416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm256-80c-17.7 0-32 14.3-32 32l-48 0c0-44.2 35.8-80 80-80s80 35.8 80 80c0 35.1-20.5 57.5-38.2 70-6.3 4.4-12.5 7.8-17.8 10.4l0 21.9-48 0 0-56.7c1.4-.4 2.7-.7 4.1-1.1 12.2-3.2 23.3-6.1 34.1-13.7 10.4-7.3 17.8-16.9 17.8-30.8 0-17.7-14.3-32-32-32zM232 344l48 0 0 48-48 0 0-48z"
				/>
			</svg>
		</a>
	);
};

export const CompactExplanation = ({
	children,
	learnMoreAriaLabel,
	learnMoreHref,
	learnMoreTitle = 'Learn more',
}: {
	readonly children: ReactNode;
	readonly learnMoreAriaLabel?: string;
	readonly learnMoreHref?: string;
	readonly learnMoreTitle?: string;
}) => {
	return (
		<div style={compactExplanation}>
			{children}
			{learnMoreHref ? (
				<CompactHelpLink
					href={learnMoreHref}
					ariaLabel={learnMoreAriaLabel ?? learnMoreTitle}
					title={learnMoreTitle}
				/>
			) : null}
		</div>
	);
};

export const CompactNotSetUp = ({
	learnMoreAriaLabel,
	learnMoreHref,
	learnMoreTitle,
}: {
	readonly learnMoreAriaLabel: string;
	readonly learnMoreHref: string;
	readonly learnMoreTitle?: string;
}) => {
	return (
		<CompactExplanation
			learnMoreAriaLabel={learnMoreAriaLabel}
			learnMoreHref={learnMoreHref}
			learnMoreTitle={learnMoreTitle ?? 'Learn more'}
		>
			Not set up
		</CompactExplanation>
	);
};
