import type {
	GeoJSONSource,
	GeoJSONSourceSpecification,
	SourceSpecification,
} from '@maptiler/sdk';
import {useContext, useEffect, useRef, type ReactNode} from 'react';
import {
	Freeze,
	Sequence,
	Internals,
	useDelayRender,
	type InteractiveBaseProps,
	type InteractivePremountProps,
} from 'remotion';
import {delayMapRender} from './delay-map-render';
import {MapTilerContext} from './MapTilerContext';

export type MapSourceProps = InteractiveBaseProps &
	Pick<InteractivePremountProps, 'premountFor' | 'postmountFor'> & {
		readonly children?: ReactNode;
		readonly id: string;
		readonly source: SourceSpecification;
	};

const MapSourceContent = ({children, id, source}: MapSourceProps) => {
	const {map, styleRevision} = useContext(MapTilerContext);
	const sourceRef = useRef(source);
	const {continueRender, delayRender} = useDelayRender();
	sourceRef.current = source;

	useEffect(() => {
		if (!map) {
			return;
		}

		const loadingHandle = delayRender(`Loading MapTiler source ${id}`);
		let hasFinished = false;
		const finish = () => {
			if (hasFinished) {
				return;
			}

			hasFinished = true;
			continueRender(loadingHandle);
		};

		if (!map.getSource(id)) {
			map.addSource(id, sourceRef.current);
		}

		map.once('idle', finish);
		map.triggerRepaint();

		return () => {
			map.off('idle', finish);
			finish();

			for (const layer of map.getStyle().layers ?? []) {
				if (
					'source' in layer &&
					layer.source === id &&
					map.getLayer(layer.id)
				) {
					map.removeLayer(layer.id);
				}
			}

			if (map.getSource(id)) {
				map.removeSource(id);
			}

			map.triggerRepaint();
		};
	}, [continueRender, delayRender, id, map, styleRevision]);

	useEffect(() => {
		if (!map || source.type !== 'geojson') {
			return;
		}

		const existingSource = map.getSource(id) as GeoJSONSource | undefined;
		if (!existingSource) {
			return;
		}

		existingSource.setData((source as GeoJSONSourceSpecification).data);
		return delayMapRender({
			continueRender,
			delayRender,
			label: `Updating MapTiler source ${id}`,
			map,
		});
	}, [continueRender, delayRender, id, map, source]);

	return children;
};

export const MapSource = ({
	from,
	durationInFrames,
	trimBefore,
	trimAfter,
	playbackRate,
	loop,
	freeze,
	hidden,
	name,
	showInTimeline,
	premountFor,
	postmountFor,
	...props
}: MapSourceProps) => {
	const {
		effectivePremountFor,
		effectivePostmountFor,
		freezeFrame,
		isPremountingOrPostmounting,
		premountingActive,
		postmountingActive,
	} = Internals.usePremounting({
		from: from ?? 0,
		durationInFrames: Internals.resolveSequenceDuration({
			durationInFrames,
			trimBefore,
			trimAfter,
			playbackRate,
			loop,
		}),
		premountFor: premountFor ?? null,
		postmountFor: postmountFor ?? null,
		style: null,
		styleWhilePremounted: null,
		styleWhilePostmounted: null,
		hideWhilePremounted: 'opacity',
	});

	return (
		<Freeze frame={freezeFrame} active={isPremountingOrPostmounting}>
			<Sequence
				layout="none"
				from={from}
				durationInFrames={durationInFrames}
				trimBefore={trimBefore}
				trimAfter={trimAfter}
				playbackRate={playbackRate}
				loop={loop}
				freeze={freeze}
				hidden={hidden}
				showInTimeline={showInTimeline ?? false}
				name={name ?? '<MapSource>'}
				_remotionInternalPremountDisplay={effectivePremountFor || null}
				_remotionInternalPostmountDisplay={effectivePostmountFor || null}
				_remotionInternalIsPremounting={premountingActive}
				_remotionInternalIsPostmounting={postmountingActive}
			>
				<MapSourceContent {...props} />
			</Sequence>
		</Freeze>
	);
};
