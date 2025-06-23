import { Slot, Redirect, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { storage } from "@/src/utils/storage";
import api from "@/src/services/api";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const user = await storage.obterUsuario();

        if (user) {
          const { login } = user;

          const res = await api.get(
            `/usuarios/login/${encodeURIComponent(login)}`
          );

          if (res.data) {
            setIsLogged(true);
          } else {
            await storage.removerUsuario();
            setIsLogged(false);
          }
        } else {
          setIsLogged(false);
        }
      } catch (e) {
        console.log("Erro ao verificar login com backend:", e);
        await storage.removerUsuario();
        setIsLogged(false);
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
