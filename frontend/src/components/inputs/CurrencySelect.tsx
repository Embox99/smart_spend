import { useId } from "react";

/** A short list beats a 180-entry dropdown; the API accepts any ISO code. */
const CURRENCIES = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "ILS", label: "Israeli Shekel" },
  { code: "RUB", label: "Russian Ruble" },
  { code: "UAH", label: "Ukrainian Hryvnia" },
  { code: "PLN", label: "Polish Zloty" },
  { code: "CHF", label: "Swiss Franc" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "INR", label: "Indian Rupee" },
] as const;

interface CurrencySelectProps {
  value: string;
  onChange: (code: string) => void;
}

const CurrencySelect = ({ value, onChange }: CurrencySelectProps) => {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={id}
        className="text-[13px] text-slate-700 dark:text-slate-300"
      >
        Currency
      </label>
      <div className="input-box">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100"
        >
          {CURRENCIES.map(({ code, label }) => (
            <option key={code} value={code}>
              {code} — {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CurrencySelect;
