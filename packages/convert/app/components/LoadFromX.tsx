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

export const LoadFromX: React.FC = () => {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState('');
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const onOpenChange = React.useCallback(() => {
		setOpen((prev) => !prev);
		setError(null);
	}, []);

	const isValid = useMemo(() => {
		try {
			return extractTweetId(value) !== null;
		} catch {
			return false;
		}
	}, [value]);

	const onOpenUrl = React.useCallback(() => {
		setOpen(true);
	}, []);

	const set = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(
				'https://lzpqleuj7axkrgoxsa3h7ecynq0vveim.lambda-url.eu-central-1.on.aws/?id=' +
					extractTweetId(value),
			);
			const json = await res.json();
			if (json.type !== 'success') {
				setError(json.error || 'Failed to load from X');
				return;
			}

			const urls = json.urls as string[];
			if (!urls.length) {
				setError('No videos found in this post');
				return;
			}

			const [firstUrl] = urls;
			const currentUrl = new URL(window.location.href);
			currentUrl.searchParams.set('url', firstUrl);

			window.location.href = currentUrl.toString();
		} catch {
			setError('An unexpected error occurred');
		} finally {
			setLoading(false);
		}
	}, [value]);

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
			<a
				className="font-brand text-brand cursor cursor-pointer hover:underline"
				onClick={onOpenUrl}
			>
				Load from x.com
			</a>
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
						{error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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
