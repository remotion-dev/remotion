import React, {useContext, useRef, useState} from 'react';
import {Internals, type DelayRenderScope} from 'remotion';

const errorStyle: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	flex: 1,
	height: '100%',
	width: '100%',
};

// Insertion effects run before descendant layout effects. Older React versions
// do not expose this hook; their initial layout-phase throws are caught by React.
const useScopeCommitEffect =
	typeof window === 'undefined'
		? React.useEffect
		: (React.useInsertionEffect ?? React.useLayoutEffect);

// A cancellation belongs to the mounted composition that started its async work.
// Readiness still belongs to the inherited renderer scope.
const AsyncRenderErrorScope = ({
	children,
	renderingOwner,
}: {
	children: React.ReactNode;
	renderingOwner: object | null;
}) => {
	const inheritedScope = useContext(Internals.DelayRenderContextType);
	const activity = useRef(new WeakMap<DelayRenderScope, boolean>());
	const [failure, setFailure] = useState<{
		scope: DelayRenderScope;
		error: Error;
	} | null>(null);
	const createScope = () => {
		const target =
			inheritedScope ?? (typeof window === 'undefined' ? null : window);
		if (!target) return {inheritedScope, renderingOwner, scope: null};
		const onCancelRender = (error: Error) => {
			const active = activity.current.get(scope);
			// Before commit, React can catch the synchronous error directly.
			if (active === undefined) throw error;
			if (active)
				setFailure((previous) =>
					previous?.scope === scope ? previous : {scope, error},
				);
		};
		const scope: DelayRenderScope = new Proxy(target, {
			get(target, key) {
				return key === 'remotion_onCancelRender'
					? onCancelRender
					: Reflect.get(target, key, target);
			},
		});
		return {inheritedScope, renderingOwner, scope};
	};
	// This identity owns async work and must survive compiler memoization changes.
	const [owned, setOwned] = useState(createScope);
	const {scope} = owned;
	useScopeCommitEffect(() => {
		if (!scope) return;
		activity.current.set(scope, true);
		return () => {
			activity.current.set(scope, false);
		};
	}, [scope]);
	if (
		owned.inheritedScope !== inheritedScope ||
		!Object.is(owned.renderingOwner, renderingOwner)
	) {
		setOwned(createScope());
		return null;
	}
	if (failure?.scope === scope) throw failure.error;
	return (
		<Internals.DelayRenderContextType.Provider value={scope}>
			{children}
		</Internals.DelayRenderContextType.Provider>
	);
};

export class ErrorBoundary extends React.Component<
	{
		onError: (error: Error) => void;
		renderingOwner: object | null;
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
			<AsyncRenderErrorScope renderingOwner={this.props.renderingOwner}>
				{this.props.children}
			</AsyncRenderErrorScope>
		);
	}
}
