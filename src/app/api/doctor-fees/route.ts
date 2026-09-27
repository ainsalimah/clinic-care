import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { rupiahAmount } from "@/lib/billing-rules";

export async function GET() {
  if ((await getSession())?.role !== "ADMIN") return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  return NextResponse.json({ doctors: await prisma.doctor.findMany({
    select: { id: true, fullName: true, consultationFee: true }, orderBy: { fullName: "asc" },
  }) });
}

export async function PATCH(req: Request) {
  if ((await getSession())?.role !== "ADMIN") return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  try {
    const { id, consultationFee } = await req.json();
    const fee = rupiahAmount(consultationFee);
    if (typeof id !== "string") throw new Error("Dokter tidak valid.");
    await prisma.doctor.update({ where: { id }, data: { consultationFee: fee } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Dokter atau nominal tarif tidak valid." }, { status: 400 });
  }
}
