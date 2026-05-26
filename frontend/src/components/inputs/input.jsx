import { React, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({ value, onChange, placeholder, label, type }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="text-[13px] text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="input-box">
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          value={value}
          onChange={(e) => onChange(e)}
        />
        {type === "password" && (
          <>
            {showPassword ? (
              <FaRegEye
                size={22}
                className="text-primary cursor-pointer"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <FaRegEyeSlash
                size={22}
                className="text-slate-400 dark:text-slate-500 cursor-pointer"
                onClick={() => setShowPassword(true)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Input;
