/* ============================
   DONKEY KONG — platforms.js
   Render & collision for platforms and ladders
   ============================ */

const Platforms = (() => {
  let platforms = [];
  let ladders   = [];

  function load(levelData) {
    platforms = levelData.platforms.map(p => ({ ...p }));
    ladders   = levelData.ladders.map(l => ({ ...l }));
  }

  /* ── DRAW ───────────────────────── */
  function draw(ctx) {
    drawPlatforms(ctx);
    drawLadders(ctx);
  }

  function drawPlatforms(ctx) {
    platforms.forEach(p => {
      const slope = p.slope || 0;
      const leftY  = p.y + (slope < 0 ? -slope * p.w : 0);
      const rightY = p.y + (slope > 0 ? slope * p.w : 0);

      // Draw each pixel-column for slope effect
      const cols = Math.ceil(p.w);

      // Main girder — gradient brown/orange
      for (let i = 0; i < cols; i++) {
        const t = i / cols;
        const cy = p.y + slope * i;
        // Skip gap
        if (p.hasGap && i >= p.gapStart && i < p.gapStart + p.gapW) continue;

        const r = Math.floor(139 + (210 - 139) * t);
        const g = Math.floor(69  + (105 - 69)  * t);
        const b = 19;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(p.x + i, cy, 1, p.h);
      }

      // Top highlight strip
      ctx.fillStyle = 'rgba(255,200,100,0.35)';
      for (let i = 0; i < cols; i++) {
        if (p.hasGap && i >= p.gapStart && i < p.gapStart + p.gapW) continue;
        const cy = p.y + slope * i;
        ctx.fillRect(p.x + i, cy, 1, 2);
      }

      // Bottom shadow strip
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      for (let i = 0; i < cols; i++) {
        if (p.hasGap && i >= p.gapStart && i < p.gapStart + p.gapW) continue;
        const cy = p.y + slope * i;
        ctx.fillRect(p.x + i, cy + p.h - 2, 1, 2);
      }

      // Rivet bolts every 40px
      ctx.fillStyle = '#FFD700';
      for (let rx = 20; rx < p.w - 10; rx += 40) {
        if (p.hasGap && rx >= p.gapStart && rx < p.gapStart + p.gapW) continue;
        const ry = p.y + slope * rx + Math.floor(p.h / 2) - 2;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 4;
        ctx.fillRect(p.x + rx, ry, 4, 4);
        ctx.shadowBlur = 0;
      }
    });
  }

  function drawLadders(ctx) {
    ladders.forEach(l => {
      const lw = 14;
      const halfW = lw / 2;
      // Side rails
      ctx.fillStyle = '#A0522D';
      ctx.shadowColor = 'rgba(210,105,30,0.5)';
      ctx.shadowBlur = 6;
      ctx.fillRect(l.x - halfW,     l.y, 3, l.h);
      ctx.fillRect(l.x + halfW - 3, l.y, 3, l.h);
      ctx.shadowBlur = 0;

      // Rungs every 12px
      ctx.fillStyle = '#CD853F';
      for (let ry = l.y + 4; ry < l.y + l.h - 4; ry += 12) {
        ctx.fillRect(l.x - halfW + 3, ry, lw - 6, 3);
      }
    });
  }

  /* ── COLLISION ──────────────────── */

  /**
   * Returns the platform the entity is standing on (or null).
   * Entity: { x, y, w, h, vy }
   */
  function getLandingPlatform(ent) {
    const foot = ent.y + ent.h;
    const prevFoot = foot - ent.vy * (1 / 60); // approximate previous position

    for (const p of platforms) {
      // Skip gaps
      const entMidX = ent.x + ent.w / 2;
      const localX  = entMidX - p.x;
      if (localX < 0 || localX > p.w) continue;
      if (p.hasGap && localX >= p.gapStart && localX < p.gapStart + p.gapW) continue;

      const slope   = p.slope || 0;
      const platTop = p.y + slope * localX;

      // Landing: was above, now at or below
      if (prevFoot <= platTop + 2 && foot >= platTop && ent.vy >= 0) {
        return { platform: p, surfaceY: platTop };
      }
    }
    return null;
  }

  /**
   * Check if entity is on any platform (standing).
   * Returns surfaceY or null.
   */
  function getSurface(ent) {
    const foot   = ent.y + ent.h;
    for (const p of platforms) {
      const entMidX = ent.x + ent.w / 2;
      const localX  = entMidX - p.x;
      if (localX < 0 || localX > p.w) continue;
      if (p.hasGap && localX >= p.gapStart && localX < p.gapStart + p.gapW) continue;

      const slope   = p.slope || 0;
      const platTop = p.y + slope * localX;

      if (Math.abs(foot - platTop) <= 6 && ent.vy >= 0) {
        return platTop;
      }
    }
    return null;
  }

  /**
   * Check if entity overlaps a ladder.
   * Returns the ladder or null.
   *
   * Rules:
   *  - Horizontally: player center must be within ±12px of ladder center
   *  - Vertically:   player head must be ABOVE ladder bottom (l.y + l.h)
   *                  player foot must be BELOW ladder top (l.y) with a small grab margin
   *
   * The strict lower bound (no margin at bottom) prevents a player standing
   * on a lower platform from accidentally grabbing a ladder that starts on that
   * same platform but belongs to the floor above.
   */
  function getOverlappingLadder(ent) {
    const entMidX = ent.x + ent.w / 2;
    const entFoot = ent.y + ent.h;
    const entHead = ent.y;
    const halfW   = 12;

    for (const l of ladders) {
      if (entMidX < l.x - halfW || entMidX > l.x + halfW) continue;

      const ladderTop    = l.y;           // top of ladder (upper platform surface)
      const ladderBottom = l.y + l.h;    // bottom of ladder (lower platform surface)

      // Player must have their head strictly above the bottom of the ladder
      // and their feet at or below the top + small margin (so they can grab from above)
      if (entHead < ladderBottom && entFoot > ladderTop - 8) {
        return l;
      }
    }
    return null;
  }

  /**
   * Returns the Y surface a barrel should sit on.
   * bx = center X of barrel, by = top Y, bh = height, bw = width
   * Samples multiple X points so wide gaps are detected reliably.
   */
  function getBarrelSurface(bx, by, bh, bw) {
    const hw = (bw || 20) / 2;
    const foot = by + bh;
    // Sample leading edge, center, trailing edge
    const sampleXs = [bx - hw + 2, bx, bx + hw - 2];

    for (const p of platforms) {
      const slope = p.slope || 0;

      for (const sx of sampleXs) {
        const localX = sx - p.x;
        if (localX < 0 || localX > p.w) continue;
        if (p.hasGap && localX >= p.gapStart && localX < p.gapStart + p.gapW) continue;

        const platTop = p.y + slope * localX;
        if (Math.abs(foot - platTop) <= 20) {
          return { y: platTop - bh, slope: slope };
        }
      }
    }
    return null;
  }

  /**
   * Returns true if the barrel has no platform support (over gap or edge).
   */
  function barrelOverGap(bx, by, bh) {
    const foot = by + bh;
    for (const p of platforms) {
      const localX = bx - p.x;
      if (localX < 0 || localX > p.w) continue;
      if (p.hasGap && localX >= p.gapStart && localX < p.gapStart + p.gapW) continue;
      const slope = p.slope || 0;
      const platTop = p.y + slope * localX;
      if (Math.abs(foot - platTop) <= 20) return false;
    }
    return true;
  }

  /**
   * The slope of the platform under a given x position.
   */
  function getSlopeAt(x, y) {
    for (const p of platforms) {
      const localX = x - p.x;
      if (localX < 0 || localX > p.w) continue;
      if (p.hasGap && localX >= p.gapStart && localX < p.gapStart + p.gapW) continue;

      const slope   = p.slope || 0;
      const platTop = p.y + slope * localX;
      if (Math.abs((y) - platTop) < 30) {
        return slope;
      }
    }
    return 0;
  }

  function getPlatforms() { return platforms; }
  function getLadders()   { return ladders; }

  return { load, draw, getLandingPlatform, getSurface, getOverlappingLadder, getBarrelSurface, barrelOverGap, getSlopeAt, getPlatforms, getLadders };
})();