import React, {useEffect, useState} from 'react';
import {BlueButton} from './layout/Button';
import {useColorMode} from './layout/use-color-mode';
import {Spacer} from './Spacer';
import {YouAreHere} from './YouAreHere';

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
};

const flex: React.CSSProperties = {
	flex: 1,
};

const list: React.CSSProperties = {
	listStyleType: 'none',
	textAlign: 'center',
	paddingLeft: 0,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
};

const hr: React.CSSProperties = {
	width: 20,
	textAlign: 'center',
	borderTop: 0,
	marginTop: 10,
	marginBottom: 10,
};

const docsButton: React.CSSProperties = {
	textDecoration: 'none',
};

const StepTitle: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<div className="text-center text-xl font-semibold fontbrand mt-2">
			{children}
		</div>
	);
};

const Subtitle: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<div className="text-center text-base fontbrand text-[var(--subtitle)]">
			{children}
		</div>
	);
};

const Pane: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<div className="border-effect bg-pane flex-1 p-3 rounded-lg min-h-[500px] flex flex-col text-center">
			{children}
		</div>
	);
};

export const VideoApps: React.FC<{
	readonly active: 'remotion' | 'player' | 'lambda';
}> = ({active}) => {
	const {colorMode} = useColorMode();

	const [src, setSrc] = useState('/img/player-example.png');
	const [src2, setSrc2] = useState('/img/player-example-dark.png');

	useEffect(() => {
		if (colorMode === 'dark') {
			setSrc('/img/player-example-dark.png');
		} else {
			setSrc('/img/player-example.png');
		}
	}, [colorMode]);
	useEffect(() => {
		setSrc2(
			colorMode === 'dark' ? '/img/cluster-dark.png' : '/img/cluster.png',
		);
	}, [colorMode]);

	return (
		<div className="w-full">
			<div className={'flex flex-col lg:flex-row gap-2'}>
				<Pane>
					{active === 'remotion' ? <YouAreHere /> : null}
					<StepTitle>Remotion</StepTitle>
					<Subtitle>Make videos programmatically</Subtitle>
					<br />
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							flex: 1,
						}}
					>
						<img className="max-w-[300px]" src="/img/writeinreact.png" />
					</div>
					<ul style={list}>
						<li>Use the Web to create graphics</li>
						<hr style={hr} />
						<li>Consume user input and APIs</li>
						<hr style={hr} />
						<li>Render real MP4 videos</li>
					</ul>
					<div style={row}>
						{active === 'remotion' ? null : (
							<>
								<div style={flex}>
									<a style={docsButton} href="/">
										<BlueButton loading={false} size="sm">
											Learn more
										</BlueButton>
									</a>
								</div>
								<Spacer />
								<Spacer />
							</>
						)}
						<div style={flex}>
							<a style={docsButton} href="/docs">
								<BlueButton className="w-full" loading={false} size="sm">
									Read docs
								</BlueButton>
							</a>
						</div>
					</div>
				</Pane>
				<Pane>
					{active === 'player' ? <YouAreHere /> : null}
					<StepTitle>Remotion Player</StepTitle>
					<Subtitle>Embeddable interactive videos</Subtitle>
					<br />

					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							flex: 1,
						}}
					>
						<img className="max-w-[300px]" src={src} />
					</div>
					<ul style={list}>
						<li>Preview videos in the browser</li>
						<hr style={hr} />
						<li>React to user input</li>
						<hr style={hr} />
						<li>Customize look and behavior</li>
					</ul>
					<div style={row}>
						{active === 'player' ? null : (
							<>
								<div style={flex}>
									<a style={docsButton} href="/player">
										<BlueButton className="w-full" loading={false} size="sm">
											Learn more
										</BlueButton>
									</a>
								</div>
								<Spacer />
								<Spacer />
							</>
						)}
						<div style={flex}>
							<a style={docsButton} href="/docs/player">
								<BlueButton className="w-full" loading={false} size="sm">
									Read docs
								</BlueButton>
							</a>
						</div>
					</div>
				</Pane>
				<Pane>
					{active === 'lambda' ? <YouAreHere /> : null}
					<StepTitle>Remotion Lambda</StepTitle>
					<Subtitle>Render at scale</Subtitle>
					<br />
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							flex: 1,
						}}
					>
						<img className="max-w-[300px]" src={src2} />
					</div>
					<div className="flex-1" />
					<ul style={list}>
						<li>Render videos in the cloud</li>
						<hr style={hr} />
						<li>Scale according to your volume</li>
						<hr style={hr} />
						<li>Fast because distributed</li>
					</ul>
					<div style={row}>
						{active === 'lambda' ? null : (
							<>
								<div style={flex}>
									<a style={docsButton} href="/lambda">
										<BlueButton className="w-full" loading={false} size="sm">
											Learn more
										</BlueButton>
									</a>
								</div>
								<Spacer />
								<Spacer />
							</>
						)}
						<div style={flex}>
							<a style={docsButton} href="/docs/lambda">
								<BlueButton className="w-full" loading={false} size="sm">
									Read docs
								</BlueButton>
							</a>
						</div>
					</div>
				</Pane>
			</div>
		</div>
	);
};
