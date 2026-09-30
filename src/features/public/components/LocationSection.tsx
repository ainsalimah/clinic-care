import {
  Car,
  Clock,
  HeartPulse,
  MapPin,
  Navigation,
  Sparkles,
} from "lucide-react";

export function LocationSection() {
  return (
    <section className="kc-location-section kc-section" id="lokasi">
      <div className="kc-shell">
        <div className="kc-section-head kc-reveal">
          <div>
            <p className="kc-eyebrow">
              <Sparkles size={13} />
              <span>Lokasi & Akses Fasilitas</span>
            </p>
            <h2 className="kc-heading">
              Akses strategis di pusat kota,<br />
              <em>mudah dijangkau bersama keluarga.</em>
            </h2>
          </div>
          <p className="kc-section-head-desc">
            Berada di jalur utama dengan akses ramah ambulans, area parkir luas, serta drop-off zone
            khusus pasien lansia dan kursi roda di depan lobi penerimaan.
          </p>
        </div>

        <div className="kc-location-grid kc-reveal">
          {/* Left Column: Visual Map Card with Coordinates & Directions */}
          <div className="kc-map-card">
            <div className="kc-map-art" aria-hidden="true">
              {/* Stylized vector map graphic */}
              <div className="kc-map-grid-lines" />
              <div className="kc-map-road kc-road-horizontal" />
              <div className="kc-map-road kc-road-vertical" />
              <div className="kc-map-pin-pulse">
                <span className="kc-pin-ring" />
                <span className="kc-pin-core">
                  <HeartPulse size={16} />
                </span>
              </div>
              <div className="kc-map-label-bubble">
                <b>KlinikCare Pratama</b>
                <small>Lobi Utama & IGD 24 Jam</small>
              </div>
            </div>

            <div className="kc-map-footer">
              <div className="kc-map-addr-info">
                <MapPin size={18} className="text-emerald-700 flex-shrink-0" />
                <div>
                  <b>Jl. Kesehatan Raya No. 12</b>
                  <span>Kecamatan Sukajadi, Kota Bandung, Jawa Barat 40161</span>
                </div>
              </div>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="kc-btn-secondary kc-map-nav-btn"
              >
                <Navigation size={15} />
                <span>Buka Peta Navigasi</span>
              </a>
            </div>
          </div>

          {/* Right Column: Facility Details & Schedule */}
          <div className="kc-access-details">
            <div className="kc-access-card">
              <div className="kc-access-head">
                <div className="kc-access-icon">
                  <Clock size={20} />
                </div>
                <div>
                  <h4>Jadwal Pelayanan Poliklinik</h4>
                  <p>Rawat jalan reguler terjadwal</p>
                </div>
              </div>
              <div className="kc-schedule-rows">
                <div className="kc-sched-row">
                  <span>Senin – Jumat</span>
                  <b>08.00 – 21.00 WIB</b>
                </div>
                <div className="kc-sched-row">
                  <span>Sabtu</span>
                  <b>08.00 – 14.00 WIB</b>
                </div>
                <div className="kc-sched-row">
                  <span>Minggu & Hari Libur</span>
                  <span className="kc-sched-badge">Tutup (Khusus IGD Buka)</span>
                </div>
              </div>
            </div>

            <div className="kc-access-card">
              <div className="kc-access-head">
                <div className="kc-access-icon kc-access-icon-gold">
                  <Car size={20} />
                </div>
                <div>
                  <h4>Fasilitas Parkir & Drop-Off</h4>
                  <p>Akses nyaman untuk kendaraan roda 2 dan roda 4</p>
                </div>
              </div>
              <ul className="kc-access-bullet-list">
                <li>Area drop-off tepat di depan lobi rawat jalan tanpa tangga</li>
                <li>Parkir khusus difabel dan lansia dekat pintu masuk utama</li>
                <li>Layanan valet dan pengawalan kursi roda gratis dari satpam</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
