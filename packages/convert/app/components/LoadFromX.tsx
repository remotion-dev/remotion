import React, {useCallback, useMemo} from 'react';
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

	const onOpenChange = React.useCallback(() => {
		setOpen((prev) => !prev);
	}, []);

	const isValid = useMemo(() => {
		try {
			// eslint-disable-next-line no-new
			new URL(value);
			return true;
		} catch {
			return false;
		}
	}, [value]);

	const onOpenUrl = React.useCallback(() => {
		setOpen(true);
	}, []);

	const set = useCallback(async () => {
		const res = await fetch(
			'https://lzpqleuj7axkrgoxsa3h7ecynq0vveim.lambda-url.eu-central-1.on.aws/?id=1859650265021817143',
		);
		const json = await res.json();
		if (json.type !== 'success') {
			console.log(json.error); // TODO: Show error
			return;
		}

		const urls = json.urls as string[];
		if (!urls.length) {
			console.log('No URLs found'); // TODO: Show error
			return;
		}

		const [firstUrl, ...moreUrls] = urls;
		const currentUrl = new URL(window.location.href);
		currentUrl.searchParams.set('url', firstUrl);

		window.location.href = currentUrl.toString();
	}, []);

	const onKeydown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (!isValid) {
				return;
			}

			if (e.key === 'Enter') {
				set();
			}
		},
		[isValid, set],
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
						<div className="h-2" />
						<Button disabled={!isValid} variant="brand" onClick={set}>
							Load
						</Button>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</>
	);
};
