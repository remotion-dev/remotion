import React, {useCallback, useState} from 'react';
import type {SymbolicatedStackFrame} from '../react-overlay/utils/stack-frame';
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
	s: SymbolicatedStackFrame;
	lineNumberWidth: number;
	isFirst: boolean;
	defaultFunctionName: string;
}> = ({s, lineNumberWidth, isFirst, defaultFunctionName}) => {
	const [showCodeFrame, setShowCodeFrame] = useState(
		() =>
			(!s.originalFileName?.includes('node_modules') &&
				!s.originalFileName?.startsWith('webpack/')) ||
			isFirst
	);
	const toggleCodeFrame = useCallback(() => {
		setShowCodeFrame((f) => !f);
	}, []);
	return (
		<div>
			<div style={header}>
				<div style={left}>
					<div style={fnName}>
						{s.originalFunctionName ?? defaultFunctionName}
					</div>
					{s.originalFileName ? (
						<div style={location}>
							{formatLocation(s.originalFileName as string)}:
							{s.originalLineNumber}
						</div>
					) : null}
				</div>
				{s.originalScriptCode && s.originalScriptCode.length > 0 ? (
					<Button onClick={toggleCodeFrame}>
						{showCodeFrame ? <CaretDown invert={false} /> : <CaretRight />}
					</Button>
				) : null}
			</div>
			<div>
				{s.originalScriptCode &&
				s.originalScriptCode.length > 0 &&
				showCodeFrame ? (
					<CodeFrame
						lineNumberWidth={lineNumberWidth}
						source={s.originalScriptCode}
					/>
				) : null}
			</div>
		</div>
	);
};
