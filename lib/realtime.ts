import Pusher from "pusher";

export function getPusherServer() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER || "ap2";
  if (!appId || !key || !secret) return null;
  return new Pusher({ appId, key, secret, cluster, useTLS: true });
}

export async function notifyInbox(event: string, data: unknown) {
  const pusher = getPusherServer();
  if (!pusher) return;
  await pusher.trigger("unified-inbox", event, data);
}
