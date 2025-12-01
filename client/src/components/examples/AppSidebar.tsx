import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../AppSidebar";

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-[400px] w-full border rounded-lg overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center gap-2 p-3 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <span className="text-sm text-muted-foreground">Main Content Area</span>
          </header>
          <main className="flex-1 p-4 bg-background">
            <p className="text-muted-foreground">Dashboard content goes here</p>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
