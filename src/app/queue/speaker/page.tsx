"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Volume2, VolumeX, ArrowLeft } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface Announcement {
  id: string;
  queueNumber: string;
  roomLabel: string;
  createdAt: string;
  playedAt: string | null;
}

interface ClaimedAnnouncement {
  id: string;
  queueNumber: string;
  roomLabel: string;
  claimToken: string;
}

interface DoctorRoom {
  id: string;
  fullName: string;
  roomLabel: string | null;
  department: { name: string };
}

function spokenQueueNumber(value: string) {
  const digits: Record<string, string> = {
    "0": "nol", "1": "satu", "2": "dua", "3": "tiga", "4": "empat",
    "5": "lima", "6": "enam", "7": "tujuh", "8": "delapan", "9": "sembilan",
  };
  return [...value.toUpperCase()].map((character) => digits[character] ?? character).join(" ");
}

function speak(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.88;
    const indonesianVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("id"));
    if (indonesianVoice) utterance.voice = indonesianVoice;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("Suara tidak dapat diputar. Periksa speaker dan izin audio browser."));
    window.speechSynthesis.speak(utterance);
  });
}

export default function QueueSpeakerPage() {
  const [enabled, setEnabled] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<Announcement[]>([]);
  const [rooms, setRooms] = useState<DoctorRoom[]>([]);
  const [savingRoom, setSavingRoom] = useState<string | null>(null);
  const [roomNotice, setRoomNotice] = useState("");
  const [current, setCurrent] = useState<ClaimedAnnouncement | null>(null);
  const busy = useRef(false);

  const refreshRecent = useCallback(async () => {
    const res = await fetch("/api/queue-announcements", { cache: "no-store" });
    if (!res.ok) throw new Error("Riwayat panggilan tidak dapat dimuat.");
    const data = await res.json();
    setRecent(data.announcements ?? []);
  }, []);

  useEffect(() => {
    refreshRecent().catch(() => {});
    fetch("/api/doctor-rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data.doctors ?? []))
      .catch(() => {});
  }, [refreshRecent]);

  const saveRoom = async (doctor: DoctorRoom) => {
    setRoomNotice("");
    setSavingRoom(doctor.id);
    try {
      const res = await fetch("/api/doctor-rooms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: doctor.id, roomLabel: doctor.roomLabel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nama ruang gagal disimpan.");
      setRoomNotice(`Ruang ${doctor.fullName} tersimpan.`);
    } catch (cause) {
      setRoomNotice(cause instanceof Error ? cause.message : "Nama ruang gagal disimpan.");
    } finally {
      setSavingRoom(null);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    const poll = async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        const res = await fetch("/api/queue-announcements", { method: "POST" });
        if (!res.ok) throw new Error("Layar speaker tidak dapat mengambil panggilan.");
        const data: { announcement: ClaimedAnnouncement | null } = await res.json();
        if (!data.announcement || !mounted) return;
        setCurrent(data.announcement);
        await speak(`Nomor antrean ${spokenQueueNumber(data.announcement.queueNumber)}, silakan menuju ${data.announcement.roomLabel}.`);
        const ack = await fetch("/api/queue-announcements", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: data.announcement.id, claimToken: data.announcement.claimToken }),
        });
        if (!ack.ok) throw new Error("Status pemutaran suara gagal disimpan.");
        await refreshRecent();
      } catch (cause) {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : "Suara panggilan tidak dapat diputar.");
          setEnabled(false);
        }
      } finally {
        busy.current = false;
        if (mounted) setCurrent(null);
      }
    };
    poll();
    const interval = window.setInterval(poll, 2500);
    return () => { mounted = false; window.clearInterval(interval); };
  }, [enabled, refreshRecent]);

  const start = async () => {
    if (!("speechSynthesis" in window)) {
      setError("Browser ini tidak mendukung suara panggilan. Gunakan browser dengan dukungan text-to-speech.");
      return;
    }
    setError("");
    setActivating(true);
    try {
      await speak("Pengeras suara antrean siap.");
      setEnabled(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal mengaktifkan suara.");
    } finally {
      setActivating(false);
    }
  };

  return (
    <AppLayout breadcrumbTitle="Speaker Antrean" activeNav="/queue">
      <div className="page">
        <div className="section-header-flex">
          <div>
            <Link href="/queue" className="btn-back"><ArrowLeft size={15} /> Kembali ke antrean</Link>
            <h1 className="page-title">Layar Panggilan Antrean</h1>
            <p className="page-subtitle">Buka di satu perangkat yang terhubung ke speaker ruang tunggu.</p>
          </div>
          <button type="button" className={enabled ? "btn-secondary" : "btn-primary-action"} disabled={activating || Boolean(current)} onClick={enabled ? () => setEnabled(false) : start}>
            {enabled ? <><VolumeX size={17} /> Nonaktifkan Suara</> : <><Volume2 size={17} /> {activating ? "Mengaktifkan..." : "Aktifkan Suara"}</>}
          </button>
        </div>

        {error && <div className="data-error" role="alert">{error}</div>}
        <section className="panel" aria-live="polite">
          <p className="eyebrow">PANGGILAN SAAT INI</p>
          {current ? (
            <div className="speaker-current">
              <strong>{current.queueNumber}</strong>
              <span>{current.roomLabel}</span>
            </div>
          ) : (
            <p className="speaker-idle">{enabled ? "Menunggu panggilan berikutnya..." : "Aktifkan suara untuk mulai menerima panggilan."}</p>
          )}
        </section>
        <section className="panel" style={{ marginTop: 18 }}>
          <div className="panel-head"><h2>Riwayat panggilan hari ini</h2></div>
          {recent.length === 0 ? <p className="speaker-idle">Belum ada nomor yang dipanggil.</p> : (
            <ul className="speaker-history">
              {recent.map((item) => <li key={item.id}>
                <strong>{item.queueNumber}</strong><span>{item.roomLabel}</span>
                <time>{new Date(item.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })}</time>
              </li>)}
            </ul>
          )}
        </section>
        <section className="panel" style={{ marginTop: 18 }}>
          <div className="panel-head"><div><h2>Penempatan ruang dokter</h2><p className="page-subtitle">Nama ruang ini akan disebut saat nomor antrean dipanggil.</p></div></div>
          {roomNotice && <p role="status" className="page-subtitle">{roomNotice}</p>}
          <div className="speaker-rooms">
            {rooms.map((doctor) => <div className="speaker-room-row" key={doctor.id}>
              <label htmlFor={`room-${doctor.id}`}><strong>{doctor.fullName}</strong><span>{doctor.department.name}</span></label>
              <input id={`room-${doctor.id}`} type="text" maxLength={50} value={doctor.roomLabel ?? ""} placeholder="Contoh: Ruang Umum 2" onChange={(event) => setRooms((items) => items.map((item) => item.id === doctor.id ? { ...item, roomLabel: event.target.value } : item))} />
              <button type="button" className="btn-secondary" disabled={savingRoom === doctor.id || !doctor.roomLabel?.trim()} onClick={() => saveRoom(doctor)}>Simpan</button>
            </div>)}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
