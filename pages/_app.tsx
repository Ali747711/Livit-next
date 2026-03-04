import { useEffect } from "react";
import { useApollo } from "@/apollo/client";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import {
  ApolloProvider,
  useReactiveVar,
  useLazyQuery,
} from "@apollo/client/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScrollToTopProgress } from "@/components/ui/scroll-to-top";
import { userVar, notifCountVar } from "@/apollo/store";
import { getJwtToken, logOut, updateUserinfo } from "@/lib/auth";
import { useRouter } from "next/router";
import { useSocket } from "@/hooks/useSocket";
import { GET_MY_NOTIFICATIONS } from "@/apollo/user/query";

// AppShell renders INSIDE ApolloProvider — all Apollo hooks work correctly here
const AppShell = ({ Component, pageProps }: any) => {
  const user = useReactiveVar(userVar);
  const router = useRouter();
  const socket = useSocket();

  const [fetchNotifications, { data: notifData }] = useLazyQuery(
    GET_MY_NOTIFICATIONS,
    { fetchPolicy: "network-only" },
  );

  useEffect(() => {
    const token = getJwtToken();
    if (token) updateUserinfo(token);
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchNotifications({ variables: { input: { page: 1, limit: 50 } } });
    }
  }, [user?._id]);

  useEffect(() => {
    const d = notifData as any;
    if (d?.getMyNotifications?.list) {
      const unread = d.getMyNotifications.list.filter(
        (n: any) => n.notificationStatus === "UNREAD",
      ).length;
      notifCountVar(unread);
    }
  }, [notifData]);

  // Global WS listener — handles incoming private message notifications on any page
  useEffect(() => {
    if (!socket) return;
    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "notification") {
          const n = data.data;
          // Skip bell increment and toast if the user is already viewing this conversation
          const alreadyViewing =
            router.pathname === "/messages" &&
            router.query.memberId === n?.authorId;

          if (!alreadyViewing) {
            notifCountVar(notifCountVar() + 1);
            if (n?.authorData?.memberNick && n?.notificationDesc) {
              toast(`New message from ${n.authorData.memberNick}`, {
                description: n.notificationDesc.slice(0, 100),
                action: {
                  label: "Reply",
                  onClick: () =>
                    router.push(`/messages?memberId=${n.authorId}`),
                },
              });
            }
          }
        }
      } catch {}
    };
    socket.addEventListener("message", handler);
    return () => socket.removeEventListener("message", handler);
  }, [socket, router]);

  // Admin pages render with no public shell
  if (router.pathname.startsWith("/admin")) {
    return <Component {...pageProps} />;
  }

  return (
    <div>
      {router.pathname !== "/account" && (
        <Navbar user={user} onLogout={logOut} />
      )}
      <Component {...pageProps} />
      {router.pathname !== "/account" && <Footer />}
      <ScrollToTopProgress
        progressColor="#F25912"
        progressBgColor="#fff"
        className=""
      />
    </div>
  );
};

const App = ({ Component, pageProps }: AppProps) => {
  // @ts-ignore
  const client = useApollo(pageProps.initialApolloState);

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <ApolloProvider client={client}>
        <AppShell Component={Component} pageProps={pageProps} />
        <Toaster position="top-right" richColors />
      </ApolloProvider>
    </ThemeProvider>
  );
};

export default App;
