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