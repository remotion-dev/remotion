import type {
	EditorPickerId,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import React, {useCallback, useState} from 'react';
import {Button} from '../../components/Button';
import {BORDER_WHITE_ALPHA_12, LIGHT_TEXT, WHITE} from '../../helpers/colors';
import {openInEditor} from '../../helpers/open-in-editor';
import {CaretDown} from '../../icons/caret';
import {CodeFrame} from './CodeFrame';
import {formatLocation} from './format-location';

const location: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'monospace',
	fontSize: 14,
	overflowWrap: 'anywhere',
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
	minWidth: 0,
};

const fnName: React.CSSProperties = {
	fontSize: 14,
	lineHeight: 1.5,
	marginBottom: 3,
};

export const StackElement: React.FC<{
	readonly s: SymbolicatedStackFrame;
	readonly lineNumberWidth: number;
	readonly isFirst: boolean;
	readonly defaultFunctionName: string;
	readonly editorId: EditorPickerId | null;
}> = ({s, lineNumberWidth, isFirst, defaultFunctionName, editorId}) => {
	const [showCodeFrame, setShowCodeFrame] = useState(
		() =>
			(!s.originalFileName?.includes('node_modules') &&
				!s.originalFileName?.startsWith('webpack/')) ||
			isFirst,
	);
	const [locationHovered, setLocationHovered] = useState(false);
	const canOpenFileLocation = Boolean(editorId && s.originalFileName);
	const onOpenFileLocation = useCallback(() => {
		if (!canOpenFileLocation) {
			return;
		}

		if (!editorId) {
			return;
		}

		openInEditor(s, editorId).catch((err: unknown) => {
			// eslint-disable-next-line no-console
			console.log('Could not open in editor', err);
		});
	}, [canOpenFileLocation, editorId, s]);
	const toggleCodeFrame = useCallback(() => {
		setShowCodeFrame((f) => !f);
	}, []);
	return (
		<div className="css-reset">
			<div
				style={{
					...header,
					borderBottom: showCodeFrame ? 'none' : BORDER_WHITE_ALPHA_12,
				}}
			>
				<div style={left}>
					<div style={fnName}>
						{s.originalFunctionName ?? defaultFunctionName}
					</div>
					{s.originalFileName ? (
						<div style={location}>
							{canOpenFileLocation ? (
								<span
									onClick={onOpenFileLocation}
									onPointerEnter={() => {
										setLocationHovered(true);
									}}
									onPointerLeave={() => {
										setLocationHovered(false);
									}}
									style={{
										...location,
										color: locationHovered ? WHITE : LIGHT_TEXT,
										cursor: 'pointer',
									}}
								>
									{formatLocation(s.originalFileName as string)}:
									{s.originalLineNumber}
								</span>
							) : (
								<>
									{formatLocation(s.originalFileName as string)}:
									{s.originalLineNumber}
								</>
							)}
						</div>
					) : null}
				</div>
				{s.originalScriptCode && s.originalScriptCode.length > 0 ? (
					<Button onClick={toggleCodeFrame}>
						<div
							style={{
								display: 'flex',
								transform: showCodeFrame ? undefined : 'rotate(-90deg)',
							}}
						>
							<CaretDown />
						</div>
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
