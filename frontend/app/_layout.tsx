import { Slot, Redirect, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { storage } from "@/src/utils/storage";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const user = await storage.obterUsuario();
        setIsLogged(!!user);
      } catch (e) {
        console.log("Erro ao buscar login:", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkLogin();
  }, []);

  if (isLoading) return null;

  const isPublicRoute =
    pathname === "/" || pathname === "/initial" || pathname === "/login";

  const isInsideDrawer =
    pathname.startsWith("/(drawer)") ||
    pathname.includes("/Agenda") ||
    pathname.includes("/Solicitacoes");

  if (isLogged && !isInsideDrawer) {
    return <Redirect href="/(drawer)/Agenda" />;
  }

  if (!isLogged && !isPublicRoute) {
    return <Redirect href="/initial" />;
  }

  return <Slot />;
}
