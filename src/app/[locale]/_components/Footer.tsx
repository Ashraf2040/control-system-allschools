

import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

const COLORS = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

const Footer = () => {
  const color = useMotionValue(COLORS[0]);

  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  return (
    <footer className="w-full flex py-4  text-center text-gray-200">
      <p className="text-sm flex items-center justify-center px-8 gap-6 ">
        {/* &copy; {new Date().getFullYear()}{" "} */}
        
         All rights reserved.
        <motion.span
          style={{
            border,
            boxShadow,
          }}
          whileHover={{
            scale: 1.1,
          }}
          whileTap={{
            scale: 0.95,
          }}
          className="group relative flex w-fit items-center gap-1.5 rounded-full bg-gray-950/10 px-4 py-2 text-gray-50 transition-colors hover:bg-gray-950/5"
        >
          AEM
        </motion.span>{" "}
      </p>
    </footer>
  );
};

export default Footer;
