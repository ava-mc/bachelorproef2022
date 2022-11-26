import { socket } from "./screens.js";

export const initScreen3 = () => {
  const $example = document.querySelector(".example");
  socket.on("ended3", () => {
    $example.classList.add("animate");
    setTimeout(() => {
      $example.classList.remove("animate");
    }, 500);
  });
};
