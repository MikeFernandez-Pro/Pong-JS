// Global Variables

var rounds = [5, 5, 5];

var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');
		
var Ball = {
	new: function () {
		return {
			width: (canvas.height / 54.44),
			height: (canvas.height / 54.44),
			x: (canvas.width / 2) - ((canvas.height / 54.44) / 2),
			y: (canvas.height / 2) - ((canvas.height / 54.44) / 2),
			moveX: 0,
			moveY: 0,
			speed: (canvas.height / 54.44) / 2
		};
	}
};

// The two lines that move up and down
var paddle1 = {
	new: function (side) {
		return {
			width: (canvas.height / 54.44),
			height: (canvas.height / 14),
			x: (canvas.height / 6.53),
			y: (canvas.height / 2) - (canvas.height / 28),
			score: 0,
			move: 0,
			speed: (canvas.height / 98),
			winned: 0,
			nickname: "Player1"
		};
	}
};

var paddle2 = {
	new: function (side) {
		return {
			width: (canvas.height / 54.44),
			height: (canvas.height / 14),
			x: canvas.width - (canvas.height / 6.53),
			y: (canvas.height / 2) - (canvas.height / 28),
			score: 0,
			move: 0,
			speed: (canvas.height / 98),
			winned: 0,
			nickname: "AI"
		};
	}
};

function initialize() {

		canvas.width = canvas.getBoundingClientRect().width;
		canvas.height = canvas.width * 0.7;

		player1 = paddle1.new('left');
		AI = paddle2.new('right');
		ball = Ball.new();
	
		AI.speed = (canvas.height / 122.5);
		running = over = false;
		// Choix aléatoire de qui commence
		turn = (Math.floor(Math.random() * 2) == 0) ? player1 : AI;
		timer = round = 0;
		color = '#32ad3a';

		menu();
		listen();
}

function endGameMenu(text) {
		// Change the canvas font size and color
		context.font = (canvas.height / 20).toString() +'px Courier New';
		context.fillStyle = color;

		// Change the canvas color;
		context.fillStyle = '#ffffff';
		context.textAlign = 'center';
		
		//Replace rouns by finished
		context.fillText(
			'Finished',
			(canvas.width / 2),
			(canvas.height / 2.5)
		);
		
		context.font = (canvas.height / 15).toString() +'px Courier New';

		context.textAlign = 'center';
		// Draw the end game menu text ('Game Over' and 'Winner')
		context.fillText(text,
			canvas.width / 2,
			canvas.height / 2
		);

}

function menu() {
	// Draw all the Pong objects in their current state
	draw();
	countdown('3');
	setTimeout(function () {
		countdown('2');
		setTimeout(function () {
			countdown('1');
			setTimeout(function () {
				countdown('Go!');
				setTimeout(function () {
					if (running === false) {
						running = true;
						window.requestAnimationFrame(loop);
					}
				}, 1000);
			}, 1000);
		}, 1000);
	}, 1000);
}

// Update all objects (move the player1, AI, ball, increment the score, etc.)
function update() {
	if (!over) {
		// If the ball collides with the bound limits - correct the x and y coords.
		if (ball.x <= 0) resetTurn(AI, player1);
		if (ball.x >= canvas.width - ball.width) resetTurn(player1, AI);
		if (ball.y <= 0) ball.moveY = 2;
		if (ball.y >= canvas.height - ball.height) ball.moveY = 1;
	
		// Move player1 if they player1.move value was updated by a keyboard event
		if (player1.move === 1) player1.y -= player1.speed;
		else if (player1.move === 2) player1.y += player1.speed;
	
		// On new serve (start of each turn) move the ball to the correct side
		// and randomize the direction to add some challenge.
		if (turnDelayIsOver() && turn) {
			ball.moveX = turn === player1 ? 3 : 4;
			ball.moveY = [1, 2][Math.round(Math.random())];
			ball.y = Math.floor(Math.random() * canvas.height - (canvas.height / 4.9)) + (canvas.height / 4.9);
			turn = null;
		}
	
		// If the player1 collides with the bound limits, update the x and y coords.
		if (player1.y <= 0) player1.y = 0;
		else if (player1.y >= (canvas.height - player1.height)) player1.y = (canvas.height - player1.height);

		// Move ball in intended direction based on moveY and moveX values
		if (ball.moveY === 1) ball.y -= (ball.speed / (canvas.height / 653.33));
		else if (ball.moveY === 2) ball.y += (ball.speed / (canvas.height / 653.33));
		if (ball.moveX === 3) ball.x -= ball.speed;
		else if (ball.moveX === 4) ball.x += ball.speed;
	
		// Handle AI UP and DOWN movement
		if (AI.y > ball.y - (AI.height / 2)) {
			if (ball.moveX === 4) AI.y -= AI.speed / (canvas.height / 653.33);
			else AI.y -= AI.speed / 4;
		}
		if (AI.y < ball.y - (AI.height / 2)) {
			if (ball.moveX === 4) AI.y += AI.speed / (canvas.height / 653.33);
			else AI.y += AI.speed / 4;
		}
	
		// Handle AI wall collision
		if (AI.y >= canvas.height - AI.height) AI.y = canvas.height - AI.height;
		else if (AI.y <= 0) AI.y = 0;

		// Handle Player-Ball collisions
		if (ball.x - ball.width <= player1.x && ball.x >= player1.x - player1.width) {
			if (ball.y <= player1.y + player1.height && ball.y + ball.height >= player1.y) {
				ball.x = (player1.x + ball.width);
				ball.moveX = 4;
			
				//beep1.play();
			}
		}
	
		// Handle AI-ball collision
		if (ball.x - ball.width <= AI.x && ball.x >= AI.x - AI.width) {
			if (ball.y <= AI.y + AI.height && ball.y + ball.height >= AI.y) {
				ball.x = (AI.x - ball.width);
				ball.moveX = 3;
			
				//beep1.play();
			}
		}
	}

		// Handle the end of round transition
	if (player1.score === rounds[round] || AI.score === rounds[round]) {
		// Check to see if the player1 won the round.
		if (player1.score === rounds[round])
			player1.winned += 1;
		else
			AI.winned += 1;	
		// Check to see if there are any more rounds/levels left and display the victory screen if
		round += 1;
		if (!rounds[round] || (player1.winned > (rounds.length / 2) || (AI.winned > (rounds.length / 2)))) {
			over = true;
			if (player1.winned > AI.winned)
			setTimeout(function () {
					endGameMenu(player1.nickname + " won");
			}, 1000);
			else
			setTimeout(function () {
				endGameMenu(AI.nickname + " won");
			}, 1000);
		//beep3.play();
			return ;
		}
		// Reset all the values and increment the round number.
		color = generateRoundColor();
		player1.score = AI.score = 0;
		player1.speed += (canvas.height / 1960);
		AI.speed += (canvas.height / 980);
		player1.x = (canvas.height / 6.53)
		AI.x = canvas.width - (canvas.height / 6.53),
		player1.y = AI.y = (canvas.height / 2) - (canvas.height / 28),
		ball.speed += (canvas.height / 980);
	}
}

// Draw the objects to the canvas element
function draw() {

	// Clear the Canvas
	context.clearRect(
		0,
		0,
		canvas.width,
		canvas.height
	);

	// Set the fill style to black
	context.fillStyle = color;

	// Draw the background
	context.fillRect(
		0,
		0,
		canvas.width,
		canvas.height
	);

	// Set the fill style to black (For the AIs and the ball)
	context.fillStyle = '#000000';
		
	// Draw the Player1 background
	context.fillRect(
		player1.x - (canvas.height / 490),
		player1.y - (canvas.height / 490),
		player1.width + (canvas.height / 245),
		player1.height + (canvas.height / 245)
	);
		
	// Draw the AI background
	context.fillRect(
		AI.x - (canvas.height / 490),
		AI.y - (canvas.height / 490),
		AI.width + (canvas.height / 245),
		AI.height + (canvas.height / 245)
	);

	// Draw the ball background
	if (turnDelayIsOver()) {
		context.fillRect(
			ball.x - (canvas.height / 490),
			ball.y - (canvas.height / 490),
			ball.width + (canvas.height / 245),
			ball.height + (canvas.height / 245)
		);
	}

	// Set the fill style to white (For the AIs and the ball)
	context.fillStyle = '#ffffff';
		
	// Draw the player1
	context.fillRect(
		player1.x,
		player1.y,
		player1.width,
		player1.height
	);

	// Draw the AI
	context.fillRect(
		AI.x,
		AI.y,
		AI.width,
		AI.height
	);

	context.font = (canvas.height / 50).toString() +'px Courier New';
	context.fillStyle = '#000000';
	context.textAlign = 'center';
	// Draw the player1 nickname
	context.fillText(
		player1.nickname,
		player1.x + (canvas.height / 130),
		player1.y - (canvas.height / 70)
	);
	// Draw the AI nickname
	context.fillText(
		AI.nickname,
		AI.x + (canvas.height / 130),
		AI.y - (canvas.height / 70)
	);

	context.fillStyle = '#ffffff';


	// Draw the Ball
	if (turnDelayIsOver()) {
		context.fillRect(
			ball.x,
			ball.y,
			ball.width,
			ball.height
		);
	}

	if (over == false) { 
		// Draw the net (Line in the middle)
		let w = canvas.height / 245;
		let x = (canvas.width - 4) * 0.5;
		let y = canvas.height * 0.15 ;
		let step = canvas.height / 15;
		while (y < (canvas.height * 0.9)) {
			context.fillRect(x, y + step * 0.25, w, step * 0.5);
			y += step;
		}
	}
	// Draw the player1 win rounds (Line in the middle)
	w = canvas.height / 150;
	x = (canvas.width - 4) * 0.05;
	y = canvas.height * 0.15 ;
	step = canvas.height / 15;
	for (let i = 0; i < player1.winned; i++) {
		context.fillRect(y, x + step * 0.25, w, step * 0.5);
		y += step * 0.4;
	}
	
	// Draw the AI win rounds (Line in the middle)
	w = canvas.height / 150;
	x = (canvas.width - 4) * 0.05;
	y = canvas.height * 1.3;
	step = canvas.height / 15;
	for (let i = 0; i < AI.winned; i++) {
		context.fillRect(y, x + step * 0.25, w, step * 0.5);
		y -= step * 0.4;
	}

	// Set the default canvas font and align it to the center
	context.font = (canvas.height / 10).toString() + 'px Courier New';
	context.textAlign = 'center';

	// Draw the players score (left)
	context.fillText(
		player1.score.toString(),
		(canvas.width / 2) - (canvas.height / 3.27),
		(canvas.height / 4.9)
	);

	// Draw the AIs score (right)
	context.fillText(
		AI.score.toString(),
		(canvas.width / 2) + (canvas.height / 3.27),
		(canvas.height / 4.9)
	);

	if (over == false) {
		// Change the font size for the center score text
		context.font = (canvas.height / 20).toString() + 'px Courier New';
		// Draw the winning score (center)
		context.fillText(
			'Round ' + (round + 1),
			(canvas.width / 2),
			(canvas.height / 20)
		);
	}
	
	// Change the font size for the center score value
	context.font = (canvas.height / 15).toString() + 'px Courier';

	// Draw the current round number
	context.fillText(
		rounds[round] ? rounds[round] : rounds[round - 1],
		(canvas.width / 2),
		(canvas.height / 8)
	);
}
function loop() {
	update();
	draw();

	// If the game is not over, draw the next frame.
	if (!over) requestAnimationFrame(loop);
}

function listen () {
		document.addEventListener('keydown', function (key) {
			/*// Handle the 'Press any key to begin' function and start the game.
			if (running === false) {
				running = true;
				window.requestAnimationFrame(loop);
			}*/

			// Handle up arrow and w key events
			if (key.keyCode === 38 || key.keyCode === 87 || key.keyCode === 90) {
				player1.move = 1;
			}

			// Handle down arrow and s key events
			if (key.keyCode === 40 || key.keyCode === 83) {
				player1.move = 2;
			}
		});

		// Stop the player1 from moving when there are no keys being pressed.
		document.addEventListener('keyup', function (key) {
			player1.move = 0;
		});
}

// Reset the ball location, the player1 turns and set a delay before the next round begins.
function resetTurn(victor, loser) {
		ball = Ball.new(ball.speed);
		turn = loser;
		timer = (new Date()).getTime();

		victor.score++;
		//beep2.play();
}

	// Wait for a delay to have passed after each turn.
function	turnDelayIsOver() {
		return ((new Date()).getTime() - timer >= 1000);
}

// Select a random color as the background of each level/round.
function 	generateRoundColor() {
		let colors = ['#3dcbff', '#ff52d1', '#000000', '#2c3e50'];

		let newColor = colors[Math.floor(Math.random() * colors.length)];
		if (newColor === color) return generateRoundColor();
		return newColor;
}

function	countdown(number) {
			// Change the canvas font size and color
			context.font = (canvas.height / 5).toString() + 'px Courier New';
			context.fillStyle = color;

			// background
			context.fillRect(
				ball.x - (canvas.height / 20),
				ball.y - (canvas.height / 2.9),
				ball.width + (canvas.height / 10),
				ball.height + (canvas.height)
			);

			// Change the canvas color;
			context.fillStyle = '#ffffff';

			// Draw the 'press any key to begin' text
			context.fillText(number,
				canvas.width / 2,
				canvas.height / 2 + (canvas.height / 65.33)
			);
}

initialize();