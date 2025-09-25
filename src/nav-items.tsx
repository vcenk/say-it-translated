import { HomeIcon, User } from "lucide-react";
import Index from "./pages/Index.jsx";
import Auth from "./pages/Auth.jsx";
import App from "./pages/App.jsx";
import NotFound from "./pages/NotFound.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Auth",
    to: "/auth",
    icon: <User className="h-4 w-4" />,
    page: <Auth />,
  },
  {
    title: "App",
    to: "/app",
    icon: <User className="h-4 w-4" />,
    page: <App />,
  },
  {
    title: "404",
    to: "*",
    page: <NotFound />,
  },
];