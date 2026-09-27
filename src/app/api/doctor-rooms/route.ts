import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function allowed() {
  const session = await getSession();
  return session?.role === "ADMIN" || session?.role === "RECEPTIONIST";
}

export async function GET() {
  if (!(await allowed())) return NextResponse.json({ error: "Akses petugas diperlukan." }, { status: 403 });
  const doctors = await prisma.doctor.findMany({
    where: { user: { isActive: true } },
    select: { id: true, fullName: true, roomLabel: true, department: { select: { name: true } } },
    orderBy: [{ department: { name: "asc" } }, { fullName: "asc" }],
  });
  return NextResponse.json({ doctors });
}

export async function PATCH(req: Request) {
  if (!(await allowed())) return NextResponse.json({ error: "Akses petugas diperlukan." }, { status: 403 });
  const { doctorId, roomLabel } = await req.json();
  if (typeof doctorId !== "string" || typeof roomLabel !== "string" || !roomLabel.trim() || roomLabel.trim().length > 50) {
    return NextResponse.json({ error: "Isi nama ruang maksimal 50 karakter." }, { status: 400 });
  }
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { id: true } });
  if (!doctor) return NextResponse.json({ error: "Dokter tidak ditemukan." }, { status: 404 });
  const duplicate = await prisma.doctor.findFirst({
    where: { id: { not: doctorId }, roomLabel: { equals: roomLabel.trim(), mode: "insensitive" }, user: { isActive: true } },
    select: { id: true },
  });
  if (duplicate) return NextResponse.json({ error: "Nama ruang sudah dipakai dokter lain." }, { status: 409 });
  const updated = await prisma.doctor.update({ where: { id: doctorId }, data: { roomLabel: roomLabel.trim() }, select: { id: true, roomLabel: true } });
  return NextResponse.json({ doctor: updated });
}
