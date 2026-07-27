import { useId, type ChangeEvent } from "react";

interface TextAreaProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  label: string;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}

const TextArea = ({
  value,
  onChange,
  label,
  placeholder,
  maxLength,
  rows = 2,
}: TextAreaProps) => {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={id}
        className="text-[13px] text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      <div className="input-box">
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full bg-transparent outline-none resize-none
                     text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>
      {maxLength && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 -mt-2 mb-2 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
};

export default TextArea;
