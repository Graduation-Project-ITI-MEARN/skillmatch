"use client";

import { Eye, EyeOff } from "lucide-react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

// ======== BASE STYLES ========
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
  pt-7 pb-2.5
  text-base font-sans
  placeholder:text-gray-400
  transition-all duration-200
`;

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

  const containerClasses: string = `
    relative w-full
    ${!isTop ? "mt-[-1px]" : ""}
    ${error ? "border-red-500" : "border-gray-300"}
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
              border-gray-300
              focus:outline-none
              focus:ring-1              focus:ring-black
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
