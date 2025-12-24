import {Button as RemotionButton} from '@remotion/design';
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

export const LoadFromUrl: React.FC = () => {
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

	const set = useCallback(() => {
		const currentUrl = new URL(
			window.location.pathname === '/' ? '/convert' : window.location.pathname,
			window.location.href,
		);
		currentUrl.searchParams.set('url', value);
		window.location.href = currentUrl.toString();
	}, [value]);

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
				className="font-brand text-brand cursor cursor-pointer"
				onClick={onOpenUrl}
			>
				<RemotionButton className="rounded-full text-sm h-10">
					Load from URL
				</RemotionButton>
			</a>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="font-brand">Load from URL</DialogTitle>
						<div className="h-1" />
						<DialogDescription>
							The file must support being loaded on this domain.
						</DialogDescription>
						<div className="h-2" />
						<Input
							onKeyDown={onKeydown}
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder="For example: https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
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
