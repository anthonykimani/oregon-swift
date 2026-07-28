import { CourierLayout } from "@/components/layouts/CourierLayout";

export default function CourierPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CourierLayout>{children}</CourierLayout>;
}
