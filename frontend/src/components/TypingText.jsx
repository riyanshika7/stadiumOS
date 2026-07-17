import React, { useState, useEffect } from 'react';

export default function TypingText({ text, speed = 25 }) {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let currentLength = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      if (currentLength < text.length) {
        const nextChar = text.charAt(currentLength);
        setDisplayedText((prev) => prev + nextChar);
        currentLength++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return <span>{displayedText}</span>;
}
