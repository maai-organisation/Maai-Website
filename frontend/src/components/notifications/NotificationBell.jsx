import { Bell, CheckCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../../services/api";

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function NotificationBell({ className = "" }) {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadNotifications, 0);
    return () => window.clearTimeout(timer);
  }, [loadNotifications]);

  useEffect(() => {
    function handleClick(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleOpen() {
    setOpen((current) => !current);
    if (!open) await loadNotifications();
  }

  async function handleRead(notification) {
    if (notification.status === "unread") {
      await markNotificationRead(notification.id);
      setItems((current) => current.map((item) => (item.id === notification.id ? { ...item, status: "read" } : item)));
      setUnreadCount((current) => Math.max(0, current - 1));
    }

    const actionUrl = notification.actionUrl || notification.action_url;
    if (actionUrl) {
      setOpen(false);
      if (actionUrl.startsWith("/")) navigate(actionUrl);
      else window.location.assign(actionUrl);
    }
  }

  async function handleReadAll() {
    await markAllNotificationsRead();
    setItems((current) => current.map((item) => ({ ...item, status: "read" })));
    setUnreadCount(0);
  }

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        aria-label="Open notifications"
        className="relative grid h-11 w-11 place-items-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-cyan-700"
        onClick={handleOpen}
        type="button"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-14 z-30 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_70px_rgba(15,23,42,0.16)]">
          <div className="flex items-center justify-between gap-3 px-2 py-1">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">Notifications</p>
              <p className="text-xs font-bold text-slate-500">{unreadCount} unread</p>
            </div>
            <button
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
              disabled={unreadCount === 0}
              onClick={handleReadAll}
              type="button"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Read all
            </button>
          </div>

          <div className="mt-3 max-h-96 overflow-y-auto">
            {loading ? <p className="px-3 py-6 text-center text-sm font-bold text-slate-500">Loading notifications...</p> : null}
            {!loading && items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm font-bold text-slate-500">No notifications yet.</p>
            ) : null}
            {!loading
              ? items.map((notification) => (
                  <button
                    className={`mb-2 w-full rounded-xl px-4 py-3 text-left transition ${
                      notification.status === "unread" ? "bg-cyan-50 hover:bg-cyan-100" : "bg-slate-50 hover:bg-slate-100"
                    }`}
                    key={notification.id}
                    onClick={() => handleRead(notification)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-black text-slate-900">{notification.title}</h3>
                      {notification.status === "unread" ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" /> : null}
                    </div>
                    <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">{notification.message}</p>
                    <p className="mt-2 text-xs font-bold text-slate-400">{formatTime(notification.createdAt || notification.created_at)}</p>
                  </button>
                ))
              : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
