import {Button as RemotionButton} from '@remotion/design';
import React, {useCallback, useMemo} from 'react';
import {extractTweetId} from '~/lib/extract-tweet-id';
import {Button} from './ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';
import {Input} from './ui/input';

const loadFromXEndpoint =
	'https://lzpqleuj7axkrgoxsa3h7ecynq0vveim.lambda-url.eu-central-1.on.aws/';

type LoadFromXResponse =
	| {
			type: 'success';
			urls: string[];
	  }
	| {
			type: 'error';
			error?: string;
	  };

const isLoadFromXResponse = (data: unknown): data is LoadFromXResponse => {
	if (!data || typeof data !== 'object' || !('type' in data)) {
		return false;
	}

	if (data.type === 'success') {
		return (
			'urls' in data &&
			Array.isArray(data.urls) &&
			data.urls.every((url) => typeof url === 'string')
		);
	}

	return (
		data.type === 'error' &&
		(!('error' in data) || typeof data.error === 'string')
	);
};

export const LoadFromX: React.FC = () => {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState('');
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const onOpenChange = React.useCallback(() => {
		setOpen((prev) => !prev);
		setError(null);
	}, []);

	const tweetId = useMemo(() => extractTweetId(value), [value]);
	const isValid = tweetId !== null;

	const onOpenUrl = React.useCallback(() => {
		setOpen(true);
	}, []);

	const set = useCallback(async () => {
		if (!tweetId) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const endpoint = new URL(loadFromXEndpoint);
			endpoint.searchParams.set('id', tweetId);

			const response = await fetch(endpoint);

			if (!response.ok) {
				setError(`Failed to load from x.com (${response.status})`);
				return;
			}

			const json: unknown = await response.json();

			if (!isLoadFromXResponse(json)) {
				setError('Received an invalid response from x.com');
				return;
			}

			if (json.type !== 'success') {
				setError(json.error || 'Failed to load from x.com');
				return;
			}

			const [firstUrl] = json.urls;

			if (!firstUrl) {
				setError('No videos found in this post');
				return;
			}

			const currentUrl = new URL(
				window.location.pathname === '/'
					? '/convert'
					: window.location.pathname,
				window.location.href,
			);
			currentUrl.searchParams.set('url', firstUrl);

			window.location.href = currentUrl.toString();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'An unexpected error occurred',
			);
		} finally {
			setLoading(false);
		}
	}, [tweetId]);

	const onKeydown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (!isValid || loading) {
				return;
			}

			if (e.key === 'Enter') {
				set();
			}
		},
		[isValid, loading, set],
	);

	return (
		<>
			<RemotionButton
				className="font-brand text-brand rounded-full text-sm h-10"
				onClick={onOpenUrl}
			>
				Load from x.com
			</RemotionButton>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="font-brand">Load from x.com</DialogTitle>
						<div className="h-1" />
						<DialogDescription>
							Enter a post URL to load a video from x.com.
						</DialogDescription>
						<div className="h-2" />
						<Input
							onKeyDown={onKeydown}
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder="For example: https://x.com/JNYBGR/status/1859650265021817143"
						/>
						{error ? (
							<p className="text-red-500 text-sm mt-2">{error}</p>
						) : null}
						<div className="h-2" />
						<Button
							disabled={!isValid || loading}
							variant="brand"
							onClick={set}
						>
							{loading ? 'Loading...' : 'Load'}
						</Button>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</>
	);
};
