"use client";

import { motion } from "framer-motion";

interface AnimatedSymbolProps {
  className?: string;
  isLoading?: boolean;
}

const AnimatedSymbol = ({
  className,
  isLoading = true,
}: AnimatedSymbolProps) => {
  const rotationVariants = {
    rotate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
    stop: {
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="228"
      height="228"
      fill="none"
      viewBox="0 0 228 228"
      className={className}
    >
      <path
        fill="currentColor"
        d="M163.723 218.947v8.776H64.277v-8.776zm55.224-55.224V64.277c0-30.5-24.725-55.224-55.224-55.224H64.277c-30.5 0-55.224 24.725-55.224 55.224v99.446c0 30.499 24.725 55.224 55.224 55.224v8.776l-.828-.005C28.486 227.275.278 198.793.278 163.723V64.277C.277 29.207 28.485.724 63.45.282l.827-.005h99.446c35.346 0 64 28.653 64 64v99.446c0 35.346-28.654 64-64 64v-8.776c30.499 0 55.224-24.725 55.224-55.224"
      />
      <motion.path
        fill="currentColor"
        d="m114 0 114.001 114L114 228 0 114zm0 215.588L215.587 114 114 12.412 12.412 114z"
        variants={rotationVariants}
        animate={isLoading ? "rotate" : "stop"}
        style={{ transformOrigin: "center" }}
      />
      <motion.path
        fill="currentColor"
        d="M57.277 57.277h113.446v113.446H57.277zm104.67 104.67V66.054H66.053v95.893z"
        variants={rotationVariants}
        animate={isLoading ? "rotate" : "stop"}
        style={{ transformOrigin: "center" }}
        transition={{
          delay: 0.3,
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.path
        fill="currentColor"
        d="M58.66 114 114 58.66 169.34 114 114 169.34zm98.268 0L114 71.073 71.072 114 114 156.928z"
        variants={rotationVariants}
        animate={isLoading ? "rotate" : "stop"}
        style={{ transformOrigin: "center" }}
        transition={{
          delay: 0.6,
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </svg>
  );
};

export default AnimatedSymbol;
