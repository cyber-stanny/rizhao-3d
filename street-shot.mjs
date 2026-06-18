import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "/tmp/opencode";
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: "new",
  args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist","--enable-webgl","--no-sandbox","--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1000 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type()==="error" && !m.text().includes("404")) errors.push(m.text()); });
await page.goto("http://localhost:5173/city", { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 6000));

// night view
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button"));
  btns.find((b) => b.textContent?.includes("白天"))?.click();
});
await new Promise((r) => setTimeout(r, 3000));
await page.screenshot({ path: `${OUT}/street-night.png` });

// walk mode at night
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button"));
  btns.find((b) => b.textContent?.includes("漫游"))?.click();
});
await new Promise((r) => setTimeout(r, 3000));
await page.screenshot({ path: `${OUT}/street-walk-night.png` });

// also day walk
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button"));
  btns.find((b) => b.textContent?.includes("退出漫游"))?.click();
});
await new Promise((r) => setTimeout(r, 1000));
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button"));
  btns.find((b) => b.textContent?.includes("夜间"))?.click();
});
await new Promise((r) => setTimeout(r, 2000));
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button"));
  btns.find((b) => b.textContent?.includes("漫游"))?.click();
});
await new Promise((r) => setTimeout(r, 3000));
await page.screenshot({ path: `${OUT}/street-walk-day.png` });

console.log("ERRORS:", errors.length);
errors.forEach((e) => console.log("  -", e));
await browser.close();
