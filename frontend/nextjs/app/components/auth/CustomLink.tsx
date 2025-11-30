import React from "react";

interface CustomLinkProps extends React.PropsWithChildren {
  href: string;
  className?: string;
  style?: React.CSSProperties;
}

const CustomLink: React.FC<CustomLinkProps> = ({
  href,
  className,
  style,
  children,
}) => {
  return (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  );
};

export default CustomLink;
