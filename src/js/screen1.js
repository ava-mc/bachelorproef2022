import {socket} from "./screens.js";

export const initScreen1 = () => {
    const $example = document.querySelector(".example");
    socket.on("ended", () => {
      $example.classList.add("animate");
      setTimeout(() => {
        $example.classList.remove("animate");
        socket.emit("start2");
      }, 500);
    });
}