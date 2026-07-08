#!/usr/bin/env python3
# Recap icon: near-black rounded square, five electric-blue waveform bars
# that resolve into a quotation-mark pair (the two tallest bars, dot-capped).
# Pure stdlib: draws into an RGBA buffer, writes PNG via zlib.
import struct, zlib, sys

S = 1024
BG = (0x0B, 0x0C, 0x0E, 255)        # near-black
BLUE = (0x2E, 0x5B, 0xFF, 255)      # electric blue
TRANSPARENT = (0, 0, 0, 0)
CORNER_R = 232                       # macOS-style superellipse approximation via circle corners

buf = bytearray(S * S * 4)

def put(x, y, c):
    i = (y * S + x) * 4
    buf[i : i + 4] = bytes(c)

def rounded_square():
    r = CORNER_R
    for y in range(S):
        for x in range(S):
            inside = True
            for cx, cy in ((r, r), (S - 1 - r, r), (r, S - 1 - r), (S - 1 - r, S - 1 - r)):
                if (x < r and y < r and (x - r) ** 2 + (y - r) ** 2 > r * r and cx == r and cy == r):
                    inside = False
                if (x > S - 1 - r and y < r and (x - (S - 1 - r)) ** 2 + (y - r) ** 2 > r * r and cx == S - 1 - r and cy == r):
                    inside = False
                if (x < r and y > S - 1 - r and (x - r) ** 2 + (y - (S - 1 - r)) ** 2 > r * r and cx == r and cy == S - 1 - r):
                    inside = False
                if (x > S - 1 - r and y > S - 1 - r and (x - (S - 1 - r)) ** 2 + (y - (S - 1 - r)) ** 2 > r * r and cx == S - 1 - r and cy == S - 1 - r):
                    inside = False
            put(x, y, BG if inside else TRANSPARENT)

def vbar(cx, top, bottom, half_w):
    # vertical bar with rounded (circular) caps
    for y in range(top + half_w, bottom - half_w):
        for x in range(cx - half_w, cx + half_w):
            put(x, y, BLUE)
    for capy in (top + half_w, bottom - half_w):
        for y in range(capy - half_w, capy + half_w):
            for x in range(cx - half_w, cx + half_w):
                if (x - cx) ** 2 + (y - capy) ** 2 <= half_w * half_w:
                    put(x, y, BLUE)

def dot(cx, cy, r):
    for y in range(cy - r, cy + r):
        for x in range(cx - r, cx + r):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                put(x, y, BLUE)

rounded_square()
MID = S // 2
HW = 36  # bar half-width
# waveform: short, medium, tall, tall, medium — the two tall bars get
# detached dots above, reading as a quotation mark pair
vbar(272, MID - 90, MID + 90, HW)
vbar(392, MID - 150, MID + 150, HW)
vbar(512, MID - 40, MID + 230, HW)
vbar(632, MID - 40, MID + 230, HW)
vbar(752, MID - 120, MID + 120, HW)
dot(512, MID - 150, 44)
dot(632, MID - 150, 44)

def chunk(tag, data):
    c = struct.pack(">I", len(data)) + tag + data
    return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

rows = b"".join(b"\x00" + bytes(buf[y * S * 4 : (y + 1) * S * 4]) for y in range(S))
png = (
    b"\x89PNG\r\n\x1a\n"
    + chunk(b"IHDR", struct.pack(">IIBBBBB", S, S, 8, 6, 0, 0, 0))
    + chunk(b"IDAT", zlib.compress(rows, 9))
    + chunk(b"IEND", b"")
)
open(sys.argv[1], "wb").write(png)
print(f"wrote {sys.argv[1]}")
