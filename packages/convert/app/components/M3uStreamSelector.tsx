import type {M3uStream} from '@remotion/media-parser';
import React from 'react';
import {Label} from './ui/label';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';

export const M3uStreamSelector: React.FC<{
	readonly streams: M3uStream[];
	readonly selectedId: number | null;
	readonly setSelectedM3uId: React.Dispatch<
		React.SetStateAction<number | null>
	>;
}> = ({setSelectedM3uId, selectedId, streams}) => {
	return (
		<div className="mb-4">
			<Label htmlFor="quality">Select quality</Label>
			<Select
				value={String(selectedId ?? streams[0].id)}
				onValueChange={(v) => setSelectedM3uId(Number(v))}
			>
				<SelectTrigger id="quality">
					<SelectValue placeholder="Select quality level" />
				</SelectTrigger>
				<SelectContent>
					{streams.map((stream) => {
						return (
							<SelectGroup key={stream.id}>
								<SelectItem value={String(stream.id)}>
									{stream.resolution ? (
										<div>
											{stream.resolution?.width}x{stream.resolution?.height}
										</div>
									) : null}
								</SelectItem>
							</SelectGroup>
						);
					})}
				</SelectContent>
			</Select>
		</div>
	);
};
