"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

export default function CustomDropdown({ label, options, value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <h4 className="font-bold mb-4 uppercase tracking-widest text-xs text-gray-500">{label}</h4>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-gray-100 rounded-2xl flex justify-between items-center font-bold text-sm hover:bg-gray-200 transition-colors capitalize"
      >
        {value}
        <ChevronDown size={18} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className="p-4 hover:bg-black hover:text-white cursor-pointer transition-colors text-sm font-medium capitalize"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}