"use client";
import { HOVER_COLOR, PRIMARY_COLOR, WHITE_COLOR } from "@/app/lib/constants";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface SplitButtonProps {
  buttonText: string;
  isSubmitting: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const SplitButton: React.FC<SplitButtonProps> = ({
  buttonText,
  isSubmitting,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const currentBackgroundColor: string = isHovered
    ? HOVER_COLOR
    : PRIMARY_COLOR;

  const buttonClasses: string = `
        inline-flex items-center 
        shadow-md 
        disabled:opacity-50 disabled:cursor-not-allowed 
        transition duration-150 
        mt-10 
        group 
        cursor-pointer
        focus:outline-none 
        focus:ring-0 
        rounded-md 
        overflow-hidden 
        w-fit self-center 
    `;

  return (
    <div className="flex justify-center pt-4 w-full mb-4">
      <button
        type="submit"
        onClick={onClick}
        disabled={isSubmitting}
        className={buttonClasses}
        style={{
          backgroundColor: currentBackgroundColor,
          transition: "background-color 0.15s ease-in-out",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center text-white py-2 px-6 font-medium text-[17px] min-w-[150px] h-10">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div
            className={`
                            flex items-stretch h-10 w-full 
                            transition-transform duration-150 ease-in-out
                            group-hover:-translate-x-1 
                        `}
          >
            <span
              className={`
                                py-2 px-6 text-[17px] font-medium text-white 
                                flex items-center justify-center whitespace-nowrap 
                                transition-colors duration-150
                                w-full h-full
                            `}
            >
              {buttonText}
            </span>

            <span
              className={`
                                relative py-2 px-2 text-white flex items-center justify-center 
                                transition-colors duration-150
                                h-full
                            `}
              style={{
                paddingLeft: "15px",
              }}
            >
              <div
                className={`absolute inset-y-0 -left-2 w-4 ${WHITE_COLOR} transform skew-x-[-21deg] z-0`}
              ></div>
              <ArrowRight
                size={20}
                className="text-white z-10"
                strokeWidth={2.5}
              />
            </span>
          </div>
        )}
      </button>
    </div>
  );
};
export default SplitButton;
