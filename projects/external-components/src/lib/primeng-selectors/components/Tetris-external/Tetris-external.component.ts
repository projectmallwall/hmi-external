import { Component, HostListener } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

type Cell = '' | string; // empty or color string
interface Point { x: number; y: number; }
interface Shape {
  blocks: Point[];
  color: string;
}

const SHAPES: Shape[] = [
  { blocks: [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0}], color: '#00f0f0' }, // I
  { blocks: [{x:0,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}], color: '#f0a000' }, // J
  { blocks: [{x:2,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}], color: '#0000f0' }, // L
  { blocks: [{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1}], color: '#f0f000' }, // O
  { blocks: [{x:1,y:0},{x:2,y:0},{x:0,y:1},{x:1,y:1}], color: '#00f000' }, // S
  { blocks: [{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}], color: '#a000f0' }, // T
  { blocks: [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:2,y:1}], color: '#f00000' }, // Z
];

const ROWS: number = 20;
const COLS: number = 10;

@Component({
  selector: 'app-tetris',
  template: `
    <div class="tetris-root">
      <div 
        class="tetris-board" 
        [style.width.px]="boardWidth"
        [style.height.px]="boardHeight"
      >
        <div 
          *ngFor="let row of board; let y = index"
          class="tetris-row"
        >
          <div 
            *ngFor="let cell of row; let x = index"
            class="tetris-cell"
            [ngStyle]="{'background': getCellColor(x, y)}"
          ></div>
        </div>
        <div class="game-over" *ngIf="gameOver">Game Over<br><button (click)="restart()">Restart</button></div>
      </div>
      <div class="controls">
        <button (touchstart)="moveLeft()" aria-label="Move Left">◀️</button>
        <button (touchstart)="rotate()" aria-label="Rotate">🔄</button>
        <button (touchstart)="moveRight()" aria-label="Move Right">▶️</button>
        <button (touchstart)="moveDown()" aria-label="Move Down">⬇️</button>
      </div>
      <div class="score">Score: {{score}}</div>
    </div>
  `,
  styles: [`
    .tetris-root {
      width: 100vw; height: 100vh;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: #181828;
      color: #fff;
      font-family: monospace;
      box-sizing: border-box;
      touch-action: manipulation;
      overflow: hidden;
    }
    .tetris-board {
      display: grid;
      grid-template-rows: repeat(${ROWS}, 1fr);
      grid-template-columns: repeat(${COLS}, 1fr);
      background: #23233a;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      margin-bottom: 12px;
      box-shadow: 0 2px 24px #0006;
      min-width: 220px;
      min-height: 440px;
      /* The width and height are set inline for square cells */
      will-change: width, height;
    }
    .tetris-row { display: contents; }
    .tetris-cell {
      width: 100%; height: 100%;
      border: 1px solid #22223b;
      box-sizing: border-box;
      transition: background 0.1s;
      background: #22223b;
      aspect-ratio: 1 / 1;
    }
    .game-over {
      position: absolute;
      top: 40%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(24,24,40,0.95);
      color: #fff;
      padding: 2em 3em;
      border-radius: 12px;
      text-align: center;
      font-size: 1.5em;
      z-index: 2;
    }
    .controls {
      display: flex;
      gap: 1em;
      justify-content: center;
      margin: 0.7em 0 0.2em 0;
    }
    .controls button {
      background: #23233a;
      border: none;
      color: #fff;
      font-size: 2em;
      padding: 0.4em 0.6em;
      border-radius: 50%;
      outline: none;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s;
    }
    .controls button:active {
      background: #39396a;
    }
    .score {
      text-align: center;
      font-size: 1.1em;
      margin-top: 0.2em;
      letter-spacing: 1px;
    }
    @media (max-width: 600px) {
      .tetris-board { min-width: 140px; min-height: 280px; }
      .controls button { font-size: 1.5em; }
    }
  `]
})
export class TetrisComponent extends CommonExternalComponent {
  board: Cell[][] = [];
  activeShape!: Shape;
  shapePos: Point = { x: 3, y: 0 };
  rotation: number = 0;
  dropInterval: any;
  gameOver: boolean = false;
  score: number = 0;
  boardWidth: number = 320;
  boardHeight: number = 640;

  ngOnInit(): void {
    this.updateBoardSize();
    window.addEventListener('resize', this.updateBoardSizeBound);
    this.start();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateBoardSizeBound);
    if (this.dropInterval) clearInterval(this.dropInterval);
  }

  private updateBoardSizeBound = this.updateBoardSize.bind(this);

  updateBoardSize(): void {
    const vw: number = window.innerWidth;
    const vh: number = window.innerHeight;
    const reservedVertical: number = 180;
    const maxBoardWidth: number = vw * 0.98;
    const maxBoardHeight: number = vh - reservedVertical;
    const cellSizeByWidth: number = Math.floor(maxBoardWidth / COLS);
    const cellSizeByHeight: number = Math.floor(maxBoardHeight / ROWS);
    const cellSize: number = Math.max(18, Math.min(cellSizeByWidth, cellSizeByHeight));
    this.boardWidth = cellSize * COLS;
    this.boardHeight = cellSize * ROWS;
  }

  start(): void {
    this.board = Array.from({length: ROWS}, () => Array<Cell>(COLS).fill(''));
    this.score = 0;
    this.gameOver = false;
    this.spawnShape();
    if (this.dropInterval) clearInterval(this.dropInterval);
    this.dropInterval = setInterval(() => this.tick(), 400);
  }

  restart(): void {
    this.start();
  }

  spawnShape(): void {
    const idx: number = Math.floor(Math.random() * SHAPES.length);
    this.activeShape = JSON.parse(JSON.stringify(SHAPES[idx]));
    this.shapePos = { x: 3, y: 0 };
    this.rotation = 0;
    if (!this.isValid(this.shapePos.x, this.shapePos.y, this.rotation)) {
      this.gameOver = true;
      clearInterval(this.dropInterval);
    }
  }

  tick(): void {
    if (!this.move(0, 1)) {
      this.lockShape();
      this.clearRows();
      this.spawnShape();
    }
  }

  move(dx: number, dy: number): boolean {
    if (this.isValid(this.shapePos.x + dx, this.shapePos.y + dy, this.rotation)) {
      this.shapePos.x += dx;
      this.shapePos.y += dy;
      return true;
    }
    return false;
  }

  moveLeft(): void { if (!this.gameOver) this.move(-1, 0); }
  moveRight(): void { if (!this.gameOver) this.move(1, 0); }
  moveDown(): void { if (!this.gameOver) this.tick(); }
  rotate(): void {
    if (this.gameOver) return;
    const nextRot: number = (this.rotation + 1) % 4;
    // Try to rotate in place, then wall-kick right, then left if needed
    if (this.isValid(this.shapePos.x, this.shapePos.y, nextRot)) {
      this.rotation = nextRot;
    } else if (this.isValid(this.shapePos.x, this.shapePos.y, nextRot, true)) {
      // Centered wall kick: try shifting right or left for proper axis
      // Already handled in isValid with allowKick
      this.rotation = nextRot;
    }
  }

  /**
   * Checks validity at (x, y) with rotation rot.
   * If allowKick is true, tries wall kicks (right then left shift by 1).
   */
  isValid(x: number, y: number, rot: number, allowKick: boolean = false): boolean {
    // Compute rotated block positions relative to new origin
    const blocks: Point[] = this.getRotatedBlocks(rot);
    for (const pt of blocks) {
      const nx: number = x + pt.x;
      const ny: number = y + pt.y;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
        if (!allowKick) return false;
      }
      if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS && this.board[ny][nx]) {
        if (!allowKick) return false;
      }
    }
    if (allowKick) {
      // Try right kick
      if (this.isValid(x + 1, y, rot, false)) {
        this.shapePos.x = x + 1;
        return true;
      }
      // Try left kick
      if (this.isValid(x - 1, y, rot, false)) {
        this.shapePos.x = x - 1;
        return true;
      }
      return false;
    }
    return true;
  }

  lockShape(): void {
    for (const pt of this.getRotatedBlocks(this.rotation)) {
      const nx: number = this.shapePos.x + pt.x;
      const ny: number = this.shapePos.y + pt.y;
      if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS)
        this.board[ny][nx] = this.activeShape.color;
    }
  }

  clearRows(): void {
    let cleared: number = 0;
    for (let y: number = ROWS - 1; y >= 0; y--) {
      if (this.board[y].every(cell => !!cell)) {
        this.board.splice(y, 1);
        this.board.unshift(Array<Cell>(COLS).fill(''));
        cleared++;
        y++; // recheck the same row after shifting
      }
    }
    if (cleared > 0) this.score += cleared * 100;
  }

  /**
   * Returns rotated blocks about the actual "center" of the tetromino,
   * so shapes rotate in place instead of drifting left.
   */
  getRotatedBlocks(rot: number): Point[] {
    const blocks: Point[] = this.activeShape.blocks.map(pt => ({...pt}));
    // Find bounding box
    let minX: number = Math.min(...blocks.map(pt => pt.x));
    let minY: number = Math.min(...blocks.map(pt => pt.y));
    let maxX: number = Math.max(...blocks.map(pt => pt.x));
    let maxY: number = Math.max(...blocks.map(pt => pt.y));
    // Find geometric center (for Tetris, use the center of the 4x4 grid containing the piece)
    const cx: number = (minX + maxX) / 2;
    const cy: number = (minY + maxY) / 2;
    // Rotate each block around center
    return blocks.map(pt => {
      let x: number = pt.x - cx;
      let y: number = pt.y - cy;
      for (let i: number = 0; i < rot; i++) {
        [x, y] = [y, -x]; // Clockwise 90 deg
      }
      return {
        x: Math.round(x + cx),
        y: Math.round(y + cy)
      };
    });
  }

  getCellColor(x: number, y: number): string {
    for (const pt of this.getRotatedBlocks(this.rotation)) {
      if (x === this.shapePos.x + pt.x && y === this.shapePos.y + pt.y) {
        return this.activeShape.color;
      }
    }
    return this.board[y][x] || '#22223b';
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(e: KeyboardEvent): void {
    if (this.gameOver) return;
    switch (e.key) {
      case 'ArrowLeft': this.moveLeft(); break;
      case 'ArrowRight': this.moveRight(); break;
      case 'ArrowDown': this.moveDown(); break;
      case 'ArrowUp': this.rotate(); break;
      case ' ': e.preventDefault(); while (this.move(0,1)){} this.tick(); break;
    }
  }
}

/*
Features:
- Classic Tetris gameplay with 7 block shapes (I, J, L, O, S, T, Z)
- Shapes now rotate about their geometric center, not top-left, so rotation is visually correct
- Wall kicks: on failed rotation, tries to nudge right or left if possible
- All blocks/cells are perfectly square on all screens
- Responsive: board resizes to keep blocks square and maximize space
- Dark theme, mobile-friendly and responsive layout
- Controls: on-screen buttons (mobile) & keyboard (desktop)
- Row-clearing, scoring, and game over state
*/