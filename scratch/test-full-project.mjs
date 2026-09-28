import http from "http";

const BASE_URL = "http://localhost:3000";
const ADMIN_COOKIE = "cpc_admin_auth=authenticated";

const results = [];

async function request(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlPath, BASE_URL);
    const req = http.request(
      parsed,
      {
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode || 0, body: data, headers: res.headers }));
      }
    );
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTests() {
  console.log("=================================================");
  console.log("STARTING FULL PROJECT & API INTEGRATION AUDIT");
  console.log("=================================================");

  // 1. PUBLIC ROUTES
  const publicRoutes = [
    { name: "Home Page", path: "/", expected: [200] },
    { name: "Events Page", path: "/events", expected: [200] },
    { name: "Event Slug Redirect (/events/...)", path: "/events/annual-exhibition-2026", expected: [200, 307, 308] },
    { name: "Gallery Page (/gallery)", path: "/gallery", expected: [200, 307, 308] },
    { name: "Gallery Event Page (/gallery/[id])", path: "/gallery/11111111-1111-1111-1111-111111111104", expected: [200] },
    { name: "Gallery Slug Page (/gallery/[slug])", path: "/gallery/annual-exhibition-2026", expected: [200] },
    { name: "Portfolio Page", path: "/portfolio", expected: [200] },
    { name: "Archive Page", path: "/archive", expected: [200] },
    { name: "Coverage Request Page", path: "/coverage", expected: [200] },
    { name: "Submit Buzz Page", path: "/submit-buzz", expected: [200] },
    { name: "Timeline Page", path: "/timeline", expected: [200] },
    { name: "Public Faces Index", path: "/faces", expected: [200] },
    { name: "Admin Login Page", path: "/admin-login", expected: [200] },
    { name: "Robots.txt", path: "/robots.txt", expected: [200] },
    { name: "Sitemap.xml", path: "/sitemap.xml", expected: [200] },
  ];

  for (const r of publicRoutes) {
    const res = await request(r.path);
    const passed = r.expected.includes(res.status);
    results.push({ name: r.name, url: r.path, status: res.status, expectedStatus: r.expected, passed });
    console.log(`[${passed ? "PASS" : "FAIL"}] ${r.name} -> HTTP ${res.status}`);
  }

  // 2. ADMIN AUTHENTICATED ROUTES
  const adminRoutes = [
    { name: "Admin Dashboard", path: "/admin", expected: [200] },
    { name: "Admin Drive Sync", path: "/admin/drive", expected: [200] },
    { name: "Admin Events Management", path: "/admin/events", expected: [200] },
    { name: "Admin Team Management", path: "/admin/team", expected: [200] },
    { name: "Admin Analytics", path: "/admin/analytics", expected: [200] },
    { name: "Admin AI Faces", path: "/admin/faces", expected: [200] },
    { name: "Admin Settings", path: "/admin/settings", expected: [200] },
  ];

  for (const r of adminRoutes) {
    const res = await request(r.path, { headers: { Cookie: ADMIN_COOKIE } });
    const passed = r.expected.includes(res.status);
    results.push({ name: r.name, url: r.path, status: res.status, expectedStatus: r.expected, passed });
    console.log(`[${passed ? "PASS" : "FAIL"}] ${r.name} -> HTTP ${res.status}`);
  }

  // 3. DRIVE API & MEDIA SERVICES
  console.log("\n--- Testing Drive API & Endpoints ---");

  // Validate Folder
  const valRes = await request("/api/drive/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ folderId: "1LifGmo919TvSkZR5vcEKcyX84SPqVoXs" }),
  });
  const valPassed = valRes.status === 200 && valRes.body.includes('"valid":true');
  results.push({
    name: "API: Validate Drive Folder",
    url: "/api/drive/validate",
    status: valRes.status,
    expectedStatus: [200],
    passed: valPassed,
    notes: valRes.body.substring(0, 100),
  });
  console.log(`[${valPassed ? "PASS" : "FAIL"}] API: Validate Drive Folder -> HTTP ${valRes.status} (${valRes.body.trim()})`);

  // Sync Event Photos
  const syncRes = await request("/api/drive/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ eventId: "11111111-1111-1111-1111-111111111104" }),
  });
  const syncPassed = syncRes.status === 200 && syncRes.body.includes('"added"');
  results.push({
    name: "API: Sync Single Event Photos",
    url: "/api/drive/sync",
    status: syncRes.status,
    expectedStatus: [200],
    passed: syncPassed,
    notes: syncRes.body.substring(0, 100),
  });
  console.log(`[${syncPassed ? "PASS" : "FAIL"}] API: Sync Single Event -> HTTP ${syncRes.status} (${syncRes.body.trim()})`);

  // Global Sync All
  const syncAllRes = await request("/api/drive/sync-all", {
    method: "POST",
    headers: { Cookie: ADMIN_COOKIE },
  });
  const syncAllPassed = syncAllRes.status === 200 && syncAllRes.body.includes('"eventsSynced"');
  results.push({
    name: "API: Sync All Events",
    url: "/api/drive/sync-all",
    status: syncAllRes.status,
    expectedStatus: [200],
    passed: syncAllPassed,
    notes: syncAllRes.body.substring(0, 100),
  });
  console.log(`[${syncAllPassed ? "PASS" : "FAIL"}] API: Sync All Events -> HTTP ${syncAllRes.status} (${syncAllRes.body.trim()})`);

  // Fix Covers
  const fixRes = await request("/api/drive/fix-covers", {
    method: "POST",
    headers: { Cookie: ADMIN_COOKIE },
  });
  const fixPassed = fixRes.status === 200 && fixRes.body.includes('"ok":true');
  results.push({
    name: "API: Fix Covers",
    url: "/api/drive/fix-covers",
    status: fixRes.status,
    expectedStatus: [200],
    passed: fixPassed,
  });
  console.log(`[${fixPassed ? "PASS" : "FAIL"}] API: Fix Covers -> HTTP ${fixRes.status}`);

  // Photo Download Endpoint
  const dlRes = await request("/api/photos/1LifGmo919TvSkZR5vcEKcyX84SPqVoXs/download");
  const dlPassed = dlRes.status === 200 && dlRes.headers["content-disposition"]?.includes("attachment");
  results.push({
    name: "API: Photo Download Streaming",
    url: "/api/photos/1LifGmo919TvSkZR5vcEKcyX84SPqVoXs/download",
    status: dlRes.status,
    expectedStatus: [200],
    passed: dlPassed,
    notes: `Content-Disposition: ${dlRes.headers["content-disposition"]}`,
  });
  console.log(`[${dlPassed ? "PASS" : "FAIL"}] API: Photo Download -> HTTP ${dlRes.status} (Disposition: ${dlRes.headers["content-disposition"]})`);

  // Photo Proxy Endpoint
  const photoProxyRes = await request("/api/drive/photo/1LifGmo919TvSkZR5vcEKcyX84SPqVoXs");
  const proxyPassed = [200, 307].includes(photoProxyRes.status);
  results.push({
    name: "API: Photo Image Delivery Proxy",
    url: "/api/drive/photo/1LifGmo919TvSkZR5vcEKcyX84SPqVoXs",
    status: photoProxyRes.status,
    expectedStatus: [200, 307],
    passed: proxyPassed,
  });
  console.log(`[${proxyPassed ? "PASS" : "FAIL"}] API: Photo Delivery Proxy -> HTTP ${photoProxyRes.status}`);

  // Search API
  const searchRes = await request("/api/search?q=Fest");
  const searchPassed = searchRes.status === 200 && searchRes.body.includes('"events"');
  results.push({
    name: "API: Global Search",
    url: "/api/search?q=Fest",
    status: searchRes.status,
    expectedStatus: [200],
    passed: searchPassed,
  });
  console.log(`[${searchPassed ? "PASS" : "FAIL"}] API: Global Search -> HTTP ${searchRes.status}`);

  console.log("\n=================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  console.log(`AUDIT COMPLETE: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log("=================================================");
}

runTests().catch(console.error);
