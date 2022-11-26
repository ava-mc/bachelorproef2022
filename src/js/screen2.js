import { socket } from "./screens.js";

export const initScreen2 = () => {
  const $example = document.querySelector(".example");
  socket.on("ended2", () => {
    $example.classList.add("animate");
    setTimeout(() => {
      $example.classList.remove("animate");
      socket.emit("start3");
    }, 500);
  });
};
