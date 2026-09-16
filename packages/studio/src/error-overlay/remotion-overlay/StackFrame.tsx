import type {
	EditorPickerId,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import React, {useCallback, useState} from 'react';
import {Button} from '../../components/Button';
import {CodeFrame} from '../../components/CodeFrame';
import {
	BORDER_WHITE_ALPHA_12,
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
} from '../../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../../helpers/hoverable';
import {openInEditor} from '../../helpers/open-in-editor';
import {CaretDown} from '../../icons/caret';
import {formatLocation} from './format-location';

const location: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'monospace',
	overflowWrap: 'anywhere',
};

const header: React.CSSProperties = {
	paddingTop: 10,
	paddingBottom: 10,
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
	lineHeight: 1.5,
	marginBottom: 3,
};

export const StackElement: React.FC<{
	readonly s: SymbolicatedStackFrame;
	readonly lineNumberWidth: number;
	readonly isFirst: boolean;
	readonly defaultFunctionName: string | null;
	readonly editorId: EditorPickerId | null;
	readonly collapsible: boolean;
	readonly fontSize: number;
	readonly horizontalSpacing: number;
	readonly headerAction: React.ReactNode;
}> = ({
	s,
	lineNumberWidth,
	isFirst,
	defaultFunctionName,
	editorId,
	collapsible,
	fontSize,
	horizontalSpacing,
	headerAction,
}) => {
	const [showCodeFrame, setShowCodeFrame] = useState(
		() =>
			(!s.originalFileName?.includes('node_modules') &&
				!s.originalFileName?.startsWith('webpack/')) ||
			isFirst,
	);
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
	const functionName = s.originalFunctionName ?? defaultFunctionName;
	const shouldShowCodeFrame = collapsible ? showCodeFrame : true;
	return (
		<div className="css-reset">
			<div
				style={{
					...header,
					borderBottom: shouldShowCodeFrame ? 'none' : BORDER_WHITE_ALPHA_12,
					paddingLeft: horizontalSpacing,
					paddingRight: horizontalSpacing,
				}}
			>
				<div style={left}>
					{functionName === null ? null : (
						<div style={{...fnName, fontSize}}>{functionName}</div>
					)}
					{s.originalFileName ? (
						<div style={{...location, fontSize}}>
							{canOpenFileLocation ? (
								<button
									type="button"
									className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
									onClick={onOpenFileLocation}
									style={{
										...location,
										...hoverableStyle({
											idleBackground: TRANSPARENT,
											hoverBackground: TRANSPARENT,
											idleColor: LIGHT_TEXT,
											hoverColor: WHITE,
										}),
										appearance: 'none',
										border: 'none',
										color: undefined,
										cursor: 'default',
										fontSize,
										padding: 0,
									}}
								>
									{formatLocation(s.originalFileName as string)}:
									{s.originalLineNumber}
								</button>
							) : (
								<>
									{formatLocation(s.originalFileName as string)}:
									{s.originalLineNumber}
								</>
							)}
						</div>
					) : null}
				</div>
				{headerAction}
				{collapsible &&
				s.originalScriptCode &&
				s.originalScriptCode.length > 0 ? (
					<Button onClick={toggleCodeFrame}>
						<div
							style={{
								display: 'flex',
								transform: shouldShowCodeFrame ? undefined : 'rotate(-90deg)',
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
				shouldShowCodeFrame ? (
					<CodeFrame
						fontSize={fontSize}
						horizontalMargin={horizontalSpacing}
						lineNumberWidth={lineNumberWidth}
						source={s.originalScriptCode}
					/>
				) : null}
			</div>
		</div>
	);
};
