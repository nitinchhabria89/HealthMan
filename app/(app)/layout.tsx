import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import TabBar from "@/components/ui/TabBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-app mx-auto pb-20 px-4">
      {children}
      <TabBar />
    </div>
  );
}
