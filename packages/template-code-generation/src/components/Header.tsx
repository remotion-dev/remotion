import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  asLink?: boolean;
}

export function Header({ asLink = false }: HeaderProps) {
  const content = (
    <div className="flex items-center gap-3">
      <Image src="/logo-white.svg" alt="Remotion" width={32} height={32} />
      <span className="text-xl font-bold text-white font-sans">
        Remotion - Prompt to Motion Graphics
      </span>
    </div>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        className="flex items-center hover:opacity-80 transition-opacity"
      >
        {content}
      </Link>
    );
  }

  return content;
}
