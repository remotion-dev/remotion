import type {AnnotationHandler, HighlightedCode} from 'codehike/code';
import {highlight, InnerLine, Pre} from 'codehike/code';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Interactive, useDelayRender, useVideoConfig} from 'remotion';
import {z} from 'zod';

const REFERENCE_WIDTH = 1399;
const REFERENCE_HEIGHT = 1362;

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

const ReactFileIcon: React.FC<{readonly size: number}> = ({size}) => (
	<svg aria-hidden="true" height={size} viewBox="0 0 24 24" width={size}>
		<g fill="none" stroke="#3d7b86" strokeWidth="1.35">
			<ellipse cx="12" cy="12" rx="10" ry="3.8" />
			<ellipse cx="12" cy="12" rx="10" ry="3.8" transform="rotate(60 12 12)" />
			<ellipse cx="12" cy="12" rx="10" ry="3.8" transform="rotate(120 12 12)" />
		</g>
		<circle cx="12" cy="12" fill="#3d7b86" r="1.75" />
	</svg>
);

const ActivityIcon: React.FC<{
	readonly kind: 'debug' | 'explorer' | 'extensions' | 'gear' | 'search' | 'source';
	readonly size: number;
}> = ({kind, size}) => {
	const paths = {
		debug: 'M5 3l12 7-12 7zM15.5 11a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 2v5m-2.5-2.5h5',
		explorer: 'M6 3.5h7l5 5v12H6zM13 3.5v5h5M3.5 6.5v14h10',
		extensions: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
		gear: 'M9.7 3.2l.5-1.7h3.6l.5 1.7 1.5.7 1.6-.8 2.5 2.5-.8 1.6.7 1.5 1.7.5v3.6l-1.7.5-.7 1.5.8 1.6-2.5 2.5-1.6-.8-1.5.7-.5 1.7h-3.6l-.5-1.7-1.5-.7-1.6.8-2.5-2.5.8-1.6-.7-1.5-1.7-.5V9.2l1.7-.5.7-1.5-.8-1.6 2.5-2.5 1.6.8zM12 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
		search: 'M10.5 4.25a6.25 6.25 0 1 0 0 12.5 6.25 6.25 0 0 0 0-12.5zm4.7 10.95 5.1 5.1',
		source: 'M7 2.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5zm0 14a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5zm10-11a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5zM7 7.25v9.5m2.25-.55c4.2-.6 5.7-2.8 5.7-6',
	};

	return (
		<svg aria-hidden="true" height={size} viewBox="0 0 24 24" width={size}>
			<path
				d={paths[kind]}
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.25"
			/>
		</svg>
	);
};

const MoreIcon: React.FC<{readonly size: number}> = ({size}) => (
	<svg aria-hidden="true" height={size} viewBox="0 0 24 24" width={size}>
		<circle cx="6" cy="12" fill="currentColor" r="1.1" />
		<circle cx="12" cy="12" fill="currentColor" r="1.1" />
		<circle cx="18" cy="12" fill="currentColor" r="1.1" />
	</svg>
);

export const TextEditor: React.FC<TextEditorProps> = ({
	code,
	fileName,
	highlightedLines,
}) => {
	const {height, width} = useVideoConfig();
	const scale = Math.min(width / REFERENCE_WIDTH, height / REFERENCE_HEIGHT);
	const windowLeft = 56 * scale;
	const windowTop = 38 * scale;
	const windowWidth = width - windowLeft * 2;
	const windowHeight = height - windowTop - 74 * scale;
	const titleBarHeight = 28 * scale;
	const tabBarHeight = 34 * scale;
	const breadcrumbHeight = 22 * scale;
	const activityBarWidth = 50 * scale;
	const statusBarHeight = 32 * scale;
	const editorTop = titleBarHeight + tabBarHeight + breadcrumbHeight;
	const editorHeight = windowHeight - editorTop - statusBarHeight;
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
	const activityIcons = ['explorer', 'search', 'source', 'debug', 'extensions'] as const;

	return (
		<Interactive.Div
			name="Backdrop"
			style={{backgroundColor: '#000000', inset: 0, position: 'absolute'}}
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
					height: windowHeight,
					left: windowLeft,
					overflow: 'hidden',
					position: 'absolute',
					top: windowTop,
					width: windowWidth,
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
					<div style={{display: 'flex', gap: 8 * scale, left: 8 * scale, position: 'absolute'}}>
						{['#ff5f57', '#febc2e', '#28c840'].map((color) => (
							<div key={color} style={{backgroundColor: color, borderRadius: '50%', height: 12 * scale, width: 12 * scale}} />
						))}
					</div>
					<div style={{color: '#999999', fontSize: 12 * scale}}>{fileName} — brand</div>
					<div style={{color: '#888888', display: 'flex', position: 'absolute', right: 10 * scale}}>
						<MoreIcon size={14 * scale} />
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
					{activityIcons.map((kind, index) => (
						<div
							key={kind}
							style={{
								alignItems: 'center',
								color: index === 0 ? '#bdbdbd' : '#8d8d8d',
								display: 'flex',
								height: 45 * scale,
								justifyContent: 'center',
							}}
						>
							<ActivityIcon kind={kind} size={25 * scale} />
						</div>
					))}
					<div style={{alignItems: 'center', bottom: 7 * scale, display: 'flex', height: 34 * scale, justifyContent: 'center', position: 'absolute', width: '100%'}}>
						<ActivityIcon kind="gear" size={24 * scale} />
					</div>
				</Interactive.Div>

				<Interactive.Div
					name="Editor tabs"
					style={{backgroundColor: '#131414', height: tabBarHeight, left: activityBarWidth, position: 'absolute', right: 0, top: titleBarHeight}}
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
								<span style={{marginLeft: 7 * scale, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{tab.label}</span>
								<span style={{fontSize: 18 * scale, fontStyle: 'normal', lineHeight: 1, marginLeft: 'auto'}}>×</span>
							</div>
						))}
					</div>
					<div style={{color: '#777777', display: 'flex', position: 'absolute', right: 8 * scale, top: 8 * scale}}><MoreIcon size={14 * scale} /></div>
				</Interactive.Div>

				<Interactive.Div
					name="Breadcrumbs"
					style={{alignItems: 'center', backgroundColor: '#131414', color: '#9c9c9c', display: 'flex', fontSize: 12 * scale, height: breadcrumbHeight, left: activityBarWidth, paddingLeft: 16 * scale, position: 'absolute', right: 0, top: titleBarHeight + tabBarHeight}}
				>
					<span>src</span><span style={{margin: `0 ${6 * scale}px`, color: '#686868'}}>›</span>
					<span>announcements</span><span style={{margin: `0 ${6 * scale}px`, color: '#686868'}}>›</span>
					<span>whats-new-in-remotion</span><span style={{margin: `0 ${6 * scale}px`, color: '#686868'}}>›</span>
					<ReactFileIcon size={13 * scale} /><span style={{marginLeft: 5 * scale}}>{fileName}</span>
					<span style={{margin: `0 ${6 * scale}px`, color: '#686868'}}>›</span><span>…</span>
				</Interactive.Div>

				<Interactive.Div
					name="Code editor"
					style={{backgroundColor: '#131414', height: editorHeight + 2 * scale, left: activityBarWidth, overflow: 'hidden', position: 'absolute', right: 0, top: editorTop - 2 * scale}}
				>
					{highlighted ? (
						<Pre
							code={highlighted}
							handlers={[lineHandler]}
							style={{backgroundColor: 'transparent', color: '#d4d4d4', fontFamily: 'Menlo, Monaco, "Courier New", monospace', fontSize: 12 * scale, fontVariantLigatures: 'none', left: scale, lineHeight: `${18 * scale}px`, margin: 0, minWidth: '100%', position: 'relative', tabSize: 4}}
						/>
					) : null}
					<div style={{backgroundColor: '#131414', bottom: 0, position: 'absolute', right: 4 * scale, top: 0, width: 14 * scale}}>
						<div style={{backgroundColor: '#5c5d5e', borderRadius: 5 * scale, height: Math.min(707 * scale, editorHeight - 4 * scale), left: scale, position: 'absolute', top: 0, width: 13 * scale}} />
					</div>
				</Interactive.Div>

				<Interactive.Div
					name="Status bar"
					style={{alignItems: 'center', backgroundColor: '#181919', borderTop: `${scale}px solid #2b2b2b`, bottom: 0, boxSizing: 'border-box', color: '#9a9a9a', display: 'flex', fontSize: 12 * scale, height: statusBarHeight, left: 0, paddingLeft: 13 * scale, position: 'absolute', right: 0}}
				>
					<span style={{fontSize: 16 * scale, lineHeight: 1}}>⊗</span><span style={{marginLeft: 4 * scale}}>0</span>
					<span style={{fontSize: 15 * scale, marginLeft: 7 * scale}}>△</span><span style={{marginLeft: 3 * scale}}>0</span>
					<div style={{alignItems: 'center', display: 'flex', gap: 16 * scale, marginLeft: 'auto', paddingRight: 14 * scale}}>
						<span>Ln {code.split('\n').length}, Col 1</span><span>Tab Size: 4</span><span>UTF-8</span><span>LF</span><span>{'{ }'}&nbsp; TypeScript JSX</span><span>♙</span><span>✓ oxc</span><span>≋ Prettier</span><span style={{fontSize: 15 * scale}}>♧</span>
					</div>
				</Interactive.Div>
			</Interactive.Div>
		</Interactive.Div>
	);
};
