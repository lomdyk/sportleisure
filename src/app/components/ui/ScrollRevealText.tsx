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
    }, 150);

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
            let transition = "color 0.15s ease-out, text-shadow 0.15s ease-out";
            
            if (diff > 0) {
              if (progress >= 0.99) {
                color = "#ffffff";
              } else if (diff < 0.3 && isScrolling) {
                const intensity = Math.max(0, 1 - (diff / 0.3));
                color = `color-mix(in srgb, ${accentColor} ${intensity * 100}%, #ffffff)`;
                textShadow = `0 0 ${16 * intensity}px ${accentColor}`;
                transition = "color 0.1s linear, text-shadow 0.1s linear";
              } else {
                color = "#ffffff";
                transition = "color 0.6s ease-out, text-shadow 0.6s ease-out";
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
