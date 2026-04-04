// Plain JS — no React. ScrollTrigger writes here, Canvas reads every frame.
export const scrollState = {
  currentSwordIndex: -1,
  sectionProgress: 0,
  cameraTarget: { x: 0, y: 0, z: 5 },
  elementColorHex: '#334488',
  heroMode: true,
  requestedSwordIndex: 7,   // which sword should be displayed (SwordModel watches this)
}
