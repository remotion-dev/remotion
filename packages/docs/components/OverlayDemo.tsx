import React, {useCallback, useRef} from 'react';
import './transparent-video.css';

export const OverlayDemo: React.FC = () => {
	const ref = useRef<HTMLVideoElement>(null);
	const onClick = useCallback(() => {
		ref.current?.classList.toggle('transparent');
	}, []);
	return (
		<div>
			<div
				style={{
					alignItems: 'flex-start',
					flexDirection: 'row',
					display: 'flex',
				}}
			>
				<div
					style={{
						display: 'flex',
						width: '70%',
						flexDirection: 'column',
					}}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							border: '1px solid var(--ifm-color-emphasis-300)',
							borderRadius: 'var(--ifm-pre-border-radius)',
							overflow: 'hidden',
						}}
					>
						<video
							ref={ref}
							className="transparent"
							src="/img/overlay.webm"
							autoPlay
							loop
							playsInline
							muted
						/>
					</div>
					<div style={{marginTop: '8px'}} />
					<p className="tr-centered" onClick={onClick}>
						<button type="button">Toggle transparency</button>
					</p>
				</div>

				<p style={{marginLeft: '10px'}}>
					{' '}
					Use our template by cloning the{' '}
					<a
						href="https://github.com/remotion-dev/template-overlay"
						target="_blank"
					>
						GitHub repo
					</a>{' '}
					or running <code>npx create-video --overlay</code>.
				</p>
			</div>
		</div>
	);
};
