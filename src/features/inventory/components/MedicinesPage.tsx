"use client";

import { useCallback, useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { fetchJson } from "@/lib/http/client";
import { AddMedicineModal } from "./AddMedicineModal";
import { RestockMedicineModal } from "./RestockMedicineModal";
import type { Medicine } from "../types";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Loader2,
  Pill,
} from "lucide-react";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const canManageInventory = userRole === "PHARMACIST";
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [filterStock, setFilterStock] = useState<"ALL" | "LOW" | "OUT">("ALL");

  const [selectedMedForRestock, setSelectedMedForRestock] = useState<Medicine | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      let url = "/api/medicines";
      if (submittedQuery) {
        url += `?q=${encodeURIComponent(submittedQuery)}`;
      }
      const data = await fetchJson<{ medicines: Medicine[] }>(url);
      setMedicines(data.medicines);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Gagal memuat obat.");
    } finally {
      setLoading(false);
    }
  }, [submittedQuery]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUserRole(data.user?.role ?? null))
      .catch(() => setUserRole(null));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query === submittedQuery) fetchMedicines();
    else setSubmittedQuery(query);
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
        {loadError && <div role="alert" className="data-error">{loadError}</div>}
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
          <form onSubmit={handleSearch} className="search-form" style={{ flex: 1, minWidth: 0 }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Cari nama obat atau bentuk sediaan (misal: Paracetamol, Sirup)..."
              aria-label="Cari nama obat atau bentuk sediaan"
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
              aria-pressed={filterStock === "ALL"}
              onClick={() => setFilterStock("ALL")}
            >
              Semua ({totalItems})
            </button>
            <button
              type="button"
              className={`tab-btn tab-pending ${filterStock === "LOW" ? "active" : ""}`}
              aria-pressed={filterStock === "LOW"}
              onClick={() => setFilterStock("LOW")}
            >
              Stok Menipis ({lowStockCount})
            </button>
            <button
              type="button"
              className={`tab-btn ${filterStock === "OUT" ? "active" : ""}`}
              aria-pressed={filterStock === "OUT"}
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
                            <span style={{ fontSize: ".8125rem", color: "var(--muted)" }}>
                              {med.form || "Sediaan Standar"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: ".875rem", color: "#476170" }}>{med.unit}</span>
                      </td>
                      <td>
                        <b style={{ fontSize: ".875rem", color: "var(--ink)" }}>
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
                        <span style={{ fontSize: ".875rem", color: "var(--muted)" }}>
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

        {canManageInventory && selectedMedForRestock && (
          <RestockMedicineModal
            medicine={selectedMedForRestock}
            onClose={() => setSelectedMedForRestock(null)}
            onSaved={fetchMedicines}
          />
        )}
        {canManageInventory && isAddModalOpen && (
          <AddMedicineModal onClose={() => setIsAddModalOpen(false)} onSaved={fetchMedicines} />
        )}
      </div>
    </AppLayout>
  );
}
