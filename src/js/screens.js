import { socket } from "./lib.js";

window.addEventListener('keydown', () => {
    socket.emit('start');
})

const $example = document.querySelector('.example')
socket.on('ended',() => {
    $example.classList.add('animate');
    setTimeout(()=>{$example.classList.remove('animate')}, 1000);
})