/**
 * Animaciones de la ficha fullscreen con la Web Animations API (sin
 * dependencias). Curvas largas y desplazamientos cortos: entra con calma, sin
 * rebotes. Todo se omite con prefers-reduced-motion (lo decide quien llama).
 */

/** easeOutQuint: arranca rápido y se asienta despacio. */
export const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_IN = "cubic-bezier(0.55, 0, 1, 0.45)";

/** Entrada y salida del diálogo y de su fondo. */
export const DIALOG_IN: Keyframe[] = [
  { opacity: 0, transform: "translateY(24px)" },
  { opacity: 1, transform: "none" },
];
export const DIALOG_OUT: Keyframe[] = [
  { opacity: 1, transform: "none" },
  { opacity: 0, transform: "translateY(12px)" },
];
export const FADE_IN: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];
export const FADE_OUT: Keyframe[] = [{ opacity: 1 }, { opacity: 0 }];

/**
 * Tipos de aparición (atributo `data-reveal`):
 * - `up` (por defecto): sube 18 px y aparece.
 * - `cover`: la foto se descubre de abajo hacia arriba y se asienta (zoom suave).
 * - `fade`: solo opacidad (líneas, textos chicos).
 */
function play(el: HTMLElement, delay: number): Animation[] {
  const kind = el.dataset.reveal || "up";
  if (kind === "cover") {
    const animations = [
      el.animate(
        [
          { clipPath: "inset(14% 0 0 0)", opacity: 0 },
          { clipPath: "inset(0 0 0 0)", opacity: 1 },
        ],
        { duration: 1100, delay, easing: EASE_OUT, fill: "backwards" },
      ),
    ];
    const img = el.querySelector("img");
    if (img) {
      animations.push(
        img.animate([{ transform: "scale(1.08)" }, { transform: "scale(1)" }], {
          duration: 1600,
          delay,
          easing: EASE_OUT,
          fill: "backwards",
        }),
      );
    }
    return animations;
  }
  const keyframes =
    kind === "fade"
      ? FADE_IN
      : [
          { opacity: 0, transform: "translateY(18px)" },
          { opacity: 1, transform: "none" },
        ];
  return [el.animate(keyframes, { duration: kind === "fade" ? 700 : 800, delay, easing: EASE_OUT, fill: "backwards" })];
}

/**
 * Anima los `[data-reveal]` de `root`: los que ya se ven entran escalonados
 * (después de `startDelay`); el resto, al aparecer al hacer scroll dentro de
 * `scroller`. Devuelve la limpieza (cancela animaciones y observador).
 */
export function revealContent(root: HTMLElement, scroller: HTMLElement, startDelay = 0): () => void {
  const items = [...root.querySelectorAll<HTMLElement>("[data-reveal]")];
  const animations: Animation[] = [];
  const STAGGER = 70;

  const observer = new IntersectionObserver(
    (entries) => {
      let batch = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        el.style.opacity = "";
        animations.push(...play(el, batch++ * STAGGER));
      }
    },
    { root: scroller, rootMargin: "0px 0px -6% 0px" },
  );

  const fold = scroller.getBoundingClientRect().bottom;
  let visible = 0;
  for (const el of items) {
    if (el.getBoundingClientRect().top < fold) {
      animations.push(...play(el, startDelay + visible++ * STAGGER));
    } else {
      // Oculto hasta que entre en pantalla (sin parpadeo: se fija antes del primer pintado).
      el.style.opacity = "0";
      observer.observe(el);
    }
  }

  return () => {
    observer.disconnect();
    animations.forEach((a) => a.cancel());
    items.forEach((el) => (el.style.opacity = ""));
  };
}
