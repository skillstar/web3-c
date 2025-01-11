import React from "react";

type SVGProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const ArrowDown = ({ className, ...props }: SVGProps) => {
  return (
    <svg
      width="10"
      height="7"
      viewBox="0 0 10 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M0.5 0.5L5 5.5L9.5 0.5"
        stroke="currentColor"
        stroke-linecap="round"
      />
    </svg>
  );
};

export default ArrowDown;
