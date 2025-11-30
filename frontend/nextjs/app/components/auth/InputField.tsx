import { Eye, EyeOff } from "lucide-react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

const baseInputClass: string = `
    disabled:text-gray-700 
    [-moz-appearance:_textfield] 
    [&::-webkit-inner-spin-button]:m-0 
    [&::-webkit-inner-spin-button]:appearance-none 
    [&::-webkit-outer-spin-button]:m-0 
    [&::-webkit-outer-spin-button]:appearance-none 

    bg-gray-2
    w-full 
    px-3 
    focus:outline-none 
    text-base font-sans 
    pt-7 pb-2.5 
    transition-all duration-200
    placeholder:text-gray-400

    hover:bg-white
    hover:outline-2 
`;

// ========== FOCUS OUTLINE FUNCTION ==========
const focusOutlineClass = (borderRadius: string): string => `
    focus-within:before:rounded-${borderRadius} 
    focus-within:before:pointer-events-none 
    focus-within:before:absolute 
    focus-within:before:left-0 
    focus-within:before:top-0 
    focus-within:before:z-10 
    focus-within:before:h-full 
    focus-within:before:w-full 
    focus-within:before:outline-offset-2 
    focus-within:before:opacity-30 
`;

// ========== TYPE SCRIPT INTERFACE ==========
interface InputFieldProps<TFieldValues extends FieldValues> {
  id: keyof TFieldValues;
  type: "text" | "email" | "password";
  placeholder: string;
  label: string;
  register: UseFormRegister<TFieldValues>;
  isTop: boolean;
  error?: string;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

// ========== COMPONENT ==========
const InputField = <TFieldValues extends FieldValues>({
  id,
  type,
  placeholder,
  label,
  register,
  isTop,
  error,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
}: InputFieldProps<TFieldValues>) => {
  const borderClasses: string = isTop
    ? "rounded-t-lg border-x border-t"
    : "rounded-b-lg border";

  const focusClasses: string = isTop
    ? focusOutlineClass("t-lg")
    : focusOutlineClass("b-lg");

  const containerClasses: string = `
        relative w-full 
        ${!isTop ? "mt-[-1px]" : ""} 
        ${
          error
            ? "border-red-500 ring-red-500"
            : "border-gray-300 ring-gray-900"
        }
        ${focusClasses}
    `;

  return (
    <div className="relative w-full">
      <label className="flex flex-col w-full z-10" htmlFor={id as string}>
        <div className={containerClasses}>
          {/* INPUT */}
          <input
            id={id as string}
            type={showPassword ? "text" : type}
            placeholder={placeholder}
            spellCheck="false"
            autoComplete="off"
            {...register(id as Path<TFieldValues>)}
            className={`
              ${baseInputClass} 
              ${borderClasses} 
              ${error ? "border-red-500!" : "border-gray-300"} 
              focus:ring-0 
              ${showPasswordToggle && type === "password" ? "pr-10" : ""}
            `}
          />

          {/* FLOATING LABEL */}
          <div className="absolute top-0 left-0 right-0 pointer-events-none">
            <div className="flex w-full flex-col gap-y-1 pb-0.5 text-gray-400 pl-3 pt-2.5">
              <span className="flex items-center gap-x-1">
                <span className="text-xs uppercase font-semibold">{label}</span>
              </span>
            </div>
          </div>

          {/* 👁️ PASSWORD TOGGLE */}
          {showPasswordToggle && onTogglePassword && type === "password" && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-20"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
      </label>

      {error && <p className="text-red-500 text-sm mt-1 mb-2 px-3">{error}</p>}
    </div>
  );
};

export default InputField;
