import { Link, useLocation } from "wouter";
import { LayoutDashboard, FolderKanban, PlusCircle, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    { href: "/projects/new", label: "New Request", icon: PlusCircle },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar px-4 py-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-12 px-2">
          <div className="w-6 h-6 rounded bg-primary" />
          <span className="text-xl font-serif font-medium text-sidebar-foreground">Studio Portal</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-sidebar-border mt-auto">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-medium">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Jane Designer</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">jane@studio.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile nav header */}
      <header className="md:hidden flex items-center justify-between px-4 py-4 border-b border-border bg-sidebar sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-primary" />
          <span className="text-lg font-serif font-medium">Studio Portal</span>
        </div>
        <div className="flex items-center gap-2">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}>
              <Button variant={location === item.href ? "secondary" : "ghost"} size="icon" className="w-8 h-8 rounded-full">
                <item.icon className="w-4 h-4" />
              </Button>
            </Link>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:px-12 md:py-12">
        {children}
      </main>
    </div>
  );
}
