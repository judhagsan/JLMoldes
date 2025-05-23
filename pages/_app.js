import "../styles/globals.css";
import { WebSocketProvider } from "../contexts/WebSocketContext";

function MyApp({ Component, pageProps }) {
  const webSocketUrl =
    process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080";

  return (
    <WebSocketProvider url={webSocketUrl}>
      <Component {...pageProps} />
    </WebSocketProvider>
  );
}

export default MyApp;
