import AppKit
import CoreText

// Recap app icon: "R." monogram — Space Grotesk Bold R in off-white with an
// electric-blue rounded-square period, on an ink rounded square following
// Apple's Big Sur icon grid (824pt square centered on a 1024pt canvas).
//
// Needs SpaceGrotesk-Bold.ttf (CGFont can't read the repo's woff2 bundles):
//   curl -sL "$(curl -s -A 'Mozilla/4.0' 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700' | grep -o 'https://[^)]*\.ttf' | head -1)" -o SpaceGrotesk-Bold.ttf
// Usage: swiftc -O render-app-icon.swift -o render && ./render SpaceGrotesk-Bold.ttf out.png

let canvas: CGFloat = 1024
let args = CommandLine.arguments
let fontPath = args.count > 1 ? args[1] : "SpaceGrotesk-Bold.ttf"
let outPath = args.count > 2 ? args[2] : "recap-icon-1024.png"

let ink = NSColor(srgbRed: 0x0B / 255.0, green: 0x0C / 255.0, blue: 0x0E / 255.0, alpha: 1)
let paper = NSColor(srgbRed: 0xF2 / 255.0, green: 0xF2 / 255.0, blue: 0xED / 255.0, alpha: 1)
let blue = NSColor(srgbRed: 0x2E / 255.0, green: 0x5B / 255.0, blue: 0xFF / 255.0, alpha: 1)

guard let fontData = FileManager.default.contents(atPath: fontPath),
  let provider = CGDataProvider(data: fontData as CFData),
  let cgFont = CGFont(provider)
else {
  fputs("cannot load font at \(fontPath)\n", stderr)
  exit(1)
}
var fmError: Unmanaged<CFError>?
CTFontManagerRegisterGraphicsFont(cgFont, &fmError)
let fontSize: CGFloat = 620
let ctFont = CTFontCreateWithGraphicsFont(cgFont, fontSize, nil, nil)

guard
  let ctx = CGContext(
    data: nil, width: Int(canvas), height: Int(canvas), bitsPerComponent: 8,
    bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
else {
  fputs("cannot create context\n", stderr)
  exit(1)
}

// Background: Apple icon-grid rounded square, transparent margins.
let square = CGRect(x: 100, y: 100, width: 824, height: 824)
let bg = CGPath(roundedRect: square, cornerWidth: 186, cornerHeight: 186, transform: nil)
ctx.addPath(bg)
ctx.setFillColor(ink.cgColor)
ctx.fillPath()

// Measure the R glyph.
var chars: [UniChar] = [0x52]  // "R"
var glyphs: [CGGlyph] = [0]
CTFontGetGlyphsForCharacters(ctFont, &chars, &glyphs, 1)
var bbox = CGRect.zero
withUnsafeMutablePointer(to: &bbox) { boxPtr in
  _ = CTFontGetBoundingRectsForGlyphs(ctFont, .default, &glyphs, boxPtr, 1)
}

// Lockup: R + gap + period square, centered as a unit inside the ink square.
let periodSide: CGFloat = 118
let gap: CGFloat = 44
let lockupWidth = bbox.width + gap + periodSide
let originX = square.midX - lockupWidth / 2 - bbox.minX
let baselineY = square.midY - bbox.height / 2 - bbox.minY

ctx.setFillColor(paper.cgColor)
var position = CGPoint(x: originX, y: baselineY)
CTFontDrawGlyphs(ctFont, &glyphs, &position, 1, ctx)

let periodRect = CGRect(
  x: originX + bbox.minX + bbox.width + gap, y: baselineY + bbox.minY,
  width: periodSide, height: periodSide)
let dot = CGPath(
  roundedRect: periodRect, cornerWidth: 28, cornerHeight: 28, transform: nil)
ctx.addPath(dot)
ctx.setFillColor(blue.cgColor)
ctx.fillPath()

guard let image = ctx.makeImage() else {
  fputs("cannot render\n", stderr)
  exit(1)
}
let rep = NSBitmapImageRep(cgImage: image)
guard let png = rep.representation(using: .png, properties: [:]) else {
  fputs("cannot encode png\n", stderr)
  exit(1)
}
try! png.write(to: URL(fileURLWithPath: outPath))
print("wrote \(outPath)")
