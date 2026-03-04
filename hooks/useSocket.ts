import { useEffect, useRef, useState } from "react";
import { getJwtToken } from "@/lib/auth";
import { socketVar } from "@/apollo/store";

const MAX_RETRIES = 5;

export const useSocket = (): WebSocket | null => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retriesRef = useRef(0);

  useEffect(() => {
    const token = getJwtToken();
    if (!token) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3005";

    const connect = () => {
      const ws = new WebSocket(`${wsUrl}?token=${token}`);
      socketVar(ws);
      setSocket(ws);

      ws.onopen = () => {
        console.log("WebSocket connected");
        retriesRef.current = 0;
      };

      ws.onclose = () => {
        socketVar(null);
        setSocket(null);
        if (retriesRef.current < MAX_RETRIES) {
          retriesRef.current++;
          console.log(
            `WebSocket disconnected. Reconnecting (${retriesRef.current}/${MAX_RETRIES})...`,
          );
          reconnectRef.current = setTimeout(connect, 3000);
        } else {
          console.log(
            "WebSocket: max retries reached. Start the backend and refresh the page.",
          );
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      const current = socketVar();
      if (current) {
        current.close();
        socketVar(null);
      }
    };
  }, []);

  return socket;
};
