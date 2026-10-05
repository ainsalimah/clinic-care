import prisma from "@/lib/prisma";
import PublicHomePage from "@/features/public/components/PublicHomePage";

export default async function Page() {
  const departments = await prisma.department.findMany({
    select: { id: true, name: true, description: true },
    orderBy: { name: "asc" },
  });
  const doctors = await prisma.doctor.findMany({
    where: { user: { isActive: true } },
    select: {
      id: true,
      fullName: true,
      specialization: true,
      department: { select: { name: true } },
      schedules: {
        select: { dayOfWeek: true, startTime: true, endTime: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
    orderBy: { fullName: "asc" },
  });

  return <PublicHomePage departments={departments} doctors={doctors} />;
}
