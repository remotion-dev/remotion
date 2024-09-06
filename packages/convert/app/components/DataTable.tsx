import {Table, TableBody, TableCell, TableRow} from '@/components/ui/table';

export const TableDemo = () => {
	return (
		<Table>
			<TableBody>
				<TableRow>
					<TableCell colSpan={3}>Format</TableCell>
					<TableCell className="text-right">MP4</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Dimensions</TableCell>
					<TableCell className="text-right">1920x1080</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
};
