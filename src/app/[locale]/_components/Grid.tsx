import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { TypeAnimation } from 'react-type-animation';

export const Grid = () => {
  const [animationDone, setAnimationDone] = useState(false);
  const [showH2, setShowH2] = useState(false);
  const [showP, setShowP] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (animationDone) {
      setTimeout(() => setShowH2(true), 500); // Delay for h2
      setTimeout(() => setShowP(true), 1000); // Delay for p
      setTimeout(() => setShowButton(true), 1500); // Delay for button
    }
  }, [animationDone]);

  return (
    <section className="min-h-screen   max-w-7xl text-slate-500  mt-8   flex justify-center ">
    
        <div className="px-4 mx-auto w-full text-center flex flex-col items-center py-16 md:p-0 lg:px-12 ">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="col-span-8 place-self-center text-center sm:text-left justify-self-start flex flex-col items-center gap-4"
          >
            <h1 className=" font-extrabold text-4xl mb-4 md:text-5xl lg:text-6xl lg:leading-normal">
              
              <br />
              <TypeAnimation
                sequence={[
                  'Alforqan & Albatool American Schools',
                  1000,
                  () => setAnimationDone(true), // Callback when animation is done
                ]}
                wrapper="span"
                speed={10}
                className="mt-12 w-full bg-clip-text text-transparent bg-gradient-to-r from-[#f95959] via-[#f95959] to-slate-300 font-extrabold "
                cursor={false}
              />
            </h1>

            <AnimatePresence>
              {showH2 && (
                <motion.h2
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full flex    items-center text-xl  lg:text-xl font-semibold justify-center mb-10"
                >
                  Control Management System
                </motion.h2>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showP && (
                <motion.p
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ duration: 1 }}
                  className=" text-base sm:text-lg lg:text-xl mb-6 font-semibold"
                >
                  Here you can track your students' progress, teacher's activities, data entries, exams results, and much more ..
                </motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showButton && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ duration: 1 }}
                >
                  <button className="px-1 py-1 w-full sm:w-fit rounded-full bg-transparent  hover:bg-slate-800 mt-3 ring-2 ring-[#f95959]">
                    <span className="block  bg-gradient-to-r from-[#f95959] to-slate-300 hover:bg-slate-800 rounded-full px-5 py-2 text-black">Let’s Get Started</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        
      </div>
    </section>
  );
};