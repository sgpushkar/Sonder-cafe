import { createFileRoute } from "@tanstack/react-router";
import { CloudRain, Headphones, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import cafeHero from "@/assets/cafe-hero.jpg";
import menuBg from "@/assets/menu-bg.jpg";
import menuLatte from "@/assets/menu-latte.jpg";
import menuCroissant from "@/assets/menu-croissant.jpg";
import momentWindow from "@/assets/moment-window.jpg";
import momentCups from "@/assets/moment-cups.jpg";
import momentUmbrella from "@/assets/moment-umbrella.jpg";
import momentNotebook from "@/assets/moment-notebook.jpg";

const siteUrl = (
  import.meta.env.VITE_SITE_URL || "https://sonder-cafe.vercel.app"
).replace(/\/$/, "");
const cafeHeroUrl = `${siteUrl}${cafeHero.startsWith("/") ? cafeHero : `/${cafeHero}`}`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sonder Cafe | Slow Coffee, Croissants & Rainy Afternoons" },
      {
        name: "description",
        content:
          "Visit Sonder Cafe in Bandra for slow coffee, masala chai, honey croissants, bakery bites, and a quiet rainy-day atmosphere. Open 7 am - 11 pm daily.",
      },
      {
        property: "og:title",
        content: "Sonder Cafe | Slow Coffee in Bandra, Mumbai",
      },
      {
        property: "og:description",
        content:
          "Slow coffee, soft mornings, honey croissants, and the sound of rain on glass.",
      },
      { property: "og:image", content: cafeHeroUrl },
      {
        property: "og:image:alt",
        content: "Sonder Cafe interior at night through a rain-streaked window",
      },
      { name: "twitter:title", content: "Sonder Cafe | Stay a little longer" },
      {
        name: "twitter:description",
        content:
          "A quiet Bandra cafe for slow coffee, tea, croissants, and rainy afternoons.",
      },
      { name: "twitter:image", content: cafeHeroUrl },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: siteUrl }],
  }),
  component: Index,
});

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" },
    );
    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // If already in or above viewport on mount, reveal immediately
      if (rect.top < window.innerHeight) {
        el.classList.add("visible");
      } else {
        io.observe(el);
      }
    });

    const storyIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.2 },
    );
    document
      .querySelectorAll(".story-inner")
      .forEach((el) => storyIo.observe(el));

    return () => {
      io.disconnect();
      storyIo.disconnect();
    };
  }, []);
}

function useRain(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drops = Array.from({ length: 140 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      len: Math.random() * 18 + 6,
      speed: Math.random() * 1.6 + 0.7,
      opacity: Math.random() * 0.22 + 0.05,
      width: Math.random() * 0.9 + 0.3,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * 0.18, d.y + d.len);
        ctx.strokeStyle = `rgba(220,210,195,${d.opacity})`;
        ctx.lineWidth = d.width;
        ctx.stroke();
        d.y += d.speed;
        d.x -= d.speed * 0.12;
        if (d.y > canvas.height + 20) {
          d.y = -20;
          d.x = Math.random() * canvas.width;
        }
      });
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [canvasRef]);
}

function useAmbient() {
  const [active, setActive] = useState<"rain" | "lofi" | "silence">("silence");
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  const stop = () => {
    nodesRef.current.forEach((n) => {
      try {
        (n as AudioScheduledSourceNode).stop?.();
      } catch {
        // Some audio nodes may already be stopped; ignore browser-specific stop errors.
      }
    });
    nodesRef.current = [];
  };

  const play = (mode: "rain" | "lofi" | "silence") => {
    stop();
    setActive(mode);
    if (mode === "silence") return;
    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctxRef.current = new Ctx();
    }
    const audio = ctxRef.current!;
    if (mode === "rain") {
      const bufferSize = audio.sampleRate * 2;
      const buf = audio.createBuffer(1, bufferSize, audio.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufferSize; i++)
        data[i] = (Math.random() * 2 - 1) * 0.28;
      const src = audio.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const bp1 = audio.createBiquadFilter();
      bp1.type = "bandpass";
      bp1.frequency.value = 1800;
      bp1.Q.value = 0.4;
      const bp2 = audio.createBiquadFilter();
      bp2.type = "highpass";
      bp2.frequency.value = 800;
      const gain = audio.createGain();
      gain.gain.value = 0.18;
      src.connect(bp1).connect(bp2).connect(gain).connect(audio.destination);
      src.start();
      nodesRef.current = [src];
    } else if (mode === "lofi") {
      const o1 = audio.createOscillator();
      o1.type = "sine";
      o1.frequency.value = 130;
      const o2 = audio.createOscillator();
      o2.type = "sine";
      o2.frequency.value = 195;
      const g1 = audio.createGain();
      g1.gain.value = 0.04;
      const g2 = audio.createGain();
      g2.gain.value = 0.025;
      o1.connect(g1).connect(audio.destination);
      o2.connect(g2).connect(audio.destination);
      o1.start();
      o2.start();
      nodesRef.current = [o1, o2];
    }
  };

  useEffect(() => () => stop(), []);
  return { active, play };
}

const menuCategories: {
  title: string;
  subtitle: string;
  items: { name: string; mood: string; desc: string; price: string }[];
}[] = [
  {
    title: "Coffee & Espresso",
    subtitle: "Pulled slow, served slower",
    items: [
      {
        name: "Midnight Latte",
        mood: "For quiet thoughts",
        desc: "Dark espresso, steamed oat milk, and a whisper of vanilla bean. Best ordered when you have nowhere else to be.",
        price: "Rs. 280",
      },
      {
        name: "Cortado",
        mood: "Short, honest",
        desc: "Two parts espresso, two parts warm milk. Nothing hidden, nothing extra.",
        price: "Rs. 220",
      },
      {
        name: "Cold Brew Float",
        mood: "Afternoon drift",
        desc: "18-hour cold brew, a scoop of vanilla ice cream, and the lazy understanding that productivity is overrated.",
        price: "Rs. 310",
      },
      {
        name: "Mocha Noir",
        mood: "Slightly bitter, mostly sweet",
        desc: "Single-origin espresso, dark Belgian chocolate, oat milk foam.",
        price: "Rs. 320",
      },
      {
        name: "Affogato",
        mood: "Dessert in disguise",
        desc: "A double shot poured over slow-churned vanilla. Eat it before it forgets itself.",
        price: "Rs. 290",
      },
      {
        name: "Saffron Cardamom Latte",
        mood: "Grandmother's kitchen",
        desc: "Steamed milk, a thread of Kashmiri saffron, crushed green cardamom. Tastes like memory.",
        price: "Rs. 340",
      },
    ],
  },
  {
    title: "Tea & Tisanes",
    subtitle: "Steeped long, sipped longer",
    items: [
      {
        name: "Fog Earl Grey",
        mood: "For old letters & nostalgia",
        desc: "Bergamot and cream, steeped long. Like reading something you wrote five years ago and almost understanding it.",
        price: "Rs. 240",
      },
      {
        name: "Masala Chai",
        mood: "Monsoon companion",
        desc: "Assam leaves, fresh ginger, peppercorn, clove. Boiled the way it's supposed to be.",
        price: "Rs. 180",
      },
      {
        name: "Chamomile Honey",
        mood: "Before sleep, after rain",
        desc: "Egyptian chamomile flowers and a slow drizzle of forest honey.",
        price: "Rs. 220",
      },
      {
        name: "Rose Oolong",
        mood: "Quiet conversations",
        desc: "Half-oxidised oolong with Bulgarian rose petals. Floral without trying too hard.",
        price: "Rs. 260",
      },
    ],
  },
  {
    title: "Bakery & Bites",
    subtitle: "Made each morning, finished by night",
    items: [
      {
        name: "Honey Croissant",
        mood: "Soft mornings",
        desc: "Butter-laminated layers with wildflower honey and a light dusting of cardamom. It crumbles in the best way.",
        price: "Rs. 190",
      },
      {
        name: "Brown Butter Toast",
        mood: "Simple, unhurried",
        desc: "Sourdough, browned butter, a fleck of sea salt. The kind of thing you eat slowly without noticing.",
        price: "Rs. 160",
      },
      {
        name: "Almond Financier",
        mood: "Tea's best friend",
        desc: "Brown butter, ground almond, a golden crust that gives way to something tender.",
        price: "Rs. 170",
      },
      {
        name: "Dark Chocolate Babka",
        mood: "Worth the mess",
        desc: "Sweet brioche braided with 70% chocolate. Pulls apart in long, lazy ribbons.",
        price: "Rs. 230",
      },
      {
        name: "Olive & Feta Scone",
        mood: "Salty, savoury",
        desc: "Kalamata olives, crumbled feta, fresh thyme. Best with a strong black coffee.",
        price: "Rs. 210",
      },
      {
        name: "Cardamom Banana Bread",
        mood: "Afternoon slump fix",
        desc: "Overripe bananas, brown sugar, green cardamom. Toasted, with a knob of butter.",
        price: "Rs. 180",
      },
    ],
  },
];

const featuredMenuItems = menuCategories[0].items.slice(0, 3);

const moments = [
  {
    img: momentWindow,
    caption:
      "Someone stayed here for 3 hours.\nThey left a napkin with a poem on it.",
  },
  {
    img: momentCups,
    caption: "A proposal. She said yes.\nWe gave them the croissants for free.",
  },
  {
    img: momentUmbrella,
    caption: "A stranger shared an umbrella.\nThey became regulars after that.",
  },
  {
    img: momentNotebook,
    caption:
      "She finished her thesis here.\nThe latte went cold. She didn't notice.",
  },
];

function Index() {
  const rainRef = useRef<HTMLCanvasElement | null>(null);
  useRain(rainRef);
  useReveal();
  const { active, play } = useAmbient();

  return (
    <main className="cafe-root">
      {/* Site-wide ambient particles (embers/dust) */}
      <div className="ambient-particles" aria-hidden="true">
        {Array.from({ length: 22 }).map((_, i) => (
          <span key={i} className={`particle p-${i}`} />
        ))}
      </div>
      {/* Slow drifting gradient wash behind everything */}
      <div className="ambient-wash" aria-hidden="true" />

      {/* AMBIENT BAR */}
      <div className="ambient-bar" aria-label="Ambient sound">
        <button
          className={`amb-btn ${active === "rain" ? "active" : ""}`}
          onClick={() => play("rain")}
          title="Rain"
          aria-label="Rain sound"
        >
          <CloudRain aria-hidden="true" size={17} strokeWidth={1.8} />
        </button>
        <button
          className={`amb-btn ${active === "lofi" ? "active" : ""}`}
          onClick={() => play("lofi")}
          title="Lo-fi"
          aria-label="Lo-fi sound"
        >
          <Headphones aria-hidden="true" size={17} strokeWidth={1.8} />
        </button>
        <button
          className={`amb-btn ${active === "silence" ? "active" : ""}`}
          onClick={() => play("silence")}
          title="Silence"
          aria-label="Silence"
        >
          <VolumeX aria-hidden="true" size={17} strokeWidth={1.8} />
        </button>
      </div>

      {/* HERO */}
      <section className="cafe-hero">
        <img
          src={cafeHero}
          alt="Sonder Cafe interior at night, viewed through a rain-streaked window"
          className="cafe-hero-img"
          width={1920}
          height={1280}
        />
        <div className="cafe-hero-vignette" />
        <canvas ref={rainRef} className="cafe-rain-canvas" />
        <div className="glass-pane" />

        <div className="steam-wrap">
          <div className="steam" />
          <div className="steam" />
          <div className="steam" />
        </div>

        <div className="hero-text">
          <div className="hero-eyebrow">Sonder Cafe / Est. 2019</div>
          <h1 className="hero-tagline">Stay a little longer.</h1>
          <div className="hero-sub">
            Slow coffee / Soft mornings / Rainy afternoons
          </div>
        </div>

        <div className="scroll-cue">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* MENU */}
      <section className="cafe-section menu" id="menu">
        <div className="section-label reveal">On the Menu</div>
        <h2 className="section-title reveal">Drinks &amp; Things</h2>

        {/* featured cards with images */}
        <div className="feature-grid">
          <article className="feature-card reveal">
            <div className="feature-card-img-wrap">
              <img
                src={menuLatte}
                alt="Steaming latte with delicate latte art on a dark wooden table"
                className="feature-card-img"
                loading="lazy"
                width={1024}
                height={1024}
              />
            </div>
            <div className="feature-card-body">
              <div className="feature-card-mood">For quiet thoughts</div>
              <h3 className="feature-card-name">Midnight Latte</h3>
              <p className="feature-card-desc">
                Dark espresso, steamed oat milk, a whisper of vanilla bean -
                best ordered when you have nowhere else to be.
              </p>
            </div>
          </article>

          <article className="feature-card reveal">
            <div className="feature-card-img-wrap">
              <img
                src={menuCroissant}
                alt="Golden flaky croissant drizzled with wildflower honey"
                className="feature-card-img"
                loading="lazy"
                width={1024}
                height={1024}
              />
            </div>
            <div className="feature-card-body">
              <div className="feature-card-mood">Soft mornings</div>
              <h3 className="feature-card-name">Honey Croissant</h3>
              <p className="feature-card-desc">
                Butter-laminated layers, wildflower honey, a light dust of
                cardamom. It crumbles in the best way.
              </p>
            </div>
          </article>

          <article className="feature-card reveal">
            <div className="feature-card-img-wrap">
              <img
                src={menuBg}
                alt="Warmly lit espresso bar with hanging Edison bulbs"
                className="feature-card-img"
                loading="lazy"
                width={1536}
                height={1024}
              />
            </div>
            <div className="feature-card-body">
              <div className="feature-card-mood">Behind the bar</div>
              <h3 className="feature-card-name">Single Origin Espresso</h3>
              <p className="feature-card-desc">
                Pulled slow on a vintage lever machine. Sweet, dense, the kind
                of shot that makes you pause mid-sentence.
              </p>
            </div>
          </article>
        </div>

        {menuCategories.map((cat) => (
          <div className="menu-category" key={cat.title}>
            <div className="menu-cat-head reveal">
              <div className="menu-cat-rule" />
              <div className="menu-cat-text">
                <h3 className="menu-cat-title">{cat.title}</h3>
                <div className="menu-cat-sub">{cat.subtitle}</div>
              </div>
              <div className="menu-cat-rule" />
            </div>
            <div className="menu-grid">
              {cat.items.map((m) => (
                <div className="menu-card reveal" key={m.name}>
                  <div className="item-name">{m.name}</div>
                  <div className="item-mood">{m.mood}</div>
                  <div className="item-desc">{m.desc}</div>
                  <div className="item-price">{m.price}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* STORY */}
      <section className="story-section" id="story">
        {[
          {
            cls: "morning",
            time: "5:40 am",
            quote: '"Morning begins with silence."',
            detail:
              "Before the city wakes. Before the noise arrives. Just the sound of the kettle, and light still deciding what color to be.",
          },
          {
            cls: "afternoon",
            time: "8:15 am",
            quote: '"Afternoons smell like coffee."',
            detail:
              "Someone orders the same thing every day. We never ask why. There's a chair by the window that holds the warmth longer than the others.",
          },
          {
            cls: "evening",
            time: "3:30 pm",
            quote: '"The rain knows how to keep a secret."',
            detail:
              "People come in to wait. Then they stay. The sound of rain on glass is a very particular kind of company.",
          },
          {
            cls: "night",
            time: "10:50 pm",
            quote: '"Nights belong to thoughts."',
            detail:
              "The last table stays till we close. They never say goodbye - just slip out like a sentence that didn't need an ending.",
          },
        ].map((s) => (
          <div className={`story-block ${s.cls}`} key={s.time}>
            <div className="story-inner">
              <div className="story-time">{s.time}</div>
              <div className="story-quote">{s.quote}</div>
              <div className="story-detail">{s.detail}</div>
              <div className="story-ornament" />
            </div>
          </div>
        ))}
      </section>

      {/* MOMENTS */}
      <section className="cafe-section moments" id="moments">
        <div className="section-label reveal">Moments</div>
        <h2 className="section-title reveal">Things that happened here</h2>

        <div className="polaroid-grid">
          {moments.map((m, i) => (
            <figure className="polaroid reveal" key={i}>
              <div className="polaroid-img">
                <img
                  src={m.img}
                  alt={m.caption}
                  loading="lazy"
                  width={768}
                  height={768}
                />
              </div>
              <figcaption className="polaroid-caption">
                {m.caption.split("\n").map((line, idx) => (
                  <span key={idx}>
                    {line}
                    {idx === 0 && <br />}
                  </span>
                ))}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* VISIT */}
      <section className="cafe-section visit" id="visit">
        <div className="section-label reveal">Find Us</div>
        <h2 className="section-title reveal">Come As You Are</h2>

        <div className="visit-inner reveal">
          <div className="visit-info">
            <div className="info-row">
              <span className="info-label">Address</span>
              <span className="info-val">12 Bandra Lane, Mumbai</span>
            </div>
            <div className="info-row">
              <span className="info-label">Hours</span>
              <span className="info-val">7 am - 11 pm, every day</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone</span>
              <span className="info-val">+91 98200 00000</span>
            </div>
            <div className="info-row">
              <span className="info-label">Wi-Fi</span>
              <span className="info-val">Always on, no password</span>
            </div>
          </div>

          <div className="mini-map-wrap" aria-hidden="true">
            <div className="map-bg">
              <svg width="320" height="180" viewBox="0 0 320 180">
                <line
                  x1="0"
                  y1="90"
                  x2="320"
                  y2="90"
                  stroke="oklch(0.68 0.13 60)"
                  strokeWidth="1.5"
                />
                <line
                  x1="160"
                  y1="0"
                  x2="160"
                  y2="180"
                  stroke="oklch(0.68 0.13 60)"
                  strokeWidth="1.5"
                />
                <line
                  x1="0"
                  y1="45"
                  x2="320"
                  y2="45"
                  stroke="oklch(0.52 0.06 60)"
                  strokeWidth="0.5"
                />
                <line
                  x1="0"
                  y1="135"
                  x2="320"
                  y2="135"
                  stroke="oklch(0.52 0.06 60)"
                  strokeWidth="0.5"
                />
                <line
                  x1="80"
                  y1="0"
                  x2="80"
                  y2="180"
                  stroke="oklch(0.52 0.06 60)"
                  strokeWidth="0.5"
                />
                <line
                  x1="240"
                  y1="0"
                  x2="240"
                  y2="180"
                  stroke="oklch(0.52 0.06 60)"
                  strokeWidth="0.5"
                />
                <rect
                  x="50"
                  y="55"
                  width="60"
                  height="30"
                  fill="oklch(0.22 0.03 55)"
                />
                <rect
                  x="130"
                  y="100"
                  width="80"
                  height="40"
                  fill="oklch(0.22 0.03 55)"
                />
                <rect
                  x="220"
                  y="50"
                  width="50"
                  height="50"
                  fill="oklch(0.22 0.03 55)"
                />
              </svg>
              <div className="map-pin" />
            </div>
          </div>
        </div>
      </section>

      <footer className="cafe-footer">
        (c) 2026 Sonder Cafe / Made with silence and strong coffee
      </footer>
    </main>
  );
}
