import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { useDispatch } from "react-redux";
import Navbar from "./Navbar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import MobileDrawer from "./MobileDrawer";
import BottomNav from "./BottomNav";
import ScrollToTop from "./ScrollToTop";
import { closeDrawer } from "@/store/uiSlice";

export default function Layout() {
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  // On every route change: close the drawer and jump to the top of the new page
  useEffect(() => {
    dispatch(closeDrawer());
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, dispatch]);

  return (
    <div className="min-h-screen bg-neutral-50 text-black dark:bg-neutral-950 dark:text-white">
      <Navbar />
      <MobileDrawer />
      <div className="mx-auto flex max-w-7xl gap-6 px-3 sm:px-4">
        <LeftSidebar />
        {/* pb-24 leaves room for the fixed bottom nav on small devices */}
        <main className="min-w-0 flex-1 py-4 pb-24 md:pb-8">
          <Outlet />
        </main>
        <RightSidebar />
      </div>
      <BottomNav />
      <ScrollToTop />
    </div>
  );
}
