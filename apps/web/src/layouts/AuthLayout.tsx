import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@ruoyi/ui";

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between rounded-t-2xl border-b border-border bg-card/50 p-3 backdrop-blur-md sm:gap-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          width="24"
          height="24"
          className="text-foreground"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 15,55 C 15,75 35,90 60,85 C 75,82 85,70 80,55" />
            <path d="M 45,60 C 35,40 45,15 65,20 C 80,25 75,45 60,50" />
          </g>
        </svg>
        <ThemeToggle />
      </header>
      <div className="m-auto w-full max-w-md px-8">
        <Outlet />
      </div>
    </div>
  );
}
