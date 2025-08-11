"use client";

import { cn } from "$/lib/utils";
import { ChevronLeft, ChevronRight, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocalStorage } from "react-use";

interface NavigationSidebarProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function NavigationSidebar({ scrollRef }: NavigationSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [collapsed, setCollapsed] = useLocalStorage<boolean>(
    "navigation-sidebar-collapsed",
    false
  );

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
    <div
      className={cn(
        "border-l border-sidebar-border w-full max-w-48 p-4 relative transition-all",
        collapsed && "max-w-0 p-0"
      )}
    >
      <div className="sticky top-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Contents
        </h3>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-accent",
                {
                  "bg-subtle text-foreground": activeSection === section.id,
                  "text-muted-foreground": activeSection !== section.id,
                }
              )}
            >
              <Hash className="w-3 h-3 opacity-60 shrink-0" />
              {section.label}
            </button>
          ))}
        </nav>
      </div>
      <button
        className="cursor-pointer absolute top-1/2 -translate-y-1/2 -left-[26px] rounded-r-none py-2 p-1 bg-white rounded-lg border border-sidebar-border"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
