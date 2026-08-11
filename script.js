/* ---------------- reveal on scroll ---------------- */
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 },
);
revealEls.forEach((el) => io.observe(el));

/* ---------------- nav shrink ---------------- */
const nav = document.getElementById("nav");
window.addEventListener(
  "scroll",
  () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  },
  { passive: true },
);

/* ---------------- image skeleton loader ----------------
   Every image frame keeps its shimmer forever unless a real
   data-src is supplied and successfully loads. */
document.querySelectorAll("[data-skeleton]").forEach((frame) => {
  const img = frame.querySelector("img");
  const src = img.getAttribute("data-src");
  if (!src) return; // no real photo yet — keep shimmering
  const loader = new Image();
  loader.onload = () => {
    img.src = src;
    img.classList.add("loaded");
    frame.style.animation = "none";
    frame.style.background = "transparent";
  };
  loader.onerror = () => {
    /* keep shimmering forever, never show broken icon */
  };
  loader.src = src;
});

/* ---------------- order selector ---------------- */
const opts = document.querySelectorAll(".order-opt");
const qtyVal = document.getElementById("qtyVal");
const orderTotal = document.getElementById("orderTotal");
let qty = 1;
let price = parseInt(opts[0].dataset.price, 10);

function fmt(n) {
  return n.toLocaleString("en-UG");
}
function updateTotal() {
  orderTotal.textContent = fmt(price * qty) + " UGX";
}

opts.forEach((opt) => {
  opt.addEventListener("click", () => {
    opts.forEach((o) => o.classList.remove("active"));
    opt.classList.add("active");
    price = parseInt(opt.dataset.price, 10);
    updateTotal();
  });
});
document.getElementById("qtyPlus").addEventListener("click", () => {
  qty++;
  qtyVal.textContent = qty;
  updateTotal();
});
document.getElementById("qtyMinus").addEventListener("click", () => {
  if (qty > 1) {
    qty--;
    qtyVal.textContent = qty;
    updateTotal();
  }
});
document.getElementById("checkoutBtn").addEventListener("click", () => {
  const productName = document.querySelector(".order-opt.active .name").textContent.trim();
  const details = `${productName} x${qty}\nTotal: ${fmt(price * qty)} UGX\n\nPlease confirm availability and provide delivery details (name, address/location, preferred delivery time).\n\nThank you!`;
  const modal = document.getElementById("checkoutModal");
  if (modal) {
    modal.querySelector(".order-summary").textContent = details;
    modal.classList.add("open");
  } else {
    // fallback if modal not present
    alert("Order:\n" + details);
  }
});

// Modal actions: open WhatsApp or mailto with prefilled message
const checkoutModal = document.getElementById("checkoutModal");
if (checkoutModal) {
  document.getElementById("checkoutWhatsapp").addEventListener("click", () => {
    const productName = document.querySelector(".order-opt.active .name").textContent.trim();
    const message = `${productName} x${qty}\nTotal: ${fmt(price * qty)} UGX\n\nPlease confirm availability and provide delivery details (name, address/location, preferred delivery time).\n\nThank you!`;
    const waUrl = "https://wa.me/256761270901?text=" + encodeURIComponent(message);
    window.open(waUrl, "_blank");
    checkoutModal.classList.remove("open");
  });

  document.getElementById("checkoutEmail").addEventListener("click", () => {
    const productName = document.querySelector(".order-opt.active .name").textContent.trim();
    const subject = "Order from Coffee Esiimwe";
    const body = `${productName} x${qty}\nTotal: ${fmt(price * qty)} UGX\n\nPlease confirm availability and provide delivery details (name, address/location, preferred delivery time).\n\nThank you!`;
    const mailto = "mailto:coffeeesiimwe@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    window.location.href = mailto;
    checkoutModal.classList.remove("open");
  });

  document.getElementById("checkoutCancel").addEventListener("click", () => {
    checkoutModal.classList.remove("open");
  });

  // clicking overlay closes modal
  checkoutModal.addEventListener("click", (e) => {
    if (e.target.classList.contains("checkout-modal") || e.target.classList.contains("checkout-overlay")) {
      checkoutModal.classList.remove("open");
    }
  });
}

/* ---------------- three.js realistic coffee bean ---------------- */
(function () {
  const canvas = document.getElementById("bean-canvas");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!window.THREE || !canvas) return;

  let width = canvas.clientWidth,
    height = canvas.clientHeight;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  if ("outputColorSpace" in renderer) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else if ("outputEncoding" in renderer) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
  camera.position.set(0, 0, 6.6);

  /* ---- studio lighting: key, fill, rim, ambient ---- */
  scene.add(new THREE.AmbientLight(0x40281a, 0.9));
  const key = new THREE.DirectionalLight(0xffdcaa, 2.4);
  key.position.set(3.2, 4.2, 5);
  scene.add(key);
  const fillLight = new THREE.DirectionalLight(0x9fb8ff, 0.45);
  fillLight.position.set(-3.5, 1.2, 2.4);
  scene.add(fillLight);
  const rim = new THREE.DirectionalLight(0xffb873, 1.6);
  rim.position.set(-3, -2.6, -4);
  scene.add(rim);
  const pointFill = new THREE.PointLight(0xffe6c2, 0.5, 20);
  pointFill.position.set(0, -3, 4);
  scene.add(pointFill);

  /* ---- tiny deterministic value-noise (no external deps) ---- */
  function hash3(x, y, z) {
    const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
    return s - Math.floor(s);
  }
  function noise3D(x, y, z) {
    const xi = Math.floor(x),
      yi = Math.floor(y),
      zi = Math.floor(z);
    const xf = x - xi,
      yf = y - yi,
      zf = z - zi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const w = zf * zf * (3 - 2 * zf);
    const lerp = (a, b, t) => a + (b - a) * t;
    const c000 = hash3(xi, yi, zi),
      c100 = hash3(xi + 1, yi, zi);
    const c010 = hash3(xi, yi + 1, zi),
      c110 = hash3(xi + 1, yi + 1, zi);
    const c001 = hash3(xi, yi, zi + 1),
      c101 = hash3(xi + 1, yi, zi + 1);
    const c011 = hash3(xi, yi + 1, zi + 1),
      c111 = hash3(xi + 1, yi + 1, zi + 1);
    const x00 = lerp(c000, c100, u),
      x10 = lerp(c010, c110, u);
    const x01 = lerp(c001, c101, u),
      x11 = lerp(c011, c111, u);
    const y0 = lerp(x00, x10, v),
      y1 = lerp(x01, x11, v);
    return lerp(y0, y1, w);
  }

  /* ---- procedural micro-surface maps: pores, wrinkles, oil sheen ---- */
  function makeSurfaceTextures(size) {
    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = bumpCanvas.height = size;
    const bctx = bumpCanvas.getContext("2d");
    const bimg = bctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size,
          v = y / size;
        const n =
          noise3D(u * 22, v * 22, 0) * 0.5 +
          noise3D(u * 55, v * 55, 8) * 0.3 +
          noise3D(u * 110, v * 110, 22) * 0.2;
        const val = Math.max(0, Math.min(255, Math.floor(n * 255)));
        const idx = (y * size + x) * 4;
        bimg.data[idx] = val;
        bimg.data[idx + 1] = val;
        bimg.data[idx + 2] = val;
        bimg.data[idx + 3] = 255;
      }
    }
    bctx.putImageData(bimg, 0, 0);
    const bumpTex = new THREE.CanvasTexture(bumpCanvas);
    bumpTex.wrapS = bumpTex.wrapT = THREE.RepeatWrapping;

    const roughCanvas = document.createElement("canvas");
    roughCanvas.width = roughCanvas.height = size;
    const rctx = roughCanvas.getContext("2d");
    const rimg = rctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size,
          v = y / size;
        const n =
          noise3D(u * 9 + 40, v * 9 + 40, 3) * 0.6 +
          noise3D(u * 30 + 40, v * 30 + 40, 12) * 0.4;
        const val = Math.max(0, Math.min(255, Math.floor(120 + n * 110)));
        const idx = (y * size + x) * 4;
        rimg.data[idx] = val;
        rimg.data[idx + 1] = val;
        rimg.data[idx + 2] = val;
        rimg.data[idx + 3] = 255;
      }
    }
    rctx.putImageData(rimg, 0, 0);
    const roughTex = new THREE.CanvasTexture(roughCanvas);
    roughTex.wrapS = roughTex.wrapT = THREE.RepeatWrapping;

    return { bumpTex, roughTex };
  }

  const beanGroup = new THREE.Group();
  scene.add(beanGroup);

  /* ---- sculpt a real coffee-bean shape out of a UV sphere ---- */
  const WSEG = 128,
    HSEG = 96;
  const geo = new THREE.SphereGeometry(1, WSEG, HSEG);
  const pos = geo.attributes.position;

  // fixed, natural-looking dent/blemish centers on the unit sphere
  const dents = [
    { x: 0.35, y: 0.55, z: 0.6, amp: 0.045, r2: 0.09 },
    { x: -0.5, y: -0.2, z: 0.65, amp: 0.035, r2: 0.07 },
    { x: 0.2, y: -0.7, z: -0.5, amp: 0.03, r2: 0.08 },
    { x: -0.4, y: 0.6, z: -0.55, amp: 0.025, r2: 0.06 },
    { x: 0.55, y: 0.05, z: -0.65, amp: 0.03, r2: 0.07 },
  ];

  const colors = new Float32Array(pos.count * 3);
  const darkC = new THREE.Color(0x2a150c);
  const midC = new THREE.Color(0x4c2c18);
  const liteC = new THREE.Color(0x6f4526);
  const tmpC = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const nx = pos.getX(i),
      ny = pos.getY(i),
      nz = pos.getZ(i);
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    const ux = nx / len,
      uy = ny / len,
      uz = nz / len;

    // taper the two ends instead of leaving them round
    const tt = Math.min(1, Math.abs(uy));
    const taper = 1 - 0.34 * Math.pow(tt, 3.3);

    // continuous width asymmetry between the two lobes (no hard seam)
    const widthMod =
      1 + 0.065 * ux + 0.03 * (noise3D(ux * 2 + 4, uy * 2, uz * 2) - 0.5);

    // plano-convex cross-section: flatter front face, rounder back
    let zScale;
    if (uz >= 0) {
      zScale = 0.3 + 0.11 * (1 - Math.pow(1 - uz, 2));
    } else {
      zScale = 0.6 + 0.04 * Math.pow(-uz, 2);
    }

    let X = ux * 0.68 * taper * widthMod;
    let Y = uy * 1.6;
    let Z = uz * zScale * taper;

    // gentle banana-curve bend along the length (kidney shape, not a mirror)
    X += 0.085 * Math.sin(Math.PI * uy);

    // deep center groove on the flat face, with irregular, uneven edges
    let creaseDepth = 0;
    if (uz > 0.02) {
      const d = Math.abs(ux);
      const edgeNoise = noise3D(uy * 4.4 + 30, ux * 3.1 + 5, 6) - 0.5;
      const gw = 0.15 * (1 + 0.4 * edgeNoise);
      const frontFactor = Math.min(1, (uz - 0.02) / 0.34);
      const depthNoise = 1 + 0.3 * (noise3D(uy * 6 + 2, 1, 9) - 0.5);
      creaseDepth =
        0.15 * Math.exp(-(d * d) / (gw * gw)) * frontFactor * depthNoise;
      Z -= creaseDepth;
      X -= Math.sign(ux) * creaseDepth * 0.12; // pinched crease lips
    }

    // fine organic wrinkle noise across the whole surface
    const n1 = noise3D(ux * 6 + 1, uy * 6 + 1, uz * 6 + 1) - 0.5;
    const n2 = noise3D(ux * 15 + 9, uy * 15 + 9, uz * 15 + 9) - 0.5;
    const wrinkle = n1 * 0.022 + n2 * 0.009;
    X += ux * wrinkle;
    Y += uy * wrinkle * 0.5;
    Z += uz * wrinkle;

    // a handful of scattered natural dents so the two halves aren't mirrored
    let dentSum = 0;
    for (const d of dents) {
      const dx = ux - d.x,
        dy = uy - d.y,
        dz = uz - d.z;
      const dist2 = dx * dx + dy * dy + dz * dz;
      dentSum += d.amp * Math.exp(-dist2 / d.r2);
    }
    X -= ux * dentSum;
    Y -= uy * dentSum;
    Z -= uz * dentSum;

    pos.setXYZ(i, X, Y, Z);

    // roast-mottled vertex color, darker in the crease and in dents
    const roastN = noise3D(ux * 3 + 100, uy * 3 + 100, uz * 3 + 100);
    tmpC.copy(darkC).lerp(liteC, roastN);
    tmpC.lerp(midC, 0.25);
    const shadowAmt = Math.min(1, creaseDepth * 5 + dentSum * 4);
    tmpC.multiplyScalar(1 - shadowAmt * 0.55);
    colors[i * 3] = tmpC.r;
    colors[i * 3 + 1] = tmpC.g;
    colors[i * 3 + 2] = tmpC.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const { bumpTex, roughTex } = makeSurfaceTextures(256);

  const mat = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.46,
    metalness: 0.04,
    clearcoat: 0.55,
    clearcoatRoughness: 0.3,
    bumpMap: bumpTex,
    bumpScale: 0.012,
    roughnessMap: roughTex,
    sheen: 1,
    sheenColor: new THREE.Color(0xb4894f),
  });
  const bean = new THREE.Mesh(geo, mat);
  beanGroup.add(bean);

  // soft contact shadow beneath the bean
  const shadowGeo = new THREE.CircleGeometry(1.5, 48);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.16,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.85;
  scene.add(shadow);

  /* ---- cursor-driven rotation, weighted easing, idle spin blend ---- */
  const baseY = 0.6;
  const restTiltX = 0.08;
  const maxTilt = 0.55;
  let targetX = restTiltX,
    targetY = baseY;
  let curX = 0,
    curY = 0.5;

  let lastMoveAt = 0;
  const idleDelay = 1400; // ms of stillness before idle spin resumes
  const idleSpeed = (Math.PI * 2) / (30 * 60); // ~1 full turn every 30s at 60fps

  function wrapAngle(a) {
    return (((a % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  }

  function onPointer(clientX, clientY) {
    const nx = (clientX / window.innerWidth) * 2 - 1;
    const ny = (clientY / window.innerHeight) * 2 - 1;
    targetY = baseY + nx * 1.05;
    targetX = ny * maxTilt;
    lastMoveAt = performance.now();
  }
  window.addEventListener("mousemove", (e) => onPointer(e.clientX, e.clientY), {
    passive: true,
  });
  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches[0]) onPointer(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true },
  );

  function animate() {
    requestAnimationFrame(animate);
    if (!reduceMotion) {
      const active = performance.now() - lastMoveAt <= idleDelay;
      const desiredX = active ? targetX : restTiltX;
      curX += (desiredX - curX) * 0.05;

      if (active) {
        const delta = wrapAngle(targetY - curY);
        curY += delta * 0.045;
      } else {
        curY += idleSpeed;
      }

      beanGroup.rotation.x = curX;
      beanGroup.rotation.y = curY;
      beanGroup.position.y = Math.sin(performance.now() * 0.0006) * 0.04;
    } else {
      beanGroup.rotation.x = restTiltX;
      beanGroup.rotation.y = baseY;
    }
    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  window.addEventListener("resize", onResize);
  onResize();
})();
