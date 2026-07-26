import { useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { LuMoon, LuSun } from "react-icons/lu";
import SideMenu from "./SideMenu";
import { useTheme } from "../../context/themeContext";

const Navbar = ({ activeMenu }: { activeMenu: string }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const { isDark, toggle } = useTheme();

  return (
    <div className="flex items-center gap-5 bg-white dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-700/60 py-4 px-7 sticky top-0 z-30">
      <button
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={openSideMenu}
        className="block lg:hidden text-gray-700 dark:text-gray-300"
        onClick={() => setOpenSideMenu((open) => !open)}
      >
        {openSideMenu ? (
          <HiOutlineX className="text-2xl" />
        ) : (
          <HiOutlineMenu className="text-2xl" />
        )}
      </button>

      <h2 className="text-lg font-medium text-gray-900 dark:text-white flex-1">
        Smart Spend
      </h2>

      <button
        type="button"
        onClick={toggle}
        aria-label="Toggle dark mode"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {isDark ? <LuSun size={18} /> : <LuMoon size={18} />}
      </button>

      {openSideMenu && (
        <div className="fixed top-[61px] left-0 bg-white dark:bg-gray-900 z-40">
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
