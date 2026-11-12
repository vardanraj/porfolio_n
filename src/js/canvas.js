/**
 * Canvas 2D Packet Network Background
 * Renders drifting nodes, proximity links, cursor repulsion, and travelling packets.
 * Automatically pauses when the tab is hidden or when reduced motion is preferred.
 */

export function initNetworkCanvas(prefersReducedMotion) {
  const canvas = document.getElementById('packet-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let nodes = [];
  let packets = [];
  let rafId = null;

  const pointer = { x: -9999, y: -9999, active: false };
  const CONFIG = {
    linkDistance: 165,
    repelRadius: 145,
    repelStrength: 2.2,
    maxPackets: 18,
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createNodes();
  }

  function createNodes() {
    // Scale node count with viewport area while keeping frame budget light
    const targetCount = Math.min(72, Math.max(26, Math.floor((width * height) / 22000)));
    nodes = Array.from({ length: targetCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.36,
      vy: (Math.random() - 0.5) * 0.36,
      radius: Math.random() > 0.85 ? 2.4 : 1.5,
      isAccent: Math.random() > 0.88,
    }));
    packets = [];
  }

  function spawnPacket(links) {
    if (links.length === 0 || packets.length >= CONFIG.maxPackets) return;
    const link = links[Math.floor(Math.random() * links.length)];
    packets.push({
      from: link.a,
      to: link.b,
      t: 0,
      speed: 0.012 + Math.random() * 0.016,
      accent: Math.random() > 0.35,
    });
  }

  function step(animate = true) {
    ctx.clearRect(0, 0, width, height);

    if (animate) {
      for (const n of nodes) {
        if (pointer.active) {
          const dx = n.x - pointer.x;
          const dy = n.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < CONFIG.repelRadius) {
            const force = (1 - dist / CONFIG.repelRadius) * CONFIG.repelStrength;
            n.x += (dx / dist) * force;
            n.y += (dy / dist) * force;
          }
        }

        n.x += n.vx;
        n.y += n.vy;

        // Soft wrap around edges
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }
    }

    // Collect and draw active links
    const links = [];
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < CONFIG.linkDistance) {
          const alpha = (1 - dist / CONFIG.linkDistance) * 0.28;
          ctx.strokeStyle = `rgba(244, 244, 240, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          links.push({ a, b });
        }
      }
    }

    // Draw nodes
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = n.isAccent ? 'rgba(255, 75, 31, 0.85)' : 'rgba(244, 244, 240, 0.55)';
      ctx.fill();
    }

    // Update & draw packets travelling along links
    if (animate) {
      if (Math.random() < 0.12) spawnPacket(links);

      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.speed;
        const linkDist = Math.hypot(p.from.x - p.to.x, p.from.y - p.to.y);

        if (p.t >= 1 || linkDist > CONFIG.linkDistance * 1.2) {
          packets.splice(i, 1);
          continue;
        }

        const px = p.from.x + (p.to.x - p.from.x) * p.t;
        const py = p.from.y + (p.to.y - p.from.y) * p.t;

        ctx.beginPath();
        ctx.arc(px, py, p.accent ? 2.3 : 1.7, 0, Math.PI * 2);
        ctx.fillStyle = p.accent ? '#ff4b1f' : '#f4f4f0';
        ctx.fill();
      }
    }
  }

  function loop() {
    if (document.hidden) {
      rafId = null;
      return;
    }
    step(true);
    rafId = requestAnimationFrame(loop);
  }

  function handleVisibility() {
    if (prefersReducedMotion) return;
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!rafId) {
      rafId = requestAnimationFrame(loop);
    }
  }

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', handleVisibility);

  if (!prefersReducedMotion) {
    window.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType === 'touch') return;
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.active = true;
      },
      { passive: true }
    );
    window.addEventListener('pointerleave', () => {
      pointer.active = false;
    });
  }

  resize();
  if (prefersReducedMotion) {
    step(false);
  } else {
    loop();
  }
}
