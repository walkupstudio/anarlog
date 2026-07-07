# Solid electric-blue 1024x1024 PNG (Recap placeholder until Phase B art).
import struct, zlib, sys

SIZE, COLOR = 1024, (0x2E, 0x5B, 0xFF)

def chunk(tag, data):
    c = struct.pack(">I", len(data)) + tag + data
    return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

row = b"\x00" + bytes(COLOR) * SIZE
raw = row * SIZE
png = (
    b"\x89PNG\r\n\x1a\n"
    + chunk(b"IHDR", struct.pack(">IIBBBBB", SIZE, SIZE, 8, 2, 0, 0, 0))
    + chunk(b"IDAT", zlib.compress(raw, 9))
    + chunk(b"IEND", b"")
)
out = sys.argv[1]
open(out, "wb").write(png)
print(f"wrote {out}")
