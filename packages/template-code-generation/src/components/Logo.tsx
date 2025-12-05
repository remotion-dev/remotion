import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  asLink?: boolean;
}

export function Logo({ asLink = false }: LogoProps) {
  const content = (
    <div className="flex items-center gap-3">
      <Image src="/logo-white.svg" alt="Remotion" width={32} height={32} />
      <span className="text-xl font-bold text-white font-sans">
        Remotion Code Generator
      </span>
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
