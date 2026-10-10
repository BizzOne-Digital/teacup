import Image from "next/image";

export function Hero() {
  return (
    <section
      className="relative min-h-[min(88vh,720px)] overflow-hidden text-white"
      id="top"
    >
      <Image
        src="/hero.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center md:object-right"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0f1a0f]/95 via-[#1a2e1a]/75 to-[#1a2e1a]/15 md:via-[#1a2e1a]/55 md:to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0f1a0f]/40 via-transparent to-[#0f1a0f]/30"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex h-full min-h-[min(88vh,720px)] w-full max-w-6xl items-center px-4 pb-16 pt-24 sm:px-6 sm:pt-28 md:pb-20 md:pt-32">
        <div className="w-full min-w-0 max-w-lg space-y-5 sm:space-y-6 md:max-w-xl">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-200/90 sm:text-sm sm:tracking-[0.15em]">
            Sacramento · Dim Sum &amp; Tea
          </p>
          <h1 className="text-3xl font-semibold leading-tight drop-shadow-sm sm:text-4xl md:text-5xl lg:text-6xl">
            Warm bowls, fresh steam,
            <span className="block text-emerald-300">crafted daily.</span>
          </h1>
          <p className="text-base text-white/90 drop-shadow-sm sm:text-lg">
            Order online from Tea Cup Cafe — browse categories, build your cart,
            and checkout in minutes.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {["Dim Sum", "Noodles", "Tea", "Rice", "Desserts"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-xs backdrop-blur-sm md:text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <a
            href="#menu"
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-8 py-3 text-sm font-semibold text-[#1a2e1a] shadow-lg transition hover:bg-emerald-300"
          >
            View menu
          </a>
        </div>
      </div>
    </section>
  );
}
