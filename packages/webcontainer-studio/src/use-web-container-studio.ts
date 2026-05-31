import {WebContainer} from '@webcontainer/api';
import {useCallback, useEffect, useRef, useState} from 'react';
import {templateFiles} from './template-files';

type Phase =
	| {type: 'booting'}
	| {type: 'mounting'}
	| {type: 'installing'; output: string}
	| {type: 'starting'}
	| {type: 'ready'; url: string}
	| {type: 'error'; message: string};

export function useWebContainerStudio() {
	const [phase, setPhase] = useState<Phase>({type: 'booting'});
	const containerRef = useRef<WebContainer | null>(null);

	const appendOutput = useCallback((text: string) => {
		setPhase((prev) => {
			if (prev.type === 'installing') {
				return {type: 'installing', output: prev.output + text};
			}

			return {type: 'installing', output: text};
		});
	}, []);

	useEffect(() => {
		let cancelled = false;

		async function run() {
			try {
				setPhase({type: 'booting'});
				const container = await WebContainer.boot();
				containerRef.current = container;
				if (cancelled) {
					await container.teardown();
					return;
				}

				setPhase({type: 'mounting'});
				await container.mount(templateFiles);

				setPhase({type: 'installing', output: ''});
				const installProcess = await container.spawn('npm', ['install']);

				installProcess.output.pipeTo(
					new WritableStream({
						write(data) {
							appendOutput(data);
						},
					}),
				);

				const installExitCode = await installProcess.exit;
				if (cancelled) return;
				if (installExitCode !== 0) {
					setPhase({
						type: 'error',
						message: `npm install failed with exit code ${installExitCode}`,
					});
					return;
				}

				setPhase({type: 'starting'});
				const devProcess = await container.spawn('npm', ['run', 'dev']);

				devProcess.output.pipeTo(
					new WritableStream({
						write(data) {
							appendOutput(data);
						},
					}),
				);

				container.on('server-ready', (port, url) => {
					if (cancelled) return;
					setPhase({type: 'ready', url});
				});
			} catch (err) {
				if (cancelled) return;
				setPhase({
					type: 'error',
					message: err instanceof Error ? err.message : String(err),
				});
			}
		}

		run();

		return () => {
			cancelled = true;
			containerRef.current?.teardown();
		};
	}, [appendOutput]);

	return {phase};
}
