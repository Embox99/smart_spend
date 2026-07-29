import type { ReactNode } from "react";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";
import { useUserAuth } from "../../hooks/useUserAuth";

interface DashboardLayoutProps {
  children: ReactNode;
  activeMenu: string;
}

const DashboardLayout = ({ children, activeMenu }: DashboardLayoutProps) => {
  const { user, isLoading, isUnavailable } = useUserAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // The session is intact but the profile did not load — offer a retry
  // rather than the blank shell this used to render.
  if (isUnavailable) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-slate-50 dark:bg-gray-950">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Could not reach the server
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          You are still signed in. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-white bg-violet-500 rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Navbar activeMenu={activeMenu} />
      {user && (
        <div className="flex">
          <div className="max-[1080px]:hidden">
            <SideMenu activeMenu={activeMenu} />
          </div>
          <div className="grow mx-5">{children}</div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
