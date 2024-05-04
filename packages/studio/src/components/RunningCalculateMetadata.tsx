import type React from 'react';
import {useEffect, useMemo, useState} from 'react';
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
	flexDirection: 'column',
	paddingTop: 40,
	paddingBottom: 40,
	paddingLeft: 100,
	paddingRight: 100,
};

export const RunningCalculateMetadata: React.FC = () => {
	const [takesALongTime, setTakesALongTime] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setTakesALongTime(true);
		}, 500);
		return () => {
			clearTimeout(timeout);
		};
	}, []);

	const style = useMemo(() => {
		return {
			...loaderLabel,
			opacity: takesALongTime ? 1 : 0,
			transition: 'opacity 0.3s',
		};
	}, [takesALongTime]);

	return (
		<div style={container}>
			<Spinner size={30} duration={1} />
			<Spacing y={2} />
			<div style={style}>
				Running <code style={inlineCodeSnippet}>calculateMetadata()</code>...
			</div>
		</div>
	);
};
