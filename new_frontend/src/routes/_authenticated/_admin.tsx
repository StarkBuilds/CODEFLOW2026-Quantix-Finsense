import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_admin")({
  beforeLoad: () => {
    const userStr = localStorage.getItem("finsense_user");
    if (!userStr) throw redirect({ to: "/login" });
    try {
      const user = JSON.parse(userStr);
      if (!user.roles || !user.roles.includes("admin")) {
        throw redirect({ to: "/dashboard" });
      }
    } catch {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: () => <Outlet />,
});
