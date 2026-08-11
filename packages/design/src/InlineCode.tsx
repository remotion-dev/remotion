export const InlineCode: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return <code className="font-brand text-brand">{children}</code>;
};
