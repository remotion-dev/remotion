import React, {useState} from 'react';
import {Internals} from 'remotion';

const errorStyle: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	flex: 1,
	height: '100%',
	width: '100%',
};

// Cancellation ownership is separate from the renderer's shared readiness scope.
const useOwnerLayoutEffect =
	typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

type CancellationOwner = {
	renderingOwner: object | null;
	active: boolean;
	firstError: Error | null;
	generation: number;
	onCancel: (error: Error) => void;
};

const AsyncRenderErrorScope = ({
	children,
	renderingOwner,
	isReplacingComponent,
}: {
	readonly children: React.ReactNode;
	readonly renderingOwner: object | null;
	readonly isReplacingComponent: boolean;
}) => {
	const [failure, setFailure] = useState<{
		owner: CancellationOwner;
		generation: number;
		error: Error;
	} | null>(null);
	const currentOwner = React.useRef<CancellationOwner | null>(null);
	const createOwner = (): CancellationOwner => {
		const createdOwner: CancellationOwner = {
			renderingOwner,
			active: false,
			firstError: null,
			generation: 0,
			onCancel: (error) => {
				if (!createdOwner.active || createdOwner.firstError !== null) return;
				createdOwner.firstError = error;
				const {generation} = createdOwner;
				queueMicrotask(() => {
					if (
						!createdOwner.active ||
						currentOwner.current !== createdOwner ||
						generation !== createdOwner.generation
					)
						return;
					setFailure((previous) =>
						previous?.owner === createdOwner &&
						previous.generation === generation
							? previous
							: {owner: createdOwner, generation, error},
					);
				});
			},
		};
		return createdOwner;
	};

	const [owner, setOwner] = useState(createOwner);
	useOwnerLayoutEffect(() => {
		owner.active = true;
		currentOwner.current = owner;
		return () => {
			owner.active = false;
			owner.generation++;
			owner.firstError = null;
			if (currentOwner.current === owner) currentOwner.current = null;
		};
	}, [owner]);
	if (!Object.is(owner.renderingOwner, renderingOwner)) {
		setOwner(createOwner());
	}

	if (
		!isReplacingComponent &&
		Object.is(owner.renderingOwner, renderingOwner) &&
		failure?.owner === owner &&
		failure.generation === owner.generation
	)
		throw failure.error;
	return (
		<Internals.CancelRenderContext.Provider value={owner.onCancel}>
			{children}
		</Internals.CancelRenderContext.Provider>
	);
};

export class ErrorBoundary extends React.Component<
	{
		onError: (error: Error) => void;
		renderingOwner: object | null;
		isReplacingComponent: boolean;
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

		return (
			<AsyncRenderErrorScope
				renderingOwner={this.props.renderingOwner}
				isReplacingComponent={this.props.isReplacingComponent}
			>
				{this.props.children}
			</AsyncRenderErrorScope>
		);
	}
}
