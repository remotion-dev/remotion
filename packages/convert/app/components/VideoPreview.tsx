import {Button} from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import React from 'react';

export const VideoPreview: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	return (
		<Card className="w-[350px]">
			<CardHeader>
				<CardTitle>bigbuckbunny.mp4</CardTitle>
				<CardDescription>From URL</CardDescription>
			</CardHeader>
			<CardContent>{children}</CardContent>
			<CardFooter className="flex justify-between">
				<div className="flex-1" />
				<Button variant={'link'}>View info</Button>
			</CardFooter>
		</Card>
	);
};
