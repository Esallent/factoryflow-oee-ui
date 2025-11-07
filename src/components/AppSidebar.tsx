import { LayoutDashboard, ClipboardList, History, Settings, Factory, Plug } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useTranslation } from "@/contexts/LanguageContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

export function AppSidebar() {
  const { open } = useSidebar();
  const { t } = useTranslation();

  const items = [
    { title: t("dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("record"), url: "/record", icon: ClipboardList },
    { title: t("history"), url: "/history", icon: History },
    { title: "Integraciones", url: "/integrations", icon: Plug },
    { title: t("lines"), url: "/lines", icon: Settings },
  ];

  const demoItems = [
    { title: t("demo_schaeffler"), url: "/demo/schaeffler" },
    { title: t("demo_spada"), url: "/demo/spada" },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-bold text-base mb-4">
            FactoryOS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <Collapsible asChild defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="hover:bg-sidebar-accent transition-colors">
                      <Factory className="h-5 w-5" />
                      {open && <span>{t("demo")}</span>}
                      {open && (
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {demoItems.map((demoItem) => (
                        <SidebarMenuSubItem key={demoItem.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink
                              to={demoItem.url}
                              className="hover:bg-sidebar-accent transition-colors"
                              activeClassName="bg-sidebar-accent text-primary font-medium"
                            >
                              {open && <span>{demoItem.title}</span>}
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
