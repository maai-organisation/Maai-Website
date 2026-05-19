import { ArrowRight, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";

export default function AnnouncementsPanel({ announcements, managementPath }) {
  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-cyan-600" />
          <h2 className="text-sm font-semibold text-gray-800">Announcements</h2>
        </div>
        {managementPath ? (
          <Link
            className="flex items-center gap-1 text-xs font-medium text-cyan-600 transition-colors hover:text-cyan-700"
            to={managementPath}
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        ) : null}
      </div>

      {announcements.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50">
            <Megaphone className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="text-sm font-medium text-gray-700">No new announcements</p>
          <p className="mt-1 max-w-sm text-xs leading-5 text-gray-400">
            Stay tuned - updates will appear here for members and partner organisations.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 p-4">
          {announcements.slice(0, 4).map((announcement) => (
            <article
              className="rounded-xl border border-gray-100 p-3.5 transition-all hover:border-cyan-100 hover:bg-cyan-50/40"
              key={announcement.id}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan-700">
                  {announcement.priority || "update"}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  {announcement.announcementType || announcement.announcement_type || "announcement"}
                </span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-gray-800">{announcement.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">{announcement.message}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
