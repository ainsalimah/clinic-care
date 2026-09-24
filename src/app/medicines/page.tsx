"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Loader2,
  X,
  ArrowUpDown,
  Pill,
  Filter,
} from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  form: string | null;
  unit: string;
  price: number;
  stock: number;
  minimumStock: number;
  createdAt: string;
}

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const canManageInventory = userRole === "PHARMACIST";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStock, setFilterStock] = useState<"ALL" | "LOW" | "OUT">("ALL");

  // Restock modal state
  const [selectedMedForRestock, setSelectedMedForRestock] = useState<Medicine | null>(null);
  const [restockQty, setRestockQty] = useState<number>(50);
  const [restockNotes, setRestockNotes] = useState("");
  const [restockSubmitting, setRestockSubmitting] = useState(false);

  // New medicine modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newForm, setNewForm] = useState("Tablet");
  const [newUnit, setNewUnit] = useState("strip");
  const [newPrice, setNewPrice] = useState("10000");
  const [newStock, setNewStock] = useState("100");
  const [newMinStock, setNewMinStock] = useState("20");
  const [addLoading, setAddLoading] = useState(false);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      let url = "/api/medicines";
      if (searchQuery.trim()) {
        url += `?q=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.medicines) {
        setMedicines(data.medicines);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUserRole(data.user?.role ?? null))
      .catch(() => setUserRole(null));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedicines();
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedForRestock) return;
    if (restockQty <= 0) {
      alert("Jumlah restock harus lebih dari 0.");
      return;
    }

    setRestockSubmitting(true);
    try {
      const res = await fetch(`/api/medicines/${selectedMedForRestock.id}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: restockQty,
          notes: restockNotes.trim() || "Penerimaan restock gudang farmasi",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSelectedMedForRestock(null);
        setRestockNotes("");
        setRestockQty(50);
        await fetchMedicines();
      } else {
        alert(data.error || "Gagal melakukan restock obat.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setRestockSubmitting(false);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUnit.trim()) {
      alert("Nama obat dan satuan wajib diisi.");
      return;
    }

    setAddLoading(true);
    try {
      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          form: newForm,
          unit: newUnit.trim(),
          price: Number(newPrice) || 0,
          stock: Number(newStock) || 0,
          minimumStock: Number(newMinStock) || 10,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewName("");
        setNewPrice("10000");
        setNewStock("100");
        setNewMinStock("20");
        await fetchMedicines();
      } else {
        alert(data.error || "Gagal menambahkan obat baru.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setAddLoading(false);
    }
  };

  // Filtered list based on stock status
  const filteredMedicines = medicines.filter((m) => {
    if (filterStock === "LOW") {
      return m.stock <= m.minimumStock && m.stock > 0;
    }
    if (filterStock === "OUT") {
      return m.stock === 0;
    }
    return true;
  });

  // Aggregated stats
  const totalItems = medicines.length;
  const outOfStockCount = medicines.filter((m) => m.stock === 0).length;
  const lowStockCount = medicines.filter((m) => m.stock > 0 && m.stock <= m.minimumStock).length;
  const safeStockCount = medicines.filter((m) => m.stock > m.minimumStock).length;

  return (
    <AppLayout breadcrumbTitle="Katalog & Stok Obat" activeNav="/medicines">
      <div className="page">
        {/* Header */}
        <div className="section-header-flex">
          <div>
            <h1 className="page-title">Katalog & Manajemen Stok Obat</h1>
            <p className="page-subtitle">
              {canManageInventory
                ? "Kelola katalog farmasi, penerimaan stok, dan peringatan stok minimum."
                : "Pantau katalog farmasi dan ketersediaan stok obat."}
            </p>
          </div>
          <div className="header-actions-group">
            <button
              type="button"
              className="btn-refresh"
              onClick={fetchMedicines}
              title="Perbarui daftar obat"
            >
              <RefreshCw size={15} className={loading ? "spinner" : ""} />
              <span>Refresh</span>
            </button>
            {canManageInventory && <button
              type="button"
              className="btn-primary-action"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} />
              <span>Tambah Obat Baru</span>
            </button>}
          </div>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-icon blue">
              <Package size={19} />
            </div>
            <div>
              <p>Total Jenis Obat</p>
              <strong>{totalItems}</strong>
              <small className="neutral">Item terdaftar di formularium</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon teal">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <p>Stok Aman</p>
              <strong>{safeStockCount}</strong>
              <small className="positive">Di atas batas minimum</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amber">
              <AlertTriangle size={19} />
            </div>
            <div>
              <p>Stok Menipis</p>
              <strong>{lowStockCount}</strong>
              <small className="warn">Perlu segera restock</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <AlertTriangle size={19} />
            </div>
            <div>
              <p>Stok Habis (Kosong)</p>
              <strong>{outOfStockCount}</strong>
              <small className="danger">Tidak dapat diresepkan</small>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="filter-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <form onSubmit={handleSearch} className="search-form" style={{ flex: 1, minWidth: "260px" }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Cari nama obat atau bentuk sediaan (misal: Paracetamol, Sirup)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn-search">
              Cari
            </button>
          </form>

          {/* Quick Filter buttons */}
          <div className="rx-status-tabs">
            <button
              type="button"
              className={`tab-btn ${filterStock === "ALL" ? "active" : ""}`}
              onClick={() => setFilterStock("ALL")}
            >
              Semua ({totalItems})
            </button>
            <button
              type="button"
              className={`tab-btn tab-pending ${filterStock === "LOW" ? "active" : ""}`}
              onClick={() => setFilterStock("LOW")}
            >
              Stok Menipis ({lowStockCount})
            </button>
            <button
              type="button"
              className={`tab-btn ${filterStock === "OUT" ? "active" : ""}`}
              onClick={() => setFilterStock("OUT")}
              style={filterStock === "OUT" ? { color: "#dc2626" } : {}}
            >
              Habis ({outOfStockCount})
            </button>
          </div>
        </div>

        {/* Medicines Table */}
        <div className="table-card">
          {loading ? (
            <div className="table-loading">
              <Loader2 size={24} className="spinner" />
              <p>Memuat data katalog obat...</p>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="table-empty">
              <Package size={36} />
              <p>Tidak ada obat yang cocok dengan kriteria pencarian.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Obat & Sediaan</th>
                  <th>Satuan</th>
                  <th>Harga Jual</th>
                  <th>Sisa Stok</th>
                  <th>Batas Min.</th>
                  <th>Status Persediaan</th>
                  {canManageInventory && <th style={{ textAlign: "right" }}>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((med) => {
                  const isOut = med.stock === 0;
                  const isLow = med.stock > 0 && med.stock <= med.minimumStock;

                  return (
                    <tr key={med.id} className={isLow || isOut ? "med-row-low" : ""}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Pill size={16} color="var(--teal)" />
                          <div>
                            <b style={{ color: "var(--ink)", display: "block" }}>{med.name}</b>
                            <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                              {med.form || "Sediaan Standar"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "#476170" }}>{med.unit}</span>
                      </td>
                      <td>
                        <b style={{ fontSize: "12px", color: "var(--ink)" }}>
                          Rp {med.price.toLocaleString("id-ID")}
                        </b>
                      </td>
                      <td>
                        <b
                          style={{
                            fontSize: "14px",
                            color: isOut ? "#dc2626" : isLow ? "#b45309" : "#0f9185",
                          }}
                        >
                          {med.stock} {med.unit}
                        </b>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                          {med.minimumStock} {med.unit}
                        </span>
                      </td>
                      <td>
                        {isOut ? (
                          <span className="stock-danger-badge">
                            <AlertTriangle size={11} /> Habis
                          </span>
                        ) : isLow ? (
                          <span className="stock-warning-badge">
                            <AlertTriangle size={11} /> Menipis
                          </span>
                        ) : (
                          <span className="stock-safe-badge">
                            <CheckCircle2 size={11} /> Tersedia
                          </span>
                        )}
                      </td>
                      {canManageInventory && <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="btn-restock"
                          onClick={() => {
                            setSelectedMedForRestock(med);
                            setRestockQty(50);
                            setRestockNotes("");
                          }}
                          title="Tambah Stok Obat Masuk"
                        >
                          <TrendingUp size={13} />
                          <span>Restock</span>
                        </button>
                      </td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Restock Obat */}
        {canManageInventory && selectedMedForRestock && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
                <div>
                  <h3>Penerimaan / Restock Obat</h3>
                  <p>
                    {selectedMedForRestock.name} ({selectedMedForRestock.unit})
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => setSelectedMedForRestock(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRestock}>
                <div className="modal-body">
                  <div style={{ background: "#f8fbfb", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e1ebed" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                      <span style={{ color: "var(--muted)" }}>Stok Gudang Saat Ini:</span>
                      <b style={{ color: "var(--ink)", fontSize: "14px" }}>
                        {selectedMedForRestock.stock} {selectedMedForRestock.unit}
                      </b>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Jumlah Tambahan Masuk ({selectedMedForRestock.unit}) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="form-input"
                      value={restockQty}
                      onChange={(e) => setRestockQty(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Catatan Penerimaan / No. Faktur</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Faktur No. INV-2026-001 dari PT Kimia Farma"
                      value={restockNotes}
                      onChange={(e) => setRestockNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: "14px 22px", borderTop: "1px solid #eef2f3" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setSelectedMedForRestock(null)}
                    disabled={restockSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-action"
                    disabled={restockSubmitting}
                  >
                    {restockSubmitting ? (
                      <>
                        <Loader2 size={15} className="spinner" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp size={15} />
                        <span>Konfirmasi Restock</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Tambah Obat Baru */}
        {canManageInventory && isAddModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-card" style={{ maxWidth: "520px" }}>
              <div className="modal-header">
                <div>
                  <h3>Tambah Obat Baru ke Formularium</h3>
                  <p>Daftarkan item obat baru ke master katalog apotek</p>
                </div>
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddMedicine}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Nama Obat & Kekuatan *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Ibuprofen 400mg"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Bentuk Sediaan</label>
                      <select
                        className="form-input"
                        value={newForm}
                        onChange={(e) => setNewForm(e.target.value)}
                      >
                        <option value="Tablet">Tablet</option>
                        <option value="Kaplet">Kaplet</option>
                        <option value="Kapsul">Kapsul</option>
                        <option value="Sirup">Sirup</option>
                        <option value="Salep / Krim">Salep / Krim</option>
                        <option value="Tetes (Drops)">Tetes (Drops)</option>
                        <option value="Injeksi">Injeksi</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Satuan Kemasan *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Contoh: strip, botol, tube"
                        value={newUnit}
                        onChange={(e) => setNewUnit(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Harga (Rp)</label>
                      <input
                        type="number"
                        min={0}
                        className="form-input"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Stok Awal</label>
                      <input
                        type="number"
                        min={0}
                        className="form-input"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Min. Stok Warning</label>
                      <input
                        type="number"
                        min={1}
                        className="form-input"
                        value={newMinStock}
                        onChange={(e) => setNewMinStock(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: "14px 22px", borderTop: "1px solid #eef2f3" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={addLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-action"
                    disabled={addLoading}
                  >
                    {addLoading ? (
                      <>
                        <Loader2 size={15} className="spinner" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={15} />
                        <span>Simpan Obat Baru</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
