import { useId, useState, type ChangeEvent } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

interface InputProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label: string;
  type?: string;
}

const Input = ({ value, onChange, placeholder, label, type }: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = useId();

  const resolvedType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      {/* Associated with the field so assistive tech announces the label. */}
      <label
        htmlFor={inputId}
        className="text-[13px] text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      <div className="input-box">
        <input
          id={inputId}
          type={resolvedType}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          value={value}
          onChange={onChange}
        />
        {type === "password" &&
          (showPassword ? (
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
          ))}
      </div>
    </div>
  );
};

export default Input;
