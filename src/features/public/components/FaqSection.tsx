import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { faqs } from "../content";

export function FaqSection() {
  return <section className="kc-faq kc-section" id="faq"><div className="kc-shell kc-faq-grid">
    <div className="kc-faq-intro kc-reveal"><span className="kc-round-icon"><MessageCircleQuestion size={22} /></span><p className="kc-eyebrow">Sebelum berkunjung</p><h2 className="kc-heading">Pertanyaan yang sering ditanyakan.</h2><p>Informasi singkat untuk membantu Anda menyiapkan kunjungan dengan lebih tenang.</p></div>
    <div className="kc-faq-list kc-reveal">{faqs.map(([question,answer],index)=><details key={question} className="kc-faq-item" open={index===0}><summary><span>{question}</span><ChevronDown size={18} /></summary><p>{answer}</p></details>)}</div>
  </div></section>;
}
