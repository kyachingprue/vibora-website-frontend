import { Link } from "react-router";
import { PlusCircle } from "lucide-react";
import { mainNav } from "@/config/nav";
import NavItem from "./NavItem";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/ThemeToggle";

export default function LeftSidebar() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col gap-1 overflow-y-auto py-4 no-scrollbar lg:flex">
      <nav className="flex flex-col gap-1">
        {mainNav.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </nav>
      <Button asChild className="mt-3 h-11 py-4">
        <Link to="/create">
          <PlusCircle className="h-5 w-5" /> New post
        </Link>
      </Button>
      <div className="mt-auto pt-4">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Appearance</p>
        <ThemeSwitch />
      </div>
    </aside>
  );
}
