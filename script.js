(() => {
  const nodes = document.querySelectorAll(".timeline-node[data-target]");

  const clearActive = () => {
    document.querySelectorAll(".timeline-node.is-active").forEach((element) => {
      element.classList.remove("is-active");
    });
    document.querySelectorAll(".key-term.is-active").forEach((element) => {
      element.classList.remove("is-active");
    });
  };

  const activateByKey = (key) => {
    if (!key) return;
    document.querySelectorAll(`.timeline-node[data-key="${key}"]`).forEach((element) => {
      element.classList.add("is-active");
    });
    document.querySelectorAll(`.key-term[data-key="${key}"]`).forEach((element) => {
      element.classList.add("is-active");
    });
  };

  const scrollToTarget = (selector) => {
    const target = document.querySelector(selector);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const targetTop = window.scrollY + rect.top;
    const header = document.querySelector(".site-header");
    const headerHeight = header ? header.offsetHeight : 0;
    const desiredTop = targetTop - window.innerHeight * 0.38 - headerHeight * 0.5;

    window.scrollTo({
      top: Math.max(desiredTop, 0),
      behavior: "smooth"
    });
  };

  nodes.forEach((node) => {
    const selector = node.getAttribute("data-target");
    const key = node.getAttribute("data-key");
    if (!selector) return;

    node.addEventListener("click", () => {
      clearActive();
      activateByKey(key);
      scrollToTarget(selector);
    });

    node.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      clearActive();
      activateByKey(key);
      scrollToTarget(selector);
    });
  });

  const timelineItems = document.querySelectorAll(".vertical-timeline-item");
  const timelineToggles = document.querySelectorAll(".timeline-toggle");

  const collapseItem = (item) => {
    item.classList.remove("is-expanded");
    const toggle = item.querySelector(".timeline-toggle");
    const extra = item.querySelector(".timeline-extra");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
    if (extra) {
      extra.hidden = true;
    }
  };

  const expandItem = (item) => {
    item.classList.add("is-expanded");
    const toggle = item.querySelector(".timeline-toggle");
    const extra = item.querySelector(".timeline-extra");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
    }
    if (extra) {
      extra.hidden = false;
    }
  };

  timelineToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const parentItem = toggle.closest(".vertical-timeline-item");
      if (!parentItem) return;
      const isExpanded = parentItem.classList.contains("is-expanded");

      timelineItems.forEach((item) => {
        if (item !== parentItem) {
          collapseItem(item);
        }
      });

      if (isExpanded) {
        collapseItem(parentItem);
      } else {
        expandItem(parentItem);
      }
    });
  });

  const galleries = document.querySelectorAll(".timeline-gallery");

  galleries.forEach((gallery) => {
    const slides = Array.from(gallery.querySelectorAll(".timeline-gallery-slide"));
    const prevButton = gallery.querySelector(".timeline-gallery-prev");
    const nextButton = gallery.querySelector(".timeline-gallery-next");
    const count = gallery.querySelector(".timeline-gallery-count");
    let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));

    if (slides.length === 0) return;
    if (activeIndex < 0) {
      activeIndex = 0;
    }

    const isSingleSlide = slides.length <= 1;
    gallery.classList.toggle("is-single", isSingleSlide);
    if (prevButton) {
      prevButton.hidden = isSingleSlide;
    }
    if (nextButton) {
      nextButton.hidden = isSingleSlide;
    }
    if (count) {
      count.hidden = isSingleSlide;
    }

    const updateGallery = () => {
      slides.forEach((slide, index) => {
        slide.classList.toggle("is-active", index === activeIndex);
      });
      if (count) {
        count.textContent = `${activeIndex + 1} / ${slides.length}`;
      }
    };

    prevButton?.addEventListener("click", () => {
      activeIndex = (activeIndex - 1 + slides.length) % slides.length;
      updateGallery();
    });

    nextButton?.addEventListener("click", () => {
      activeIndex = (activeIndex + 1) % slides.length;
      updateGallery();
    });

    updateGallery();
  });

  const profileToggles = document.querySelectorAll(".profile-toggle");
  const audioButtons = document.querySelectorAll(".profile-audio-button[data-audio-target]");

  profileToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.getAttribute("aria-controls");
      const target = targetId ? document.getElementById(targetId) : null;
      if (!target) return;

      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      const collapsedLabel = toggle.dataset.collapsedLabel || "⌗ 展开查看图片集";
      const expandedLabel = toggle.dataset.expandedLabel || "⌗ 收起图片集";
      toggle.setAttribute("aria-expanded", String(!isExpanded));
      toggle.textContent = isExpanded ? collapsedLabel : expandedLabel;
      target.hidden = isExpanded;
    });
  });

  audioButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-audio-target");
      const audio = targetId ? document.getElementById(targetId) : null;
      if (!audio) return;

      if (audio.paused) {
        audioButtons.forEach((otherButton) => {
          const otherId = otherButton.getAttribute("data-audio-target");
          const otherAudio = otherId ? document.getElementById(otherId) : null;
          if (otherAudio && otherAudio !== audio) {
            otherAudio.pause();
          }
        });
        audio.play().catch(() => {
          // Audio files may be missing while local interview clips are still being prepared.
        });
      } else {
        audio.pause();
      }
    });
  });
})();

// 导航栏当前章节高亮
(function () {
  const nav = document.querySelector(".anchor-nav");
  const navLinks = document.querySelectorAll(".anchor-nav a");
  const sections = Array.from(navLinks)
    .map((link) => {
      const href = link.getAttribute("href");
      const id = href?.startsWith("#") ? href.slice(1) : "";
      return { link, section: document.getElementById(id) };
    })
    .filter((item) => item.section);

  if (sections.length === 0) return;

  const setActiveLink = (activeLink) => {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link === activeLink);
    });
  };

  const updateActiveSection = () => {
    const navOffset = nav ? nav.offsetHeight + 24 : 0;
    const readingLine = window.scrollY + navOffset + window.innerHeight * 0.32;
    let active = sections[0];

    sections.forEach((item) => {
      if (item.section.offsetTop <= readingLine) {
        active = item;
      }
    });

    setActiveLink(active.link);
  };

  let ticking = false;
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateActiveSection();
      ticking = false;
    });
  };

  updateActiveSection();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
})();

// PC 端开场：真人海报退潮，AI 海报涌入，最后揭示标题。
(function () {
  const hero = document.querySelector("[data-scroll-hero]");
  if (!hero || window.matchMedia("(max-width: 980px)").matches) return;

  const realField = hero.querySelector(".hero-poster-field-real");
  const aiField = hero.querySelector(".hero-poster-field-ai");
  const fillPosterField = (field, total) => {
    if (!field) return;
    const originals = Array.from(field.querySelectorAll(".hero-poster"));
    if (originals.length === 0) return;

    for (let index = originals.length; index < total; index += 1) {
      const clone = originals[index % originals.length].cloneNode(true);
      clone.dataset.repeat = "true";
      field.appendChild(clone);
    }
  };

  fillPosterField(realField, 18);
  fillPosterField(aiField, 48);

  const realPosters = Array.from(hero.querySelectorAll(".hero-poster-field-real .hero-poster"));
  const aiPosters = Array.from(hero.querySelectorAll(".hero-poster-field-ai .hero-poster"));
  const glass = hero.querySelector(".hero-glass");
  const copy = hero.querySelector(".hero-copy");
  const scrollPrompt = hero.querySelector(".hero-scroll");

  const realLayout = [
    [-4, -10, -6, 1.05],
    [12, 48, 4, 0.92],
    [22, 2, -3, 0.88],
    [38, 58, 5, 1.02],
    [44, 18, -2, 0.96],
    [58, -8, 5, 0.9],
    [67, 51, -5, 1.04],
    [78, 8, 3, 0.94],
    [88, 57, -4, 1.08],
    [94, 20, 6, 0.9]
  ];

  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const smoothstep = (start, end, value) => {
    const progress = clamp((value - start) / (end - start));
    return progress * progress * (3 - 2 * progress);
  };
  const mix = (start, end, progress) => start + (end - start) * progress;

  const render = () => {
    const viewportHeight = window.innerHeight;
    const rect = hero.getBoundingClientRect();
    const scrollDistance = Math.max(hero.offsetHeight - viewportHeight, 1);
    const progress = clamp(-rect.top / scrollDistance);
    const wave = smoothstep(0.05, 0.5, progress);
    const reveal = smoothstep(0.56, 0.78, progress);
    const titleReveal = smoothstep(0.63, 0.82, progress);

    hero.style.setProperty("--hero-progress", progress.toFixed(4));
    hero.style.setProperty("--hero-wave", wave.toFixed(4));
    hero.style.setProperty("--hero-reveal", reveal.toFixed(4));

    realPosters.forEach((poster, index) => {
      const repeatRow = Math.floor(index / realLayout.length);
      const layoutIndex = (index + repeatRow * 5) % realLayout.length;
      const [baseX, baseY, baseRotation, baseScaleValue] = realLayout[layoutIndex];
      const startX = baseX + repeatRow * (layoutIndex % 2 ? 2 : -2);
      const startY = baseY + repeatRow * (layoutIndex % 3 === 0 ? 7 : -6);
      const rotation = baseRotation + repeatRow * (layoutIndex % 2 ? -3 : 3);
      const baseScale = baseScaleValue * (repeatRow ? 0.82 : 1);
      const direction = startX < 50 ? -1 : 1;
      const endX = startX + direction * (10 + (index % 3) * 3);
      const endY = startY - 7 + (index % 2) * 5;
      const x = mix(startX, endX, wave);
      const y = mix(startY, endY, wave);
      const scale = mix(baseScale, baseScale * 0.84, wave);
      const opacity = mix(0.9, 0.16, wave);

      poster.style.zIndex = String(index + 1);
      poster.style.opacity = opacity.toFixed(3);
      poster.style.transform = `translate3d(${x}vw, ${y}vh, ${-80 + index * 5}px) rotate(${rotation}deg) scale(${scale})`;
      poster.style.filter = `saturate(${mix(0.72, 0.48, wave)}) brightness(${mix(0.72, 0.46, wave)}) blur(${reveal * 1.8}px)`;
    });

    aiPosters.forEach((poster, index) => {
      const placementIndex = index;
      const column = placementIndex % 8;
      const row = Math.floor(placementIndex / 8);
      const endX = -6 + column * 14.2 + (row % 2) * 2.5;
      const endY = -18 + row * 19 + (column % 2) * 3;
      const entryType = index % 3;
      const startX = entryType === 0 ? endX - 10 : entryType === 1 ? 112 + (index % 4) * 4 : -28 - (index % 4) * 4;
      const startY = entryType === 0 ? 112 + (index % 5) * 7 : endY + 16;
      const delay = (index % 8) * 0.008 + row * 0.012;
      const localProgress = smoothstep(0.055 + delay, 0.43 + delay, progress);
      const x = mix(startX, endX, localProgress);
      const y = mix(startY, endY, localProgress);
      const startRotation = entryType === 1 ? 14 : entryType === 2 ? -14 : index % 2 ? 8 : -8;
      const endRotation = ((index * 7) % 11) - 5;
      const scaleBoost = index % 5 === 0 ? 1.16 : index % 4 === 0 ? 1.08 : 1;
      const scale = mix(0.62, scaleBoost, localProgress);
      const opacity = localProgress * mix(0.96, 0.68, reveal);

      poster.style.zIndex = String(20 + index);
      poster.style.opacity = opacity.toFixed(3);
      poster.style.transform = `translate3d(${x}vw, ${y}vh, ${index * 7}px) rotate(${mix(startRotation, endRotation, localProgress)}deg) scale(${scale})`;
      poster.style.filter = `saturate(${mix(1.02, 0.64, reveal)}) brightness(${mix(0.9, 0.62, reveal)}) blur(${reveal * 2.4}px)`;
    });

    if (glass) {
      glass.style.opacity = (reveal * 0.76).toFixed(3);
      glass.style.backdropFilter = `blur(${reveal * 24}px) saturate(${100 + reveal * 32}%)`;
      glass.style.webkitBackdropFilter = `blur(${reveal * 24}px) saturate(${100 + reveal * 32}%)`;
    }

    if (copy) {
      copy.style.opacity = titleReveal.toFixed(3);
      copy.style.transform = `translate(-50%, calc(-50% + ${mix(34, 0, titleReveal)}px))`;
    }

    if (scrollPrompt) {
      scrollPrompt.style.opacity = String(1 - smoothstep(0.025, 0.14, progress));
    }
  };

  let ticking = false;
  const requestRender = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      render();
      ticking = false;
    });
  };

  render();
  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender);
})();
