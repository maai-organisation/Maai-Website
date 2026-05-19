import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Navbar from "../components/navbar/Navbar";

export default function PublicLayout() {
  const { pathname } = useLocation();
  const showNavbar = pathname !== "/";

  return (
    <div className="min-h-screen bg-[#f7f4ef] overflow-x-hidden">
      {showNavbar ? <Navbar /> : null}
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
