"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-emerald-100/80 bg-white/90 shadow-sm backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("#home");
          }}
          className="group flex items-center gap-2"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white transition-transform group-hover:scale-110">
            R
          </span>
          <span
            className={cn(
              "text-sm font-semibold tracking-tight transition-colors sm:text-base",
              scrolled ? "text-forest" : "text-forest",
            )}
          >
            {SITE.name}
          </span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="rounded-full px-3 py-2 text-sm font-medium text-forest/80 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Button
              size="sm"
              className="ml-2 rounded-full bg-emerald-500 px-5 text-white hover:bg-emerald-600"
              onClick={() => handleNavClick("#booking")}
            >
              Join a Run
            </Button>
          </li>
        </ul>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-forest" />
              </Button>
            }
          />
          <SheetContent side="right" className="w-[280px] border-emerald-100">
            <SheetHeader>
              <SheetTitle className="text-left text-forest">{SITE.name}</SheetTitle>
            </SheetHeader>
            <ul className="mt-8 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(link.href)}
                    className="w-full rounded-lg px-3 py-3 text-left text-base font-medium text-forest/80 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
              onClick={() => handleNavClick("#booking")}
            >
              Join a Run
            </Button>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
