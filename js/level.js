/* ============================
   DONKEY KONG — level.js
   Level definitions & generation
   ============================ */

const LevelData = (() => {

  // Canonical canvas size: 400 × 520
  // Platforms: { x, y, w, h, hasGap?, gapStart?, gapW? }
  // Ladders:   { x, y, h }  (x=center, y=top, h=height)
  // Kong pos:  { x, y }
  // Princess:  { x, y }
  // Player start: { x, y }

  const levels = [

    /* ─── LEVEL 1 : GIRDERS ─────────────────────── */
    // Floors at y: 488(ground), 420, 352, 284, 216, 148(top)
    // Gap between floors = 68px exactly
    // Ladder h = exactly 68 (floor_below.y - floor_above.y)
    // Ladder y = floor_above.y  (top of the upper platform = where ladder starts)
    // Ladder reaches y+68 = floor_below.y (surface of lower platform = where it ends)
    {
      name: 'GIRDERS',
      bgColor: '#0d1030',
      platforms: [
        { x: 0,   y: 488, w: 400, h: 14 },
        { x: 20,  y: 420, w: 340, h: 14, slope: -0.04, hasGap: true, gapStart: 240, gapW: 50 },
        { x: 20,  y: 352, w: 340, h: 14, slope: 0.04,  hasGap: true, gapStart: 100, gapW: 50 },
        { x: 20,  y: 284, w: 340, h: 14, slope: -0.04, hasGap: true, gapStart: 220, gapW: 50 },
        { x: 20,  y: 216, w: 340, h: 14, slope: 0.02, hasGap: true, gapStart: 160, gapW: 55 },
        { x: 20,  y: 148, w: 340, h: 14, hasGap: true, gapStart: 270, gapW: 55 },
      ],
      ladders: [
        // 420→488 : h=68
        { x: 60,  y: 420, h: 68 },
        { x: 300, y: 420, h: 68 },
        // 352→420 : h=68
        { x: 160, y: 352, h: 68 },
        { x: 320, y: 352, h: 68 },
        // 284→352 : h=68
        { x: 60,  y: 284, h: 68 },
        { x: 260, y: 284, h: 68 },
        // 216→284 : h=68
        { x: 140, y: 216, h: 68 },
        { x: 340, y: 216, h: 68 },
        // 148→216 : h=68
        { x: 70,  y: 148, h: 68 },
        { x: 300, y: 148, h: 68 },
      ],
      kongPos:    { x: 60,  y: 175 },
      princessPos:{ x: 335, y: 118 },
      playerStart:{ x: 40,  y: 456 },
      barrelSpawnRate: 2000,
    },

    /* ─── LEVEL 2 : RIVETS ───────────────────────── */
    // Floors at y: 488, 430, 370, 310, 250, 190, 130
    // Gaps: 58-60px
    {
      name: 'RIVETS',
      bgColor: '#101028',
      platforms: [
        { x: 0,   y: 488, w: 400, h: 14 },
        { x: 10,  y: 430, w: 170, h: 14 },
        { x: 220, y: 430, w: 170, h: 14 },
        { x: 10,  y: 370, w: 140, h: 14 },
        { x: 250, y: 370, w: 140, h: 14 },
        { x: 10,  y: 310, w: 170, h: 14 },
        { x: 220, y: 310, w: 170, h: 14 },
        { x: 10,  y: 250, w: 140, h: 14 },
        { x: 250, y: 250, w: 140, h: 14 },
        { x: 10,  y: 190, w: 380, h: 14 },
        { x: 80,  y: 130, w: 240, h: 14 },
      ],
      ladders: [
        // 430→488 : h=58
        { x: 80,  y: 430, h: 58 },
        { x: 200, y: 430, h: 58 },
        // 370→430 : h=60
        { x: 130, y: 370, h: 60 },
        { x: 270, y: 370, h: 60 },
        // 310→370 : h=60
        { x: 80,  y: 310, h: 60 },
        { x: 320, y: 310, h: 60 },
        // 250→310 : h=60
        { x: 140, y: 250, h: 60 },
        { x: 260, y: 250, h: 60 },
        // 190→250 : h=60
        { x: 100, y: 190, h: 60 },
        { x: 300, y: 190, h: 60 },
        // 130→190 : h=60
        { x: 200, y: 130, h: 60 },
      ],
      kongPos:    { x: 190, y: 95 },
      princessPos:{ x: 330, y: 100 },
      playerStart:{ x: 30,  y: 456 },
      barrelSpawnRate: 1700,
    },

    /* ─── LEVEL 3 : CAKE ─────────────────────────── */
    // Staircase layout — varied gaps (48-50px)
    {
      name: 'CAKE',
      bgColor: '#0a1520',
      platforms: [
        { x: 0,   y: 488, w: 400, h: 14 },
        { x: 0,   y: 440, w: 100, h: 14 },
        { x: 150, y: 440, w: 100, h: 14 },
        { x: 300, y: 440, w: 100, h: 14 },
        { x: 50,  y: 390, w: 100, h: 14 },
        { x: 200, y: 390, w: 100, h: 14 },
        { x: 350, y: 390, w: 50,  h: 14 },
        { x: 0,   y: 340, w: 120, h: 14 },
        { x: 150, y: 340, w: 100, h: 14 },
        { x: 280, y: 340, w: 120, h: 14 },
        { x: 50,  y: 290, w: 300, h: 14 },
        { x: 20,  y: 240, w: 120, h: 14 },
        { x: 260, y: 240, w: 120, h: 14 },
        { x: 100, y: 190, w: 200, h: 14 },
        { x: 50,  y: 140, w: 300, h: 14 },
      ],
      ladders: [
        // 440→488 : h=48
        { x: 100, y: 440, h: 48 },
        { x: 250, y: 440, h: 48 },
        // 390→440 : h=50
        { x: 50,  y: 390, h: 50 },
        { x: 200, y: 390, h: 50 },
        { x: 350, y: 390, h: 50 },
        // 340→390 : h=50
        { x: 100, y: 340, h: 50 },
        { x: 250, y: 340, h: 50 },
        // 290→340 : h=50
        { x: 150, y: 290, h: 50 },
        { x: 300, y: 290, h: 50 },
        // 240→290 : h=50
        { x: 70,  y: 240, h: 50 },
        { x: 310, y: 240, h: 50 },
        // 190→240 : h=50
        { x: 200, y: 190, h: 50 },
        // 140→190 : h=50
        { x: 130, y: 140, h: 50 },
        { x: 310, y: 140, h: 50 },
      ],
      kongPos:    { x: 190, y: 108 },
      princessPos:{ x: 330, y: 110 },
      playerStart:{ x: 30,  y: 456 },
      barrelSpawnRate: 1400,
    },

    /* ─── LEVEL 4 : CHAOS ───────────────────────── */
    // Floors at y: 488, 420, 355, 290, 225, 160, 100
    // Gaps: 65px
    // Gaps in platforms widened to 70px so barrels fall through reliably
    {
      name: 'CHAOS',
      bgColor: '#1a0a20',
      platforms: [
        { x: 0,   y: 488, w: 400, h: 14 },
        { x: 10,  y: 420, w: 380, h: 14, slope: 0.05, hasGap: true, gapStart: 155, gapW: 70 },
        { x: 10,  y: 355, w: 160, h: 14 },
        { x: 230, y: 355, w: 160, h: 14 },
        { x: 10,  y: 290, w: 380, h: 14, slope: -0.03, hasGap: true, gapStart: 75, gapW: 70 },
        { x: 10,  y: 225, w: 180, h: 14 },
        { x: 210, y: 225, w: 180, h: 14 },
        { x: 10,  y: 160, w: 380, h: 14 },
        { x: 100, y: 100, w: 200, h: 14 },
      ],
      ladders: [
        // 420→488 : h=68
        { x: 80,  y: 420, h: 68 },
        { x: 280, y: 420, h: 68 },
        // 355→420 : h=65
        { x: 140, y: 355, h: 65 },
        { x: 320, y: 355, h: 65 },
        // 290→355 : h=65
        { x: 60,  y: 290, h: 65 },
        { x: 330, y: 290, h: 65 },
        // 225→290 : h=65
        { x: 170, y: 225, h: 65 },
        { x: 240, y: 225, h: 65 },
        // 160→225 : h=65
        { x: 100, y: 160, h: 65 },
        { x: 300, y: 160, h: 65 },
        // 100→160 : h=60
        { x: 200, y: 100, h: 60 },
      ],
      kongPos:    { x: 190, y: 68 },
      princessPos:{ x: 330, y: 70 },
      playerStart:{ x: 30,  y: 456 },
      barrelSpawnRate: 1100,
    },
  ];

  function get(index) {
    return levels[index % levels.length];
  }

  function count() {
    return levels.length;
  }

  return { get, count };
})();