import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { InventoryTransactionType } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { quantity, notes } = await req.json();

    const addQty = Number(quantity);
    if (!addQty || addQty <= 0) {
      return NextResponse.json(
        { error: "Jumlah restock harus lebih dari 0." },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const medicine = await tx.medicine.update({
        where: { id },
        data: {
          stock: {
            increment: addQty,
          },
        },
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          medicineId: id,
          type: InventoryTransactionType.IN,
          quantity: addQty,
          notes: notes || "Restock penerimaan obat masuk",
        },
      });

      return { medicine, transaction };
    });

    return NextResponse.json({ success: true, medicine: updated.medicine });
  } catch (error) {
    console.error("POST /api/medicines/[id]/stock error:", error);
    return NextResponse.json({ error: "Gagal memperbarui stok obat." }, { status: 500 });
  }
}
