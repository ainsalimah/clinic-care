"use client";

interface DataFeedbackProps {
  loading: boolean;
  error: string;
  updatedAt: Date | null;
  onRetry: () => void;
  refreshHint?: boolean;
}

export default function DataFeedback({ loading, error, updatedAt, onRetry, refreshHint = true }: DataFeedbackProps) {
  if (error) {
    return (
      <div className="data-error data-feedback" role="alert">
        <div>
          <strong>{error}</strong>
          <p>{updatedAt ? "Data yang ditampilkan berasal dari pemuatan terakhir. Coba lagi untuk memperbaruinya." : "Data belum tersedia. Periksa koneksi Anda lalu coba lagi."}</p>
        </div>
        <button type="button" className="btn-refresh" disabled={loading} onClick={onRetry}>
          {loading ? "Mencoba lagi..." : "Coba lagi"}
        </button>
      </div>
    );
  }
  return (
    <p className="data-updated" role="status" aria-live="polite">
      {loading ? "Sedang memperbarui data..." : updatedAt ? `Terakhir diperbarui ${updatedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Jakarta" })} WIB.${refreshHint ? " Gunakan Refresh untuk melihat perubahan terbaru." : ""}` : "Data belum dimuat."}
    </p>
  );
}
