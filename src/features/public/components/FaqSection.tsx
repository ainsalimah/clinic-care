"use client";

import { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  PhoneCall,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { faqs } from "../content";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="kc-faq-section" id="faq">
      <div className="kc-shell">
        <div className="kc-faq-grid">
          {/* Left Column: FAQ Information & Assistance */}
          <div className="kc-faq-sidebar kc-reveal">
            <p className="kc-eyebrow">
              <Sparkles size={13} />
              <span>Sebelum Berkunjung</span>
            </p>
            <h2 className="kc-heading">
              Pertanyaan yang<br />
              <em>sering diajukan.</em>
            </h2>
            <p className="kc-lead-p">
              Informasi singkat untuk membantu Anda menyiapkan kunjungan, memahami pendaftaran online,
              serta simulasi operasional terpadu di KlinikCare.
            </p>

            <div className="kc-help-card">
              <div className="kc-help-icon">
                <HelpCircle size={24} />
              </div>
              <h4>Butuh bantuan lebih lanjut?</h4>
              <p>Staf resepsionis kami siap menjawab pertanyaan seputar jadwal praktik dokter dan pendaftaran pasien.</p>
              
              <div className="kc-help-contacts">
                <a href="tel:02287654321" className="kc-help-contact-item">
                  <PhoneCall size={16} />
                  <span>(022) 8765-4321 · Bandung</span>
                </a>
                <div className="kc-help-meta">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>Respon Cepat Jam Kerja (08.00–21.00 WIB)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Accordion */}
          <div className="kc-faq-list-col kc-reveal">
            <div className="kc-accordion-list" role="region" aria-label="Daftar FAQ">
              {faqs.map(([question, answer], index) => {
                const isOpen = openIndex === index;
                const panelId = `faq-panel-${index}`;
                const triggerId = `faq-trigger-${index}`;
                return (
                  <div
                    key={question}
                    className={`kc-accordion-item ${isOpen ? "kc-accordion-item-open" : ""}`}
                  >
                    <button
                      id={triggerId}
                      type="button"
                      className="kc-accordion-trigger"
                      onClick={() => toggle(index)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                    >
                      <span className="kc-faq-q-text">{question}</span>
                      <span className="kc-accordion-chevron-wrap">
                        <ChevronDown size={18} className="kc-accordion-chevron" />
                      </span>
                    </button>
                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={triggerId}
                        className="kc-accordion-content"
                      >
                        <p>{answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
