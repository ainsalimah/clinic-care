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
    <section className="kc-emergency-section kc-reveal" id="darurat">
      <div className="kc-shell">
        <div className="kc-emergency-card">
          <div className="kc-emergency-ambient" aria-hidden="true" />

          <div className="kc-emergency-grid">
            {/* Left Column: Urgent Contact */}
            <div className="kc-emergency-left">
              <div className="kc-emergency-kicker">
                <span className="kc-live-beacon">
                  <span className="kc-beacon-ring" />
                  <span className="kc-beacon-dot" />
                </span>
                <span>Unit Gawat Darurat (UGD / IGD) · Siaga 24 Jam</span>
              </div>

              <h2 className="kc-emergency-title">
                Butuh Penanganan Cepat?<br />
                <em>Tim Medis Siaga 24/7.</em>
              </h2>

              <p className="kc-emergency-desc">
                Bagi kondisi darurat medis, jangan tunda. Hubungi nomor siaga gawat darurat kami atau segera
                menuju lobi timur IGD KlinikCare untuk penanganan triage langsung.
              </p>

              <div className="kc-emergency-actions">
                <a href="tel:02287654321" className="kc-btn-emergency">
                  <PhoneCall size={18} />
                  <span>Telepon Darurat: (022) 8765-4321</span>
                </a>
                <a href="#lokasi" className="kc-btn-emergency-ghost">
                  <MapPin size={17} />
                  <span>Petunjuk Arah IGD</span>
                </a>
              </div>
            </div>

            {/* Right Column: Triage Checklist & Ambulance Dispatch */}
            <div className="kc-emergency-right">
              <div className="kc-triage-box">
                <div className="kc-triage-head">
                  <div className="kc-triage-icon">
                    <Ambulance size={22} />
                  </div>
                  <div>
                    <h4>Indikasi Penanganan Gawat Darurat Segera</h4>
                    <p>Prioritas penanganan triage tanpa antre reguler</p>
                  </div>
                </div>

                <ul className="kc-triage-list">
                  {triagePoints.map((item) => (
                    <li key={item}>
                      <AlertCircle size={15} className="text-rose-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="kc-ambulance-notice">
                  <HeartPulse size={16} className="text-rose-600 flex-shrink-0" />
                  <span>
                    Armada ambulans siaga penjemputan wilayah Bandung dan sekitarnya.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
