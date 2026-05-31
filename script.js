const stocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 178.4,
    vol: 12456789,
    high: 0,
    low: 99999,
    history: [],
    open: 0,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 245.8,
    vol: 8765432,
    high: 0,
    low: 99999,
    history: [],
    open: 0,
  },
  {
    symbol: "GOOG",
    name: "Alphabet Inc.",
    price: 141.2,
    vol: 5678234,
    high: 0,
    low: 99999,
    history: [],
    open: 0,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com",
    price: 185.6,
    vol: 9234567,
    high: 0,
    low: 99999,
    history: [],
    open: 0,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 378.9,
    vol: 7890123,
    high: 0,
    low: 99999,
    history: [],
    open: 0,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 824.3,
    vol: 15234567,
    high: 0,
    low: 99999,
    history: [],
    open: 0,
  },
  {
    symbol: "META",
    name: "Meta Platforms",
    price: 512.6,
    vol: 6345678,
    high: 0,
    low: 99999,
    history: [],
    open: 0,
  },
  {
    symbol: "NFLX",
    name: "Netflix Inc.",
    price: 612.4,
    vol: 3456789,
    high: 0,
    low: 99999,
    history: [],
    open: 0,
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase",
    price: 198.5,
    vol: 4567890,
    high: 0,
    low: 99999,
    history: [],
    open: 0,
  },
  {
    symbol: "BAC",
    name: "Bank of America",
    price: 39.8,
    vol: 11234567,
    high: 0,
    low: 99999,
    history: [],
    open: 0,
  },
  {
    symbol: "DIS",
    name: "Disney",
    price: 112.3,
    vol: 5678901,
    high: 0,
    low: 99999,
    history: [],
    open: 0,
  },
  {
    symbol: "KO",
    name: "Coca-Cola Co.",
    price: 68.2,
    vol: 4567890,
    high: 0,
    low: 99999,
    history: [],
    open: 0,
  },
];

const indices = [
  { id: "sp", name: "S&P 500", val: 5342.8 },
  { id: "dow", name: "DOW", val: 38890.4 },
  { id: "nas", name: "NASDAQ", val: 17280.6 },
  { id: "rus", name: "RUSSELL", val: 2045.3 },
  { id: "vix", name: "VIX", val: 12.8 },
];

const newsItems = [
  "Fed holds interest rates steady at 5.50%",
  "AAPL reports record Q3 revenue of $85B",
  "TSLA unveils new self-driving software update",
  "NVDA market cap surpasses $2 trillion",
  "Oil prices drop 3% amid supply concerns",
  "META launches new AI platform",
  "S&P 500 hits all-time high",
  "Bitcoin rebounds above $65,000",
  "JPM raises dividend by 10%",
  "KO announces new product line",
  "BAC expands into new markets",
];

let currentUser = null;
let currentUserEmail = null;
let currentMainIdx = 0;
let intervals = [];
let orderHistory = [];
let watchlist = [];
let alerts = [];
let portfolio = {};

const LS_ORDERS = "stock_orders";
const LS_WATCH = "stock_watch";
const LS_ALERTS = "stock_alerts";
const LS_PORT = "stock_portfolio";
const LS_USERS = "users";

function loadState() {
  try {
    orderHistory = JSON.parse(localStorage.getItem(LS_ORDERS)) || [];
    watchlist = JSON.parse(localStorage.getItem(LS_WATCH)) || [];
    alerts = JSON.parse(localStorage.getItem(LS_ALERTS)) || [];
    portfolio = JSON.parse(localStorage.getItem(LS_PORT)) || {};
  } catch (e) {}
}
function saveOrders() {
  localStorage.setItem(LS_ORDERS, JSON.stringify(orderHistory));
}
function saveWatch() {
  localStorage.setItem(LS_WATCH, JSON.stringify(watchlist));
}
function saveAlerts() {
  localStorage.setItem(LS_ALERTS, JSON.stringify(alerts));
}
function savePortfolio() {
  localStorage.setItem(LS_PORT, JSON.stringify(portfolio));
}

function getAvatarUrl(seed, style) {
  if (!style) style = "avataaars";
  return (
    "https://api.dicebear.com/7.x/" +
    style +
    "/svg?seed=" +
    encodeURIComponent(seed)
  );
}

function updateAvatarDisplay() {
  if (!currentUserEmail) return;
  let users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
  const u = users.find((x) => x.email === currentUserEmail);
  if (!u) return;
  const seed = u.avatarSeed || u.email;
  const style = u.avatarStyle || "avataaars";
  const url = getAvatarUrl(seed, style);

  const topImg = document.querySelector("#topAvatar img");
  if (topImg) topImg.src = url;

  const profImg = document.querySelector("#profileAvatar img");
  if (profImg) profImg.src = url;

  const seedEl = document.getElementById("avatarSeed");
  if (seedEl) seedEl.textContent = "seed: " + seed;

  const styleSel = document.getElementById("avatarStyle");
  if (styleSel) {
    for (const opt of styleSel.options) {
      if (opt.value === style) {
        opt.selected = true;
        break;
      }
    }
  }
}

function regenerateAvatar() {
  if (!currentUserEmail) return;
  let users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
  const idx = users.findIndex((x) => x.email === currentUserEmail);
  if (idx < 0) return;
  const newSeed =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  users[idx].avatarSeed = newSeed;
  users[idx].avatarStyle = document.getElementById("avatarStyle").value;
  localStorage.setItem(LS_USERS, JSON.stringify(users));
  updateAvatarDisplay();
  const msg = document.getElementById("profileMsg");
  if (msg) msg.textContent = "Avatar updated!";
}

function changeAvatarStyle() {
  if (!currentUserEmail) return;
  let users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
  const idx = users.findIndex((x) => x.email === currentUserEmail);
  if (idx < 0) return;
  users[idx].avatarStyle = document.getElementById("avatarStyle").value;
  localStorage.setItem(LS_USERS, JSON.stringify(users));
  updateAvatarDisplay();
}

function initHistory() {
  for (const s of stocks) {
    s.history = [];
    let p = s.price;
    for (let i = 0; i < 80; i++) {
      p += (Math.random() - 0.5) * 5;
      p = Math.max(p, 5);
      s.history.push(p);
    }
    s.price = p;
    s.high = Math.max(...s.history);
    s.low = Math.min(...s.history);
    s.open = s.history[0] || s.price;
  }
}

function updatePrices() {
  for (const s of stocks) {
    const ch = (Math.random() - 0.5) * 6;
    s.price += ch;
    s.price = Math.max(s.price, 5);
    s.vol += Math.floor((Math.random() - 0.5) * 500000);
    s.vol = Math.max(s.vol, 100000);
    s.history.push(s.price);
    if (s.history.length > 80) s.history.shift();
    s.high = Math.max(...s.history);
    s.low = Math.min(...s.history);
  }
  for (const idx of indices) idx.val += (Math.random() - 0.5) * 20;
  checkAlerts();
}

function fmt(p) {
  return "$" + p.toFixed(2);
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

function switchPage(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".sidebar .nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");
  const nav = document.querySelector(
    '.sidebar .nav-item[data-page="' + page + '"]',
  );
  if (nav) nav.classList.add("active");

  if (window.innerWidth <= 768)
    document.getElementById("sidebar").classList.remove("open");

  if (page === "markets") renderMarketsPage();
  else if (page === "portfolio") renderPortfolioPage();
  else if (page === "watchlist") renderWatchlist();
  else if (page === "history") renderHistory();
  else if (page === "alerts") renderAlerts();
  else if (page === "profile") {
    updateAvatarDisplay();
    loadProfileForm();
  } else if (page === "buy") {
    updateOrderPrice();
  }
}

function searchGlobal(val, forceSwitch) {
  const u = val.toUpperCase().trim();
  const dashboardPage = document.getElementById("page-dashboard");
  const tableSection = dashboardPage.querySelector(".stock-table");
  const tableWrap = tableSection
    ? tableSection.closest("div") || tableSection.parentElement
    : null;

  // If not on dashboard and has query, switch to dashboard
  if (
    u &&
    forceSwitch &&
    !document.getElementById("page-dashboard").classList.contains("active")
  ) {
    switchPage("dashboard");
  }

  // Show/hide main chart area based on search
  const chartWrap = document.querySelector(".main-chart-wrap");
  const indices = document.querySelector(".indices");

  if (u) {
    let found = false;
    for (const s of stocks) {
      if (s.symbol.includes(u)) {
        currentMainIdx = stocks.indexOf(s);
        drawMainChart();
        found = true;
        break;
      }
    }
    if (!found && u) {
      currentMainIdx = 0;
      drawMainChart();
    }
  } else {
    currentMainIdx = 0;
    drawMainChart();
  }

  // Filter table rows
  const rows = document.querySelectorAll("#stockTableBody tr");
  rows.forEach((row) => {
    const sym = row.querySelector(".sym");
    if (sym) {
      row.style.display = !u || sym.textContent.includes(u) ? "" : "none";
    }
  });
}

function renderIndices() {
  for (const idx of indices) {
    const prev = idx.val - (Math.random() - 0.5) * 10;
    const chg = idx.val - prev;
    const cls = chg >= 0 ? "up" : "dn";
    document.getElementById("idx-" + idx.id).textContent = fmt(idx.val);
    document.getElementById("idx-" + idx.id + "-chg").textContent =
      (chg >= 0 ? "+" : "") + chg.toFixed(2);
    document.getElementById("idx-" + idx.id + "-chg").className =
      "idx-chg " + cls;
  }
}

function drawMainChart() {
  const s = stocks[currentMainIdx];
  const canvas = document.getElementById("mainChart");
  const wrap = canvas.parentElement;
  const rect = wrap.getBoundingClientRect();
  canvas.width = Math.max(rect.width - 24, 200);
  canvas.height = 180;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const data = s.history;
  if (data.length < 2) return;
  const w = canvas.width,
    h = canvas.height;
  const mn = Math.min(...data),
    mx = Math.max(...data);
  const rng = mx - mn || 1;
  const pad = 8;

  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 4; i++) {
    const y = pad + (i / 3) * (h - pad * 2);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const len = data.length;
  ctx.beginPath();
  for (let i = 0; i < len; i++) {
    const x = (i / (len - 1)) * (w - pad * 2) + pad;
    const y = h - pad - ((data[i] - mn) / rng) * (h - pad * 2);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.lineTo(w - pad, h - pad);
  ctx.lineTo(pad, h - pad);
  ctx.closePath();
  ctx.fillStyle = "#ece6d8";
  ctx.fill();

  ctx.beginPath();
  for (let i = 0; i < len; i++) {
    const x = (i / (len - 1)) * (w - pad * 2) + pad;
    const y = h - pad - ((data[i] - mn) / rng) * (h - pad * 2);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 2;
  ctx.stroke();

  const prev = data[len - 2] || data[0];
  const up = data[len - 1] >= prev;
  document.getElementById("mcSymbol").textContent = s.symbol;
  document.getElementById("mcPrice").textContent = fmt(s.price);
  document.getElementById("mcPrice").className =
    "mc-price " + (up ? "up" : "dn");
}

function switchMainStock(dir) {
  currentMainIdx = (currentMainIdx + dir + stocks.length) % stocks.length;
  drawMainChart();
}

function renderTable() {
  const tbody = document.getElementById("stockTableBody");
  let html = "";
  for (const s of stocks) {
    const len = s.history.length;
    const prev = len >= 2 ? s.history[len - 2] : s.price;
    const chg = s.price - prev;
    const chgP = prev !== 0 ? (chg / prev) * 100 : 0;
    const cls = chg >= 0 ? "up" : "dn";
    html +=
      "<tr>" +
      '<td class="sym ' +
      cls +
      '" onclick="selectStock(\'' +
      s.symbol +
      "')\">" +
      s.symbol +
      "</td>" +
      '<td class="' +
      cls +
      '">' +
      fmt(s.price) +
      "</td>" +
      '<td class="' +
      cls +
      '">' +
      (chg >= 0 ? "+" : "") +
      chg.toFixed(2) +
      "</td>" +
      '<td class="' +
      cls +
      '">' +
      (chgP >= 0 ? "+" : "") +
      chgP.toFixed(2) +
      "%</td>" +
      "<td>" +
      s.vol.toLocaleString() +
      "</td>" +
      "<td>" +
      fmt(s.high) +
      "</td>" +
      "<td>" +
      fmt(s.low) +
      "</td>" +
      '<td><canvas id="tbl-' +
      s.symbol +
      '" width="60" height="22"></canvas></td>' +
      "</tr>";
  }
  tbody.innerHTML = html;
  for (const s of stocks) drawSparkline(s.symbol);
}

function drawSparkline(sym) {
  const s = stocks.find((x) => x.symbol === sym);
  if (!s) return;
  const canvas = document.getElementById("tbl-" + sym);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 60, 22);
  const data = s.history.slice(-20);
  if (data.length < 2) return;
  const mn = Math.min(...data),
    mx = Math.max(...data),
    rng = mx - mn || 1;
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i < data.length; i++) {
    const x = (i / (data.length - 1)) * 56 + 2;
    const y = 19 - ((data[i] - mn) / rng) * 16;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function selectStock(sym) {
  const idx = stocks.findIndex((s) => s.symbol === sym);
  if (idx >= 0) {
    currentMainIdx = idx;
    switchPage("dashboard");
    drawMainChart();
  }
}

function quickOrder(type) {
  const sym = document.getElementById("dashOrderSymbol").value;
  const qty = parseInt(document.getElementById("dashOrderQty").value) || 1;
  const s = stocks.find((x) => x.symbol === sym);
  if (!s) return;
  const total = s.price * qty;
  const msg = document.getElementById("dashOrderMsg");
  msg.textContent =
    type + " " + qty + " " + sym + " @ " + fmt(s.price) + " = " + fmt(total);
  msg.style.color = type === "BUY" ? "#222" : "#991b1b";
  addOrder(sym, type, qty, s.price);
  updatePortfolio(sym, qty, type);
}

function updatePortfolio(sym, qty, type) {
  if (!portfolio[sym]) portfolio[sym] = { qty: 0, totalCost: 0 };
  const s = stocks.find((x) => x.symbol === sym);
  if (!s) return;
  if (type === "BUY") {
    portfolio[sym].qty += qty;
    portfolio[sym].totalCost += s.price * qty;
  } else {
    const avg =
      portfolio[sym].qty > 0
        ? portfolio[sym].totalCost / portfolio[sym].qty
        : 0;
    portfolio[sym].qty -= qty;
    portfolio[sym].totalCost -= avg * qty;
    if (portfolio[sym].qty <= 0) delete portfolio[sym];
  }
  savePortfolio();
  renderPortfolioPanel();
}

function renderPortfolioPanel() {
  const body = document.getElementById("portfolioBody");
  let html = "";
  let total = 0;
  if (Object.keys(portfolio).length === 0) {
    for (const sym of ["AAPL", "TSLA", "GOOG", "AMZN", "MSFT", "NVDA"]) {
      if (!portfolio[sym])
        portfolio[sym] = {
          qty: Math.floor(Math.random() * 15) + 5,
          totalCost: 0,
        };
    }
    for (const sym in portfolio) {
      const s = stocks.find((x) => x.symbol === sym);
      if (s) portfolio[sym].totalCost = portfolio[sym].qty * (s.price * 0.92);
    }
    savePortfolio();
  }
  for (const sym in portfolio) {
    const s = stocks.find((x) => x.symbol === sym);
    if (!s) continue;
    const val = s.price * portfolio[sym].qty;
    total += val;
    html +=
      '<div class="port-row"><span class="port-sym">' +
      sym +
      "</span><span>" +
      portfolio[sym].qty +
      "x</span><span>" +
      fmt(val) +
      "</span></div>";
  }
  body.innerHTML = html;
  document.getElementById("portfolioTotal").textContent = fmt(total);
}

function addOrder(sym, type, qty, price) {
  orderHistory.unshift({
    time: new Date().toLocaleTimeString(),
    sym,
    type,
    qty,
    price,
    total: price * qty,
  });
  if (orderHistory.length > 50) orderHistory.pop();
  saveOrders();
}

function updateTicker() {
  const el = document.getElementById("newsTickerText");
  el.textContent =
    " // " + newsItems.map((n) => "◆ " + n).join(" // ") + " // ";
}

function renderMarketsPage() {
  const grid = document.getElementById("marketGrid");
  let html = "";
  for (const s of stocks) {
    const len = s.history.length;
    const prev = len >= 2 ? s.history[len - 2] : s.price;
    const chg = s.price - prev;
    const chgP = prev !== 0 ? (chg / prev) * 100 : 0;
    const cls = chg >= 0 ? "up" : "dn";
    html +=
      '<div class="market-card">' +
      '<div class="m-sym ' +
      cls +
      '">' +
      s.symbol +
      "</div>" +
      '<div class="m-name">' +
      s.name +
      "</div>" +
      '<div class="m-price ' +
      cls +
      '">' +
      fmt(s.price) +
      "</div>" +
      '<div class="m-detail">' +
      (chg >= 0 ? "+" : "") +
      chg.toFixed(2) +
      " (" +
      (chgP >= 0 ? "+" : "") +
      chgP.toFixed(2) +
      "%) | Vol: " +
      (s.vol / 1e6).toFixed(1) +
      "M</div>" +
      '<canvas id="mkt-' +
      s.symbol +
      '" width="400" height="50"></canvas>' +
      "</div>";
  }
  grid.innerHTML = html;
  for (const s of stocks) {
    const canvas = document.getElementById("mkt-" + s.symbol);
    if (!canvas) continue;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 400, 50);
    const data = s.history.slice(-30);
    if (data.length < 2) continue;
    const mn = Math.min(...data),
      mx = Math.max(...data),
      rng = mx - mn || 1;
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * 390 + 5;
      const y = 45 - ((data[i] - mn) / rng) * 36;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function renderPortfolioPage() {
  let totalVal = 0,
    best = { sym: "—", chg: -Infinity },
    worst = { sym: "—", chg: Infinity };
  let html = "";
  for (const sym in portfolio) {
    const s = stocks.find((x) => x.symbol === sym);
    if (!s) continue;
    const val = s.price * portfolio[sym].qty;
    totalVal += val;
    const avg =
      portfolio[sym].qty > 0
        ? portfolio[sym].totalCost / portfolio[sym].qty
        : s.price;
    const pl = s.price - avg;
    const ret = avg !== 0 ? (pl / avg) * 100 : 0;
    const cls = pl >= 0 ? "up" : "dn";
    if (pl > best.chg) best = { sym, chg: pl };
    if (pl < worst.chg) worst = { sym, chg: pl };
    html +=
      "<tr>" +
      '<td class="' +
      cls +
      '">' +
      sym +
      "</td><td>" +
      portfolio[sym].qty +
      "</td>" +
      "<td>" +
      fmt(avg) +
      '</td><td class="' +
      cls +
      '">' +
      fmt(s.price) +
      "</td>" +
      "<td>" +
      fmt(val) +
      '</td><td class="' +
      cls +
      '">' +
      (pl >= 0 ? "+" : "") +
      pl.toFixed(2) +
      "</td>" +
      '<td class="' +
      cls +
      '">' +
      (ret >= 0 ? "+" : "") +
      ret.toFixed(2) +
      "%</td></tr>";
  }
  document.getElementById("portHoldingsBody").innerHTML =
    html ||
    '<tr><td colspan="7" style="text-align:center;padding:16px;color:#888;">No holdings</td></tr>';
  document.getElementById("ps-total").textContent = fmt(totalVal);
  document.getElementById("ps-count").textContent =
    Object.keys(portfolio).length;
  document.getElementById("ps-best").textContent =
    best.sym + " (" + (best.chg >= 0 ? "+" : "") + best.chg.toFixed(2) + ")";
  document.getElementById("ps-worst").textContent =
    worst.sym + " (" + (worst.chg >= 0 ? "+" : "") + worst.chg.toFixed(2) + ")";
}

function addToWatchlist() {
  const sel = document.getElementById("wlAddSelect");
  if (watchlist.includes(sel.value)) return;
  watchlist.push(sel.value);
  saveWatch();
  renderWatchlist();
}
function removeFromWatch(sym) {
  watchlist = watchlist.filter((x) => x !== sym);
  saveWatch();
  renderWatchlist();
}
function renderWatchlist() {
  const grid = document.getElementById("watchlistGrid");
  if (watchlist.length === 0) {
    grid.innerHTML = '<div class="wl-empty">Watchlist is empty</div>';
    return;
  }
  let html = "";
  for (const sym of watchlist) {
    const s = stocks.find((x) => x.symbol === sym);
    if (!s) continue;
    const prev =
      s.history.length >= 2 ? s.history[s.history.length - 2] : s.price;
    const chg = s.price - prev;
    const cls = chg >= 0 ? "up" : "dn";
    html +=
      '<div class="wl-card"><div class="wl-info"><div class="wl-sym ' +
      cls +
      '">' +
      sym +
      '</div><div class="wl-name">' +
      s.name +
      "</div></div>" +
      '<div class="wl-price ' +
      cls +
      '">' +
      fmt(s.price) +
      ' <span style="font-size:10px;">(' +
      (chg >= 0 ? "+" : "") +
      chg.toFixed(2) +
      ")</span></div>" +
      '<button class="wl-remove" onclick="removeFromWatch(\'' +
      sym +
      "')\">✕</button></div>";
  }
  grid.innerHTML = html;
}

function updateOrderPrice() {
  const sym = document.getElementById("orderSymbol").value;
  const s = stocks.find((x) => x.symbol === sym);
  if (s) document.getElementById("orderPrice").value = fmt(s.price);
}

function placeOrderFull(type) {
  const sym = document.getElementById("orderSymbol").value;
  const qty = parseInt(document.getElementById("orderQty").value) || 1;
  const s = stocks.find((x) => x.symbol === sym);
  if (!s) return;
  addOrder(sym, type, qty, s.price);
  updatePortfolio(sym, qty, type);
  const msg = document.getElementById("orderPageMsg");
  msg.textContent = type + " " + qty + " " + sym + " @ " + fmt(s.price);
  msg.style.color = type === "BUY" ? "#222" : "#991b1b";
}

function renderHistory() {
  const body = document.getElementById("historyBody");
  if (orderHistory.length === 0) {
    for (let i = 0; i < 8; i++) {
      const s = stocks[i % stocks.length];
      const type = i % 2 === 0 ? "BUY" : "SELL";
      const qty = Math.floor(Math.random() * 50) + 5;
      orderHistory.push({
        time: new Date(Date.now() - i * 3600000).toLocaleTimeString(),
        sym: s.symbol,
        type,
        qty,
        price: s.price,
        total: s.price * qty,
      });
    }
    saveOrders();
  }
  let html = "";
  for (const o of orderHistory) {
    html +=
      "<tr><td>" +
      o.time +
      '</td><td class="' +
      (o.type === "BUY" ? "up" : "dn") +
      '">' +
      o.sym +
      "</td>" +
      '<td class="type-' +
      o.type.toLowerCase() +
      '">' +
      o.type +
      "</td><td>" +
      o.qty +
      "</td>" +
      "<td>" +
      fmt(o.price) +
      "</td><td>" +
      fmt(o.total) +
      "</td></tr>";
  }
  body.innerHTML = html;
}

function addAlert() {
  const sym = document.getElementById("alertSymbol").value;
  const cond = document.getElementById("alertCondition").value;
  const price = parseFloat(document.getElementById("alertPrice").value);
  if (!price) return;
  alerts.push({ sym, cond, price, triggered: false });
  saveAlerts();
  renderAlerts();
}
function removeAlert(idx) {
  alerts.splice(idx, 1);
  saveAlerts();
  renderAlerts();
}
function checkAlerts() {
  for (let i = 0; i < alerts.length; i++) {
    if (alerts[i].triggered) continue;
    const s = stocks.find((x) => x.symbol === alerts[i].sym);
    if (!s) continue;
    if (alerts[i].cond === "above" && s.price >= alerts[i].price) {
      alerts[i].triggered = true;
      saveAlerts();
      setTimeout(() => {
        const m = document.getElementById("dashOrderMsg");
        if (m) {
          m.textContent =
            "🔔 " + alerts[i].sym + " above " + fmt(alerts[i].price);
          m.style.color = "#991b1b";
        }
      }, 0);
    } else if (alerts[i].cond === "below" && s.price <= alerts[i].price) {
      alerts[i].triggered = true;
      saveAlerts();
      setTimeout(() => {
        const m = document.getElementById("dashOrderMsg");
        if (m) {
          m.textContent =
            "🔔 " + alerts[i].sym + " below " + fmt(alerts[i].price);
          m.style.color = "#991b1b";
        }
      }, 0);
    }
  }
}
function renderAlerts() {
  const list = document.getElementById("alertsList");
  if (alerts.length === 0) {
    list.innerHTML = '<div class="alerts-empty">No alerts set</div>';
    return;
  }
  let html = "";
  for (let i = 0; i < alerts.length; i++) {
    const a = alerts[i];
    html +=
      '<div class="alert-item"><span><strong>' +
      a.sym +
      "</strong> " +
      (a.cond === "above" ? "⬆ ABOVE" : "⬇ BELOW") +
      " " +
      fmt(a.price) +
      (a.triggered ? ' <span style="color:#991b1b;">(TRIGGERED)</span>' : "") +
      '</span><button class="alert-del" onclick="removeAlert(' +
      i +
      ')">✕</button></div>';
  }
  list.innerHTML = html;
}

function loadProfileForm() {
  if (!currentUserEmail) return;
  let users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
  const u = users.find((x) => x.email === currentUserEmail);
  if (!u) return;
  document.getElementById("profileName").value = u.name || "";
  document.getElementById("profileEmail").value = u.email || "";
  document.getElementById("profilePassword").value = "";
  document.getElementById("profileMsg").textContent = "";
  const sel = document.getElementById("avatarStyle");
  for (const opt of sel.options) {
    if (opt.value === (u.avatarStyle || "avataaars")) {
      opt.selected = true;
      break;
    }
  }
}

function saveProfile() {
  if (!currentUserEmail) return;
  let users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
  const idx = users.findIndex((x) => x.email === currentUserEmail);
  if (idx < 0) return;
  const newName = document.getElementById("profileName").value.trim();
  const newPass = document.getElementById("profilePassword").value.trim();
  if (!newName) {
    document.getElementById("profileMsg").textContent = "Name cannot be empty!";
    return;
  }
  users[idx].name = newName;
  if (newPass.length >= 6) users[idx].password = newPass;
  else if (newPass.length > 0 && newPass.length < 6) {
    document.getElementById("profileMsg").textContent = "Password min 6 chars!";
    return;
  }
  users[idx].avatarStyle = document.getElementById("avatarStyle").value;

  localStorage.setItem(LS_USERS, JSON.stringify(users));
  document.getElementById("profileMsg").textContent = "Profile saved!";
  document.getElementById("profileMsg").style.color = "#222";
  document.getElementById("dashUserName").textContent = newName.toUpperCase();
  updateAvatarDisplay();
}

function startDashboard(name, email) {
  currentUser = name;
  currentUserEmail = email;
  document.getElementById("dashUserName").textContent = name.toUpperCase();
  document.getElementById("authBox").style.display = "none";
  document.getElementById("dboard").classList.add("active");

  loadState();
  initHistory();
  updateAvatarDisplay();
  renderIndices();
  drawMainChart();
  renderTable();
  renderPortfolioPanel();
  updateTicker();
  renderWatchlist();
  renderAlerts();
  updateOrderPrice();

  intervals.push(
    setInterval(() => {
      updatePrices();
      renderIndices();
      drawMainChart();
      renderTable();
      renderPortfolioPanel();
      const active = document.querySelector(".page.active");
      if (active) {
        const id = active.id;
        if (id === "page-markets") renderMarketsPage();
        else if (id === "page-portfolio") renderPortfolioPage();
        else if (id === "page-watchlist") renderWatchlist();
        else if (id === "page-alerts") renderAlerts();
      }
    }, 1200),
  );

  intervals.push(setInterval(updateTicker, 4000));
}

function stopIntervals() {
  for (const i of intervals) clearInterval(i);
  intervals = [];
}

function showMsg(text, type) {
  const el = document.getElementById("authMsg");
  el.textContent = text;
  el.className = "message " + type;
  setTimeout(() => {
    el.className = "message";
  }, 3000);
}

function toggleForm() {
  document.getElementById("loginForm").classList.toggle("hidden");
  document.getElementById("registerForm").classList.toggle("hidden");
  document.getElementById("authMsg").className = "message";
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  let users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
  if (users.find((u) => u.email === email)) {
    showMsg("Email already registered!", "error");
    return;
  }
  users.push({
    name,
    email,
    password,
    avatarSeed: email.split("@")[0] + Math.random().toString(36).slice(2, 6),
    avatarStyle: "avataaars",
  });
  localStorage.setItem(LS_USERS, JSON.stringify(users));
  showMsg("Account created!", "success");
  e.target.reset();
  setTimeout(() => {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("authMsg").className = "message";
  }, 1000);
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const remember = document.getElementById("rememberMe").checked;
  if (remember) {
    localStorage.setItem("stock_remembered_email", email);
  } else {
    localStorage.removeItem("stock_remembered_email");
  }
  let users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    showMsg("Welcome, " + user.name + "!", "success");
    e.target.reset();
    setTimeout(() => startDashboard(user.name, user.email), 500);
  } else {
    showMsg("Invalid email or password!", "error");
  }
}

function loadRememberedEmail() {
  const saved = localStorage.getItem("stock_remembered_email");
  if (saved) {
    document.getElementById("loginEmail").value = saved;
    document.getElementById("rememberMe").checked = true;
  }
}

function handleLogout() {
  stopIntervals();
  currentUser = null;
  currentUserEmail = null;
  document.getElementById("dboard").classList.remove("active");
  document.getElementById("authBox").style.display = "block";
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("authMsg").className = "message";
}

window.addEventListener("resize", () => {
  if (document.getElementById("dboard").classList.contains("active")) {
    drawMainChart();
    renderTable();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadRememberedEmail();
  const sel = document.getElementById("orderSymbol");
  if (sel) sel.addEventListener("change", updateOrderPrice);
  const asel = document.getElementById("avatarStyle");
  if (asel) asel.addEventListener("change", changeAvatarStyle);
});
