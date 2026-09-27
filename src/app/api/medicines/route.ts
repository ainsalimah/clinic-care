import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";
    const inStockOnly = searchParams.get("inStockOnly") === "true";

    const medicines = await prisma.medicine.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { form: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          inStockOnly ? { stock: { gt: 0 } } : {},
        ],
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ medicines });
  } catch (error) {
    console.error("GET /api/medicines error:", error);
    return NextResponse.json({ error: "Gagal memuat katalog obat." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, form, unit, price, stock, minimumStock } = await req.json();

    if (!name || !unit) {
      return NextResponse.json({ error: "Nama obat dan satuan wajib diisi." }, { status: 400 });
    }

    const initialStock = Number(stock) || 0;
    const unitPrice = Number(price ?? 0);
    if (!Number.isSafeInteger(unitPrice) || unitPrice < 0 || unitPrice > 2000000000) {
      return NextResponse.json({ error: "Harga obat harus rupiah bulat antara 0 dan 2 miliar." }, { status: 400 });
    }

    const newMedicine = await prisma.$transaction(async (tx) => {
      const med = await tx.medicine.create({
        data: {
          name: name.trim(),
          form: form ? form.trim() : null,
          unit: unit.trim(),
          price: unitPrice,
          stock: initialStock,
          minimumStock: Number(minimumStock) || 10,
        },
      });

      if (initialStock > 0) {
        await tx.inventoryTransaction.create({
          data: {
            medicineId: med.id,
            type: "IN",
            quantity: initialStock,
            notes: "Saldo awal penambahan obat baru",
          },
        });
      }

      return med;
    });

    return NextResponse.json({ success: true, medicine: newMedicine }, { status: 201 });
  } catch (error) {
    console.error("POST /api/medicines error:", error);
    return NextResponse.json({ error: "Gagal menambahkan data obat baru." }, { status: 500 });
  }
}
