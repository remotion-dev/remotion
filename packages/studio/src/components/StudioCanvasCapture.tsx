import {
	HtmlInCanvasCapture,
	type HtmlInCanvasCaptureHandle,
	isHtmlInCanvasAvailable,
} from '@remotion/canvas-capture';
import React, {useEffect, useMemo, useRef} from 'react';
import {useKeybinding} from '../helpers/use-keybinding';

const logCaptureError = (message: string, err: unknown) => {
	// eslint-disable-next-line no-console
	console.error(message, err instanceof Error ? err.message : String(err));
};

export const StudioCanvasCapture: React.FC<{
	readonly children: React.ReactNode;
	readonly density: number;
}> = ({children, density}) => {
	const captureRef = useRef<HtmlInCanvasCaptureHandle | null>(null);
	const isSupported = useMemo(() => isHtmlInCanvasAvailable(), []);
	const keybindings = useKeybinding();

	useEffect(() => {
		if (!isSupported) {
			return;
		}

		const binding = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'p',
			commandCtrlKey: true,
			callback: () => {
				captureRef.current?.toggleRecording().catch((err) => {
					logCaptureError('Could not toggle Studio canvas recording:', err);
				});
			},
			preventDefault: true,
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: true,
		});

		return () => {
			binding.unregister();
		};
	}, [isSupported, keybindings]);

	return (
		<HtmlInCanvasCapture
			ref={captureRef}
			density={density}
			filename="remotion-studio-canvas-recording.webm"
		>
			{children}
		</HtmlInCanvasCapture>
	);
};
