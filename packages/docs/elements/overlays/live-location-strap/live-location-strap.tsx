import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {
	Easing,
	Interactive,
	Sequence,
	interpolate,
	type InteractivitySchema,
	type SequenceControls,
	useCurrentFrame,
} from 'remotion';

type LiveLocationStrapProps = {
	readonly statusLabel?: string;
	readonly location?: string;
	readonly venue?: string;
	readonly date?: string;
};

const liveLocationStrapSchema = {
	statusLabel: {
		type: 'text-content',
		default: 'LIVE',
		description: 'Status label',
		keyframable: false,
	},
	location: {
		type: 'text-content',
		default: 'Berlin',
		description: 'Location',
		keyframable: false,
	},
	venue: {
		type: 'text-content',
		default: 'Main Stage',
		description: 'Venue',
		keyframable: false,
	},
	date: {
		type: 'text-content',
		default: 'June 22',
		description: 'Date',
		keyframable: false,
	},
} as const satisfies InteractivitySchema;

const LiveLocationStrapInner = forwardRef<
	HTMLDivElement,
	LiveLocationStrapProps & {
		readonly controls: SequenceControls | undefined;
	}
>(
	(
		{
			statusLabel = 'LIVE',
			location = 'Berlin',
			venue = 'Main Stage',
			date = 'June 22',
			controls,
		},
		ref,
	) => {
		const frame = useCurrentFrame();
		const outlineRef = useRef<HTMLDivElement>(null);
		useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

		const visibleStatusLabel = statusLabel.trim();
		const visibleLocation = location.trim();
		const visibleVenue = venue.trim();
		const visibleDate = date.trim();
		const hasPrimaryRow = Boolean(visibleStatusLabel || visibleLocation);
		const hasContextRow = Boolean(visibleDate || visibleVenue);
		const hasContent = hasPrimaryRow || hasContextRow;

		return (
			<Sequence
				layout="none"
				name="Container"
				controls={controls}
				outlineRef={outlineRef}
			>
				<div
					ref={outlineRef}
					style={{
						width: 760,
						height: 156,
						boxSizing: 'border-box',
					}}
				>
					{hasContent ? (
						<div
							style={{
								width: '100%',
								height: '100%',
								boxSizing: 'border-box',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								gap: 16,
								padding: '24px 28px',
								border: '1px solid rgba(255, 255, 255, 0.18)',
								borderRadius: 14,
								backgroundColor: 'rgba(15, 23, 42, 0.94)',
								boxShadow: '0 10px 30px rgba(15, 23, 42, 0.3)',
								fontFamily: 'Arial, Helvetica, sans-serif',
								opacity: interpolate(frame, [0, 14], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
								translate: interpolate(
									frame,
									[0, 20],
									['-24px 0px', '0px 0px'],
									{
										easing: Easing.out(Easing.cubic),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
							}}
						>
							{hasPrimaryRow ? (
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 16,
										minWidth: 0,
									}}
								>
									{visibleStatusLabel ? (
										<div
											dir="auto"
											style={{
												flexShrink: 0,
												maxWidth: 220,
												overflow: 'hidden',
												padding: '9px 12px',
												borderRadius: 7,
												backgroundColor: '#dc2626',
												color: 'white',
												fontSize: 20,
												fontWeight: 700,
												letterSpacing: 1.2,
												lineHeight: 1,
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}
										>
											{visibleStatusLabel}
										</div>
									) : null}
									{visibleLocation ? (
										<div
											dir="auto"
											style={{
												minWidth: 0,
												overflow: 'hidden',
												color: 'white',
												fontSize: 36,
												fontWeight: 700,
												letterSpacing: -0.5,
												lineHeight: 1.05,
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}
										>
											{visibleLocation}
										</div>
									) : null}
								</div>
							) : null}
							{hasContextRow ? (
								<div
									dir="auto"
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 10,
										minWidth: 0,
										overflow: 'hidden',
										color: hasPrimaryRow ? '#cbd5e1' : 'white',
										fontSize: hasPrimaryRow ? 21 : 30,
										fontWeight: hasPrimaryRow ? 500 : 650,
										lineHeight: 1,
										whiteSpace: 'nowrap',
									}}
								>
									{visibleDate ? (
										<span
											dir="auto"
											style={{
												overflow: 'hidden',
												textOverflow: 'ellipsis',
											}}
										>
											{visibleDate}
										</span>
									) : null}
									{visibleDate && visibleVenue ? (
										<span aria-hidden style={{color: '#94a3b8'}}>
											·
										</span>
									) : null}
									{visibleVenue ? (
										<span
											dir="auto"
											style={{
												overflow: 'hidden',
												textOverflow: 'ellipsis',
											}}
										>
											{visibleVenue}
										</span>
									) : null}
								</div>
							) : null}
						</div>
					) : null}
				</div>
			</Sequence>
		);
	},
);

LiveLocationStrapInner.displayName = 'LiveLocationStrapInner';

export const LiveLocationStrap = Interactive.withSchema({
	Component: LiveLocationStrapInner,
	componentName: '<LiveLocationStrap>',
	componentIdentity: 'dev.remotion.elements.LiveLocationStrap',
	schema: liveLocationStrapSchema,
	supportsEffects: false,
});
