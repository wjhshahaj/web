const express = require("express");
const cron = require("node-cron");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ====== CẤU HÌNH ======
const MAX = 10_000_000_000;

// ====== BIẾN TOÀN CỤC (CHUNG CHO TẤT CẢ) ======
let counter = 0;
let ended = false;

// ====== RESET 00:00 UTC ======
cron.schedule("0 0 * * *", () => {
  counter = 0;
  ended = false;
  console.log("🔄 Reset counter 00:00 UTC");
}, {
  timezone: "UTC"
});

// ====== API LẤY SỐ ======
app.get("/count", (req, res) => {
  res.json({ counter, ended });
});

// ====== API TĂNG SỐ ======
app.post("/increment", (req, res) => {
  if (ended) {
    return res.json({ counter, ended });
  }

  counter++;

  if (counter >= MAX) {
    ended = true;
  }

  res.json({ counter, ended });
});

// ====== WEBSITE (HTML + CSS + JS GỘP CHUNG) ======
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Nút Toàn Cầu</title>
<style>
body {
  margin: 0;
  height: 100vh;
  background: #111;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Arial;
}
.container {
  text-align: center;
}
#count {
  font-size: 48px;
  margin-bottom: 20px;
}
button {
  font-size: 32px;
  padding: 20px 40px;
  cursor: pointer;
}
button:disabled {
  background: #555;
  cursor: not-allowed;
}
#status {
  margin-top: 15px;
  color: red;
}
</style>
</head>

<body>
<div class="container">
  <div id="count">0</div>
  <button id="btn">NHẤN</button>
  <div id="status"></div>
</div>

<script>
const countEl = document.getElementById("count");
const btn = document.getElementById("btn");
const statusEl = document.getElementById("status");

async function loadCount() {
  const res = await fetch("/count");
  const data = await res.json();
  updateUI(data);
}

async function increment() {
  const res = await fetch("/increment", { method: "POST" });
  const data = await res.json();
  updateUI(data);
}

function updateUI(data) {
  countEl.innerText = data.counter.toLocaleString();

  if (data.ended) {
    btn.disabled = true;
    statusEl.innerText = "⛔ Đã đạt 10 tỷ lần nhấn. Kết thúc!";
  }
}

btn.onclick = increment;

// Cập nhật realtime mỗi 1 giây
setInterval(loadCount, 1000);
loadCount();
</script>
</body>
</html>
`);
});

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log("🚀 Server chạy tại port", PORT);
});
