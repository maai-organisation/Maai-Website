import { Activity } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickActions({ actions }) {
  return (
    <section className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
        <Activity className="h-4 w-4 text-cyan-600" />
        <h2 className="text-sm font-semibold text-gray-800">Quick Actions</h2>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-3 p-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              className="group flex items-center gap-3 rounded-xl border border-gray-100 p-3.5 text-left transition-all duration-150 hover:border-cyan-200 hover:bg-cyan-50"
              key={action.id}
              to={action.href}
            >
              <div className="rounded-lg bg-gray-100 p-2 transition-colors group-hover:bg-cyan-100">
                <Icon className="h-4 w-4 text-gray-500 transition-colors group-hover:text-cyan-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-cyan-700">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
