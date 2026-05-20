import React from 'react';

type Props = {
	readonly children: React.ReactNode;
	readonly onError: (error: Error) => void;
	readonly onClear: () => void;
	// Bumped every time something happens that should cause the boundary to
	// retry rendering its children — currently every time Fast Refresh applies
	// an HMR update in the studio. Without this, once the boundary catches a
	// runtime error it returns `null` forever and the in-canvas error UI stays
	// up even after the user fixes the bug.
	// See https://github.com/remotion-dev/remotion/issues/7447.
	readonly resetKey: number;
};

type State = {
	hasError: boolean;
	lastResetKey: number;
};

export class CompositionErrorBoundary extends React.Component<Props, State> {
	state: State = {hasError: false, lastResetKey: this.props.resetKey};

	static getDerivedStateFromError(): Partial<State> {
		return {hasError: true};
	}

	static getDerivedStateFromProps(
		nextProps: Props,
		prevState: State,
	): Partial<State> | null {
		if (nextProps.resetKey === prevState.lastResetKey) {
			return null;
		}

		// Drop the error state on every reset. If the children still throw,
		// `getDerivedStateFromError` will set `hasError` back to `true` during
		// the same render pass. If they succeed, `componentDidUpdate` will fire
		// `onClear()` so the studio can dismiss the error UI.
		return {
			hasError: false,
			lastResetKey: nextProps.resetKey,
		};
	}

	componentDidCatch(error: Error): void {
		this.props.onError(error);
	}

	componentDidMount(): void {
		// If a freshly mounted boundary renders its children successfully, tell
		// the host to clear any stale render error. This matters when Fast
		// Refresh causes the previous boundary instance (which was stuck in the
		// error state) to unmount and a new one to mount in its place — in that
		// case `componentDidUpdate` never fires the transition.
		if (!this.state.hasError) {
			this.props.onClear();
		}
	}

	componentDidUpdate(_prevProps: Props, prevState: State): void {
		if (prevState.hasError && !this.state.hasError) {
			this.props.onClear();
		}
	}

	render() {
		if (this.state.hasError) {
			return null;
		}

		return this.props.children;
	}
}
