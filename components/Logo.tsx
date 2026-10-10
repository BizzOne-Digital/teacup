import Image from "next/image";
import Link from "next/link";

type Props = {
  className?: string;
  /** white card behind logo (for dark hero) */
  variant?: "default" | "onDark";
  priority?: boolean;
};

export function Logo({
  className = "",
  variant = "default",
  priority = false,
}: Props) {
  const wrap =
    variant === "onDark"
      ? "rounded-lg bg-white px-2 py-1.5 shadow-lg ring-1 ring-white/20 sm:rounded-xl sm:px-4 sm:py-3"
      : "";

  return (
    <Link
      href="/"
      className={`inline-block max-w-full min-w-0 ${className}`}
      aria-label="Tea Cup Cafe home"
    >
      <span className={`inline-block max-w-full ${wrap}`}>
        <Image
          src="/logo.jpg"
          alt="Tea Cup Cafe"
          width={280}
          height={80}
          className="h-8 w-auto max-w-full sm:h-12 md:h-14"
          priority={priority}
        />
      </span>
    </Link>
  );
}
