"use client";

import { useEffect, useState } from "react";

interface AutoCall {
  id: string;
  dueAt: string;
  cancelledAt: string | null;
  processedAt: string | null;
  calledQueueId: string | null;
}

export function AutoCallNotice({ initialCall, appointmentId }: { initialCall: AutoCall; appointmentId: string }) {
  const [call, setCall] = useState(initialCall);
  const [seconds, setSeconds] = useState(Math.max(0, Math.ceil((new Date(initialCall.dueAt).getTime() - Date.now()) / 1000)));
  const [error, setError] = useState("");

  useEffect(() => {
    if (call.cancelledAt || call.processedAt) return;
    const timer = window.setInterval(() => {
      setSeconds(Math.max(0, Math.ceil((new Date(call.dueAt).getTime() - Date.now()) / 1000)));
    }, 250);
    const poll = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/queue-auto-calls?appointmentId=${encodeURIComponent(appointmentId)}`, { cache: "no-store" });
        if (res.ok) setCall((await res.json()).autoCall);
      } catch {
        // The scheduled call remains on the server while this page is offline.
      }
    }, 2500);
    return () => { window.clearInterval(timer); window.clearInterval(poll); };
  }, [call.cancelledAt, call.dueAt, call.processedAt, appointmentId]);

  const cancel = async () => {
    setError("");
    const res = await fetch("/api/queue-auto-calls", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: call.id }),
    });
    if (res.ok) setCall({ ...call, cancelledAt: new Date().toISOString() });
    else setError((await res.json()).error || "Panggilan tidak dapat dibatalkan.");
  };

  return (
    <div className="auto-call-notice" role="status">
      {call.cancelledAt ? <p>Panggilan otomatis dibatalkan. Panggil pasien berikutnya secara manual saat ruang siap.</p>
        : call.processedAt ? <p>{call.calledQueueId ? "Pasien berikutnya telah dipanggil melalui layar speaker." : "Tidak ada pasien menunggu yang perlu dipanggil."}</p>
        : <>
          <p>{seconds > 0 ? `Pasien berikutnya akan dipanggil otomatis dalam ${seconds} detik.` : "Menunggu layar speaker memproses panggilan..."}</p>
          {seconds > 0 && <button type="button" className="btn-secondary" onClick={cancel}>Batalkan Panggilan</button>}
        </>}
      {error && <p className="data-error">{error}</p>}
    </div>
  );
}
