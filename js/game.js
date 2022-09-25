const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')
const timer = document.querySelector('#timerEl')
const spanName = document.querySelector('#player')
const showscoreGameOver = document.querySelector('#showScoreGameOver')
const showScoreWin = document.querySelector('#showScoreWin')

canvas.width = 570
canvas.height = 660


class Boundary {
    static width = 30
    static height = 30
    constructor({ position, image }) {             // <----- Paredes do jogo
        this.position = position
        this.width = 30
        this.height = 30
        this.image = image
    }
    draw() {
        // c.fillStyle = 'blue'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

class Ghost {
    static speed = 2
    constructor({ position, velocity, color = 'red' }) {
        this.position = position                                     // <------ fantasma
        this.velocity = velocity
        this.radius = 12
        this.color = color
        this.prevCollisions = []
        this.speed = 2
        this.scared = false
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0,
            Math.PI * 2)                                                // <---- fantasma
        c.fillStyle = this.scared ? 'blue' : this.color
        c.fill()
        c.closePath()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x              // <----- animaçao do fantasma andando
        this.position.y += this.velocity.y
    }
}

class Player {
    constructor({ position, velocity }) {
        this.position = position                        // <------ Pacman
        this.velocity = velocity
        this.radius = 12
        this.radians = 0
        this.openRate = 0
        this.rotation = 0
    }

    draw() {
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, this.radians,
            Math.PI * 2 - this.radians)                                                // <---- Pacman
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
        c.restore()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x              // <----- animaçao do pocman andando
        this.position.y += this.velocity.y

        if (this.radians < 0 || this.radians > .75) this.openRate = -this.openRate

        this.radians += this.openRate
    }

    open(){
        this.radians = 0.75
        this.openRate = 0.12
    }
    stop(){
        this.radians = 0.75
        this.openRate = 0
    }
}

class Pellet {
    constructor({ position }) {
        this.position = position                        // <------ Pontos para coletar no mapa
        this.radius = 3
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0,
            Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

class PowerUp {
    constructor({ position }) {
        this.position = position            //<--- power up (poderzinho pro pacman comer o fantasma)                   
        this.radius = 8
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0,
            Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

const pellets = []
const boundaries = []
const powerUps = []
const ghosts = [
    new Ghost({
        position: {
            x: Boundary.width *3 + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        }
    }),
    new Ghost({
        position: {
            x: Boundary.width * 14 + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'pink'
    }),
    new Ghost({
        position: {
            x: Boundary.width *3 + Boundary.width / 2,
            y: Boundary.height * 20 + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'green'
    }),
    new Ghost({
        position: {
            x: Boundary.width * 14 + Boundary.width / 2,
            y: Boundary.height * 20 + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'purple'
    })
]
const player = new Player({
    position: {
        x: Boundary.width * 9 + Boundary.width / 2,             // <---- Posiçao do pacman  
        y: Boundary.height *10 + Boundary.height / 2
    },
    velocity: {
        x: 0,
        y: 0
    }
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}


let lastKey = ''
let score = 0


const map = [
    ['1', '-','-','-', '-', '-', '-', '-', '-', '7', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.','.','.', '.', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.','1','2', '.', '1', '-', '2', '.', '.', '.', '1', '-', '2', '.', '1', '2', '.', '|'],
    ['|', '.','4','3', '.', '4', '-', '3', '.', '^', '.', '4', '-', '3', '.', '4', '3', '.', '|'],
    ['|', '.','.','p', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', 'p', '.', '|'],
    ['|', '.','[',']', '.', '^', '.', '[', '-', '+', '-', ']', '.', '^', '.', '[', ']', '.', '|'],
    ['|', '.','.','.', '.', '|', '.', '.', '.', '|', '.', '.', '.', '|', '.', '.', '.', '.', '|'],
    ['6', ']','.','^', '.', '4', '-', ']', '.', '_', '.', '[', '-', '3', '.', '^', '.', '[', '8'],
    ['|', '.','.','|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', '.', '|'],
    ['|', '.','[','3', '.', '^', '.', '1', ']', '.', '[', '2', '.', '^', '.', '4', ']', '.', '|'],        //<--- mapa do jogo
    ['|', '.','.','.', '.', '|', '.', '|', '.', ' ', '.', '|', '.', '|', '.', '.', '.', '.', '|'],
    ['|', '.','[','2', '.', '|', '.', '4', '-', '-', '-', '3', '.', '|', '.', '1', ']', '.', '|'],
    ['|', '.','.','|', '.', '|', '.', '.', '.', '.', '.', '.', '.', '|', '.', '|', '.', '.', '|'],
    ['6', ']','.','_', '.', '_', '.', '[', '-', '-', '-', ']', '.', '_', '.', '_', '.', '[', '8'],
    ['|', '.','.','.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.','[','2', '.', '[', '-', ']', '.', '^', '.', '[', '-', ']', '.', '1', ']', '.', '|'],
    ['|', '.','.','|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|', '.', '.', '|'],
    ['6', ']','.','_', '.', '^', '.', '[', '-', '+', '-', ']', '.', '^', '.', '_', '.', '[', '8'],
    ['|', '.','.','.', '.', '|', '.', '.', '.', '|', '.', '.', '.', '|', '.', '.', '.', '.', '|'],
    ['|', '.','[',']', '.', '4', '-', ']', '.', '_', '.', '[', '-', '3', '.', '[', ']', '.', '|'],
    ['|', 'p','.','.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['4', '-','-','-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
]

function createImage(src) {
    const image = new Image()
    image.src = src
    return image

}

map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            case '-':
                boundaries.push(
                    new Boundary({                                      //<--- puxa uma imagem e forma o mapa do jogo
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('../img/pipeHorizontal.png')
                    })
                )
                break
            case '|':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('../img/pipeVertical.png')
                    })
                )
                break
            case '1':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('../img/pipeCorner1.png')
                    })
                )
                break
            case '2':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('../img/pipeCorner2.png')
                    })
                )
                break
            case '3':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('../img/pipeCorner3.png')
                    })
                )
                break
            case '4':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('../img/pipeCorner4.png')
                    })
                )
                break
            case 'b':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('../img/block.png')
                    })
                )
                break
            case '[':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('../img/capLeft.png')
                    })
                )
                break
            case ']':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('../img/capRight.png')
                    })
                )
                break
            case '_':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('../img/capBottom.png')
                    })
                )
                break
            case '^':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('../img/capTop.png')
                    })
                )
                break
            case '+':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('../img/pipeCross.png')
                    })
                )
                break
            case '5':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('../img/pipeConnectorTop.png')
                    })
                )
                break
            case '6':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('../img/pipeConnectorRight.png')
                    })
                )
                break
            case '7':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('../img/pipeConnectorBottom.png')
                    })
                )
                break
            case '8':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('../img/pipeConnectorLeft.png')
                    })
                )
                break
            case '.':
                pellets.push(
                    new Pellet({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2,
                            y: i * Boundary.height + Boundary.height / 2
                        }
                    })
                )
                break

            case 'p':
                powerUps.push(
                    new PowerUp({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2,
                            y: i * Boundary.height + Boundary.height / 2
                        }
                    })
                )
                break
        }
    })
})

function circleCollidesWithRectangle({ circle, rectangle }) {
    const padding = Boundary.width / 2 - circle.radius - 1
    return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height +
        padding &&
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding &&
        circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding &&                         //<--- detectar colisao do pacman com a parede e para-lo
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)
}

const startTimer = () => {
    this.loop = setInterval(() =>{
        const currentTime =+ timer.innerHTML;
        if (timer.innerHTML > 0) {
            timer.innerHTML = currentTime - 1;
        }
        else {
            clearInterval(this.loop)
            cancelAnimationFrame(animationId)
            gameOver()
            console.log('You Lose')
        }

    },1000)  
}
startTimer();

function gameOver() {  

    document.getElementById("GameOver").style.visibility = "visible";
 };


 function winGame() {

    document.getElementById("YouWin").style.visibility = "visible";

 }
let animationId
function animate() {
    animationId = requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)


    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {
                        ...player, velocity: {
                            x: 0,
                            y: -5                         //<--- fazer o pacman se movimentar para cima e para baixo do mapo sem precisar de uma parede do lado dele
                        }
                    },
                    rectangle: boundary
                })) {
                player.velocity.y = 0
                break
            } else {
                player.velocity.y = -5
            }
        }

    } else if (keys.a.pressed && lastKey === 'a') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {
                        ...player, velocity: {
                            x: -5,
                            y: 0                        //<--- fazer o pacman se movimentar para cima e para baixo do mapo sem precisar de uma parede do lado dele
                        }
                    },
                    rectangle: boundary
                })) {
                player.velocity.x = 0
                break
            } else {
                player.velocity.x = -5
            }
        }
    } else if (keys.s.pressed && lastKey === 's') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {
                        ...player, velocity: {
                            x: 0,
                            y: 5
                        }                                 //<--- fazer o pacman se movimentar para cima e para baixo do mapo sem precisar de uma parede do lado dele
                    },
                    rectangle: boundary
                })) {
                player.velocity.y = 0
                break
            } else {
                player.velocity.y = 5
            }
        }
    } else if (keys.d.pressed && lastKey === 'd') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {
                        ...player, velocity: {
                            x: 5,
                            y: 0                         //<--- fazer o pacman se movimentar para cima e para baixo do mapo sem precisar de uma parede do lado dele
                        }
                    },
                    rectangle: boundary
                })) {
                player.velocity.x = 0
                break
            } else {
                player.velocity.x = 5
            }
        }
    }
    for (let i = ghosts.length - 1; 0 <= i; i--) {
        const ghost = ghosts[i]

        if (
            Math.hypot(
                ghost.position.x - player.position.x,               //<--- quando um fantasma toca o pacman voce perde, mas se estiver com o powerup nao perde
                ghost.position.y - player.position.y
            ) <
            ghost.radius + player.radius
        ) {
            if (ghost.scared) {
                ghosts.splice(i, 1)
            } else {
                clearInterval(this.loop)
                cancelAnimationFrame(animationId)
                gameOver()
                console.log('You Lose')
            }
        }
    }

    if (pellets.length === 0) {
        console.log('You Win')     
        clearInterval(this.loop)                         //<--- condiçao para ganhar o jogo 
        cancelAnimationFrame(animationId)
        winGame()
    }

    for (let i = powerUps.length - 1; 0 <= i; i--) {
        const powerUp = powerUps[i]
        powerUp.draw()

        if (
            Math.hypot(                                         //<--- pacman comer o power up
                powerUp.position.x - player.position.x,
                powerUp.position.y - player.position.y
            ) <
            powerUp.radius + player.radius
        ) {
            powerUps.splice(i, 1)

            ghosts.forEach(ghost => {
                ghost.scared = true                         //<--- faz os fantasmas ficarem com medo dps de pegar o powerUp

                setTimeout(() => {
                    ghost.scared = false
                }, 5000)
            })
        }
    }

    for (let i = pellets.length - 1; 0 <= i; i--) {
        const pellet = pellets[i]
        pellet.draw()

        if (
            Math.hypot(
                pellet.position.x - player.position.x,          //<--- faz os pontos sumirem assim que o pacman passa por cima deles
                pellet.position.y - player.position.y
            ) <
            pellet.radius + player.radius
        ) {
            pellets.splice(i, 1)
            score += 10
            scoreEl.innerHTML = score
            showscoreGameOver.innerHTML = score
            showScoreWin.innerHTML = score

        }
    }



    boundaries.forEach((boundary) => {
        boundary.draw()

        if (
            circleCollidesWithRectangle({
                circle: player,
                rectangle: boundary
            })
        ) {
            player.velocity.x = 0
            player.velocity.y = 0
            player.stop()
        }
    })

    player.update()

    ghosts.forEach((ghost) => {
        ghost.update()


        const collisions = []
        boundaries.forEach((boundary) => {
            if (
                !collisions.includes('right') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: ghost.speed,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
            ) {
                collisions.push('right')
            }

            if (
                !collisions.includes('left') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: -ghost.speed,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
            ) {
                collisions.push('left')
            }

            if (
                !collisions.includes('up') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: 0,
                            y: -ghost.speed
                        }
                    },
                    rectangle: boundary
                })
            ) {
                collisions.push('up')
            }

            if (
                !collisions.includes('down') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: 0,
                            y: ghost.speed
                        }
                    },
                    rectangle: boundary
                })
            ) {
                collisions.push('down')
            }
        })

        if (collisions.length > ghost.prevCollisions.length)
            ghost.prevCollisions = collisions

        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {

            if (ghost.velocity.x > 0) ghost.prevCollisions.push('right')
            else if (ghost.velocity.x < 0) ghost.prevCollisions.push('left')
            else if (ghost.velocity.y < 0) ghost.prevCollisions.push('up')
            else if (ghost.velocity.y > 0) ghost.prevCollisions.push('down')

            const pathways = ghost.prevCollisions.filter((collision) => 
                {
                    return !collisions.includes(collision)
                })
            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            switch (direction) {
                case 'down':
                    ghost.velocity.y = ghost.speed
                    ghost.velocity.x = 0
                    break

                case 'up':
                    ghost.velocity.y = -ghost.speed
                    ghost.velocity.x = 0
                    break

                case 'right':
                    ghost.velocity.y = 0
                    ghost.velocity.x = ghost.speed
                    break

                case 'left':
                    ghost.velocity.y = 0
                    ghost.velocity.x = -ghost.speed
                    break
            }

            ghost.prevCollisions = []
        }
    })

    if (player.velocity.x > 0) player.rotation = 0
    else if (player.velocity.x < 0) player.rotation = Math.PI                   //<--- faz a boca do pacman mudar a direçao junto com ele
    else if (player.velocity.y > 0) player.rotation = Math.PI / 2
    else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5
}

window.onload = () => {

    const playerName = localStorage.getItem('player')
    spanName.innerHTML = playerName;

    animate();
}

addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            player.open()
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            player.open()
            break                                   // <----- Fazer o pacman andar usando as teclas W A S D
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            player.open()
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            player.open()
            break
    }
})

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break                                   // <----- Fazer o pacman andar usando as teclas W A S D
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})