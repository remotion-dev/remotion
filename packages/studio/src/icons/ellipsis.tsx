export const EllipsisIcon: React.FC<{
	svgProps: React.SVGProps<SVGSVGElement>;
	fill: string;
}> = (props) => {
	return (
		<svg {...props.svgProps} viewBox="0 0 448 512">
			<path
				fill={props.fill}
				d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"
			/>
		</svg>
	);
};
