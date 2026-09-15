import type {AnnotationHandler, HighlightedCode} from 'codehike/code';
import {highlight, InnerLine, Pre} from 'codehike/code';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Interactive, useDelayRender} from 'remotion';
import {z} from 'zod';
import {ReactFileIcon, VscodeIcon} from './vscode-icons';

const REFERENCE_WIDTH = 1287;
const REFERENCE_HEIGHT = 1250;

export const textEditorSchema = z.object({
	code: z.string().describe('Code shown in the editor'),
	fileName: z.string().describe('Active file name'),
	height: z.number().int().min(320).max(4096).describe('Output height'),
	highlightedLines: z
		.string()
		.describe('Highlighted lines, for example 11-23,39'),
	width: z.number().int().min(320).max(4096).describe('Output width'),
});

export type TextEditorProps = z.infer<typeof textEditorSchema>;

export const TextEditor: React.FC<TextEditorProps> = ({
	code,
	fileName,
	height,
	highlightedLines,
	width,
}) => {
	const scale = Math.min(width / REFERENCE_WIDTH, height / REFERENCE_HEIGHT);
	const titleBarHeight = 28 * scale;
	const tabBarHeight = 34 * scale;
	const breadcrumbHeight = 22 * scale;
	const activityBarWidth = 50 * scale;
	const statusBarHeight = 32 * scale;
	const editorTop = titleBarHeight + tabBarHeight + breadcrumbHeight;
	const editorHeight = height - editorTop - statusBarHeight;
	const [highlighted, setHighlighted] = useState<HighlightedCode | null>(null);
	const {cancelRender, continueRender, delayRender} = useDelayRender();
	const [handle] = useState(() => delayRender('Highlighting text editor code'));
	const hasContinued = useRef(false);

	useEffect(() => {
		let cancelled = false;

		highlight({value: code, lang: 'tsx', meta: ''}, 'dark-plus')
			.then((result) => {
				if (!cancelled) {
					setHighlighted(result);
				}
			})
			.catch((error) => cancelRender(error));

		return () => {
			cancelled = true;
		};
	}, [cancelRender, code]);

	useEffect(() => {
		if (highlighted && !hasContinued.current) {
			hasContinued.current = true;
			continueRender(handle);
		}
	}, [continueRender, handle, highlighted]);

	const highlightedLineNumbers = useMemo(() => {
		const result = new Set<number>();
		for (const part of highlightedLines.split(',')) {
			const [rawStart, rawEnd] = part.trim().split('-');
			const start = Number(rawStart);
			const end = rawEnd === undefined ? start : Number(rawEnd);
			if (!Number.isFinite(start) || !Number.isFinite(end)) {
				continue;
			}

			for (
				let line = Math.max(1, Math.min(start, end));
				line <= Math.max(start, end);
				line++
			) {
				result.add(line);
			}
		}

		return result;
	}, [highlightedLines]);

	const lineHandler = useMemo<AnnotationHandler>(
		() => ({
			name: 'editor-line',
			Line: ({lineNumber, ...props}) => (
				<InnerLine
					merge={{lineNumber, ...props}}
					style={{
						alignItems: 'center',
						backgroundColor: 'transparent',
						display: 'flex',
						height: 18 * scale,
						minWidth: '100%',
					}}
				>
					<span
						style={{
							boxSizing: 'border-box',
							color: '#858585',
							flex: `0 0 ${67 * scale}px`,
							fontSize: 12 * scale,
							paddingRight: 25 * scale,
							textAlign: 'right',
							userSelect: 'none',
						}}
					>
						{lineNumber}
					</span>
					<span
						style={{
							backgroundColor: highlightedLineNumbers.has(lineNumber)
								? '#212122'
								: 'transparent',
							flex: 1,
							height: '100%',
							whiteSpace: 'pre',
						}}
					>
						{props.children}
					</span>
				</InnerLine>
			),
		}),
		[highlightedLineNumbers, scale],
	);

	const tabs = [
		{active: true, label: fileName},
		{active: false, label: 'Root.tsx'},
		{active: false, label: 'SlideInOverlay.tsx'},
	];
	const activityIcons = [
		'files',
		'search-large',
		'source-control',
		'debug-alt',
		'extensions',
	] as const;

	return (
		<Interactive.Div
			name="Backdrop"
			style={{
				backgroundColor: '#000000',
				borderRadius: 10 * scale,
				inset: 0,
				overflow: 'hidden',
				position: 'absolute',
			}}
		>
			<Interactive.Div
				name="Editor window"
				style={{
					backgroundColor: '#131414',
					border: `${scale}px solid #454545`,
					borderRadius: 10 * scale,
					boxSizing: 'border-box',
					color: '#cccccc',
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
					height,
					left: 0,
					overflow: 'hidden',
					position: 'absolute',
					top: 0,
					width,
				}}
			>
				<Interactive.Div
					name="Title bar"
					style={{
						alignItems: 'center',
						backgroundColor: '#181919',
						borderBottom: `${scale}px solid #2b2b2b`,
						boxSizing: 'border-box',
						display: 'flex',
						height: titleBarHeight,
						justifyContent: 'center',
						position: 'relative',
					}}
				>
					<div
						style={{
							display: 'flex',
							gap: 8 * scale,
							left: 8 * scale,
							position: 'absolute',
						}}
					>
						{['#ff5f57', '#febc2e', '#28c840'].map((color) => (
							<div
								key={color}
								style={{
									backgroundColor: color,
									borderRadius: '50%',
									height: 12 * scale,
									width: 12 * scale,
								}}
							/>
						))}
					</div>
					<div style={{color: '#999999', fontSize: 12 * scale}}>
						{fileName} — brand
					</div>
					<div
						style={{
							color: '#888888',
							display: 'flex',
							position: 'absolute',
							right: 10 * scale,
						}}
					>
						<VscodeIcon name="ellipsis" size={14 * scale} />
					</div>
				</Interactive.Div>

				<Interactive.Div
					name="Activity bar"
					style={{
						backgroundColor: '#181919',
						bottom: statusBarHeight,
						borderRight: `${scale}px solid #2b2b2b`,
						color: '#8e8e8e',
						left: 0,
						position: 'absolute',
						top: titleBarHeight,
						width: activityBarWidth,
					}}
				>
					{activityIcons.map((name, index) => (
						<div
							key={name}
							style={{
								alignItems: 'center',
								color: index === 0 ? '#bdbdbd' : '#8d8d8d',
								display: 'flex',
								height: 45 * scale,
								justifyContent: 'center',
							}}
						>
							<VscodeIcon name={name} size={25 * scale} />
						</div>
					))}
					<div
						style={{
							alignItems: 'center',
							bottom: 7 * scale,
							display: 'flex',
							height: 34 * scale,
							justifyContent: 'center',
							position: 'absolute',
							width: '100%',
						}}
					>
						<VscodeIcon name="settings-gear" size={24 * scale} />
					</div>
				</Interactive.Div>

				<Interactive.Div
					name="Editor tabs"
					style={{
						backgroundColor: '#131414',
						height: tabBarHeight,
						left: activityBarWidth,
						position: 'absolute',
						right: 0,
						top: titleBarHeight,
					}}
				>
					<div style={{display: 'flex', height: '100%'}}>
						{tabs.map((tab, index) => (
							<div
								key={tab.label}
								style={{
									alignItems: 'center',
									backgroundColor: tab.active ? '#131414' : '#181919',
									borderLeft: index === 0 ? 'none' : `${scale}px solid #2b2b2b`,
									boxSizing: 'border-box',
									color: tab.active ? '#e7e7e7' : '#8e8e8e',
									display: 'flex',
									fontSize: 12 * scale,
									fontStyle: index === 2 ? 'italic' : 'normal',
									height: '100%',
									paddingLeft: 10 * scale,
									paddingRight: 9 * scale,
									width: [126, 111, 163][index] * scale,
								}}
							>
								<ReactFileIcon size={14 * scale} />
								<span
									style={{
										marginLeft: 7 * scale,
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									{tab.label}
								</span>
								<span style={{display: 'flex', marginLeft: 'auto'}}>
									<VscodeIcon name="close" size={14 * scale} />
								</span>
							</div>
						))}
					</div>
					<div
						style={{
							color: '#777777',
							display: 'flex',
							position: 'absolute',
							right: 8 * scale,
							top: 8 * scale,
						}}
					>
						<VscodeIcon name="ellipsis" size={14 * scale} />
					</div>
				</Interactive.Div>

				<Interactive.Div
					name="Breadcrumbs"
					style={{
						alignItems: 'center',
						backgroundColor: '#131414',
						color: '#9c9c9c',
						display: 'flex',
						fontSize: 12 * scale,
						height: breadcrumbHeight,
						left: activityBarWidth,
						paddingLeft: 16 * scale,
						position: 'absolute',
						right: 0,
						top: titleBarHeight + tabBarHeight,
					}}
				>
					<span>src</span>
					<span style={{margin: `0 ${6 * scale}px`, color: '#686868'}}>›</span>
					<span>announcements</span>
					<span style={{margin: `0 ${6 * scale}px`, color: '#686868'}}>›</span>
					<span>whats-new-in-remotion</span>
					<span style={{margin: `0 ${6 * scale}px`, color: '#686868'}}>›</span>
					<ReactFileIcon size={13 * scale} />
					<span style={{marginLeft: 5 * scale}}>{fileName}</span>
					<span style={{margin: `0 ${6 * scale}px`, color: '#686868'}}>›</span>
					<span>…</span>
				</Interactive.Div>

				<Interactive.Div
					name="Code editor"
					style={{
						backgroundColor: '#131414',
						height: editorHeight + 2 * scale,
						left: activityBarWidth,
						overflow: 'hidden',
						position: 'absolute',
						right: 0,
						top: editorTop - 2 * scale,
					}}
				>
					{highlighted ? (
						<Pre
							code={highlighted}
							handlers={[lineHandler]}
							style={{
								backgroundColor: 'transparent',
								color: '#d4d4d4',
								fontFamily: 'Menlo, Monaco, "Courier New", monospace',
								fontSize: 12 * scale,
								fontVariantLigatures: 'none',
								left: scale,
								lineHeight: `${18 * scale}px`,
								margin: 0,
								minWidth: '100%',
								position: 'relative',
								tabSize: 4,
							}}
						/>
					) : null}
					<div
						style={{
							backgroundColor: '#131414',
							bottom: 0,
							position: 'absolute',
							right: 4 * scale,
							top: 0,
							width: 14 * scale,
						}}
					>
						<div
							style={{
								backgroundColor: '#5c5d5e',
								borderRadius: 5 * scale,
								height: Math.min(707 * scale, editorHeight - 4 * scale),
								left: scale,
								position: 'absolute',
								top: 0,
								width: 13 * scale,
							}}
						/>
					</div>
				</Interactive.Div>

				<Interactive.Div
					name="Status bar"
					style={{
						alignItems: 'center',
						backgroundColor: '#181919',
						borderTop: `${scale}px solid #2b2b2b`,
						bottom: 0,
						boxSizing: 'border-box',
						color: '#9a9a9a',
						display: 'flex',
						fontSize: 12 * scale,
						height: statusBarHeight,
						left: 0,
						paddingLeft: 13 * scale,
						position: 'absolute',
						right: 0,
					}}
				>
					<VscodeIcon name="error" size={13 * scale} />
					<span style={{marginLeft: 4 * scale}}>0</span>
					<span style={{display: 'flex', marginLeft: 7 * scale}}>
						<VscodeIcon name="warning" size={13 * scale} />
					</span>
					<span style={{marginLeft: 3 * scale}}>0</span>
					<div
						style={{
							alignItems: 'center',
							display: 'flex',
							gap: 16 * scale,
							marginLeft: 'auto',
							paddingRight: 14 * scale,
						}}
					>
						<span>Ln {code.split('\n').length}, Col 1</span>
						<span>Tab Size: 4</span>
						<span>UTF-8</span>
						<span>LF</span>
						<span>{'{ }'}&nbsp; TypeScript JSX</span>
						<span style={{display: 'flex'}}>
							<VscodeIcon name="copilot" size={14 * scale} />
						</span>
						<span>✓ oxc</span>
						<span style={{display: 'flex'}}>
							<VscodeIcon name="bell" size={14 * scale} />
						</span>
					</div>
				</Interactive.Div>
			</Interactive.Div>
		</Interactive.Div>
	);
};
