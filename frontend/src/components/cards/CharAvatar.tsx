import { getInitials } from "../../utils/helper";

interface CharAvatarProps {
  fullName?: string | null;
  width?: string;
  height?: string;
  style?: string;
}

const CharAvatar = ({ fullName, width, height, style }: CharAvatarProps) => (
  <div
    className={`${width ?? "w-12"} ${height ?? "h-12"} ${style ?? ""}
      flex items-center justify-center rounded-full
      text-gray-900 dark:text-gray-100 font-medium
      bg-gray-100 dark:bg-gray-700`}
  >
    {getInitials(fullName)}
  </div>
);

export default CharAvatar;
