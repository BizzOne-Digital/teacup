import { Logo } from "./Logo";

type Props = {
  storeName: string;
};

export function SiteFooter({ storeName }: Props) {
  return (
    <footer className="mx-auto w-full min-w-0 max-w-6xl px-3 py-10 text-center text-sm text-stone-500 sm:px-4">
      <Logo className="mx-auto mb-4" />
      <p className="font-medium text-[#2d422b]">{storeName}</p>
      <p className="mt-4 text-xs text-stone-400">
        © Tea Cup Cafe. All rights reserved.
      </p>
    </footer>
  );
}
