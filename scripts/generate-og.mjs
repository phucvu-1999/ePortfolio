// ─────────────────────────────────────────────────────────────────────────────
// generate-og.mjs — builds public/og-portfolio.png (1200×630) with zero
// dependencies (Node built-ins only): manual PNG encoder + 5×7 pixel font.
// The image matches the site's terminal aesthetic so social/messaging
// previews (WhatsApp, Telegram, iMessage, LinkedIn, X) show an on-brand card.
//
// Usage: node scripts/generate-og.mjs
// ─────────────────────────────────────────────────────────────────────────────
import zlib from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const W = 1200
const H = 630

// ─── Palette (matches the site) ──────────────────────────────────────────────
const BG_TOP = [10, 10, 15]      // #0a0a0f
const BG_BOT = [13, 17, 23]      // #0d1117
const EMERALD = [16, 185, 129]   // #10b981
const WHITE = [241, 245, 249]    // #f1f5f9
const GRAY = [148, 163, 184]     // #94a3b8
const DIM = [100, 116, 139]      // #64748b
const FAINT = [71, 85, 105]      // #475569
const TERM_BG = [13, 17, 23]     // #0d1117
const TERM_BORDER = [30, 41, 59] // #1e293b
const TITLEBAR = [22, 27, 34]    // #161b22
const RED = [255, 95, 87]        // #ff5f57
const YELLOW = [254, 188, 46]    // #febc2e
const GREEN = [40, 200, 64]      // #28c840

// ─── 5×7 pixel font (rows of 5 bits, MSB = leftmost pixel) ───────────────────
const F = {
  A: [0x0e,0x11,0x11,0x1f,0x11,0x11,0x11], B: [0x1e,0x11,0x11,0x1e,0x11,0x11,0x1e],
  C: [0x0e,0x11,0x10,0x10,0x10,0x11,0x0e], D: [0x1e,0x11,0x11,0x11,0x11,0x11,0x1e],
  E: [0x1f,0x10,0x10,0x1e,0x10,0x10,0x1f], F: [0x1f,0x10,0x10,0x1e,0x10,0x10,0x10],
  G: [0x0e,0x11,0x10,0x17,0x11,0x11,0x0f], H: [0x11,0x11,0x11,0x1f,0x11,0x11,0x11],
  I: [0x0e,0x04,0x04,0x04,0x04,0x04,0x0e], J: [0x07,0x02,0x02,0x02,0x02,0x12,0x0c],
  K: [0x11,0x12,0x14,0x18,0x14,0x12,0x11], L: [0x10,0x10,0x10,0x10,0x10,0x10,0x1f],
  M: [0x11,0x1b,0x15,0x15,0x11,0x11,0x11], N: [0x11,0x19,0x15,0x13,0x11,0x11,0x11],
  O: [0x0e,0x11,0x11,0x11,0x11,0x11,0x0e], P: [0x1e,0x11,0x11,0x1e,0x10,0x10,0x10],
  Q: [0x0e,0x11,0x11,0x11,0x15,0x12,0x0d], R: [0x1e,0x11,0x11,0x1e,0x14,0x12,0x11],
  S: [0x0f,0x10,0x10,0x0e,0x01,0x01,0x1e], T: [0x1f,0x04,0x04,0x04,0x04,0x04,0x04],
  U: [0x11,0x11,0x11,0x11,0x11,0x11,0x0e], V: [0x11,0x11,0x11,0x11,0x11,0x0a,0x04],
  W: [0x11,0x11,0x11,0x15,0x15,0x1b,0x11], X: [0x11,0x11,0x0a,0x04,0x0a,0x11,0x11],
  Y: [0x11,0x11,0x0a,0x04,0x04,0x04,0x04], Z: [0x1f,0x01,0x02,0x04,0x08,0x10,0x1f],
  '0': [0x0e,0x11,0x13,0x15,0x19,0x11,0x0e], '1': [0x04,0x0c,0x04,0x04,0x04,0x04,0x0e],
  '2': [0x0e,0x11,0x01,0x02,0x04,0x08,0x1f], '3': [0x1f,0x02,0x04,0x02,0x01,0x11,0x0e],
  '4': [0x02,0x06,0x0a,0x12,0x1f,0x02,0x02], '5': [0x1f,0x10,0x1e,0x01,0x01,0x11,0x0e],
  '6': [0x06,0x08,0x10,0x1e,0x11,0x11,0x0e], '7': [0x1f,0x01,0x02,0x04,0x08,0x08,0x08],
  '8': [0x0e,0x11,0x11,0x0e,0x11,0x11,0x0e], '9': [0x0e,0x11,0x11,0x0f,0x01,0x02,0x0c],
  ' ': [0,0,0,0,0,0,0],
  $: [0x04,0x0f,0x14,0x0e,0x05,0x1e,0x04],
  '.': [0,0,0,0,0,0x0c,0x0c],
  ':': [0,0x0c,0x0c,0,0x0c,0x0c,0],
  '+': [0,0,0x04,0x0e,0x04,0,0],
  '-': [0,0,0,0x0e,0,0,0],
  '/': [0x01,0x01,0x02,0x04,0x08,0x10,0x10],
  '#': [0x0a,0x0a,0x1f,0x0a,0x1f,0x0a,0x0a],
  '%': [0x19,0x1a,0x02,0x04,0x08,0x0b,0x13],
  '·': [0,0,0,0x0c,0x0c,0,0],
}

// ─── Canvas buffer ───────────────────────────────────────────────────────────
const px = new Uint8Array(W * H * 4)

function setPx(x, y, [r, g, b], a = 1) {
  if (x < 0 || x >= W || y < 0 || y >= H) return
  const i = (y * W + x) * 4
  // alpha-blend over existing pixel
  px[i] = Math.round(r * a + px[i] * (1 - a))
  px[i + 1] = Math.round(g * a + px[i + 1] * (1 - a))
  px[i + 2] = Math.round(b * a + px[i + 2] * (1 - a))
  px[i + 3] = 255
}

function rect(x, y, w, h, color, a = 1) {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) setPx(xx, yy, color, a)
}

function strokeRect(x, y, w, h, color, t = 2) {
  rect(x, y, w, t, color); rect(x, y + h - t, w, t, color)
  rect(x, y, t, h, color); rect(x + w - t, y, t, h, color)
}

function circle(cx, cy, r, color) {
  for (let yy = cy - r; yy <= cy + r; yy++)
    for (let xx = cx - r; xx <= cx + r; xx++)
      if ((xx - cx) ** 2 + (yy - cy) ** 2 <= r * r) setPx(xx, yy, color)
}

function drawText(x, y, text, scale, color) {
  let cx = x
  for (const ch of text.toUpperCase()) {
    const glyph = F[ch]
    if (glyph) {
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 5; col++) {
          if (glyph[row] & (1 << (4 - col))) {
            rect(cx + col * scale, y + row * scale, scale, scale, color)
          }
        }
      }
    }
    cx += 6 * scale
  }
  return cx
}

function textWidth(text, scale) {
  return text.length * 6 * scale - scale
}

// ─── Paint ───────────────────────────────────────────────────────────────────
// Vertical gradient background
for (let y = 0; y < H; y++) {
  const t = y / H
  const c = [
    Math.round(BG_TOP[0] + (BG_BOT[0] - BG_TOP[0]) * t),
    Math.round(BG_TOP[1] + (BG_BOT[1] - BG_TOP[1]) * t),
    Math.round(BG_TOP[2] + (BG_BOT[2] - BG_TOP[2]) * t),
  ]
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4
    px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255
  }
}

// Subtle dot grid (like the site background)
for (let y = 24; y < H; y += 28) {
  for (let x = 24; x < W; x += 28) setPx(x, y, GRAY, 0.12)
}

// Top accent bar
rect(0, 0, W, 4, EMERALD)

// Terminal window
const TX = 100, TY = 110, TW = 1000, TH = 390
rect(TX, TY, TW, TH, TERM_BG)
strokeRect(TX, TY, TW, TH, TERM_BORDER, 2)

// Title bar
rect(TX, TY, TW, 44, TITLEBAR)
rect(TX, TY + 43, TW, 2, TERM_BORDER)
circle(TX + 30, TY + 22, 6, RED)
circle(TX + 52, TY + 22, 6, YELLOW)
circle(TX + 74, TY + 22, 6, GREEN)
// Title bar text — centered "epos@v5:~"
{
  const title = 'EPOS@V5:~'
  const w = textWidth(title, 2)
  drawText(TX + (TW - w) / 2, TY + 15, title, 2, DIM)
}

// $ whoami
drawText(TX + 40, TY + 70, '$ WHOAMI', 3, EMERALD)

// Name — "EPOS" white, "V5" emerald, big
drawText(TX + 40, TY + 112, 'EPOS', 9, WHITE)
const eposW = textWidth('EPOS ', 9)
drawText(TX + 40 + eposW, TY + 112, 'V5', 9, EMERALD)
// Emerald underline accent
rect(TX + 40, TY + 112 + 66, 220, 4, EMERALD, 0.7)

// Role
drawText(TX + 40, TY + 205, 'ENTERPRISE POS SYSTEMS ENGINEER', 3, GRAY)
// Stack line
drawText(TX + 40, TY + 240, 'C# · .NET 8 · gRPC · WPF · XAMARIN', 2, DIM)

// $ cat stats.txt
drawText(TX + 40, TY + 282, '$ CAT STATS.TXT', 3, EMERALD)
// Stats
drawText(TX + 40, TY + 315, '30+ MODULES · 20+ PAYMENTS · 5 DEVICES · $200K+ REVENUE', 2, GRAY)
drawText(TX + 40, TY + 342, '99.9% UPTIME · 0 FINANCIAL INCIDENTS · 22/22 MIGRATED', 2, GRAY)

// Window bottom accent line
rect(TX, TY + TH - 6, TW, 3, EMERALD, 0.6)

// Footer — centered
{
  const foot = 'EPOS SINGAPORE · 2020 - PRESENT'
  const w = textWidth(foot, 2)
  drawText((W - w) / 2, 566, foot, 2, FAINT)
}

// ─── PNG encode (manual: IHDR + IDAT + IEND with CRC32) ──────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typeAndData))
  return Buffer.concat([len, typeAndData, crc])
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0)
ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8   // bit depth
ihdr[9] = 6   // color type RGBA
ihdr[10] = 0  // compression
ihdr[11] = 0  // filter
ihdr[12] = 0  // interlace

// Scanlines with filter byte 0
const raw = Buffer.alloc((W * 4 + 1) * H)
for (let y = 0; y < H; y++) {
  raw[y * (W * 4 + 1)] = 0
  Buffer.from(px.buffer, y * W * 4, W * 4).copy(raw, y * (W * 4 + 1) + 1)
}
const idat = zlib.deflateSync(raw, { level: 9 })

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
])

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og-portfolio.png')
fs.writeFileSync(out, png)
console.log(`✓ wrote ${out} (${(png.length / 1024).toFixed(1)} kB, ${W}×${H})`)
