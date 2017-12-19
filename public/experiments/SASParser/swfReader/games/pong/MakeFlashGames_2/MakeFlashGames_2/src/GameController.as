/*
-------------------------------------------------------------------------------------------------
All contents (including text, graphics, actionscript code, fla source files and all other original 
works), on MakeFlashGames.com website is licensed under a Creative Commons License.

Copyright: Joseph Tan
Location: Singapore
Website: http://www.makeflashgames.com
Email: joseph@makeflashgames.com
Licensing: http://creativecommons.org/licenses/by-nc/2.0/

None of the tutorials/codes/graphics here should be distributed or used for any commercial purposes 
without first seeking prior permission from the author.
Any use of the materials here must carry an acknowledgment of the original author as the sole 
owner to the rights of this document.

Kindly contact joseph@makeflashgames.com if you would like to use these materials for commercial
or educational purposes.
-------------------------------------------------------------------------------------------------
*/

package
{
	import flash.display.MovieClip;
	import flash.events.*;
	import flash.geom.*;
	import flash.text.*;
	
	import Game.*;
	
	public class GameController extends MovieClip
	{
		private var player:Player;
		private var computer:Computer;
		private var topWall, bottomWall: Wall;
		private var ball: Ball;
		private var ballVelX, ballVelY: Number;
		private var playerScore:Number;
		private var computerScore:Number;		
		private var gameTime:Number;
		
		//User Input
		private var moveY,moveY2:Number;
		
		public function GameController()
		{
			
		}
		
		public function startGame()
		{
			//Create ball
			ball = new Ball();
			ball.x = C.BALL_START_X;
			ball.y = C.BALL_START_Y;
			mcGameStage.addChild(ball);
			
			//Create player
			player = new Player();
			player.x = C.PLAYER_START_X;
			player.y = C.PLAYER_START_Y;
			mcGameStage.addChild(player);
			
			//Create computer
			computer = new Computer();
			computer.x = C.COMPUTER_START_X;
			computer.y = C.COMPUTER_START_Y;
			mcGameStage.addChild(computer);
			
			//Create top and bottom walls
			topWall = new Wall();
			topWall.x = C.TOP_WALL_X;
			topWall.y = C.TOP_WALL_Y;
			bottomWall = new Wall();
			bottomWall.x = C.BOTTOM_WALL_X;
			bottomWall.y = C.BOTTOM_WALL_Y;			
			mcGameStage.addChild(topWall);
			mcGameStage.addChild(bottomWall);
			
			playerScore = C.PLAYER_START_SCORE;
			computerScore = C.COMPUTER_START_SCORE;
			
			moveY = 0;
			moveY2 = 0;
			ballVelX = -1;
			ballVelY = 1;
			
			mcGameStage.addEventListener(Event.ENTER_FRAME,update);
			
			//Handle event when this game is being preloaded
			addEventListener(Event.ADDED_TO_STAGE, gameAddedToStage ); 
			
			//Handle situations when this game is being run directly
			if (stage != null)
			{
				stage.addEventListener(KeyboardEvent.KEY_DOWN,keyDownHandler);
				stage.addEventListener(KeyboardEvent.KEY_UP,keyUpHandler);
			}
		}		
		
		private function gameAddedToStage(evt: Event):void
		{
			stage.addEventListener(KeyboardEvent.KEY_DOWN,keyDownHandler);
			stage.addEventListener(KeyboardEvent.KEY_UP,keyUpHandler);
		}		
		
		private function keyDownHandler(evt:KeyboardEvent):void
		{
			if (evt.keyCode == 87)
			{
				//Move player up
				moveY = -1;
			}
			else if (evt.keyCode == 83)
			{
				//Move player down
				moveY = 1;
			}
		}
	
		private function keyUpHandler(evt:KeyboardEvent):void
		{
			moveY = 0;
		}
		
		private function update(evt:Event)
		{
			//******************			
			//Handle User Input
			//******************
			//Handle Player 1 User Input
				//Handled with keyDownHandler
			//Handle Player 2 User Input
				//Handled with Computer AI
			moveY2 = 0;
			if (Math.random() < C.COMPUTER_INTELLIGENCE)
			{
				//Computer reacts and move towards ball position
				if (ballVelY < 0)
					moveY2 = -1;
				else if (ballVelY > 0)
					moveY2 = 1;
			}
			
			//******************
			//Handle Game Logic
			//******************
			//Handle new Player Position
			if (moveY > 0)
			{
				if (player.y - C.COMPUTER_SPEED <= C.PLAYER_UPPER_BOUND)
					player.y += C.PLAYER_SPEED;
			}
			else if (moveY < 0)
			{
				if (player.y - C.COMPUTER_SPEED > C.PLAYER_LOWER_BOUND)
					player.y -= C.PLAYER_SPEED;	
			}
			
			//Handle new Player 2 Position
			if (moveY2 > 0)
			{
				if (computer.y + C.COMPUTER_SPEED <= C.PLAYER_UPPER_BOUND)
					computer.y += C.COMPUTER_SPEED;
			}
			else if (moveY2 < 0)
			{
				if (computer.y - C.COMPUTER_SPEED > C.PLAYER_LOWER_BOUND)
					computer.y -= C.COMPUTER_SPEED;	
			}
			
			//Handle new Ball Position
			if (ballVelX < 0)
			{
				ball.x -= C.BALL_SPEED + Math.floor(Math.random()*C.SPEED_MOD);
			}
			else if (ballVelX > 0)
			{
				ball.x += C.BALL_SPEED +  Math.floor(Math.random()*C.SPEED_MOD);
			}
			
			if (ballVelY < 0)
			{
				ball.y -= C.BALL_SPEED +  Math.floor(Math.random()*C.SPEED_MOD);
			}
			else if (ballVelY > 0)
			{
				ball.y += C.BALL_SPEED +  Math.floor(Math.random()*C.SPEED_MOD);
			}
			
			//Check for collision
			//---------------------
			//Top and bottom walls
			if (ball.y <= topWall.y + topWall.height)
			{
				ballVelY = 1;
			}
			else if (ball.y >= bottomWall.y)
			{
				ballVelY = -1;
			}
			
			//Player and Computer collisions
			if (ball.x <= player.x)
			{
				if (Math.abs(ball.y - player.y) <= player.height/2)
				{
					ballVelX = 1;
				}
			}
			else if (ball.x >= computer.x)
			{
				if (Math.abs(ball.y - computer.y) <= computer.height/2)
				{
					ballVelX = -1;
				}
			}
			
			//Check for Winning
			//---------------------
			if (ball.x < C.PLAYER_LOSE)
			{
				resetGame();
				computerScore += 1;
			}
			else if (ball.x > C.COMPUTER_LOSE)
			{
				resetGame();
				playerScore += 1;				
			}
			
			//******************
			//Handle Display
			//******************
			//Display new Score
			txtScorePlayer.text = String(playerScore);
			txtScoreComputer.text = String(computerScore);
		}
		
		private function resetGame():void
		{
			ball.x = C.BALL_START_X;
			ball.y = C.BALL_START_Y;
			player.x = C.PLAYER_START_X;
			player.y = C.PLAYER_START_Y;			
			moveY = 0;
			moveY2 = 0;
			ballVelX = -1;
			ballVelY = 1;
		}
	}
}