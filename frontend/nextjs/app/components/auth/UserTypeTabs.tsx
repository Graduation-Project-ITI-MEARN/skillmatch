"use client";
import React from "react";

export type UserType = "candidate" | "company" | "challenger";

interface UserTypeTabsProps {
  selected: UserType;
  onChange: (type: UserType) => void;
}

const UserTypeTabs: React.FC<UserTypeTabsProps> = ({ selected, onChange }) => {
  const tabs: Array<{ value: UserType; label: string }> = [
    { value: "candidate", label: "Candidate" },
    { value: "company", label: "Company" },
    { value: "challenger", label: "Challenger" },
  ];

  const activeColor = "#39594d";
  const inactiveColor = "#a0a0a0";
  const activeBackgroundColor = "white";

  const correctClipPath = "polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)";
  const borderRadius = "0.3rem";
  const borderWidth = "1px";

  const leftBorderRadiusStyle = {
    borderTopLeftRadius: borderRadius,
    borderBottomLeftRadius: borderRadius,
    borderTopRightRadius: "0px",
    borderBottomRightRadius: "0px",
  };

  const buttonDisableStyles: React.CSSProperties = {
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    userSelect: "none",
    outline: "none",
    boxShadow: "none",
    backgroundColor: "transparent",
  };

  return (
    <div className="w-full mb-12">
      <p className="mb-3 text-center text-gray-800 font-semibold text-base">
        I am a
      </p>

      <div className="flex gap-2 justify-center items-center">
        {tabs.map((tab) => {
          const isActive = selected === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              tabIndex={-1}
              className="relative px-4 py-2 text-sm font-medium focus:outline-none focus:ring-0 cursor-pointer"
              style={{
                zIndex: 10,
                minWidth: "80px",
                padding: `calc(8px + 1px) calc(16px + 1px)`,
                color: isActive ? activeColor : inactiveColor,
                fontWeight: isActive ? "bold" : "medium",
                ...buttonDisableStyles,
              }}
            >
              {isActive && (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: correctClipPath,
                      backgroundColor: activeColor,
                      ...leftBorderRadiusStyle,
                      zIndex: -3,
                    }}
                  />
                  <div
                    className="absolute"
                    style={{
                      top: borderWidth,
                      bottom: borderWidth,
                      left: borderWidth,
                      right: "2px",
                      clipPath: correctClipPath,
                      backgroundColor: activeBackgroundColor,
                      ...leftBorderRadiusStyle,
                      zIndex: -2,
                    }}
                  />
                </>
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UserTypeTabs;