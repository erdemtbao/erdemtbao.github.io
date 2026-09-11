(function () {
  "use strict";

  const videos = Array.from(document.querySelectorAll("video.lazy-video"));
  if (!videos.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function loadVideo(video) {
    if (video.dataset.loaded === "true") return;
    video.querySelectorAll("source[data-src]").forEach(function (source) {
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
    });
    video.dataset.loaded = "true";
    video.load();
  }

  if (reduceMotion) return;

  if (!("IntersectionObserver" in window)) {
    videos.forEach(function (video) {
      loadVideo(video);
      video.play().catch(function () {});
    });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      const video = entry.target;
      if (entry.isIntersecting) {
        loadVideo(video);
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    });
  }, { rootMargin: "200px 0px", threshold: 0.05 });

  videos.forEach(function (video) {
    observer.observe(video);
  });
})();
