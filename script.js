const input = document.querySelector('.input')
const button = document.querySelector('.button')
const form = document.querySelector('.form')

const Submit = (event) => {
    event.preventDefault();
    localStorage.setItem('player', input.value);
    window.location = 'game/game.html';

}

form.addEventListener ('submit', Submit);