import { useContext } from "react";
import { SIDE_MENU_DATA } from "../../utils/data";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { UserContext } from "../../context/userContext";
import { clearToken } from "../../utils/token";
import CharAvatar from "../cards/CharAvatar";

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleClick = (route) => {
    if (route === "logout") {
      // Only the token — localStorage.clear() also wiped the theme choice.
      clearToken();
      clearUser();
      queryClient.clear();
      navigate("/login", { replace: true });
      return;
    }
    navigate(route);
  };

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white dark:bg-gray-900 border-r border-gray-200/50 dark:border-gray-700/60 p-5 sticky top-[61px] z-20">
      <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <CharAvatar
            fullName={user?.fullName}
            width="w-20"
            height="h-20"
            style="text-xl"
          />
        )}
        <h5 className="text-gray-900 dark:text-gray-100 font-medium leading-6">
          {user?.fullName || ""}
        </h5>
      </div>

      {SIDE_MENU_DATA.map((item, index) => (
        <button
          key={`menu_${index}`}
          className={`w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg mb-3 transition-colors
            ${
              activeMenu === item.label
                ? "text-white bg-primary dark:bg-violet-600"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          onClick={() => handleClick(item.path)}
        >
          <item.icon />
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default SideMenu;
