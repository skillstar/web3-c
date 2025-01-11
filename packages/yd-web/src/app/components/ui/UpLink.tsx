// components/ContactButton.tsx
import React from "react";

interface ContactButtonProps {
  text?: string;
  href?: string;
  showArrow?: boolean;
  className?: string;
}

const UpLink: React.FC<ContactButtonProps> = ({
  text = "Contact us",
  href = "mailto:hello@nodes.ai",
  showArrow = true,
  className = "",
}) => {
  const letters = text.split("");

  return (
    <a
      className={`group/contact inline-flex items-center gap-3 ${className}`}
      href={href}
    >
      <div className="mono-large text-14 md:text-sm text-white transition-colors duration-200">
        <div className="overflow-hidden relative">
          <span className="sr-only">{text}</span>
          <div className="flex">
            {letters.map((letter, index) => (
              <span
                key={`top-${index}`}
                className="inline-block transition-transform duration-200 transform translate-y-0 group-hover/contact:-translate-y-full"
                style={{ transitionDelay: `${index * 10}ms` }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </div>
          <div className="flex absolute top-0 left-0">
            {letters.map((letter, index) => (
              <span
                key={`bottom-${index}`}
                className="inline-block transition-transform duration-200 transform translate-y-full group-hover/contact:translate-y-0 text-primary"
                style={{ transitionDelay: `${index * 10}ms` }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </div>
        </div>
      </div>
      {showArrow && (
        <svg
          width="11"
          height="8"
          viewBox="0 0 11 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white group-hover/contact:text-primary transition-colors duration-200"
        >
          <path
            d="M7.47501 7.318L6.55701 6.4L8.14101 4.816L9.041 4.312L8.951 4.096L8.14101 4.348H0.509003V3.052H8.14101L8.951 3.304L9.041 3.088L8.14101 2.584L6.55701 1L7.47501 0.0820007L10.229 2.836V4.564L7.47501 7.318Z"
            fill="currentColor"
          />
        </svg>
      )}
    </a>
  );
};

export default UpLink;
