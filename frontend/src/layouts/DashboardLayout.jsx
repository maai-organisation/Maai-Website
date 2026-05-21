import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ sidebar, topbar, children }) {
  const [open, setOpen] = useState(false);

  const desktopSidebar = typeof sidebar === "function" ? sidebar({ collapsed: false }) : sidebar;
  const mobileSidebar  = typeof sidebar === "function" ? sidebar({ collapsed: false }) : sidebar;

  return (
    <div className="min-h-screen bg-[#F6FAFB] text-[#041C32]">
      <aside style={{ width: "270px" }} className="fixed inset-y-0 left-0 z-40 hidden bg-[#041C32] shadow-[0_8px_32px_rgba(4,28,50,0.18)] lg:flex lg:flex-col">
        {desktopSidebar}
      </aside>
      <button className="fixed left-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm lg:hidden" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </button>
      {open && <div className="fixed inset-0 z-50 bg-[#041C32]/45 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <aside style={{ width: "270px" }} className={`fixed inset-y-0 left-0 z-[60] bg-[#041C32] transition duration-300 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </button>
        {mobileSidebar}
      </aside>
      <main className="min-h-screen lg:ml-[270px]">
        {topbar && (
          <div className="sticky top-0 z-30 border-b border-[#041C32]/[0.07] bg-[#F6FAFB]/90 px-4 py-3 backdrop-blur-xl md:px-8">
            {topbar}
          </div>
        )}
        <div className="px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
