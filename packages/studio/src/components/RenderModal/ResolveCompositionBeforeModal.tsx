import React, {useContext, useEffect, useMemo} from 'react';
import type {AnyComposition, VideoConfig} from 'remotion';
import {Internals} from 'remotion';
import {LIGHT_TEXT} from '../../helpers/colors';
import {inlineCodeSnippet} from '../Menu/styles';
import {RunningCalculateMetadata} from '../RunningCalculateMetadata';
import {Spacing} from '../layout';

const loaderContainer: React.CSSProperties = {
	paddingTop: 40,
	paddingBottom: 40,
	paddingLeft: 100,
	paddingRight: 100,
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	flexDirection: 'column',
};

const loaderLabel: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
};

type TResolvedCompositionContext = {
	unresolved: AnyComposition;
	resolved: {
		type: 'success';
		result: VideoConfig;
	};
} | null;

export const ResolvedCompositionContext =
	React.createContext<TResolvedCompositionContext>(null);

export const ResolveCompositionBeforeModal: React.FC<{
	readonly compositionId: string;
	readonly children: React.ReactNode;
}> = ({compositionId, children}) => {
	const resolved = Internals.useResolvedVideoConfig(compositionId);
	const unresolvedContext = useContext(Internals.CompositionManager);

	const unresolved = unresolvedContext.compositions.find(
		(c) => compositionId === c.id,
	);

	useEffect(() => {
		const {current} = Internals.resolveCompositionsRef;
		if (!current) {
			throw new Error('No ref to trigger composition calc');
		}

		current.setCurrentRenderModalComposition(compositionId);
		return () => {
			current.setCurrentRenderModalComposition(null);
		};
	}, [compositionId]);

	if (!unresolved) {
		throw new Error('Composition not found: ' + compositionId);
	}

	const value: TResolvedCompositionContext = useMemo(() => {
		return {
			resolved: resolved as {
				type: 'success';
				result: VideoConfig;
			},
			unresolved,
		};
	}, [resolved, unresolved]);

	if (!resolved || resolved.type === 'loading') {
		return <RunningCalculateMetadata />;
	}

	if (resolved.type === 'error') {
		return (
			<div style={loaderContainer}>
				<Spacing y={2} />
				<div style={loaderLabel}>
					Running <code style={inlineCodeSnippet}>calculateMetadata()</code>{' '}
					yielded an error:
				</div>
				<Spacing y={1} />
				<div style={loaderLabel}>
					{resolved.error.message || 'Unknown error'}
				</div>
			</div>
		);
	}

	return (
		<ResolvedCompositionContext.Provider value={value}>
			{children}
		</ResolvedCompositionContext.Provider>
	);
};
