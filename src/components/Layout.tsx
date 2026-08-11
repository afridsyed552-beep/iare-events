import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Toasts from "./Toasts";
import { AmbientOrbs } from "./visuals";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07070f] text-white antialiased">
      <ScrollToTop />
      <AmbientOrbs />
      <Navbar />
      <main className="flex-1 relative">
        <Outlet />
      </main>
      <Footer />
      <Toasts />
    </div>
  );
}
