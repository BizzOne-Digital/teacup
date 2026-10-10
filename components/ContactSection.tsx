const HOURS = [
  { day: "Saturday", time: "10:30 am – 8:30 pm" },
  { day: "Sunday", time: "10:30 am – 8:30 pm" },
  { day: "Monday", time: "11:00 am – 8:30 pm" },
  { day: "Tuesday", time: "11:00 am – 8:30 pm" },
  { day: "Wednesday", time: "11:00 am – 8:30 pm" },
  { day: "Thursday", time: "11:00 am – 8:30 pm" },
  { day: "Friday", time: "11:00 am – 8:30 pm" },
];

const PHONE = "+1 916-448-6212";
const PHONE_HREF = "tel:+19164486212";
const ADDRESS =
  "1614 21st Street, Sacramento, CA 95811, United States";
const MAP_QUERY = encodeURIComponent(
  "1614 21st Street, Sacramento, CA 95811"
);
const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;

export function ContactSection() {
  return (
    <section
      id="contact"
      className="border-t border-stone-200 bg-white py-16 md:py-20"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto w-full min-w-0 max-w-6xl px-3 sm:px-4">
        <div className="mb-10 text-center md:text-left">
          <h2
            id="contact-heading"
            className="text-2xl font-semibold text-[#2d422b] md:text-3xl"
          >
            Visit &amp; contact
          </h2>
          <p className="mt-2 text-stone-600">
            Pick up your order or reach us during business hours.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#2d422b]">
              Hours
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-stone-700">
              {HOURS.map(({ day, time }) => (
                <li
                  key={day}
                  className="flex flex-col gap-0.5 border-b border-stone-200/80 pb-2 last:border-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4"
                >
                  <span className="font-medium text-stone-900">{day}</span>
                  <span className="text-stone-600 sm:text-right">{time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#2d422b]">
              Phone
            </h3>
            <p className="mt-4">
              <a
                href={PHONE_HREF}
                className="text-lg font-semibold text-[#2d422b] underline-offset-4 hover:underline"
              >
                {PHONE}
              </a>
            </p>
            <p className="mt-2 text-sm text-stone-600">
              Call for questions about your order or the menu.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#2d422b]">
              Address
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-stone-700">
              {ADDRESS}
            </p>
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-sm font-medium text-emerald-800 hover:text-emerald-900"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
