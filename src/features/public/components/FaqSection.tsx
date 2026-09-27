import { ChevronDown } from "lucide-react";
import { faqs } from "../content";

export function FaqSection() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24" id="faq">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#187560]">
            Pusat Informasi
          </p>
          <h2 className="mt-3 font-jakarta text-2xl font-extrabold tracking-tight text-[#143c34] sm:text-3xl lg:text-4xl">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-3 text-sm text-[#547367]">
            Penjelasan seputar proses pendaftaran, jadwal konsultasi, dan alur pengambilan obat di KlinikCare.
          </p>
        </div>

        <div className="mt-10 divide-y divide-[#e5ede7] border-t border-b border-[#e5ede7]">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group py-5 sm:py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-jakarta text-base font-semibold text-[#143c34] transition hover:text-[#187560] focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560] marker:hidden">
                <span>{question}</span>
                <ChevronDown
                  size={18}
                  className="shrink-0 text-[#187560] transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 pr-6 text-sm leading-relaxed text-[#4d6b60] sm:text-base">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
