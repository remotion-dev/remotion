import {parseStudioProtocolCaptionStyleSelection} from './caption-style-selection';
import {isAllowedStudioProtocolPageOrigin} from './install-in-studio';

type Listener = {onChange: (slug: string | null) => void};

type CaptionStyleSubscription = {
	listeners: Set<Listener>;
	slug: string | null;
	hasSelection: boolean;
	dispose: () => void;
};

let subscription: CaptionStyleSubscription | null = null;

export const subscribeToCaptionStyleSelection = (
	onChange: (slug: string | null) => void,
): (() => void) => {
	if (
		typeof window === 'undefined' ||
		window.parent === window ||
		typeof MessageChannel === 'undefined' ||
		!isAllowedStudioProtocolPageOrigin(window.location.origin) ||
		new URLSearchParams(window.location.search).get(
			'remotion-studio-context',
		) !== 'captions'
	) {
		return () => {};
	}

	if (subscription === null) {
		const state: CaptionStyleSubscription = {
			listeners: new Set<Listener>(),
			slug: null,
			hasSelection: false,
			dispose: () => {},
		};
		let port: MessagePort | null = null;
		const disconnect = () => {
			if (port !== null) {
				port.onmessage = null;
				port.postMessage(null);
				port.close();
				port = null;
			}

			state.hasSelection = false;
		};

		const connect = () => {
			disconnect();
			const channel = new MessageChannel();
			port = channel.port1;
			port.onmessage = (event) => {
				if (port !== channel.port1) {
					return;
				}

				const message = parseStudioProtocolCaptionStyleSelection(event.data);
				if (message === null) {
					return;
				}

				state.slug =
					message.selection?.origin === window.location.origin
						? message.selection.slug
						: null;
				state.hasSelection = true;
				for (const entry of [...state.listeners]) {
					if (!state.listeners.has(entry)) {
						continue;
					}

					try {
						entry.onChange(state.slug);
					} catch (error) {
						// One failing listener must not prevent other listeners receiving updates.
						queueMicrotask(() => {
							throw error;
						});
					}
				}
			};

			window.parent.postMessage(
				{
					operation: 'subscribe-to-caption-style-selection',
					protocol: 'remotion-studio-protocol',
					protocolVersion: 1,
				},
				'*',
				[channel.port2],
			);
		};

		const onPageShow = (event: PageTransitionEvent) => {
			if (event.persisted) {
				connect();
			}
		};

		state.dispose = () => {
			window.removeEventListener('pagehide', disconnect);
			window.removeEventListener('pageshow', onPageShow);
			disconnect();
		};

		subscription = state;
		window.addEventListener('pagehide', disconnect);
		window.addEventListener('pageshow', onPageShow);
		connect();
	}

	const current = subscription;
	const listener = {onChange};
	current.listeners.add(listener);
	if (current.hasSelection) {
		queueMicrotask(() => {
			if (current.listeners.has(listener) && current.hasSelection) {
				onChange(current.slug);
			}
		});
	}

	return () => {
		if (!current.listeners.delete(listener) || current.listeners.size > 0) {
			return;
		}

		current.dispose();
		subscription = null;
	};
};
