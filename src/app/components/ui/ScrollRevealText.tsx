import React, { useMemo, useState, useEffect, useRef } from "react";

interface Props {
  text: string;
  progress: number;
  accentColor: string;
  className?: string;
}

export const ScrollRevealText: React.FC<Props> = ({ 
  text, 
  progress, 
  accentColor, 
  className = "" 
}) => {
  const [cooledDownProgress, setCooledDownProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setCooledDownProgress(progress);
    }, 200);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [progress]);
  const { charsMap, totalLength } = useMemo(() => {
    const words = text.split(" ");
    let totalChars = 0;
    const charsMap = words.map(word => {
      const chars = word.split("");
      const result = chars.map((char) => {
        const globalIndex = totalChars++;
        return { char, globalIndex };
      });
      totalChars++; // Count the space
      return result;
    });
    return { charsMap, totalLength: totalChars };
  }, [text]);

  return (
    <p className={`m-0 ${className}`}>
      {charsMap.map((wordChars, i) => (
        <span key={i} className="inline-block mr-[0.25em] whitespace-nowrap">
          {wordChars.map((item, j) => {
            const p = item.globalIndex / totalLength;
            const diff = progress - p;
            
            let color = "rgba(255,255,255,0.15)";
            let textShadow = "none";
            
            if (diff > 0) {
              if (progress >= 0.99 || p <= cooledDownProgress || diff >= 0.15) {
                color = "#ffffff";
              } else {
                color = accentColor;
                textShadow = `0 0 16px ${accentColor}`;
              }
            }

            return (
              <span 
                key={j} 
                className="inline-block"
                style={{ 
                  color, 
                  textShadow, 
                  transition: "color 0.15s ease-out, text-shadow 0.15s ease-out",
                  willChange: "color, text-shadow"
                }}
              >
                {item.char}
              </span>
            );
          })}
        </span>
      ))}
    </p>
  );
};
