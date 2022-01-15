import React, {useCallback, useState} from 'react';
import {StackFrame} from '../react-overlay/utils/stack-frame';
import {Button} from './Button';
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
	borderBottom: '1px solid rgb(66, 144, 245)',
	backgroundColor: 'black',
};

const left: React.CSSProperties = {
	paddingRight: 14,
	flex: 1,
};

const fnName: React.CSSProperties = {
	fontSize: 14,
	marginBottom: 3,
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
					<div style={fnName}>{s.functionName ?? '(anonymous function)'}</div>
					{s._originalFileName ? (
						<div style={location}>
							{formatLocation(s._originalFileName as string)}:
							{s._originalLineNumber}
						</div>
					) : s.fileName ? (
						<div style={location}>
							{formatLocation(s.fileName as string)}:{s.lineNumber}
						</div>
					) : null}
				</div>
				{s._originalScriptCode && s._originalScriptCode.length > 0 ? (
					<Button onClick={toggleCodeFrame}>
						{showCodeFrame ? <CaretDown /> : <CaretRight />}
					</Button>
				) : null}
			</div>
			<div>
				{s._originalScriptCode &&
				s._originalScriptCode.length > 0 &&
				showCodeFrame ? (
					<CodeFrame
						lineNumberWidth={lineNumberWidth}
						source={s._originalScriptCode}
					/>
				) : null}
			</div>
		</div>
	);
};
