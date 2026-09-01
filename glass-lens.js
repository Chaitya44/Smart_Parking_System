/**
 * glass-lens.js  –  Real Liquid Glass Lens Engine
 *
 * Translates Kyant's AGSL shaders (Shaders.kt) to JavaScript:
 *   • sdRoundedRect()         → SDF for rounded rectangle
 *   • gradSdRoundedRect()     → outward surface normal at any point
 *   • circleMap()             → lens curvature mapping (edge-strong refraction)
 *   • RoundedRectRefraction   → per-pixel lens displacement
 *   • Chromatic aberration    → separate R/G/B displacements (from dispersion shader)
 *   • Highlight shader        → directional specular rim (dot product with light normal)
 *
 * Architecture:
 *   bgCanvas  – full-page offscreen canvas, draws the animated scene
 *   lensCanvas – sits inside .card, samples bgCanvas with lens warp applied
 *   warpTable  – precomputed Float32Array: for each lens pixel → [srcX, srcY]
 *                avoids SDF math every frame
 *
 * Performance: render at 0.5x resolution then CSS scale(2) = 4× fewer pixels
 */

"use strict";

// ── SDF math (direct AGSL → JS translation) ──────────────────────────────────

function sdRoundedRect(dx, dy, halfW, halfH, r) {
    const qx = Math.abs(dx) - halfW + r;
    const qy = Math.abs(dy) - halfH + r;
    const outer = Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2) - r;
    const inner = Math.min(Math.max(qx, qy), 0);
    return outer + inner;
}

function gradSdRoundedRect(dx, dy, halfW, halfH, r) {
    const qx = Math.abs(dx) - halfW + r;
    const qy = Math.abs(dy) - halfH + r;
    if (qx >= 0 || qy >= 0) {
        const mx = Math.max(qx, 0), my = Math.max(qy, 0);
        const len = Math.sqrt(mx * mx + my * my) || 1e-6;
        return [Math.sign(dx) * mx / len, Math.sign(dy) * my / len];
    }
    // interior: pick the axis closest to surface
    const gx = qy <= qx ? 1 : 0;
    return [Math.sign(dx) * gx, Math.sign(dy) * (1 - gx)];
}

// Lens profile: maps [0,1] → [0,1] with circular falloff (stronger at edge, zero at center)
// = 1 − √(1 − x²)   (quarter-circle)
function circleMap(x) {
    return 1 - Math.sqrt(Math.max(0, 1 - x * x));
}

// ── Warp table builder ────────────────────────────────────────────────────────
// Pre-computes for every pixel in the lens canvas what background pixel to read.
// lensW/H = canvas pixel dimensions (0.5x display size for performance)
// cardRect = getBoundingClientRect() of .card on page
// Returns Float32Array of length lensW*lensH*4: [srcX_r, srcY_r, srcX_g, srcY_g, ...]
// (r/g channels get slightly different displacement = chromatic aberration)

function buildWarpTable(lensW, lensH, borderRadius, refrHeight, refrAmounts) {
    const table = new Float32Array(lensW * lensH * 4); // pairs: [srcX_r,srcY_r, srcX_b,srcY_b] per pixel
    const halfW = lensW / 2, halfH = lensH / 2;
    const gradR = Math.min(borderRadius * 1.5, Math.min(halfW, halfH));

    for (let y = 0; y < lensH; y++) {
        for (let x = 0; x < lensW; x++) {
            const dx = x - halfW, dy = y - halfH;
            const sd = sdRoundedRect(dx, dy, halfW, halfH, borderRadius);

            let offXr = 0, offYr = 0;  // red channel offset (more displaced)
            let offXb = 0, offYb = 0;  // blue channel offset (less displaced)

            if (sd <= 0 && -sd < refrHeight) {
                const t = 1 - (-sd / refrHeight);
                const lensD = circleMap(t);
                const [gx, gy] = gradSdRoundedRect(dx, dy, halfW, halfH, gradR);
                // Chromatic: red displaced slightly MORE outward, blue slightly LESS
                offXr = gx * lensD * refrAmounts[0];
                offYr = gy * lensD * refrAmounts[0];
                offXb = gx * lensD * refrAmounts[1];
                offYb = gy * lensD * refrAmounts[1];
            }

            const i = (y * lensW + x) * 4;
            table[i]     = x + offXr; // red src X
            table[i + 1] = y + offYr; // red src Y
            table[i + 2] = x + offXb; // blue src X
            table[i + 3] = y + offYb; // blue src Y
        }
    }
    return table;
}

// ── Background scene renderer ─────────────────────────────────────────────────
// Draws the animated colored orbs onto bgCanvas.
// This is what the lens refracts — needs to be colorful and high-contrast.

const orbs = [
    { x: 0.15, y: 0.20, r: 0.38, color: [0,   220, 130], phase: 0,      speed: 0.00028 },
    { x: 0.75, y: 0.15, r: 0.30, color: [130,  60, 255], phase: 2.1,   speed: 0.00020 },
    { x: 0.80, y: 0.75, r: 0.32, color: [0,   160, 255], phase: 4.4,   speed: 0.00024 },
    { x: 0.25, y: 0.80, r: 0.25, color: [255, 180,  40], phase: 1.1,   speed: 0.00018 },
    { x: 0.50, y: 0.50, r: 0.20, color: [255,  60, 140], phase: 3.3,   speed: 0.00032 },
];

function drawBackground(ctx, w, h, time) {
    // Deep dark background
    ctx.fillStyle = '#050d09';
    ctx.fillRect(0, 0, w, h);

    // Radial orbs — these are what get visibly distorted through the lens
    for (const orb of orbs) {
        const px = (orb.x + Math.sin(time * orb.speed + orb.phase) * 0.12) * w;
        const py = (orb.y + Math.cos(time * orb.speed * 0.8 + orb.phase) * 0.10) * h;
        const rad = orb.r * Math.min(w, h);
        const [r, g, b] = orb.color;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, rad);
        grad.addColorStop(0,   `rgba(${r},${g},${b},0.85)`);
        grad.addColorStop(0.4, `rgba(${r},${g},${b},0.40)`);
        grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
    }

    // Subtle star field
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    // stars are static (seeded), drawn efficiently
    const stars = drawBackground._stars || (drawBackground._stars = (() => {
        const s = [];
        for (let i = 0; i < 80; i++) s.push([Math.random(), Math.random(), Math.random() * 1.2 + 0.3]);
        return s;
    })());
    for (const [sx, sy, sr] of stars) {
        ctx.beginPath();
        ctx.arc(sx * w, sy * h, sr, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ── Lens render ───────────────────────────────────────────────────────────────
// Reads bgCanvas pixels, applies warp table, writes to lensCtx.
// Handles chromatic aberration: R and B channels from slightly different src coords.

function renderLens(bgCanvas, lensCtx, warpTable, lensW, lensH, borderRadius) {
    // Sample from bgCanvas (which may be larger / different size than lens canvas)
    const bgCtx = bgCanvas.getContext('2d');
    const bgData = bgCtx.getImageData(0, 0, bgCanvas.width, bgCanvas.height).data;
    const bW = bgCanvas.width, bH = bgCanvas.height;

    const outImg = lensCtx.createImageData(lensW, lensH);
    const out    = outImg.data;

    // Inside/outside mask: for pixels fully inside the rounded rect (far from edge),
    // skip refraction (use direct pixel) for a performance win
    const halfW = lensW / 2, halfH = lensH / 2;

    for (let y = 0; y < lensH; y++) {
        for (let x = 0; x < lensW; x++) {
            const i   = (y * lensW + x) * 4;
            const ti  = i;          // warp table index (same layout)

            // Red+Green channel source (more displaced)
            const srxR = Math.max(0, Math.min(bW - 1, warpTable[ti]     )) | 0;
            const sryR = Math.max(0, Math.min(bH - 1, warpTable[ti + 1] )) | 0;
            // Blue channel source (less displaced = chromatic aberration)
            const srxB = Math.max(0, Math.min(bW - 1, warpTable[ti + 2] )) | 0;
            const sryB = Math.max(0, Math.min(bH - 1, warpTable[ti + 3] )) | 0;

            // Green channel: average of R and B source positions
            const srxG = ((srxR + srxB) / 2) | 0;
            const sryG = ((sryR + sryB) / 2) | 0;

            const idxR = (sryR * bW + srxR) * 4;
            const idxG = (sryG * bW + srxG) * 4;
            const idxB = (sryB * bW + srxB) * 4;

            out[i]     = bgData[idxR];     // R from red-displaced coord
            out[i + 1] = bgData[idxG + 1]; // G from mid coord
            out[i + 2] = bgData[idxB + 2]; // B from blue-displaced coord
            out[i + 3] = 255;
        }
    }

    // Clip to rounded rect shape (make outside pixels transparent)
    for (let y = 0; y < lensH; y++) {
        for (let x = 0; x < lensW; x++) {
            const dx = x - halfW, dy = y - halfH;
            const sd = sdRoundedRect(dx, dy, halfW, halfH, borderRadius);
            if (sd > 0.5) {
                const i = (y * lensW + x) * 4;
                out[i + 3] = 0; // transparent outside shape
            }
        }
    }

    lensCtx.putImageData(outImg, 0, 0);
}

// ── Main init ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const card       = document.querySelector('.card');
    const lensCanvas = document.getElementById('lensCanvas');
    const bgCanvas   = document.getElementById('bgCanvas');
    if (!card || !lensCanvas || !bgCanvas) return;

    const bgCtx   = bgCanvas.getContext('2d');
    const lensCtx = lensCanvas.getContext('2d');

    // Full-page background canvas
    function resizeBg() {
        bgCanvas.width  = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }
    resizeBg();
    window.addEventListener('resize', resizeBg);

    // Lens canvas: 0.5x the card's CSS size (scaled up via CSS = 4× fewer pixels)
    const SCALE       = 0.5;  // render resolution multiplier
    const BORDER_R    = 28;   // must match --radius-card px
    const REFR_HEIGHT = 55;   // refraction zone depth in pixels (at full scale)
    const REFR_AMT_R  = 30;   // red channel displacement pixels
    const REFR_AMT_B  = 20;   // blue channel displacement pixels

    let warpTable = null;
    let lensW = 0, lensH = 0;

    function buildLens() {
        const rect = card.getBoundingClientRect();
        lensW = Math.max(1, Math.round(rect.width  * SCALE));
        lensH = Math.max(1, Math.round(rect.height * SCALE));
        lensCanvas.width  = lensW;
        lensCanvas.height = lensH;
        // CSS: scale canvas UP to fill the card
        lensCanvas.style.width  = rect.width  + 'px';
        lensCanvas.style.height = rect.height + 'px';

        warpTable = buildWarpTable(
            lensW, lensH,
            BORDER_R * SCALE,          // border radius at half scale
            REFR_HEIGHT * SCALE,
            [REFR_AMT_R * SCALE, REFR_AMT_B * SCALE]
        );
    }
    buildLens();

    if (window.ResizeObserver) {
        new ResizeObserver(buildLens).observe(card);
    }

    // ── Animation loop ────────────────────────────────────────────────────────
    let frame = 0;
    let lastLensRender = -1;
    const LENS_FPS = 30; // lens render at 30fps is enough for smooth look

    function loop(time) {
        requestAnimationFrame(loop);

        // Always animate background at 60fps
        const bW = bgCanvas.width, bH = bgCanvas.height;
        drawBackground(bgCtx, bW, bH, time);

        // Render lens at 30fps (every other frame)
        if (warpTable && time - lastLensRender > 1000 / LENS_FPS) {
            lastLensRender = time;
            // bgCanvas coords for the card area
            const rect = card.getBoundingClientRect();
            // Create a cropped offscreen canvas matching the card position in page
            const cropCanvas = document.createElement('canvas');
            cropCanvas.width  = lensW;
            cropCanvas.height = lensH;
            const cropCtx = cropCanvas.getContext('2d');
            cropCtx.drawImage(
                bgCanvas,
                rect.left, rect.top, rect.width, rect.height, // src region
                0, 0, lensW, lensH                            // dst (scaled)
            );
            renderLens(cropCanvas, lensCtx, warpTable, lensW, lensH, BORDER_R * SCALE);
        }

        frame++;
    }
    requestAnimationFrame(loop);
});
