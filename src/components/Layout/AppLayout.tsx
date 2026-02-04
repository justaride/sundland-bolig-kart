import type { ReactNode } from "react";

type Props = {
  sidebar: ReactNode;
  children: ReactNode;
};

export default function AppLayout({ sidebar, children }: Props) {
  return (
    <div className="h-screen flex overflow-hidden bg-atmosphere">
      {sidebar}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
