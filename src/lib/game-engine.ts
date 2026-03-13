/**
 * Space Defender game engine for ShelbyGameVault.
 *
 * A simple canvas-based space shooter that demonstrates
 * Shelby protocol integration for storing high scores.
 */

export interface GameState {
  running: boolean;
  paused: boolean;
  score: number;
  lives: number;
  level: number;
  gameOver: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
}

export interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
}

export interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
  points: number;
  type: "basic" | "fast" | "tank";
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export interface PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: "shield" | "rapid" | "life";
  color: string;
}

export class SpaceDefenderEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;

  private state: GameState;
  private player: Player;
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private stars: Star[] = [];
  private powerUps: PowerUp[] = [];
  private particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

  private keys: Set<string> = new Set();
  private lastShot = 0;
  private lastEnemySpawn = 0;
  private lastPowerUpSpawn = 0;
  private shieldActive = false;
  private shieldTimer = 0;
  private rapidFireActive = false;
  private rapidFireTimer = 0;

  private onScoreChange?: (score: number) => void;
  private onGameOver?: (score: number) => void;
  private onStateChange?: (state: GameState) => void;

  constructor(
    canvas: HTMLCanvasElement,
    callbacks?: {
      onScoreChange?: (score: number) => void;
      onGameOver?: (score: number) => void;
      onStateChange?: (state: GameState) => void;
    }
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context not available");
    this.ctx = ctx;

    this.onScoreChange = callbacks?.onScoreChange;
    this.onGameOver = callbacks?.onGameOver;
    this.onStateChange = callbacks?.onStateChange;

    this.state = {
      running: false,
      paused: false,
      score: 0,
      lives: 3,
      level: 1,
      gameOver: false,
    };

    this.player = {
      x: canvas.width / 2 - 20,
      y: canvas.height - 60,
      width: 40,
      height: 40,
      speed: 5,
      color: "#00ff88",
    };

    this.initStars();
    this.bindKeys();
  }

  private initStars(): void {
    this.stars = [];
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }
  }

  private bindKeys(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keys.add(e.key);
      if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown" ||
          e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Store for cleanup
    this._keydownHandler = handleKeyDown;
    this._keyupHandler = handleKeyUp;
  }

  private _keydownHandler?: (e: KeyboardEvent) => void;
  private _keyupHandler?: (e: KeyboardEvent) => void;

  start(): void {
    this.state = {
      running: true,
      paused: false,
      score: 0,
      lives: 3,
      level: 1,
      gameOver: false,
    };
    this.player.x = this.canvas.width / 2 - 20;
    this.player.y = this.canvas.height - 60;
    this.bullets = [];
    this.enemies = [];
    this.powerUps = [];
    this.particles = [];
    this.shieldActive = false;
    this.rapidFireActive = false;
    this.lastShot = 0;
    this.lastEnemySpawn = 0;
    this.lastPowerUpSpawn = 0;
    this.onStateChange?.(this.state);
    this.loop();
  }

  pause(): void {
    this.state.paused = !this.state.paused;
    this.onStateChange?.(this.state);
    if (!this.state.paused) {
      this.loop();
    }
  }

  stop(): void {
    this.state.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.onStateChange?.(this.state);
  }

  destroy(): void {
    this.stop();
    if (this._keydownHandler) {
      window.removeEventListener("keydown", this._keydownHandler);
    }
    if (this._keyupHandler) {
      window.removeEventListener("keyup", this._keyupHandler);
    }
  }

  getState(): GameState {
    return { ...this.state };
  }

  private loop = (): void => {
    if (!this.state.running || this.state.paused) return;

    this.update();
    this.render();

    if (this.state.running && !this.state.gameOver) {
      this.animationId = requestAnimationFrame(this.loop);
    }
  };

  private update(): void {
    const now = Date.now();

    // Player movement
    if (this.keys.has("ArrowLeft") || this.keys.has("a")) {
      this.player.x = Math.max(0, this.player.x - this.player.speed);
    }
    if (this.keys.has("ArrowRight") || this.keys.has("d")) {
      this.player.x = Math.min(
        this.canvas.width - this.player.width,
        this.player.x + this.player.speed
      );
    }
    if (this.keys.has("ArrowUp") || this.keys.has("w")) {
      this.player.y = Math.max(
        this.canvas.height / 2,
        this.player.y - this.player.speed
      );
    }
    if (this.keys.has("ArrowDown") || this.keys.has("s")) {
      this.player.y = Math.min(
        this.canvas.height - this.player.height,
        this.player.y + this.player.speed
      );
    }

    // Shooting
    const fireRate = this.rapidFireActive ? 100 : 250;
    if (this.keys.has(" ") && now - this.lastShot > fireRate) {
      this.bullets.push({
        x: this.player.x + this.player.width / 2 - 2,
        y: this.player.y,
        width: 4,
        height: 12,
        speed: 8,
        color: this.rapidFireActive ? "#ff4444" : "#00ffff",
      });
      this.lastShot = now;
    }

    // Update bullets
    this.bullets = this.bullets.filter((b) => {
      b.y -= b.speed;
      return b.y > -b.height;
    });

    // Spawn enemies
    const spawnRate = Math.max(400, 1200 - this.state.level * 80);
    if (now - this.lastEnemySpawn > spawnRate) {
      this.spawnEnemy();
      this.lastEnemySpawn = now;
    }

    // Spawn power-ups
    if (now - this.lastPowerUpSpawn > 10000) {
      this.spawnPowerUp();
      this.lastPowerUpSpawn = now;
    }

    // Update enemies
    this.enemies = this.enemies.filter((e) => {
      e.y += e.speed;
      return e.y < this.canvas.height + e.height;
    });

    // Update power-ups
    this.powerUps = this.powerUps.filter((p) => {
      p.y += p.speed;
      return p.y < this.canvas.height + p.height;
    });

    // Update stars
    this.stars.forEach((s) => {
      s.y += s.speed;
      if (s.y > this.canvas.height) {
        s.y = 0;
        s.x = Math.random() * this.canvas.width;
      }
    });

    // Update particles
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      return p.life > 0;
    });

    // Power-up timers
    if (this.shieldActive && now > this.shieldTimer) {
      this.shieldActive = false;
    }
    if (this.rapidFireActive && now > this.rapidFireTimer) {
      this.rapidFireActive = false;
    }

    // Collision: bullets vs enemies
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        if (this.collides(this.bullets[i], this.enemies[j])) {
          this.spawnExplosion(
            this.enemies[j].x + this.enemies[j].width / 2,
            this.enemies[j].y + this.enemies[j].height / 2,
            this.enemies[j].color
          );
          this.state.score += this.enemies[j].points;
          this.onScoreChange?.(this.state.score);
          this.bullets.splice(i, 1);
          this.enemies.splice(j, 1);

          // Level up every 500 points
          const newLevel = Math.floor(this.state.score / 500) + 1;
          if (newLevel > this.state.level) {
            this.state.level = newLevel;
            this.player.speed = Math.min(8, 5 + this.state.level * 0.3);
          }
          break;
        }
      }
    }

    // Collision: player vs enemies
    for (let j = this.enemies.length - 1; j >= 0; j--) {
      if (this.collides(this.player, this.enemies[j])) {
        this.spawnExplosion(
          this.enemies[j].x + this.enemies[j].width / 2,
          this.enemies[j].y + this.enemies[j].height / 2,
          "#ff0000"
        );
        this.enemies.splice(j, 1);

        if (!this.shieldActive) {
          this.state.lives--;
          if (this.state.lives <= 0) {
            this.state.gameOver = true;
            this.state.running = false;
            this.onGameOver?.(this.state.score);
            this.onStateChange?.(this.state);
            this.render(); // Final render
            return;
          }
        }
      }
    }

    // Collision: player vs power-ups
    for (let j = this.powerUps.length - 1; j >= 0; j--) {
      if (this.collides(this.player, this.powerUps[j])) {
        const pu = this.powerUps[j];
        if (pu.type === "shield") {
          this.shieldActive = true;
          this.shieldTimer = now + 5000;
        } else if (pu.type === "rapid") {
          this.rapidFireActive = true;
          this.rapidFireTimer = now + 5000;
        } else if (pu.type === "life") {
          this.state.lives = Math.min(5, this.state.lives + 1);
        }
        this.powerUps.splice(j, 1);
      }
    }

    // Enemies that pass below = lose life
    for (let j = this.enemies.length - 1; j >= 0; j--) {
      if (this.enemies[j].y > this.canvas.height) {
        this.enemies.splice(j, 1);
      }
    }

    this.onStateChange?.(this.state);
  }

  private spawnEnemy(): void {
    const types: Array<{ type: Enemy["type"]; color: string; speed: number; width: number; height: number; points: number }> = [
      { type: "basic", color: "#ff4466", speed: 2, width: 30, height: 30, points: 10 },
      { type: "fast", color: "#ffaa00", speed: 4, width: 24, height: 24, points: 25 },
      { type: "tank", color: "#aa44ff", speed: 1.2, width: 40, height: 40, points: 50 },
    ];

    const levelBonus = this.state.level * 0.15;
    const typeIndex =
      Math.random() < 0.6 ? 0 : Math.random() < 0.8 ? 1 : 2;
    const template = types[typeIndex];

    this.enemies.push({
      x: Math.random() * (this.canvas.width - template.width),
      y: -template.height,
      width: template.width,
      height: template.height,
      speed: template.speed + levelBonus,
      color: template.color,
      points: template.points,
      type: template.type,
    });
  }

  private spawnPowerUp(): void {
    const types: Array<{ type: PowerUp["type"]; color: string }> = [
      { type: "shield", color: "#00aaff" },
      { type: "rapid", color: "#ff6600" },
      { type: "life", color: "#00ff00" },
    ];
    const t = types[Math.floor(Math.random() * types.length)];
    this.powerUps.push({
      x: Math.random() * (this.canvas.width - 20),
      y: -20,
      width: 20,
      height: 20,
      speed: 1.5,
      type: t.type,
      color: t.color,
    });
  }

  private spawnExplosion(x: number, y: number, color: string): void {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
      });
    }
  }

  private collides(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private render(): void {
    const { ctx, canvas } = this;

    // Background
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    this.stars.forEach((s) => {
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    ctx.globalAlpha = 1;

    // Particles
    this.particles.forEach((p) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;

    // Power-ups
    this.powerUps.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      const symbol = p.type === "shield" ? "S" : p.type === "rapid" ? "R" : "+";
      ctx.fillText(symbol, p.x + p.width / 2, p.y + p.height / 2 + 4);
    });

    // Enemies
    this.enemies.forEach((e) => {
      ctx.fillStyle = e.color;
      if (e.type === "basic") {
        ctx.fillRect(e.x, e.y, e.width, e.height);
      } else if (e.type === "fast") {
        ctx.beginPath();
        ctx.moveTo(e.x + e.width / 2, e.y);
        ctx.lineTo(e.x + e.width, e.y + e.height);
        ctx.lineTo(e.x, e.y + e.height);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(e.x + e.width / 2, e.y + e.height / 2, e.width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Bullets
    this.bullets.forEach((b) => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.width, b.height);
    });

    // Player ship
    ctx.fillStyle = this.player.color;
    ctx.beginPath();
    ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
    ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
    ctx.lineTo(this.player.x + this.player.width * 0.75, this.player.y + this.player.height * 0.7);
    ctx.lineTo(this.player.x + this.player.width * 0.25, this.player.y + this.player.height * 0.7);
    ctx.lineTo(this.player.x, this.player.y + this.player.height);
    ctx.closePath();
    ctx.fill();

    // Shield effect
    if (this.shieldActive) {
      ctx.strokeStyle = "#00aaff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
        this.player.width * 0.8,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Engine glow
    const glowSize = 4 + Math.random() * 4;
    ctx.fillStyle = "#ff6600";
    ctx.fillRect(
      this.player.x + this.player.width / 2 - glowSize / 2,
      this.player.y + this.player.height,
      glowSize,
      glowSize
    );

    // Game Over overlay
    if (this.state.gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#ff4444";
      ctx.font = "bold 36px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

      ctx.fillStyle = "#ffffff";
      ctx.font = "20px monospace";
      ctx.fillText(
        `Final Score: ${this.state.score}`,
        canvas.width / 2,
        canvas.height / 2 + 20
      );
      ctx.font = "14px monospace";
      ctx.fillText(
        "Press START to play again",
        canvas.width / 2,
        canvas.height / 2 + 50
      );
    }
  }
}
