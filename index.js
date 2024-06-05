
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')  //context

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')

const x = canvas.width / 2
const y = canvas.height / 2

class Player {  // Making the player character
   constructor(x, y, radius, color) {
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color
   }

   draw() {
      c.beginPath()
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
      c.fillStyle = this.color
      c.fill()
   }
}

class Projectile {  // Making the small bolets that gets fired
   constructor(x, y, radius, color, velocity){
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color
      this.velocity = velocity
   }

   draw() {
       c.beginPath()
       c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
       c.fillStyle = this.color
       c.fill()
   }

   update() { // The motion of the projectile
      this.draw()
      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
   }
}

class Enemy {
   constructor(x, y, radius, color, velocity){
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color
      this.velocity = velocity
   }

   draw() {
       c.beginPath()
       c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
       c.fillStyle = this.color
       c.fill()
   }

   update() { // Movement of the enemy
      this.draw()
      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
   }
}

const friction = 0.989 //doesn't need to add it
class Particle {
   constructor(x, y, radius, color, velocity){
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color
      this.velocity = velocity
      this.alpha = 1 //tranfarency
   }

   draw() {
       c.save()  //calling a global code
       c.globalAlpha = this.alpha
       c.beginPath()
       c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
       c.fillStyle = this.color
       c.fill()
       c.restore()
   }

   update() { // Movement of the enemy
      this.draw()
      this.velocity.x *= friction
      this.velocity.y *= friction
      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
      this.alpha -= 0.01
   }
}

class Lightsaber {
    constructor(x, y, w, h, color){
       this.x = x
       this.y = y
       this.w = w
       this.h = h
       this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(x, y, 20, 0, 2 * Math.PI, false)
        c.fillStyle = this.color
        c.fill()
    }
}

let player = new Player(x, y, 10, 'white')
let lightsaber = new Lightsaber(x, y, 150, 1000, 'orange')
let projectiles = []
let enemies = []
let particles = []

console.log(Player)
console.log(Lightsaber)

function init() {
   player = new Player(x, y, 10, 'white')
   lightsaber = new Lightsaber(x, y, 150, 1000, 'orange')
   projectiles = []
   enemies = []
   particles = []
   score = 0
   scoreEl.innerHTML = score
   bigScoreEl.innerHTMl = score
}

function spawnEnemies() {
   setInterval(() => {
      const radius = Math.random() * (30 - 4) + 4

      let x
      let y

      if (Math.random() < 0.5 ) {
         x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius   // like a if statement
         y = Math.random() * canvas.height  // since const can't use outside the method of if statement
      } else {
         x = Math.random() * canvas.width
         y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
      }


      const color = `hsl(${Math.random() * 360}, 50%, 50%)` // random color; hsl-- Hue(color), Saturation & Lightness; computes the code in teh {} before putting in the string

      const angle = Math.atan2(
        canvas.height / 2 - y,   // destanation - star from
        canvas.width / 2 - x)
      //console.log(angle)
      const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

      enemies.push( new Enemy(x, y, radius, color, velocity))  // This addes the const ( a variable) to the list
      //console.log(enemies)
   }, 1000 )                 // time 1000 ms = 1 s
}

let animationId // avaliable that can be acsess in anywhere
let score = 0
function animate() {
   animationId = requestAnimationFrame(animate)  // This returns what frame you are on currently
   c.fillStyle = 'rgba(0, 0, 0, 0.1)' // Gives the fade effect to the game; 0.1 changes the style in a way that gives the effect
   c.fillRect(0, 0, canvas.width, canvas.height) //The background
   player.draw()
   //lightsaber.draw()

   particles.forEach((particle, index) => {
      if (particle.alpha <= 0){
         particles.splice(index, 1)
      } else {
         particle.update()
      }
   })

   projectiles.forEach((projectile, index) => {
      projectile.update()

      // remove from edges of screen
      if (
         projectile.x + projectile.radius < 0 ||
         projectile.x - projectile.radius > canvas.width ||
         projectile.y + projectile.radius < 0 ||
         projectile.y - projectile.radius > canvas.height
      ){
         setTimeout(() => { // removing something of the screen and the program
            projectiles.splice(index, 1)
         }, 0)
      }
   })

   enemies.forEach((enemy, index) => {
      enemy.update()

      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

      // end game
      if(dist - enemy.radius - player.radius < 1) {
         cancelAnimationFrame(animationId)
         modalEl.style.display = 'flex'
         bigScoreEl.innerHTML = score
      }

      projectiles.forEach((projectile, projectileIndex) => {
         const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)      //Distance between two points; const in a different call back code

         // When projectiles touch enemy
         if(dist - enemy.radius - projectile.radius < 1) {


            // making the particles
            for(let i = 0; i < enemy.radius * 2; i++) {
               particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color,
               {x: Math.random() - 0.5 * (Math.random() * 7), y: Math.random() - 0.5 * (Math.random() * 7)})) //random from -0.5 to 0.5
            }

            if(enemy.radius - 7 > 5){ //checks for the bid enemy
               //Increase the score
               score += 100
               scoreEl.innerHTML = score

               gsap.to(enemy,{        // for smooth animation
                  radius: enemy.radius -7
               })
               setTimeout(() => { // removing something of the screen and the program
                  projectiles.splice(projectileIndex, 1)
               }, 0) //waits for the next frame to remove it or above code
            } else {
               // remove from screen altogether
               score += 250
               scoreEl.innerHTML = score

               setTimeout(() => { // removing something of the screen and the program
                  enemies.splice(index, 1) //remove one at index
                  projectiles.splice(projectileIndex, 1)
               }, 0) //waits for the next frame to remove it or above code
            }
         }
      })
   })
}

addEventListener('click', (event) =>  // Adds a listener to listen for mouse clicks
  {

    console.log(projectiles)
    const angle = Math.atan2(  // This is to find the angle of the clicked to player
       event.clientY - canvas.height / 2,
       event.clientX - canvas.width / 2
    )
    //console.log(angle)
    const velocity = { // speed of the bullet
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    }
    projectiles.push(new Projectile( canvas.width / 2, canvas.height / 2, 5, 'white', velocity))

  })

startGameBtn.addEventListener('click', () => {
   init()
   animate()
   spawnEnemies()
   modalEl.style.display = 'none'
})