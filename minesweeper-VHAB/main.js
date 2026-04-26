class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.difficulties = {
      easy: { label: "Easy (10 x 10, 15 mines)", rows: 10, cols: 10, mineCount: 15 },
      intermediate: {
        label: "Intermediate (16 x 16, 40 mines)",
        rows: 16,
        cols: 16,
        mineCount: 40,
      },
      hard: { label: "Hard (30 x 16, 99 mines)", rows: 16, cols: 30, mineCount: 99 },
    };
    this.currentDifficultyKey = null;
    this.rows = 0;
    this.cols = 0;
    this.mineCount = 0;
    this.tileSize = 24;
    this.tileGap = 1;
    this.boardStartX = 0;
    this.boardStartY = 0;
    this.board = [];
    this.gameOver = false;
    this.score = 0;
    this.endBonusApplied = false;
    this.menuElements = [];
    this.restartButton = null;
    this.backToMenuButton = null;
    this.backgroundMusic = null;
  }

  preload() {
    this.load.image("tileMine", "assets/images/mine.png");
    this.load.image("tileFlag", "assets/images/flag.png");
    this.load.audio("mineExplosion", "assets/audio/mine_explosion.mp3");
    this.load.audio("backgroundMusic", "assets/audio/background_music.mp3");
    this.load.audio("gameOverMusic", "assets/audio/game_over_music.mp3");
  }

  create() {
    this.input.mouse?.disableContextMenu();
    this.cameras.main.setBackgroundColor("#c0c0c0");
    this.addTitle();
    this.showDifficultyMenu();
  }

  addTitle() {
    this.add
      .text(this.scale.width / 2, 36, "Minesweeper", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#000000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.statusText = this.add
      .text(this.scale.width / 2, 74, "Choose a difficulty to start", {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#222222",
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(this.scale.width / 2, 98, "Score: 0", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#111111",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
  }

  showDifficultyMenu() {
    this.gameOver = false;
    this.currentDifficultyKey = null;
    this.score = 0;
    this.endBonusApplied = false;
    this.scoreText.setText("Score: 0");
    this.statusText.setText("Choose a difficulty to start");
    this.clearRestartControls();
    this.clearBoardVisuals();
    this.board = [];
    this.stopBackgroundMusic();
    this.clearMenuElements();

    const buttons = [
      { key: "easy", y: 220 },
      { key: "intermediate", y: 280 },
      { key: "hard", y: 340 },
    ];

    buttons.forEach((entry) => {
      const difficulty = this.difficulties[entry.key];
      const button = this.add
        .text(this.scale.width / 2, entry.y, difficulty.label, {
          fontFamily: "Arial",
          fontSize: "24px",
          color: "#ffffff",
          backgroundColor: "#4a6fa5",
          padding: { x: 14, y: 8 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => button.setBackgroundColor("#3b5c8b"))
        .on("pointerout", () => button.setBackgroundColor("#4a6fa5"))
        .on("pointerdown", () => this.startGame(entry.key));

      this.menuElements.push(button);
    });
  }

  startGame(difficultyKey) {
    this.currentDifficultyKey = difficultyKey;
    const difficulty = this.difficulties[difficultyKey];
    this.rows = difficulty.rows;
    this.cols = difficulty.cols;
    this.mineCount = difficulty.mineCount;
    this.gameOver = false;
    this.score = 0;
    this.endBonusApplied = false;
    this.scoreText.setText("Score: 0");
    this.statusText.setText("Left click: reveal | Right click: flag");
    this.clearMenuElements();
    this.clearRestartControls();
    this.clearBoardVisuals();
    this.calculateBoardLayout();
    this.createBoardData();
    this.placeMines();
    this.calculateAdjacencies();
    this.drawBoard();
    this.playBackgroundMusic();
  }

  calculateBoardLayout() {
    const horizontalMargin = 24;
    const topOffset = 130;
    const bottomMargin = 20;
    this.tileGap = this.cols > 20 ? 1 : 2;

    const availableWidth = this.scale.width - horizontalMargin * 2;
    const availableHeight = this.scale.height - topOffset - bottomMargin;

    const maxSizeByWidth = Math.floor(
      (availableWidth - (this.cols - 1) * this.tileGap) / this.cols
    );
    const maxSizeByHeight = Math.floor(
      (availableHeight - (this.rows - 1) * this.tileGap) / this.rows
    );

    this.tileSize = Math.max(14, Math.min(maxSizeByWidth, maxSizeByHeight));

    const boardWidth = this.cols * this.tileSize + (this.cols - 1) * this.tileGap;
    this.boardStartX = (this.scale.width - boardWidth) / 2;
    this.boardStartY = topOffset;
  }

  createBoardData() {
    this.board = [];
    for (let row = 0; row < this.rows; row += 1) {
      const boardRow = [];
      for (let col = 0; col < this.cols; col += 1) {
        boardRow.push({
          row,
          col,
          hasMine: false,
          adjacentMines: 0,
          revealed: false,
          flagged: false,
          rect: null,
          label: null,
          icon: null,
        });
      }
      this.board.push(boardRow);
    }
  }

  placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < this.mineCount) {
      const row = Phaser.Math.Between(0, this.rows - 1);
      const col = Phaser.Math.Between(0, this.cols - 1);
      const tile = this.board[row][col];
      if (!tile.hasMine) {
        tile.hasMine = true;
        minesPlaced += 1;
      }
    }
  }

  calculateAdjacencies() {
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const tile = this.board[row][col];
        if (tile.hasMine) {
          continue;
        }

        let count = 0;
        for (let r = row - 1; r <= row + 1; r += 1) {
          for (let c = col - 1; c <= col + 1; c += 1) {
            if (this.isInsideBoard(r, c) && this.board[r][c].hasMine) {
              count += 1;
            }
          }
        }
        tile.adjacentMines = count;
      }
    }
  }

  drawBoard() {
    const fontSize = Math.max(12, Math.floor(this.tileSize * 0.5));

    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const tile = this.board[row][col];
        const x = this.boardStartX + col * (this.tileSize + this.tileGap);
        const y = this.boardStartY + row * (this.tileSize + this.tileGap);

        tile.rect = this.add
          .rectangle(x, y, this.tileSize, this.tileSize, 0xbdbdbd)
          .setOrigin(0)
          .setStrokeStyle(2, 0x8f8f8f)
          .setInteractive({ useHandCursor: true })
          .on("pointerdown", (pointer) => this.onTileClicked(tile, pointer));

        tile.label = this.add
          .text(x + this.tileSize / 2, y + this.tileSize / 2, "", {
            fontFamily: "Arial",
            fontSize: `${fontSize}px`,
            color: "#111111",
            fontStyle: "bold",
          })
          .setOrigin(0.5);

        tile.icon = this.add
          .image(x + this.tileSize / 2, y + this.tileSize / 2, "tileFlag")
          .setDisplaySize(this.tileSize * 0.9, this.tileSize * 0.9)
          .setVisible(false);
      }
    }
  }

  onTileClicked(tile, pointer) {
    if (this.gameOver || tile.revealed) {
      return;
    }

    if (pointer.rightButtonDown()) {
      this.toggleFlag(tile);
      return;
    }

    if (tile.flagged) {
      return;
    }

    if (tile.hasMine) {
      this.playLoseAudioSequence();
      this.revealMine(tile);
      this.revealAllMines();
      this.endGame("Game Over! You hit a mine.");
      return;
    }

    this.revealTileAndNeighbors(tile.row, tile.col);

    if (this.checkWinCondition()) {
      this.endGame("You Win! All safe tiles revealed.");
    }
  }

  toggleFlag(tile) {
    if (tile.flagged) {
      tile.flagged = false;
      tile.label.setText("");
      tile.label.setVisible(true);
      tile.icon.setVisible(false);
      tile.rect.setFillStyle(0xbdbdbd);
      return;
    }

    tile.flagged = true;
    tile.label.setText("");
    tile.label.setVisible(false);
    tile.icon.setTexture("tileFlag");
    tile.icon.setVisible(true);
    tile.rect.setFillStyle(0xded7b8);
  }

  revealTileAndNeighbors(startRow, startCol) {
    const queue = [[startRow, startCol]];

    while (queue.length > 0) {
      const [row, col] = queue.shift();
      if (!this.isInsideBoard(row, col)) {
        continue;
      }

      const tile = this.board[row][col];
      if (tile.revealed || tile.hasMine || tile.flagged) {
        continue;
      }

      this.revealSafeTile(tile);

      // Only keep expanding through zero-value tiles.
      if (tile.adjacentMines === 0) {
        for (let r = row - 1; r <= row + 1; r += 1) {
          for (let c = col - 1; c <= col + 1; c += 1) {
            if ((r !== row || c !== col) && this.isInsideBoard(r, c)) {
              const neighbor = this.board[r][c];
              if (!neighbor.revealed && !neighbor.hasMine) {
                queue.push([r, c]);
              }
            }
          }
        }
      }
    }
  }

  revealSafeTile(tile) {
    tile.revealed = true;
    tile.flagged = false;
    tile.icon.setVisible(false);
    tile.label.setVisible(true);
    tile.rect.setFillStyle(0xe7e7e7);
    tile.rect.setStrokeStyle(1, 0xb0b0b0);
    this.addPoints(10);

    if (tile.adjacentMines > 0) {
      tile.label.setText(String(tile.adjacentMines));
      tile.label.setColor(this.getNumberColor(tile.adjacentMines));
    }
  }

  revealMine(tile) {
    tile.revealed = true;
    tile.flagged = false;
    tile.rect.setFillStyle(0xd9534f);
    tile.rect.setStrokeStyle(1, 0x8a1c1c);
    tile.label.setText("");
    tile.icon.setTexture("tileMine");
    tile.icon.setVisible(true);
  }

  revealAllMines() {
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const tile = this.board[row][col];
        if (tile.hasMine && !tile.revealed) {
          this.revealMine(tile);
        }
      }
    }
  }

  applyEndGameFlagBonus() {
    if (this.endBonusApplied) {
      return;
    }

    let correctFlags = 0;
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const tile = this.board[row][col];
        if (tile.flagged && tile.hasMine) {
          correctFlags += 1;
        }
      }
    }

    const bonus = correctFlags * 50;
    this.addPoints(bonus);
    this.endBonusApplied = true;
  }

  addPoints(points) {
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  endGame(baseMessage) {
    this.applyEndGameFlagBonus();
    this.gameOver = true;
    this.stopBackgroundMusic();
    this.statusText.setText(`${baseMessage} Final Score: ${this.score}`);
    this.showRestartControls();
  }

  showRestartControls() {
    this.clearRestartControls();
    this.restartButton = this.add
      .text(this.scale.width / 2 - 90, this.scale.height - 16, "Restart", {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#ffffff",
        backgroundColor: "#2d6a4f",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5, 1)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => this.restartButton.setBackgroundColor("#245540"))
      .on("pointerout", () => this.restartButton.setBackgroundColor("#2d6a4f"))
      .on("pointerdown", () => this.startGame(this.currentDifficultyKey));

    this.backToMenuButton = this.add
      .text(this.scale.width / 2 + 110, this.scale.height - 16, "Back to Menu", {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#ffffff",
        backgroundColor: "#355c7d",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5, 1)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => this.backToMenuButton.setBackgroundColor("#2b4a64"))
      .on("pointerout", () => this.backToMenuButton.setBackgroundColor("#355c7d"))
      .on("pointerdown", () => this.showDifficultyMenu());
  }

  clearRestartControls() {
    if (this.restartButton) {
      this.restartButton.destroy();
      this.restartButton = null;
    }
    if (this.backToMenuButton) {
      this.backToMenuButton.destroy();
      this.backToMenuButton = null;
    }
  }

  clearMenuElements() {
    this.menuElements.forEach((item) => item.destroy());
    this.menuElements = [];
  }

  clearBoardVisuals() {
    for (let row = 0; row < this.board.length; row += 1) {
      for (let col = 0; col < this.board[row].length; col += 1) {
        const tile = this.board[row][col];
        tile.rect?.destroy();
        tile.label?.destroy();
        tile.icon?.destroy();
      }
    }
  }

  playBackgroundMusic() {
    if (!this.backgroundMusic) {
      this.backgroundMusic = this.sound.add("backgroundMusic", {
        loop: true,
        volume: 0.35,
      });
    }

    if (!this.backgroundMusic.isPlaying) {
      this.backgroundMusic.play();
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.stop();
    }
  }

  playLoseAudioSequence() {
    this.sound.stopByKey("gameOverMusic");
    const explosion = this.sound.add("mineExplosion");

    explosion.once("complete", () => {
      explosion.destroy();
      this.sound.play("gameOverMusic", { volume: 0.5 });
    });

    explosion.play();
  }

  checkWinCondition() {
    let revealedSafeTiles = 0;
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const tile = this.board[row][col];
        if (!tile.hasMine && tile.revealed) {
          revealedSafeTiles += 1;
        }
      }
    }
    return revealedSafeTiles === this.rows * this.cols - this.mineCount;
  }

  isInsideBoard(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  getNumberColor(value) {
    const colors = {
      1: "#1e63c5",
      2: "#2a8f2a",
      3: "#c83b3b",
      4: "#5a2ca0",
      5: "#8f3f1f",
      6: "#1b8f8f",
      7: "#000000",
      8: "#6f6f6f",
    };
    return colors[value] || "#111111";
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 1100,
  height: 760,
  backgroundColor: "#1f1f1f",
  scene: [GameScene],
};

new Phaser.Game(config);
