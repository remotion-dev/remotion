import {Button} from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import React, {useCallback} from 'react';

export const VideoPreview: React.FC<{
	readonly children: React.ReactNode;
	readonly setProbeDetails: (value: boolean) => void;
}> = ({children, setProbeDetails}) => {
	const title = 'bigbuckbfdsdsfkjsdflkunny.mp4';

	const onClick = useCallback(() => {
		setProbeDetails(true);
	}, [setProbeDetails]);

	return (
		<Card className="w-[350px]">
			<CardHeader>
				<CardTitle title={title}>{title}</CardTitle>
				<CardDescription>From URL</CardDescription>
			</CardHeader>
			<CardContent>{children}</CardContent>
			<CardFooter className="flex justify-between">
				<div className="flex-1" />
				<Button onClick={onClick} variant={'link'}>
					Show details
				</Button>
			</CardFooter>
		</Card>
	);
};
