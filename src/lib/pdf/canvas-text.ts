const CANVAS_FONT_FAMILY = "MuktaCanvas"
const RENDER_PPI = 300

export interface CanvasFontSources {
  regular: string
  bold: string
}

let fontLoadPromise: Promise<void> | null = null

function loadCanvasFont(fonts: CanvasFontSources): Promise<void> {
  if (!fontLoadPromise) {
    fontLoadPromise = (async () => {
      const regularFontFace = new FontFace(
        CANVAS_FONT_FAMILY,
        `url(data:font/truetype;base64,${fonts.regular})`,
        { weight: "400" }
      )

      const boldFontFace = new FontFace(
        CANVAS_FONT_FAMILY,
        `url(data:font/truetype;base64,${fonts.bold})`,
        { weight: "700" }
      )

      const [loadedRegular, loadedBold] = await Promise.all([
        regularFontFace.load(),
        boldFontFace.load(),
      ])

      document.fonts.add(loadedRegular)
      document.fonts.add(loadedBold)
    })()
  }

  return fontLoadPromise
}

export interface CanvasTextResult {
  dataUrl: string
  widthIn: number
  heightIn: number
  baselineOffsetIn: number
}

export async function renderDevanagariText(
  text: string,
  fontSizePt: number,
  options: { bold?: boolean } = {},
  fonts: CanvasFontSources
): Promise<CanvasTextResult> {
  await loadCanvasFont(fonts)

  const fontSizePx = (fontSizePt / 72) * RENDER_PPI
  const fontSpec = `${options.bold ? "700" : "400"} ${fontSizePx}px "${CANVAS_FONT_FAMILY}"`

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