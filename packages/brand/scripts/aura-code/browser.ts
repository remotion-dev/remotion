import {BufferTarget, CanvasSource, Output, WebMOutputFormat} from 'mediabunny';
import type * as Monaco from 'monaco-editor';
import type {EditorShot} from './timeline';

declare global {
	interface Window {
		require: {
			config: (options: {paths: Record<string, string>}) => void;
			(modules: string[], callback: () => void): void;
		};
		monaco: typeof Monaco;
		auraReady: Promise<void>;
		captureAura: () => Promise<Record<string, unknown>>;
	}
}

let editor: Monaco.editor.IStandaloneCodeEditor;
let shot: EditorShot;
let currentTokens: EditorShot['tokens'];

window.auraReady = new Promise<void>((resolve, reject) => {
	const timeout = window.setTimeout(
		() => reject(new Error('Monaco did not become ready within 30 seconds.')),
		30000,
	);
	window.require.config({paths: {vs: '/vs'}});
	window.require(['vs/editor/editor.main'], async () => {
		try {
			const id = new URLSearchParams(location.search).get('shot');
			const response = await fetch(`/shot.json?id=${id}`);
			if (!response.ok) throw new Error('Could not load the editor shot.');
			shot = await response.json();
			currentTokens = shot.tokens;
			const {monaco} = window;
			monaco.languages.register({id: 'homepage-tsx'});
			monaco.languages.setTokensProvider('homepage-tsx', {
				getInitialState: () => ({
					line: 0,
					clone() {
						return this;
					},
					equals(other: Monaco.languages.IState) {
						return (
							this.line ===
							(other as Monaco.languages.IState & {line: number}).line
						);
					},
				}),
				tokenize(_line, state) {
					const previous = state as Monaco.languages.IState & {line: number};
					return {
						tokens: currentTokens[previous.line] ?? [],
						endState: {...previous, line: previous.line + 1},
					};
				},
			});
			monaco.languages.registerFoldingRangeProvider('homepage-tsx', {
				provideFoldingRanges: () => shot.folds,
			});
			const tokenNames = [
				...new Set(
					[...shot.tokens, ...shot.finalTokens].flatMap((line) =>
						line.map((token) => token.scopes),
					),
				),
			];
			monaco.editor.defineTheme('homepage-dark-plus', {
				base: 'vs-dark',
				inherit: true,
				rules: tokenNames.map((token) => ({token, foreground: token.slice(5)})),
				colors: {
					'editor.background': '#131414',
					'editor.foreground': '#D4D4D4',
					'editorLineNumber.foreground': '#858585',
					'editorLineNumber.activeForeground': '#858585',
					'editorCursor.foreground': '#D4D4D4',
					'editor.selectionBackground': '#264f78',
					'editor.inactiveSelectionBackground': '#264f78',
				},
			});
			editor = monaco.editor.create(document.getElementById('editor')!, {
				value: shot.code,
				language: 'homepage-tsx',
				theme: 'homepage-dark-plus',
				fontFamily: 'Menlo, Monaco, "Courier New", monospace',
				fontSize: shot.fontSize,
				lineHeight: shot.lineHeight,
				fontWeight: '400',
				letterSpacing: 0,
				padding: {top: 16, bottom: 8},
				lineNumbersMinChars: 4,
				lineDecorationsWidth: 18,
				minimap: {enabled: false},
				scrollbar: {vertical: 'hidden', horizontal: 'hidden'},
				scrollBeyondLastLine: true,
				readOnly: false,
				renderLineHighlight: 'none',
				folding: shot.folds.length > 0,
				foldingHighlight: false,
				showFoldingControls: 'never',
				glyphMargin: false,
				overviewRulerLanes: 0,
				hideCursorInOverviewRuler: true,
				contextmenu: false,
				stickyScroll: {enabled: false},
				guides: {indentation: false, bracketPairs: false},
				bracketPairColorization: {enabled: false},
				colorDecorators: false,
				cursorBlinking: 'solid',
				cursorSmoothCaretAnimation: 'off',
				cursorWidth: 2,
				quickSuggestions: false,
				suggestOnTriggerCharacters: false,
				'semanticHighlighting.enabled': false,
			});
			await document.fonts.ready;
			editor.render(true);
			await new Promise(requestAnimationFrame);
			await new Promise(requestAnimationFrame);
			if (shot.folds.length > 0) {
				const fold = editor.getAction('editor.fold');
				if (!fold) throw new Error('Monaco fold action is unavailable.');
				await fold.run({
					selectionLines: shot.folds.map((range) => range.start - 1),
				});
			}
			editor.setScrollTop(
				shot.firstVisibleLine === 1
					? 0
					: editor.getTopForLineNumber(shot.firstVisibleLine),
			);
			if (shot.id === 'duplicate') {
				editor.setPosition({lineNumber: 13, column: 1});
				editor.focus();
				document.body.classList.add('typing');
			}
			editor.render(true);
			await new Promise(requestAnimationFrame);
			clearTimeout(timeout);
			resolve();
		} catch (error) {
			clearTimeout(timeout);
			reject(error);
		}
	});
});

window.captureAura = async () => {
	await window.auraReady;
	const shell = document.getElementById('shell')!;
	const canvas = document.createElement('canvas') as HTMLCanvasElement & {
		layoutSubtree: boolean;
		requestPaint: () => void;
	};
	canvas.width = 3600;
	canvas.height = 2400;
	canvas.style.width = '1800px';
	canvas.style.height = '1200px';
	canvas.layoutSubtree = true;
	canvas.setAttribute('layoutsubtree', '');
	canvas.setAttribute('content', 'drawable');
	shell.setAttribute('drawable', '');
	document.body.appendChild(canvas);
	canvas.moveBefore(shell, null);
	const context = canvas.getContext('2d') as CanvasRenderingContext2D & {
		drawElementImage: (
			element: Element,
			x: number,
			y: number,
			width: number,
			height: number,
		) => void;
	};
	if (!context?.drawElementImage || !canvas.requestPaint) {
		throw new Error(
			'Capture requires Chrome 157+ with CanvasDrawElement enabled.',
		);
	}
	const target = new BufferTarget();
	const output = new Output({format: new WebMOutputFormat(), target});
	const source = new CanvasSource(canvas, {codec: 'vp9', bitrate: 32_000_000});
	output.addVideoTrack(source, {frameRate: 30});
	await output.start();
	const actions: Record<string, unknown>[] = [];
	// Every output frame is a fresh paint of the actual Monaco DOM.
	for (let frame = 0; frame < shot.frameCount; frame++) {
		if (shot.id === 'duplicate') {
			let action: string | null = null;
			if ([0, 8, 16, 24, 32, 40].includes(frame)) {
				action = 'expandLineSelection';
				editor.trigger('aura-capture', action, null);
			}
			if (frame === 42) {
				currentTokens = shot.finalTokens;
				action = 'editor.action.copyLinesDownAction';
				editor.trigger('aura-capture', action, null);
				if (editor.getValue() !== shot.finalCode)
					throw new Error(
						'Native Copy Line Down did not duplicate the complete Intro block.',
					);
			}
			if (action)
				actions.push({
					frame,
					timeInSeconds: frame / 30,
					action,
					selection: editor.getSelection(),
					lineCount: editor.getModel()!.getLineCount(),
				});
		}
		editor.render(true);
		await new Promise(requestAnimationFrame);
		await new Promise<void>((resolve, reject) => {
			const timeout = window.setTimeout(
				() => reject(new Error(`Frame ${frame} did not paint.`)),
				10000,
			);
			canvas.addEventListener(
				'paint',
				() => {
					clearTimeout(timeout);
					try {
						context.reset();
						context.scale(2, 2);
						context.drawElementImage(shell, 0, 0, 1800, 1200);
						resolve();
					} catch (error) {
						reject(error);
					}
				},
				{once: true},
			);
			canvas.requestPaint();
		});
		await source.add(frame / 30, 1 / 30);
		if (
			frame === shot.frameCount - 1 ||
			(shot.id === 'duplicate' && [0, 40, 42].includes(frame))
		) {
			const suffix =
				frame === shot.frameCount - 1
					? ''
					: frame === 0
						? '-first-line'
						: frame === 40
							? '-selected'
							: '-copied';
			const png = await new Promise<Blob>((resolve, reject) =>
				canvas.toBlob((blob) =>
					blob ? resolve(blob) : reject(new Error('PNG encoding failed.')),
				),
			);
			const response = await fetch(`/save/${shot.id}${suffix}.png`, {
				method: 'POST',
				body: png,
			});
			if (!response.ok) throw new Error('Could not save the captured PNG.');
		}
	}
	if (editor.getValue() !== shot.finalCode)
		throw new Error(
			'The recorded source does not match the intended final source.',
		);

	source.close();
	await output.finalize();
	const videoResponse = await fetch(`/save/${shot.id}.webm`, {
		method: 'POST',
		body: target.buffer,
	});
	if (!videoResponse.ok) throw new Error('Could not save the captured WebM.');
	return {
		actions,
		sourceLines: shot.code.split('\n').length,
		finalSourceLines: shot.finalCode.split('\n').length,
		scrollTop: editor.getScrollTop(),
		linePositions: shot.anchors.map((anchor) => {
			const position = editor.getScrolledVisiblePosition({
				lineNumber: anchor.line,
				column: 1,
			});
			return {
				...anchor,
				x: position ? position.left * 2 : null,
				y: position ? (152 + position.top) * 2 : null,
			};
		}),
	};
};
