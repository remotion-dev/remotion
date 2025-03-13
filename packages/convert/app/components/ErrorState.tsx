import React from 'react';

const ErrorBox: React.FC<{
	readonly error: Error;
	readonly cause?: boolean;
}> = ({error, cause}) => {
	const {message} = error;
	const splitted = error.stack ? error.stack.split('\n') : [error.message];
	const deduplicated = splitted[0].includes(message)
		? splitted.slice(1)
		: splitted;

	const combined = [`${error.name}: ${message}`, ...deduplicated];

	return (
		<div className="bg-red-200/25 rounded px-3 py-2 border border-red-600 whitespace-pre overflow-x-auto">
			<div>
				{cause ? (
					<div className="text-sm text-red-600 font-bold font-brand">
						Caused by:
					</div>
				) : null}
			</div>
			<div>
				{combined?.map((line, index) => (
					<div
						// eslint-disable-next-line react/no-array-index-key
						key={index}
						className="text-red-600 first:font-medium first:font-brand"
					>
						{line}
					</div>
				))}
			</div>
		</div>
	);
};

export const ErrorState: React.FC<{
	readonly error: Error;
}> = ({error}) => {
	return (
		<>
			<div className="text-muted-foreground font-medium text-sm">
				Unfortunately, the conversion failed:
			</div>
			<div className="h-2" />
			<ErrorBox error={error} />
			{error.cause ? (
				<>
					<div className="h-3" />
					<ErrorBox cause error={error.cause as Error} />
				</>
			) : null}
			<div className="h-4" />
			<div className="text-muted-foreground font-medium text-sm">
				Report this issue on{' '}
				<a
					target="_blank"
					href="https://remotion.dev/report"
					className="underline"
				>
					remotion.dev/report
				</a>{' '}
				and upload the video. We&apos;ll try our best to help!
			</div>
		</>
	);
};
