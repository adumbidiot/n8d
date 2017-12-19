/*
-------------------------------------------------------------------------------------------------
All contents (including text, graphics, actionscript code, fla source files and all other original 
works), on MakeFlashGames.com website is licensed under a Creative Commons License.

Copyright: Joseph Tan
Location: Singapore
Website: http://www.makeflashgames.com
Email: admin@makeflashgames.com
Licensing: http://creativecommons.org/licenses/by-nc/2.0/

None of the tutorials/codes/graphics here should be distributed or used for any commercial purposes 
without first seeking prior permission from myself.
Any use of the materials here must carry an acknowledgment of the original author as the sole 
owner to the rights of this document.

Kindly contact admin@makeflashgames.com if you would like to use these materials for commercial
or educational purposes.
-------------------------------------------------------------------------------------------------
*/

package Game
{
	public class C
	{	
		//Player/Computer
		public static const PLAYER_SPEED:Number = 4;
		public static const PLAYER_START_X:Number = 35;
		public static const PLAYER_START_Y:Number = 230;
		public static const PLAYER_LOWER_BOUND = 90;
		public static const PLAYER_UPPER_BOUND = 360;
		
		public static const COMPUTER_SPEED:Number = 4;
		public static const COMPUTER_START_X:Number = 565;
		public static const COMPUTER_START_Y:Number = 230;
		public static const COMPUTER_INTELLIGENCE:Number = 0.4;
		
		public static const SPEED_MOD:Number = 5;
		
		//Walls
		public static const TOP_WALL_X:Number = 0;
		public static const TOP_WALL_Y:Number = 0;
		public static const BOTTOM_WALL_X:Number = 0;
		public static const BOTTOM_WALL_Y:Number = 430;
		
		//Ball
		public static const BALL_SPEED:Number = 6;
		public static const BALL_START_X:Number = 300;
		public static const BALL_START_Y:Number = 250;
		public static const BALL_SPEED_UP:Number = 440;		

		//Win
		public static const PLAYER_LOSE:Number = 10;
		public static const COMPUTER_LOSE:Number = 590;
		
		//Scoring
		public static const PLAYER_START_SCORE:Number = 0;
		public static const COMPUTER_START_SCORE:Number = 0;		
		public static const SCORE_PER_ROUND:Number = 0;
	}
}