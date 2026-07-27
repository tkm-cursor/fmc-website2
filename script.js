(function () {
  "use strict";

  const body = document.body;
  const header = document.getElementById("site-header");
  const menuButton = document.getElementById("menu-button");
  const navigation = document.getElementById("site-navigation");
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function finishLoading() {
    window.setTimeout(function () {
      body.classList.add("is-ready");
    }, reduceMotion.matches ? 0 : 920);
  }

  if (document.readyState === "complete") {
    finishLoading();
  } else {
    window.addEventListener("load", finishLoading, { once: true });
  }

  function closeMenu() {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
    header.classList.remove("menu-active");
    body.classList.remove("menu-open");
  }

  if (menuButton && navigation) {
    menuButton.addEventListener("click", function () {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      navigation.classList.toggle("is-open", !isOpen);
      header.classList.toggle("menu-active", !isOpen);
      body.classList.toggle("menu-open", !isOpen);
    });

    navigation.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  let ticking = false;

  function updateScrollState() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(scrollTop / scrollable, 0), 1);

    document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
    if (header) header.classList.toggle("is-scrolled", scrollTop > 12);
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollState);
      ticking = true;
    }
  }, { passive: true });

  updateScrollState();

  const revealElements = document.querySelectorAll(".reveal");

  if (!reduceMotion.matches && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const siblings = entry.target.parentElement
          ? Array.from(entry.target.parentElement.children).filter(function (element) {
            return element.classList.contains("reveal");
          })
          : [];
        const index = Math.max(siblings.indexOf(entry.target), 0);
        entry.target.style.transitionDelay = Math.min(index * 90, 270) + "ms";
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach(function (element) {
      element.classList.add("is-visible");
    });
  }

  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const requiredFields = Array.from(contactForm.querySelectorAll("[required]"));
      let firstInvalid = null;

      requiredFields.forEach(function (field) {
        const isCheckbox = field.type === "checkbox";
        const isValid = isCheckbox ? field.checked : field.value.trim() !== "" && field.checkValidity();
        field.setAttribute("aria-invalid", String(!isValid));
        if (!isValid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        formStatus.textContent = "必須項目をご確認ください。";
        firstInvalid.focus();
        return;
      }

      formStatus.textContent = "ありがとうございます。送信機能は現在準備中です。接続後、この内容を送信できるようになります。";
    });

    contactForm.addEventListener("input", function (event) {
      const field = event.target;
      if (field.matches("[required]")) field.removeAttribute("aria-invalid");
    });

    contactForm.addEventListener("change", function (event) {
      const field = event.target;
      if (field.matches("[required]")) field.removeAttribute("aria-invalid");
    });
  }

  function initWebGLHero() {
    const canvas = document.getElementById("hero-canvas");
    const hero = canvas ? canvas.closest(".hero") : null;

    if (!canvas || !hero || reduceMotion.matches || window.innerWidth < 768) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power"
    });

    if (!gl) return;

    const vertexSource = [
      "attribute vec2 a_position;",
      "void main() {",
      "  gl_Position = vec4(a_position, 0.0, 1.0);",
      "}"
    ].join("\n");

    const fragmentSource = [
      "precision mediump float;",
      "uniform vec2 u_resolution;",
      "uniform vec2 u_mouse;",
      "uniform float u_time;",
      "float ring(vec2 uv, vec2 center, float radius, float width) {",
      "  float d = abs(length(uv - center) - radius);",
      "  return 1.0 - smoothstep(width, width + 0.003, d);",
      "}",
      "float dotShape(vec2 uv, vec2 center, float radius) {",
      "  return 1.0 - smoothstep(radius, radius + 0.003, length(uv - center));",
      "}",
      "void main() {",
      "  vec2 uv = gl_FragCoord.xy / u_resolution.xy;",
      "  uv.x *= u_resolution.x / u_resolution.y;",
      "  vec2 mouse = u_mouse;",
      "  mouse.x *= u_resolution.x / u_resolution.y;",
      "  float t = u_time * 0.09;",
      "  vec2 c1 = vec2(1.02, 0.56) + vec2(sin(t) * 0.018, cos(t * 0.7) * 0.014);",
      "  vec2 c2 = vec2(0.82, 0.44) + (mouse - vec2(0.78, 0.48)) * 0.055;",
      "  float r1 = ring(uv, c1, 0.43, 0.005);",
      "  float r2 = ring(uv, c2, 0.205, 0.003);",
      "  float r3 = ring(uv, vec2(1.12, 0.36), 0.30, 0.004);",
      "  float wave = sin((uv.x * 5.4) + t * 2.0) * 0.010;",
      "  float waveLine = 1.0 - smoothstep(0.002, 0.005, abs(uv.y - (0.22 + wave)));",
      "  float d1 = dotShape(uv, c2 + vec2(-0.12, 0.15), 0.009);",
      "  float d2 = dotShape(uv, c1 + vec2(-0.20, -0.25), 0.010);",
      "  float d3 = dotShape(uv, vec2(1.05, 0.56), 0.008);",
      "  vec3 sky = vec3(0.380, 0.800, 0.914);",
      "  vec3 sea = vec3(0.141, 0.675, 0.831);",
      "  vec3 leaf = vec3(0.329, 0.776, 0.537);",
      "  vec3 sun = vec3(1.0, 0.765, 0.102);",
      "  vec3 color = sky * r1 * 0.8;",
      "  color += sea * r2 * 0.72;",
      "  color += leaf * r3 * 0.62;",
      "  color += sky * waveLine * 0.58;",
      "  color += sun * d1 * 0.95;",
      "  color += leaf * d2 * 0.86;",
      "  color += sky * d3 * 0.9;",
      "  float alpha = clamp(r1 * 0.72 + r2 * 0.68 + r3 * 0.56 + waveLine * 0.5 + d1 + d2 + d3, 0.0, 0.9);",
      "  gl_FragColor = vec4(color, alpha);",
      "}"
    ].join("\n");

    function createShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const mouseLocation = gl.getUniformLocation(program, "u_mouse");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const mouse = { x: 0.78, y: 0.48 };
    let animationFrame = null;
    let visible = true;
    const startedAt = performance.now();

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      const width = Math.max(1, Math.floor(hero.clientWidth * ratio));
      const height = Math.max(1, Math.floor(hero.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    }

    function render(now) {
      if (!visible) {
        animationFrame = null;
        return;
      }

      resize();
      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, mouse.x, mouse.y);
      gl.uniform1f(timeLocation, (now - startedAt) / 1000);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrame = window.requestAnimationFrame(render);
    }

    hero.addEventListener("pointermove", function (event) {
      const rect = hero.getBoundingClientRect();
      mouse.x = (event.clientX - rect.left) / rect.width;
      mouse.y = 1 - ((event.clientY - rect.top) / rect.height);
    }, { passive: true });

    const visibilityObserver = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && animationFrame === null) animationFrame = window.requestAnimationFrame(render);
    }, { threshold: 0 });

    visibilityObserver.observe(hero);
    hero.classList.add("has-webgl");
    animationFrame = window.requestAnimationFrame(render);
  }

  initWebGLHero();
}());
