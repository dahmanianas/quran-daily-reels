import { readFile, writeFile } from "node:fs/promises";

const required = ["IG_USER_ID", "IG_ACCESS_TOKEN", "VIDEO_BASE_URL"];
for (const key of required) if (!process.env[key]) throw new Error(`Missing ${key}`);
const state = JSON.parse(await readFile("state.json", "utf8"));
if (state.nextPage > 602) { console.log("All 602 pages are already published."); process.exit(0); }
const page = state.nextPage;
const file = `page_${String(page).padStart(3, "0")}.mp4`;
const caption = "حافظ على وردك اليومي، فالقلب يحيا بذكر الله ❤️";
const api = "https://graph.instagram.com/v27.0";
const token = process.env.IG_ACCESS_TOKEN;

async function graph(path, params = {}) {
  const response = await fetch(`${api}/${path}?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    body: new URLSearchParams(params),
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error?.message || `Instagram HTTP ${response.status}`);
  return data;
}
const videoUrl = `${process.env.VIDEO_BASE_URL.replace(/\/$/, "")}/videos/${file}`;
console.log(`Creating Reel container for page ${page}: ${videoUrl}`);
const container = await graph(`${process.env.IG_USER_ID}/media`, {
  media_type: "REELS", video_url: videoUrl, caption, share_to_feed: "true",
});

let ready = false;
for (let attempt = 0; attempt < 45; attempt++) {
  await new Promise(resolve => setTimeout(resolve, 12000));
  const response = await fetch(`${api}/${container.id}?fields=status_code,status&access_token=${encodeURIComponent(token)}`);
  const status = await response.json();
  if (!response.ok || status.error) throw new Error(status.error?.message || "Could not check Reel processing state");
  console.log(`Meta processing status: ${status.status_code || status.status}`);
  if (status.status_code === "FINISHED") { ready = true; break; }
  if (["ERROR", "EXPIRED"].includes(status.status_code)) throw new Error(`Instagram processing ${status.status_code}`);
}
if (!ready) throw new Error("Instagram video processing exceeded the 9-minute safe polling window; no page number was advanced.");
const published = await graph(`${process.env.IG_USER_ID}/media_publish`, { creation_id: container.id });
state.published = [...(state.published || []), { page, mediaId: published.id, publishedAt: new Date().toISOString(), caption }];
state.nextPage = page + 1;
await writeFile("state.json", `${JSON.stringify(state, null, 2)}\n`);
console.log(`Published page ${page} as Instagram media ${published.id}`);
