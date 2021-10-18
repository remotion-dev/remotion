import React from 'react';

const errorStyle: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	flex: 1,
	height: '100%',
	width: '100%',
};

export class ErrorBoundary extends React.Component<
	{
		onError: (error: Error) => void;
		errorMessage: string;
	},
	{ hasError: boolean }
> {
	state = { hasError: false };
	static getDerivedStateFromError() {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(error: Error) {
		this.props.onError(error);
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return <div style={errorStyle}>{this.props.errorMessage}</div>;
		}

		return this.props.children;
	}
}
