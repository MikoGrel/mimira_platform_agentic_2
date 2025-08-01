"use client";

import { cn } from "$/lib/utils";
import { Hash } from "lucide-react";
import { useEffect, useState } from "react";

interface NavigationSidebarProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function NavigationSidebar({ scrollRef }: NavigationSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>("");

  const sections = [
    { id: "at-glance", label: <span>Overview</span> },
    { id: "requirements", label: <span>Requirements</span> },
    { id: "review-criteria", label: <span>Review Criteria</span> },
    { id: "description", label: <span>Description</span> },
    { id: "others", label: <span>Additional Info</span> },
  ];

  useEffect(() => {
    if (!scrollRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: scrollRef.current,
        rootMargin: "-10% 0px -60% 0px",
        threshold: 0.1,
      }
    );

    // Wait a bit for sections to be rendered
    const timeoutId = setTimeout(() => {
      const sections = document.querySelectorAll("[data-section]");
      sections.forEach((section) => observer.observe(section));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [scrollRef]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    const container = scrollRef.current;

    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = container.scrollTop;

      const targetScrollTop =
        scrollTop + elementRect.top - containerRect.top - 24;

      container.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="border-l border-gray-200 bg-gray-50/50 overflow-hidden w-48 p-4">
      <div className="sticky top-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Contents
        </h3>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100",
                {
                  "bg-gray-100 text-gray-900": activeSection === section.id,
                  "text-gray-600": activeSection !== section.id,
                }
              )}
            >
              <Hash className="w-3 h-3 opacity-60" />
              {section.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
