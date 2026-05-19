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
    typeof sidebar === "function"
      ? sidebar({ collapsed: false })
      : sidebar;

  const mobileSidebar =
    typeof sidebar === "function"
      ? sidebar({ collapsed: false })
      : sidebar;

  return (
    <div className="min-h-screen bg-[#f7fafc] text-slate-900">

      <aside className="
      fixed
      inset-y-0
      left-0
      z-40
      hidden
      w-[290px]
      border-r
      border-slate-200
      bg-white
      lg:flex
      lg:flex-col
      ">
        {desktopSidebar}
      </aside>

      <button
        className="
        fixed
        left-5
        top-5
        z-50
        grid
        h-11
        w-11
        place-items-center
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        lg:hidden
        "
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="
          fixed
          inset-0
          z-50
          bg-black/40
          backdrop-blur-sm
          lg:hidden
          "
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
        fixed
        inset-y-0
        left-0
        z-[60]
        w-[290px]
        bg-white
        transition
        duration-300
        lg:hidden

        ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <button
          className="
          absolute
          right-4
          top-4
          grid
          h-10
          w-10
          place-items-center
          rounded-full
          bg-slate-100
          "
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>

        {mobileSidebar}
      </aside>

      <main className="lg:ml-[290px]">

        {topbar && (
          <div className="
          sticky
          top-0
          z-30
          border-b
          border-slate-200
          bg-white/90
          px-6
          py-4
          backdrop-blur-xl
          lg:px-10
          ">
            {topbar}
          </div>
        )}

        <div className="
        px-5
        py-8
        md:px-8
        lg:px-10
        ">
          {children}
        </div>

      </main>

    </div>
  );
}