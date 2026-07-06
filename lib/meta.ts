export async function sendMetaTextMessage(args: {
  pageToken: string;
  recipientId: string;
  text: string;
}) {
  const version = process.env.META_GRAPH_VERSION || "v25.0";
  const url = `https://graph.facebook.com/${version}/me/messages?access_token=${encodeURIComponent(args.pageToken)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: args.recipientId },
      message: { text: args.text }
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || "Meta Send API failed");
  }
  return data;
}
