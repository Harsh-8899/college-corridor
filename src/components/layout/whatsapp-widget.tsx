"use client";

import { useState } from "react";
import { X, MessageSquare, ArrowUpRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // Default expert phone number
  const phoneNumber = "919999999999";

  const options = [
    {
      title: "Talk To Expert",
      desc: "Instant matching with senior counselor",
      message: "Hi College Corridor, I want to talk to an admission expert regarding my university options.",
      icon: MessageSquare
    },
    {
      title: "Need Help Choosing?",
      desc: "Evaluate courses and eligibility checks",
      message: "Hi College Corridor, I need guidance in choosing the right course and university.",
      icon: HelpCircle
    },
    {
      title: "Ask Admission Team",
      desc: "Check application & documentation status",
      message: "Hi College Corridor, I have a query about my admission application and documentation process.",
      icon: ArrowUpRight
    }
  ];

  const handleOpenChat = (messageText: string) => {
    const encoded = encodeURIComponent(messageText);
    const url = `https://wa.me/${phoneNumber}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {/* Popover Card */}
      {isOpen && (
        <div className="w-80 rounded-2xl bg-white border border-slate-200/80 shadow-2xl overflow-hidden animate-in fade-in-50 slide-in-from-bottom-5 duration-200 text-slate-800">
          {/* Header */}
          <div className="bg-[#0F172A] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                {/* Custom SVG WhatsApp Logo */}
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.459 3.473 1.332 4.988L2 22l5.187-1.36c1.467.799 3.12 1.218 4.825 1.218 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.275 13.988c-.275.773-1.378 1.402-1.928 1.492-.5.089-1.15.156-3.35-.773-2.825-1.189-4.63-4.073-4.773-4.26-.143-.189-1.15-1.53-1.15-2.92 0-1.392.724-2.073.978-2.356.257-.282.56-.356.749-.356.189 0 .378.003.538.01.166.009.389-.062.609.47.22.53.754 1.84.819 1.97.065.132.11.282.02.459-.09.189-.133.308-.266.47-.133.156-.282.356-.402.47-.132.132-.275.275-.121.54.156.267.689 1.134 1.48 1.84.1.089.19.178.27.26.689.609 1.25.799 1.48.909.23.11.36.089.49-.06.133-.156.578-.679.734-.909.156-.23.31-.189.52-.11.21.079 1.33.629 1.56.74.23.11.378.166.438.267.06.1.06.58-.215 1.353z" />
                </svg>
              </span>
              <div>
                <p className="font-extrabold text-sm tracking-tight">Admissions Support</p>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  We are online now
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-slate-400 hover:text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Options List */}
          <div className="p-4 bg-slate-50 space-y-2.5">
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOpenChat(opt.message)}
                className="w-full p-3 text-left rounded-xl bg-white border border-slate-200/60 hover:border-[#25D366] hover:shadow-md transition-all group flex items-start gap-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors shrink-0">
                  <opt.icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-slate-800 group-hover:text-[#25D366] transition-colors">{opt.title}</p>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Footer branding */}
          <div className="px-4 py-2 border-t text-center text-[9px] text-slate-400 bg-white font-medium">
            College Corridor Admission Intelligence
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 group relative"
        aria-label="Contact WhatsApp Support"
      >
        {/* Unread Alert Indicator */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] font-bold text-white items-center justify-center">1</span>
          </span>
        )}

        {isOpen ? (
          <X className="h-6 w-6 animate-in spin-in duration-200" />
        ) : (
          <svg className="h-7 w-7 fill-current group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
            <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.459 3.473 1.332 4.988L2 22l5.187-1.36c1.467.799 3.12 1.218 4.825 1.218 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.275 13.988c-.275.773-1.378 1.402-1.928 1.492-.5.089-1.15.156-3.35-.773-2.825-1.189-4.63-4.073-4.773-4.26-.143-.189-1.15-1.53-1.15-2.92 0-1.392.724-2.073.978-2.356.257-.282.56-.356.749-.356.189 0 .378.003.538.01.166.009.389-.062.609.47.22.53.754 1.84.819 1.97.065.132.11.282.02.459-.09.189-.133.308-.266.47-.133.156-.282.356-.402.47-.132.132-.275.275-.121.54.156.267.689 1.134 1.48 1.84.1.089.19.178.27.26.689.609 1.25.799 1.48.909.23.11.36.089.49-.06.133-.156.578-.679.734-.909.156-.23.31-.189.52-.11.21.079 1.33.629 1.56.74.23.11.378.166.438.267.06.1.06.58-.215 1.353z" />
          </svg>
        )}
      </button>
    </div>
  );
}
