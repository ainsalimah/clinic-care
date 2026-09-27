import { NextResponse } from "next/server";
import { Prisma, PrescriptionStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PrescriptionConflict, updatePrescription } from "@/features/pharmacy/server/update-prescription";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (user?.role !== "PHARMACIST") return NextResponse.json({ error: "Akses apoteker diperlukan." }, { status: 403 });
    const { id } = await params;
    const { status, notes } = await req.json();
    if (!Object.values(PrescriptionStatus).includes(status) ||
      (notes !== undefined && (typeof notes !== "string" || notes.length > 2000))) {
      return NextResponse.json({ error: "Status atau catatan resep tidak valid." }, { status: 400 });
    }
    const prescription = await prisma.$transaction(
      (tx) => updatePrescription(tx, id, status, notes),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return NextResponse.json({ success: true, prescription });
  } catch (error) {
    if (error instanceof PrescriptionConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return NextResponse.json({ error: "Resep atau stok sedang diperbarui. Muat ulang dan coba lagi." }, { status: 409 });
    }
    console.error("Pembaruan resep gagal:", error);
    return NextResponse.json({ error: "Gagal memperbarui resep." }, { status: 500 });
  }
}
