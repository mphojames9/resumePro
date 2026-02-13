document.addEventListener("DOMContentLoaded", () => {

  const sections = document.querySelectorAll(".section-block");

  sections.forEach(section => {
    const header = section.querySelector(".section-header");
    const btn = section.querySelector(".toggle-btn");
    const content = section.querySelector(".section-content");

    // Safety check (prevents crash)
    if (!header || !btn || !content) return;

    header.addEventListener("click", () => {
      const isOpen = btn.classList.contains("active");

      // Close all sections
      sections.forEach(s => {
        const b = s.querySelector(".toggle-btn");
        const c = s.querySelector(".section-content");

        if (b && c) {
          b.classList.remove("active");
          c.style.height = "0px";
        }
      });

      // Open clicked one
      if (!isOpen) {
        btn.classList.add("active");
        content.style.height = content.scrollHeight + "px";
      }
    });
  });

});