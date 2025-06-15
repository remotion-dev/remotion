import React from 'react';
import {BlueButton} from './layout/Button';

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
		<div className="border-effect bg-pane flex-1 p-3 rounded-lg min-h-[300px] flex flex-col text-center">
			{children}
		</div>
	);
};

export const MoreVideoPowerSection: React.FC = () => {
	return (
		<div className="w-full">
			<div className={'flex flex-col lg:flex-row gap-2'}>
				<Pane>
					<StepTitle>Media Parser</StepTitle>
					<Subtitle>A new multimedia library for the web</Subtitle>
					<br />
					<div className="flex-1" />
					<div>
						<a href="/media-parser" style={{textDecoration: 'none'}}>
							<BlueButton className="w-full" loading={false} size="sm">
								Learn more
							</BlueButton>
						</a>
					</div>
				</Pane>
				<Pane>
					<StepTitle>WebCodecs</StepTitle>
					<Subtitle>Read, process, transform and create videos on the frontend</Subtitle>
					<br />
					<div className="flex-1" />
					<div>
						<a href="/webcodecs" style={{textDecoration: 'none'}}>
							<BlueButton className="w-full" loading={false} size="sm">
								Learn more
							</BlueButton>
						</a>
					</div>
				</Pane>
				<Pane>
					<StepTitle>Recorder</StepTitle>
					<Subtitle>Produce engaging screencasts end-to-end in JavaScript</Subtitle>
					<br />
					<div className="flex-1" />
					<div>
						<a href="/recorder" style={{textDecoration: 'none'}}>
							<BlueButton className="w-full" loading={false} size="sm">
								Learn more
							</BlueButton>
						</a>
					</div>
				</Pane>
			</div>
		</div>
	);
};