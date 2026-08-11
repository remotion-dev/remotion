import React from 'react';

type Props = {
	readonly children: React.ReactNode;
	readonly onError: (error: Error) => void;
	readonly onClear: () => void;
};

type State = {
	hasError: boolean;
};

type Hot = {
	addStatusHandler(callback: (status: string) => void): void;
	removeStatusHandler(callback: (status: string) => void): void;
};

// `__webpack_module__` is injected by webpack into every bundled module. It
// is undefined outside of a webpack build (e.g. `@remotion/player` or
// server-side rendering), so all access goes through `getHot()`.
declare const __webpack_module__: {hot?: Hot} | undefined;

const getHot = (): Hot | null => {
	try {
		if (typeof __webpack_module__ === 'undefined') {
			return null;
		}

		return __webpack_module__.hot ?? null;
	} catch {
		return null;
	}
};

export class CompositionErrorBoundary extends React.Component<Props, State> {
	state: State = {hasError: false};

	private hmrStatusHandler: ((status: string) => void) | null = null;

	static getDerivedStateFromError(): Partial<State> {
		return {hasError: true};
	}

	componentDidCatch(error: Error): void {
		this.props.onError(error);
		this.subscribeToHmrReset();
	}

	componentDidMount(): void {
		// A fresh boundary mounting in the success state means any stale
		// `renderError` left over by a previous boundary instance should be
		// cleared. Fast Refresh sometimes unmounts the old (errored) boundary
		// and mounts a new one during `apply`, so `componentDidUpdate`'s
		// error→success transition never fires.
		if (!this.state.hasError) {
			this.props.onClear();
		}
	}

	componentDidUpdate(_prevProps: Props, prevState: State): void {
		if (prevState.hasError && !this.state.hasError) {
			this.props.onClear();
		}
	}

	componentWillUnmount(): void {
		this.unsubscribeFromHmrReset();
	}

	private subscribeToHmrReset() {
		if (this.hmrStatusHandler) {
			return;
		}

		const hot = getHot();
		if (!hot) {
			return;
		}

		// Once the boundary catches a runtime error it returns `null` on every
		// render and never retries the children — so any subsequent HMR fix
		// would be invisible. While in the error state, wait for the next
		// time webpack HMR settles (`idle`), drop the error flag, and let the
		// boundary re-render. If the children still throw, `componentDidCatch`
		// resubscribes. If they succeed, `componentDidUpdate` calls
		// `onClear()`. See https://github.com/remotion-dev/remotion/issues/7447.
		const handler = (status: string) => {
			if (status !== 'idle') {
				return;
			}

			this.unsubscribeFromHmrReset();
			this.setState({hasError: false});
		};

		this.hmrStatusHandler = handler;
		hot.addStatusHandler(handler);
	}

	private unsubscribeFromHmrReset() {
		const handler = this.hmrStatusHandler;
		if (!handler) {
			return;
		}

		this.hmrStatusHandler = null;
		const hot = getHot();
		if (!hot) {
			return;
		}

		hot.removeStatusHandler(handler);
	}

	render() {
		if (this.state.hasError) {
			return null;
		}

		return this.props.children;
	}
}
