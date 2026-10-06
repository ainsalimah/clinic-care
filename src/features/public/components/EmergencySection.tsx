import {
  AlertCircle,
  Ambulance,
  HeartPulse,
  MapPin,
  PhoneCall,
} from "lucide-react";

export function EmergencySection() {
  const triagePoints = [
    "Sesak napas akut & gangguan pernapasan berat",
    "Nyeri dada mendadak & gejala kardiovaskular",
    "Demam kejang pada balita & dehidrasi berat",
    "Cedera luka terbuka & penanganan trauma segera",
  ];

  return (
    <section id="darurat" className="pad bg-[#0B2D45]" aria-labelledby="emergency-title">
      <div className="wrap">
        <div className="grid gap-8 rounded-3xl border border-white/20 bg-white/5 p-6 text-white shadow-xl sm:p-9 lg:grid-cols-[1.1fr_.9fr] lg:gap-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-bold tracking-wide text-red-100">
              <span className="h-2 w-2 rounded-full bg-red-400" aria-hidden="true" />
              UNIT GAWAT DARURAT · SIAGA 24 JAM
            </p>
            <h2 id="emergency-title" className="mt-5 font-extrabold text-3xl leading-tight tracking-tight sm:text-4xl">
              Butuh Penanganan Cepat?
              <span className="mt-1 block text-[#9DD8FF]">Tim Medis Siaga 24/7.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                Bagi kondisi darurat medis, jangan tunda. Hubungi nomor siaga gawat darurat kami atau segera
                menuju IGD RS Cakrawala Medika untuk penanganan triage langsung.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="tel:+62215557799" className="btn bg-red-600 text-white hover:bg-red-700">
                <PhoneCall size={18} aria-hidden="true" />
                Telepon IGD: +62 21 555 7799
              </a>
              <a href="#lokasi" className="btn border-btn">
                <MapPin size={17} aria-hidden="true" />
                Petunjuk Arah IGD
              </a>
            </div>
          </div>

          <aside className="rounded-2xl bg-white p-6 text-[#0B2D45] sm:p-7">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Ambulance size={22} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-bold text-lg">Indikasi Gawat Darurat</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#4c6475]">Prioritas penanganan triage tanpa antre reguler.</p>
              </div>
            </div>
            <ul className="mt-6 space-y-3">
              {triagePoints.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-[#315066]">
                  <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm font-semibold leading-relaxed text-[#7f1d1d]">
              <HeartPulse size={18} className="mt-0.5 shrink-0 text-red-600" aria-hidden="true" />
              Ambulans siaga untuk koordinasi transportasi medis darurat.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
