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
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setIsScrolling(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 60);

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
            let transition = "color 0.2s ease-out, text-shadow 0.2s ease-out";
            
            if (diff > 0) {
              if (progress >= 0.99) {
                color = "#ffffff";
              } else if (diff < 0.2) {
                const intensity = Math.max(0, 1 - (diff / 0.2));
                if (isScrolling) {
                  color = `color-mix(in srgb, ${accentColor} ${intensity * 100}%, #ffffff)`;
                  textShadow = `0 0 ${16 * intensity}px ${accentColor}`;
                  transition = "none";
                } else {
                  color = "#ffffff";
                  const duration = 0.1 + (intensity * 0.6);
                  transition = `color ${duration}s ease-out, text-shadow ${duration}s ease-out`;
                }
              } else {
                color = "#ffffff";
                transition = "color 0.1s ease-out, text-shadow 0.1s ease-out";
              }
            }

            return (
              <span 
                key={j} 
                className="inline-block"
                style={{ 
                  color, 
                  textShadow, 
                  transition,
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
