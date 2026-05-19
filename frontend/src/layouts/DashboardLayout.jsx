import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({
  sidebar,
  topbar,
  children,
  variant = "member",
}) {
  const [open, setOpen] = useState(false);

  const desktopSidebar =
    typeof sidebar === "function" ? sidebar({ collapsed: false }) : sidebar;

  const mobileSidebar =
    typeof sidebar === "function" ? sidebar({ collapsed: false }) : sidebar;

  return (
    <div className="min-h-screen bg-[#f7fafc] text-slate-900">

      {/* Desktop Sidebar */}
      <aside
        style={{ width: "290px" }}
        className="fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200 bg-white lg:flex lg:flex-col"
      >
        {desktopSidebar}
      </aside>

      {/* Mobile menu button */}
      <button
        className="fixed left-5 top-5 z-50 grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white shadow-sm lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        style={{ width: "290px" }}
        className={`fixed inset-y-0 left-0 z-[60] bg-white transition duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-slate-100"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
        {mobileSidebar}
      </aside>

      {/* Main content — offset by sidebar width */}
      <main style={{ marginLeft: "290px" }} className="min-h-screen">

        {/* Topbar */}
        {topbar && (
          <div style={{ position: "sticky", top: 0, zIndex: 30, borderBottom: "1px solid #e2e8f0", backgroundColor: "rgba(255,255,255,0.9)", padding: "1rem 2.5rem", backdropFilter: "blur(12px)" }}>
            {topbar}
          </div>
        )}

        {/* Page content */}
        <div style={{ padding: "2rem 2rem 2rem 2.5rem" }}>
          {children}
        </div>

      </main>

    </div>
  );
}