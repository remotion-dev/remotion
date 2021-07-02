import ClipboardJS from "clipboard";

module.exports = (function () {
  return {
    onRouteUpdate() {
      window.setTimeout(() => {
        const button = () => {
          const btn = document.createElement("button");
          btn.classList.add("copy-button");
          btn.setAttribute("type", "button");
          btn.setAttribute("aria-label", "Copy code to clipboard");
          btn.innerText = "Copy";
          return btn;
        };

        document.querySelectorAll("pre.shiki").forEach((pre) => {
          pre.appendChild(button());
        });

        const clipboard = new ClipboardJS(".copy-button", {
          target(trigger) {
            return trigger.parentNode.querySelector("code");
          },
        });

        clipboard.on("success", (event) => {
          event.clearSelection();
          const el = event.trigger;
          el.textContent = "Copied";
          setTimeout(() => {
            el.textContent = "Copy";
          }, 2000);
        });
      }, 0);
    },
  };
})();
