canvas = document.querySelector("canvas")
ctx = canvas.getContext('2d')

function defineCanvas(){
	canvas.height = window.innerHeight
	canvas.width = window.innerWidth
}

defineCanvas()

function game_update(){
	ctx.fillStyle = "#FFF1E8"
	ctx.fillRect(0,0,canvas.width, canvas.height)
}

/*
h = 963
w = 540
*/

class Player{
	constructor(){
		this.x = 0
		this.y = 0

		this.velocity = {x:0, y:0}
		this.speed = 1.2

		this.size = {h:50, w:50}

		this.isReflect = false
	}

	drawEyes(){
		let x = this.x
		let y = this.y
		let h = this.size.h
		let w = this.size.w

		if(this.isReflect){
			ctx.fillStyle = "#000000"
			ctx.fillRect(x-w/8*2+h, y+h/2, w/8, h/6)
			ctx.fillRect(x-w/8*4+h, y+h/2, w/8, h/6)
		}else{
			ctx.fillStyle = "#000000"
			ctx.fillRect(x+w/8, y+h/2, w/8, h/6)
			ctx.fillRect(x+w/8*3, y+h/2, w/8, h/6)
		}
		
	}

	draw(){
		let x = this.x 
		let y = this.y 
		let h = this.size.h
		let w = this.size.w


		ctx.fillStyle = "#FFF1E8"
		ctx.fillRect(x, y, w, h)

		ctx.fillStyle = "#000000"
		ctx.lineWidth = 4
		ctx.strokeRect(x, y, w, h)

		this.drawEyes()
	}
}

class Platforms{
	constructor(player){
		this.player = player

		this.x = canvas.width/2
		this.y = canvas.height*0.75
		this.size = {w:250, h:50}
		this.diff = 200

		this.score = 0
		this.retry = {sprite: new Image(), mousePos: {x:0,y:0}, isActive: false}
		this.retry.sprite.src = 'retry.png'

		this.platforms = [this.y, this.y - this.diff]

		this.mouseHold = false

		this.xoPlayer = -1
		this.isMovePlayer = {x: true, y: false}
		this.edgePlayer = {x:this.size.w*0.25}

		this.initPlayer()

		this.loseArea = {y1: this.platforms[1]-25, y2: this.platforms[1]-75}
		this.isGameOver = false

		this.ladder = {x: this.player.x, y: this.player.y, size: {w: 25, h: 25}, amount: 0, visualCorrect: 2, speed: 1}
		this.isBuiltLadder = false
	}

	clearUndefined(list){
		let clearedList = []
		for(let l in list){
			l = list[l]
			if(l != null){
				clearedList.push(l)
			}
		}
		return clearedList
	}

	movePlayer(xo,yo){
		let speed = this.player.speed
		this.player.velocity = {x: xo, y: yo}
		this.player.x += xo * speed
		this.player.y += yo * speed
	}

	initPlayer(){
		this.player.y = this.platforms[0] - this.player.size.h*1.1
		this.player.x = this.x - this.player.size.w/2 + this.edgePlayer.x
		this.sidePlat = 1
	}

	isStopPlayer(){
		let vl_pl = this.player.velocity
		let xo = vl_pl.x
		let yo = vl_pl.y

		return {x: xo == 0, y: yo == 0}
	}

	floatPlayer(){
		let is_stop_pl = this.isMovePlayer

		if(is_stop_pl.x){
		this.player.y += Math.sin(this.player.x/Math.PI*0.8)
		}
	}

	reflectPlayer(){
		let pl = this.player

		if(this.xoPlayer > 0){
			pl.isReflect = true
		}

		if(this.xoPlayer < 0){
			pl.isReflect = false
		}
	}

	moveUpPlayer(){
		let pl_y = this.player.y
		let is_stop_pl = this.isMovePlayer
		let plat_goal_y = this.platforms[1] - this.player.size.h*1.1
		
		if(pl_y > plat_goal_y && is_stop_pl.y && this.isBuiltLadder){
			this.movePlayer(0, -1)
		}

		if(is_stop_pl.y && pl_y <= plat_goal_y && this.isBuiltLadder){
			this.xoPlayer = -this.xoPlayer
			this.isMovePlayer = {x: true, y: false}

			this.isBuiltLadder = false
			this.ladder.amount = 0
			this.ladder.y = this.player.y


			this.platforms.push(this.platforms[1]-this.diff)
			delete this.platforms[0]
			this.platforms = this.clearUndefined(this.platforms)

			this.score += 1
			this.defineLadderSpeed()
		}
	}

	moveSidePlayer(){
		let pl_x = this.player.x
		let is_stop_pl = this.isMovePlayer
		let xo = this.player.velocity.x
		let speed = this.player.speed

		let mid = {x: this.x - this.player.size.w/2}
		let plat_goal_x = mid.x + this.xoPlayer * this.edgePlayer.x

		if(is_stop_pl.x){
			if(pl_x > plat_goal_x && this.xoPlayer < 0){
				this.movePlayer(-1 * speed, 0)
			}
			else if(pl_x < plat_goal_x && this.xoPlayer > 0){
				this.movePlayer(1 * speed, 0)
			}
			else{
				this.isMovePlayer = {x: false, y: true}
			}
		}
	}

	buildLadder(){
		let pl = this.player
		let is_stop_pl = this.isMovePlayer
		let ladder = this.ladder

		if(this.mouseHold && is_stop_pl.y && 
		   ladder.y + ladder.amount * (ladder.size.h-ladder.visualCorrect) <= pl.y+pl.size.h/2 && this.isCameraStabilized()){
				ladder.amount += 1
		}
		if(ladder.y + ladder.amount * (ladder.size.h-ladder.visualCorrect) >= pl.y+pl.size.h/2 && !this.isBuiltLadder){
			ladder.y -= 1 * ladder.speed
		}
		if(!this.mouseHold && ladder.amount > 0 && is_stop_pl.y){
			this.isBuiltLadder = true
		}
	}

	defineLadderSpeed(){
		this.ladder.speed = Math.floor(Math.random()*15)+1
	}

	moveCamera(xo,yo){
		for(let p in this.platforms){
			this.platforms[p] += yo 
		}
		this.player.y += yo 
		this.ladder.y += yo 
	}

	isCameraStabilized(){
		return this.y <= this.platforms[0]
	}

	stabilizeCamera(){
		let speed = 1.2

		if(!this.isCameraStabilized()){
			this.moveCamera(0, 1*speed)
		}
	}

	drawOne(x,y,w,h){
		ctx.fillStyle = "#000000"
		ctx.fillRect(x-w/2, y, w, h)
	}
	drawPlayer(){
		this.player.draw()
	}
	drawLadder(){
		let pl = this.player
		let ladder = this.ladder
		

		for(let lad=0; lad<ladder.amount; lad++){
			ctx.fillStyle = '#FFF1E8'
			ctx.fillRect(pl.x+pl.size.w*0.25, lad*(ladder.size.h-ladder.visualCorrect)+ladder.y, 
						 ladder.size.w , ladder.size.h)

			ctx.lineWidth = 3
			ctx.fillStyle = '#000000'
			ctx.strokeRect(pl.x+pl.size.w*0.25, lad*(ladder.size.h-ladder.visualCorrect)+ladder.y, 
						 ladder.size.w , ladder.size.h)
		}
	}
	drawAll(){
		let w = this.size.w
		let h = this.size.h
		let x = this.x

		for(let index in this.platforms){
			let pl_y = this.platforms[index]

			this.drawOne(x,pl_y,w,h)
		}
	}
	drawGuidLines(){
		let loseArea = this.loseArea

		ctx.save()

		ctx.beginPath()
		ctx.lineWidth = 5
		ctx.setLineDash([15, 25])

		ctx.lineTo(0, loseArea.y1)
		ctx.lineTo(canvas.width, loseArea.y1)

		ctx.moveTo(0, loseArea.y2)
		ctx.lineTo(canvas.width, loseArea.y2)
		ctx.stroke()

		ctx.restore()
	}

	drawScore(){
		let score = this.score.toString()

		ctx.font = "35px Pixel"
		ctx.fillStyle = '#000000'
		ctx.fillText(score, canvas.width - 35*(score.length-1)*0.25 - 35, 50)
	}

	isLose(){
		let ladder = this.ladder
		let loseArea = this.loseArea
		let isWin = ladder.y < loseArea.y1 && ladder.y > loseArea.y2

		return !isWin
	}

	gameOver(){
		let is_stop_pl = this.isMovePlayer

		if(this.isLose() && this.isBuiltLadder){
			this.isGameOver = true
		}
	}

	drawRetry(){
		let size = 100
		let pos = {x: canvas.width/2-size/2-size*0.05, y: canvas.height/2-size/2+100}
		let img = this.retry.sprite
		let mouse = {x: this.retry.mousePos.x, y: this.retry.mousePos.y}

		ctx.drawImage(img, pos.x, pos.y, size, size)
		ctx.lineWidth = 4
		ctx.strokeRect(pos.x, pos.y, size, size)

		if(mouse.x > pos.x && mouse.x < pos.x + size &&
		   mouse.y > pos.y && mouse.y < pos.y + size){
		   	this.retry.isActive = true
		}
	}

	drawGameOver(){
		let center = {x:canvas.width/2, y:canvas.height/2}
		let canvasLose = {size: {w:300, h: 350}}
		let score = this.score.toString()

		let decorationCanvas = [[center.x-canvasLose.size.w/2, center.x+canvasLose.size.w/2],
								[center.y-canvasLose.size.h/2, center.y+canvasLose.size.h/2]]
		let decorSize = 30


		ctx.fillStyle = '#000000'
		ctx.lineWidth = 8
		ctx.strokeRect(center.x - canvasLose.size.w/2, center.y - canvasLose.size.h/2, 
					   canvasLose.size.w, canvasLose.size.h)

		for(let i in decorationCanvas[0]){
			let d1 = decorationCanvas[0][i]
			for(let j in decorationCanvas[1]){
				let d2 = decorationCanvas[1][j]
				ctx.fillRect(d1-decorSize/2,d2-decorSize/2,decorSize,decorSize)
			}
		}

		ctx.font = "bold 35px Pixel"
		ctx.fillText('Your score:', center.x - 35 * 3, center.y - 50)

		ctx.font = "70px Pixel"
		ctx.fillText(score, center.x-(score.length-1)*70*0.25-70/3, center.y + 20)

		this.drawRetry()

	}

	draw(){
		this.drawScore()
		this.drawGuidLines()
		this.drawAll()
		this.drawLadder()
		this.drawPlayer()
	}

	update(){
		if(!this.isGameOver){
		this.draw()

		this.moveUpPlayer()
		this.moveSidePlayer()
		this.floatPlayer()
		this.reflectPlayer()

		this.buildLadder()

		this.stabilizeCamera()

		this.gameOver()
		}

		if(this.isGameOver){
			this.drawGameOver()
		}
	}
}


const fps = 60
const player = new Player()
var platforms = new Platforms(player)

function animate(){
	setTimeout(()=>{
	window.requestAnimationFrame(animate)
	}, 1000/fps)

	defineCanvas()

	game_update()

	platforms.update()

	if(platforms.retry.isActive){
		platforms = new Platforms(player)
	}
}

window.addEventListener('click', function(event){
	platforms.mouseHold = !platforms.mouseHold
	platforms.retry.mousePos = {x: event.clientX, y: event.clientY}
	console.log(platforms.retry.mousePos)
})

/*
onmousedown = function(){
	platforms.mouseHold = true
}

onmouseup = function(){
	platforms.mouseHold = false
}
*/

animate()