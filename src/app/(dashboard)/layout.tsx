import { CustomerLayout } from "@/components/layouts/CustomerLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerLayout>{children}</CustomerLayout>;
}
