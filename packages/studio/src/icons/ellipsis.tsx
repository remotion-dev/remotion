export const EllipsisIcon: React.FC<{
	svgProps: React.SVGProps<SVGSVGElement>;
	fill: string;
}> = (props) => {
	return (
		<svg {...props.svgProps} viewBox="0 0 448 512">
			<path
				fill={props.fill}
				d="M448 256a48 48 0 1 1-96 0 48 48 0 1 1 96 0zm-176 0a48 48 0 1 1-96 0 48 48 0 1 1 96 0zM48 304a48 48 0 1 1 0-96 48 48 0 1 1 0 96z"
			/>
		</svg>
	);
};
