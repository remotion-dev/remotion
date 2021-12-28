import React, {useCallback, useState} from 'react';
import {StackFrame} from '../react-overlay/utils/stack-frame';
import {CaretDown, CaretRight} from './carets';
import {CodeFrame} from './CodeFrame';
import {formatLocation} from './format-location';

const location: React.CSSProperties = {
	color: 'rgba(255, 255, 255, 0.6)',
	fontFamily: 'monospace',
};

const header: React.CSSProperties = {
	paddingLeft: 14,
	paddingTop: 10,
	paddingBottom: 10,
	paddingRight: 14,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const left: React.CSSProperties = {
	paddingRight: 14,
	flex: 1,
};

const fnName: React.CSSProperties = {
	fontSize: 14,
};

const INPUT_BORDER_COLOR_UNHOVERED = 'rgba(0, 0, 0, 0.6)';
const INPUT_BACKGROUND = '#2f363d';

const button: React.CSSProperties = {
	border: `1px solid ${INPUT_BORDER_COLOR_UNHOVERED}`,
	borderRadius: 4,
	backgroundColor: INPUT_BACKGROUND,
	appearance: 'none',
	fontFamily: 'inherit',
	fontSize: 14,
	color: 'white',
};

const buttonContainer: React.CSSProperties = {
	padding: 10,
	cursor: 'pointer',
	fontSize: 14,
};

export const StackElement: React.FC<{
	s: StackFrame;
	lineNumberWidth: number;
	isFirst: boolean;
}> = ({s, lineNumberWidth, isFirst}) => {
	const [showCodeFrame, setShowCodeFrame] = useState(
		() => !s._originalFileName?.includes('node_modules') || isFirst
	);
	const toggleCodeFrame = useCallback(() => {
		setShowCodeFrame((f) => !f);
	}, []);
	return (
		<div>
			<div style={header}>
				<div style={left}>
					<div style={fnName}>{s.functionName}</div>
					<div style={location}>
						{formatLocation(s._originalFileName as string)}:{s.columnNumber}
					</div>
				</div>
				{s._originalScriptCode ? (
					<button style={button} type="button" onClick={toggleCodeFrame}>
						<div style={buttonContainer}>
							{showCodeFrame ? <CaretDown /> : <CaretRight />}
						</div>
					</button>
				) : null}
			</div>
			<div>
				{s._originalScriptCode && showCodeFrame ? (
					<CodeFrame
						lineNumberWidth={lineNumberWidth}
						source={s._originalScriptCode}
					/>
				) : null}
			</div>
		</div>
	);
};
