import React, {useEffect, useMemo, useRef} from 'react';
import type {ShowcaseVideo} from '../data/showcase-videos';
import {useMobileLayout} from '../helpers/mobile-layout';
import {CancelIcon, IconLeft, IconRight} from '../icons/arrows';
import {VideoPlayerContent} from './VideoPlayerContent';
import {VidPlayerHeader} from './VideoPlayerHeader';

const container: React.CSSProperties = {
	position: 'fixed',
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
	backgroundColor: 'rgba(0, 0, 0, 0.6)',
	// Higher than Docusaurus highest
	zIndex: 1000,
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	flexDirection: 'row',
};

const changeButton: React.CSSProperties = {
	padding: 20,
	cursor: 'pointer',
};

const changeButtonInactive: React.CSSProperties = {
	padding: 20,
	cursor: 'default',
	opacity: 0.5,
};

const icon: React.CSSProperties = {
	width: 24,
	color: 'white',
};

const cancelContainer: React.CSSProperties = {
	left: 16,
	top: 16,
	position: 'absolute',
};

const cancelIcon: React.CSSProperties = {
	width: 20,
	color: 'white',
	cursor: 'pointer',
};

export const VideoPlayer: React.FC<{
	readonly video: ShowcaseVideo | null;
	readonly dismiss: () => void;
	readonly toNext: () => void;
	readonly toPrevious: () => void;
	readonly hasPrevious: boolean;
	readonly hasNext: boolean;
	readonly userHasInteractedWithPage: boolean;
}> = ({
	video,
	dismiss,
	toNext,
	toPrevious,
	hasNext,
	hasPrevious,
	userHasInteractedWithPage,
}) => {
	const mobileLayout = useMobileLayout();

	const containerWithDirection: React.CSSProperties = useMemo(() => {
		return {
			...container,
			flexDirection: mobileLayout ? 'column' : 'row',
		};
	}, [mobileLayout]);

	const outside = useRef<HTMLDivElement>(null);
	const inside = useRef<HTMLDivElement>(null);
	const backButton = useRef<HTMLDivElement>(null);
	const forwardButton = useRef<HTMLDivElement>(null);
	const headerBar = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const {current} = outside;
		const {current: insideCurrent} = inside;
		const {current: backButtonCurrent} = backButton;
		const {current: forwardButtonCurrent} = forwardButton;
		const {current: headerBarCurrent} = headerBar;
		if (!current) {
			return;
		}

		if (!insideCurrent) {
			return;
		}

		if (!mobileLayout && !backButtonCurrent) {
			return;
		}

		if (!mobileLayout && !forwardButtonCurrent) {
			return;
		}

		if (mobileLayout && !headerBarCurrent) {
			return;
		}

		const onClick = (event: MouseEvent) => {
			if (insideCurrent.contains(event.target as Node | null)) {
				return;
			}

			if (
				!mobileLayout &&
				(backButtonCurrent as HTMLDivElement).contains(
					event.target as Node | null,
				)
			) {
				return;
			}

			if (
				!mobileLayout &&
				(forwardButtonCurrent as HTMLDivElement).contains(
					event.target as Node | null,
				)
			) {
				return;
			}

			if (
				mobileLayout &&
				(headerBarCurrent as HTMLDivElement).contains(
					event.target as Node | null,
				)
			) {
				return;
			}

			dismiss();
		};

		current.addEventListener('click', onClick);
		return () => {
			current.removeEventListener('click', onClick);
		};
	}, [dismiss, mobileLayout, video]);

	useEffect(() => {
		if (!video) {
			return;
		}

		const onKeyPress = (e: KeyboardEvent) => {
			if (hasNext && e.key === 'ArrowRight') {
				toNext();
			}

			if (hasPrevious && e.key === 'ArrowLeft') {
				toPrevious();
			}

			if (e.key === 'Escape') {
				dismiss();
			}
		};

		window.addEventListener('keyup', onKeyPress);
		return () => {
			window.removeEventListener('keyup', onKeyPress);
		};
	}, [dismiss, hasNext, hasPrevious, toNext, toPrevious, video]);

	if (!video) {
		return null;
	}

	return (
		<div ref={outside} style={containerWithDirection}>
			{mobileLayout ? null : (
				<div style={cancelContainer}>
					<CancelIcon style={cancelIcon} />
				</div>
			)}
			{mobileLayout ? null : (
				<div
					ref={backButton}
					style={hasPrevious ? changeButton : changeButtonInactive}
					onClick={toPrevious}
				>
					<IconLeft style={icon} />
				</div>
			)}
			<div ref={inside}>
				<VideoPlayerContent
					video={video}
					userHasInteractedWithPage={userHasInteractedWithPage}
				/>
			</div>
			{mobileLayout ? (
				<VidPlayerHeader
					ref={headerBar}
					onNext={toNext}
					onDismiss={dismiss}
					onPrevious={toPrevious}
					hasNext={hasNext}
					hasPrevious={hasPrevious}
				/>
			) : null}
			{mobileLayout ? null : (
				<div
					ref={forwardButton}
					style={hasNext ? changeButton : changeButtonInactive}
					onClick={toNext}
				>
					<IconRight style={icon} />
				</div>
			)}
		</div>
	);
};
