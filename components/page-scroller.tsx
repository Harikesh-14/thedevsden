
"use client";

import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const scrollPercentage =
        scrollableHeight > 0
          ? (window.scrollY / scrollableHeight) * 100
          : 0;

      setShowScrollToTop(scrollPercentage >= 30);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    showScrollToTop && (
      <Button
        variant="default"
        size="icon-lg"
        className="fixed bottom-10 right-10"
        onClick={handleScrollToTop}
        aria-label="Scroll to top"
      >
        <ArrowBigUp />
      </Button>
    )
  );
}

export function ScrollToBottom() {
  const [showScrollToBottom, setShowScrollToBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const scrollPercentage =
        scrollableHeight > 0
          ? (window.scrollY / scrollableHeight) * 100
          : 0;

      setShowScrollToBottom(scrollPercentage <= 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    showScrollToBottom && (
      <Button
        variant="default"
        size="icon-lg"
        className="fixed bottom-20 right-10"
        onClick={handleScrollToBottom}
        aria-label="Scroll to bottom"
      >
        <ArrowBigDown />
      </Button>
    )
  );
}