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
		children: React.ReactNode;
		errorFallback: (info: {error: Error}) => React.ReactNode;
	},
	{hasError: Error | null}
> {
	state = {hasError: null};
	static getDerivedStateFromError(error: Error) {
		// Update state so the next render will show the fallback UI.
		return {hasError: error};
	}

	componentDidCatch(error: Error) {
		this.props.onError(error);
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return (
				<div style={errorStyle}>
					{this.props.errorFallback({
						error: this.state.hasError,
					})}
				</div>
			);
		}

		return this.props.children;
	}
}
