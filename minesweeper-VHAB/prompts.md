Which one is the best framework/library for HTML5/CSS/Javascript browser platform classic window game Minesweeper clone?
----
You are an expert game developer. Your task is to set up the structure for a lightweight classic Windows Minesweeper Clone using Phaser 3, a popular HTML5 game framework. I don’t want to write a line of code myself, so please handle all the necessary file creation and setup.

First, create the following project structure:
-minesweeper-clone/
  │── index.html
  │── main.js
  │── assets/
  │    │── images/
  │    │── audio/

Execute the necessary commands using Python to create these directories and files.

Once the structure is created, populate index.html and main.js and verify Phaser is correctly added.
----
move all these files into the @minesweeper-VHAB folder
----
index.html:1 Access to script at 'file:///Users/victor/lidr/-Ai4devs-videogame-2026-03-senior/minesweeper-VHAB/main.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: chrome, chrome-extension, chrome-untrusted, data, http, https, isolated-app.
----
I will be loading more images and sound assets, so might as well start runing a local server with python. Make all the necessary changes for this
----
You are an expert game developer. Your task is to continue setting up the Minesweeper Clone using Phaser 3. We have already created the basic project structure, and the initial HTML and JavaScript files are set up.

Now we need to:
- create a grid of 10*10
- add 15 mines hidden randomly on the tiles of the grid.
- the player can click on any of the tiles with the left click to uncover it
- if the player left click on a tile with a mine, its game over.
- if the player left click on an empty tile, it shows a number which represents the number of mines in adjacent tiles.
- if the player left click on a tile and there are no adjacent mines, discover the adjacent tiles as well.
- stop the chain process above until the discovered tiles have at least one adjacent mine.
----
You are an expert game developer. Your task is to continue setting up the Minesweeper Clone using Phaser 3. We have added the basic functionality of the game. now we are going to add some extra elements.

- the player can right click on a tile, this will put a flag over it.
- add a points counter, whenever a tile without a mine is uncovered, the player wins 10 points
- at the end of the game (wether the player uncovered all tiles or gets game over for clicking on a mine) they get 50 points for every flag added on a tile with a mine.
----
You are an expert game developer. Your task is to continue setting up the Minesweeper Clone using Phaser 3.  We will add some extra elements

- when its game over, give the player the option to restart a game.
- add 3 difficulty levels: 
  - easy: 10 * 10 grid, 15 mines
  - intermediate: 16 * 16 grid, 40 mines
  - hard: 30 * 16 grid, 99 mines
- at the begining of a game, let the player choose the difficulty.
----
yes. Add a Back to difficulty menu
----
I have added assets for the flag and mine, please use the assets under images to show these elements
----
resize the pngs to better fit the whole tile
----
I have added @minesweeper-VHAB/assets/audio/mine_explosion.mp3 , use it so when a player clicks on a mine it souds
----
I have added @minesweeper-VHAB/assets/audio/game_over_music.mp3 when the player looses
----
make sure the game over music triggers after the mine explosion