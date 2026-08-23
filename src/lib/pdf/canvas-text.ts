import { sarai07FontBase64 } from "@/lib/pdf/sarai-font.js"

const CANVAS_FONT_FAMILY = "Sarai07Canvas"
// Print-quality raster resolution for the text image — high enough to stay
// crisp on a printed receipt, without ballooning the generated PDF's size.
const RENDER_PPI = 300

let fontLoadPromise: Promise<void> | null = null

/** Registers Sarai_07 as a real CSS font face (it's normally only known to
 * jsPDF's internal VFS) so <canvas> can shape it with the browser's own text
 * engine — the same engine that already renders this app's Devanagari text
 * correctly on screen, unlike jsPDF's plain glyph-by-glyph `doc.text()`. */
function loadCanvasFont(): Promise<void> {
  if (!fontLoadPromise) {
    fontLoadPromise = (async () => {
      const fontFace = new FontFace(
        CANVAS_FONT_FAMILY,
        `url(data:font/truetype;base64,${sarai07FontBase64})`
      )
      const loaded = await fontFace.load()
      document.fonts.add(loaded)
    })()
  }
  return fontLoadPromise
}

export interface CanvasTextResult {
  dataUrl: string
  widthIn: number
  heightIn: number
  /** Distance from the top of the image to the text baseline, in inches —
   * needed because jsPDF's `doc.text()` anchors at the baseline while
   * `doc.addImage()` anchors at the top-left corner. */
  baselineOffsetIn: number
}

/** Renders `text` to an offscreen canvas using the (correctly shaping) browser
 * text engine, returning a PNG data URL sized and positioned to drop in for
 * an equivalent `doc.text(text, x, y)` call at the same point size. */
export async function renderDevanagariText(text: string, fontSizePt: number): Promise<CanvasTextResult> {
  await loadCanvasFont()

  const fontSizePx = (fontSizePt / 72) * RENDER_PPI
  const fontSpec = `${fontSizePx}px "${CANVAS_FONT_FAMILY}"`

  const measureCanvas = document.createElement("canvas")
  const measureCtx = measureCanvas.getContext("2d")
  if (!measureCtx) throw new Error("Canvas 2D context unavailable")
  measureCtx.font = fontSpec

  const metrics = measureCtx.measureText(text)
  const ascent = metrics.fontBoundingBoxAscent ?? fontSizePx * 0.85
  const descent = metrics.fontBoundingBoxDescent ?? fontSizePx * 0.35
  const width = Math.max(metrics.width, 1)
  const padding = fontSizePx * 0.15

  const canvas = document.createElement("canvas")
  canvas.width = Math.ceil(width + padding * 2)
  canvas.height = Math.ceil(ascent + descent + padding * 2)

  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D context unavailable")
  ctx.font = fontSpec
  ctx.fillStyle = "#000000"
  ctx.textBaseline = "alphabetic"

  const baselineY = padding + ascent
  ctx.fillText(text, padding, baselineY)

  return {
    dataUrl: canvas.toDataURL("image/png"),
    widthIn: canvas.width / RENDER_PPI,
    heightIn: canvas.height / RENDER_PPI,
    baselineOffsetIn: baselineY / RENDER_PPI,
  }
}
