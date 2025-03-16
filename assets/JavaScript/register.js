document.addEventListener('DOMContentLoaded', function () {
  const SW = "/uv/sw.js";
  const wispUrl = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/w/`;
  const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

  async function registerSW() {
      try {
          if (!navigator.serviceWorker) {
              console.log("[⚠] Service Workers not supported.");
              return;
          }

          await ensureWebSocketConnection(wispUrl);

          console.log("Registering Service Worker...");
          await navigator.serviceWorker.register("/sw.js", { scope: '/service/' });
          console.log("Service Worker registered.");

          switchTransport("epoxy");
          console.log("Transport: epoxy.");

      } catch (error) {
          console.error("SW/WebSocket error:", error);
      }
  }

  async function ensureWebSocketConnection(url) {
      return new Promise((resolve, reject) => {
          console.log("Connecting with WebSocket...");

          const ws = new WebSocket(url);

          ws.onopen = () => {
              console.log("WebSocket connected.");
              resolve(ws);
          };

          ws.onerror = (error) => {
              console.error("WebSocket error:", error.message || "Unknown error");
              reject(new Error("WebSocket connection failed."));
          };

          ws.onclose = (event) => {
              console.warn(`WebSocket closed: ${event.reason || "No reason provided"}`);
          };
      });
  }

  function switchTransport(transport) {
      if (transport === "epoxy") {
          connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
      }
  }

  registerSW();
});
