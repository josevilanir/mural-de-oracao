"use client";
import React from "react";
import { motion } from "framer-motion";
import { PrayerRequest } from "@/types/prayer";

export const PrayerRequestColumn = (props: {
  className?: string;
  requests: PrayerRequest[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {props.requests.map(({ id, name, text, date, category }) => (
              <div
                key={id}
                className="p-6 rounded-3xl border shadow-lg shadow-primary/10 max-w-xs w-full bg-background"
              >
                <span className="text-xs font-medium px-2 py-1 rounded-full border text-muted-foreground mb-3 inline-block">
                  {category}
                </span>

                <p className="text-sm leading-relaxed">{text}</p>

                <div className="flex items-center gap-3 mt-5">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-medium tracking-tight leading-5 text-sm">
                      {name}
                    </span>
                    <span className="text-xs leading-5 opacity-60 tracking-tight">
                      {date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
