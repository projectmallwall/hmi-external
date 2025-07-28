// birthday-wishes.component.ts

import { Component, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

@Component({
  selector: 'app-birthday-wishes',
  template: `
    <!-- 
      Features:
      - Central Happy Birthday card with modern typography and smooth animations (smaller size).
      - Dynamic background transitions from vibrant to dark.
      - Continuous falling confetti animation visible in the background.
      - Interactive button triggers animated firework display, clearly visible.
      - If a message or name is passed in the URL (?message=...&name=...), the personal wish section and name input are hidden.
      - Button to create & copy a shareable URL with the current wish message and name.
      - Name is shown in the greeting after fireworks burst if present in the URL.
      - Data is saved automatically in local storage.
      - Responsive and visually appealing using Bootstrap 5 and PrimeIcons.
    -->

    <div class="position-relative min-vh-100" [ngClass]="backgroundClass">
      <!-- Confetti Canvas -->
      <canvas #confettiCanvas
              class="position-fixed top-0 start-0 w-100 h-100"
              style="pointer-events:none; z-index:1;"></canvas>

      <!-- Fireworks Canvas -->
      <canvas #fireworkCanvas
              class="position-fixed top-0 start-0 w-100 h-100"
              style="pointer-events:none; z-index:2;"></canvas>

      <!-- Central Card -->
      <div class="d-flex flex-column justify-content-center align-items-center min-vh-100">
        <div class="card shadow-lg p-3 animate__animated animate__fadeInDown"
             style="max-width: 320px; background: rgba(255,255,255,0.92); border-radius: 1.25rem;">
          <div class="text-center">
            <i class="pi pi-gift text-danger fs-2 mb-2"></i>
            <h1 class="fw-bold fs-3 mb-2" [ngStyle]="{'font-family':'Montserrat,sans-serif'}">
              🎉 Happy Birthday{{ showNameAfterFireworks && displayName ? ', ' + displayName + '!' : '!' }} 🎂
            </h1>
            <p class="lead mb-3 small-text" [ngStyle]="{'font-family':'Quicksand,sans-serif'}">
              {{ wishesMessage }}
            </p>
            <button class="btn btn-gradient btn-sm mb-2 px-3 py-2 fw-semibold"
                    (click)="triggerFireworks()"
                    [disabled]="fireworksActive"
                    style="transition: box-shadow .2s;"
                    [ngClass]="{'shadow-lg': fireworksActive}">
              <i class="pi pi-star-fill me-2"></i>
              Launch Fireworks!
            </button>
            <br>
            <button *ngIf="!urlHasMessageOrName"
                    class="btn btn-outline-secondary btn-sm mt-1"
                    (click)="copyShareUrl()">
              <i class="pi pi-link me-1"></i>
              Create & Copy Shareable URL
            </button>
            <input #hiddenCopyInput type="text" style="opacity:0;position:absolute;left:-9999px;" tabindex="-1" aria-hidden="true"/>
            <div *ngIf="showCopiedMsg" class="text-success small-text mt-1">
              <i class="pi pi-check-circle"></i> Copied!
            </div>
          </div>
          <hr class="my-2">
          <!-- Personal Wish Section only if no message or name in url -->
          <div *ngIf="!urlHasMessageOrName">
            <label class="form-label fw-semibold small-text">Your Personal Wish</label>
            <textarea class="form-control form-control-sm mb-1"
                      rows="2"
                      [(ngModel)]="wishesMessage"
                      (ngModelChange)="saveToLocalStorage()"
                      maxlength="160"
                      placeholder="Write your wish..."></textarea>
            <label class="form-label fw-semibold small-text mt-2">Recipient's Name (optional)</label>
            <input class="form-control form-control-sm mb-1"
                   maxlength="32"
                   [(ngModel)]="name"
                   (ngModelChange)="saveToLocalStorage()"
                   placeholder="Enter recipient's name"/>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Background gradient transitions */
    .bg-vibrant {
      background: linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%);
      transition: background 1.8s cubic-bezier(.77,0,.18,1);
    }
    .bg-dark {
      background: linear-gradient(120deg,#232526 0%,#414345 100%);
      transition: background 1.8s cubic-bezier(.77,0,.18,1);
    }
    /* Button gradient */
    .btn-gradient {
      background: linear-gradient(90deg,#f857a6 0%,#ff5858 100%);
      color: #fff;
      border: none;
    }
    .btn-gradient:hover, .btn-gradient:focus {
      background: linear-gradient(90deg,#ff5858 0%,#f857a6 100%);
      box-shadow: 0 0.5rem 1.5rem rgba(248,87,166,0.12);
      color: #fff;
    }
    /* Animations */
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Quicksand:wght@500&display=swap');
    .animate__animated { animation-duration: 1.2s; }
    .animate__fadeInDown { animation-name: fadeInDown; }
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-40px);}
      to { opacity: 1; transform: translateY(0);}
    }
    /* Smaller card & text */
    .small-text { font-size: 0.98rem; }
    .card { box-shadow: 0 4px 16px rgba(0,0,0,0.09) !important; }
    textarea.form-control-sm, input.form-control-sm { font-size: 0.98rem; }
  `]
})
export class BirthdayWishesComponent extends CommonExternalComponent implements AfterViewInit {
  wishesMessage: string = 'Wishing you a fantastic year ahead!';
  name: string = '';
  backgroundClass: string = 'bg-vibrant';
  fireworksActive: boolean = false;

  urlHasMessageOrName: boolean = false;
  displayName: string = '';
  showCopiedMsg: boolean = false;
  showNameAfterFireworks: boolean = false;

  @ViewChild('confettiCanvas', { static: true }) confettiCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fireworkCanvas', { static: true }) fireworkCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hiddenCopyInput', { static: false }) hiddenCopyInputRef!: ElementRef<HTMLInputElement>;

  private confettiCtx!: CanvasRenderingContext2D;
  private confettiParticles: ConfettiParticle[] = [];
  private confettiAnimationId: number = 0;

  private fireworkCtx!: CanvasRenderingContext2D;
  private fireworks: Firework[] = [];
  private fireworkAnimationRunning = false;

  constructor(private cdr: ChangeDetectorRef) {
    super();
    this.checkUrlParams();
    setTimeout(() => this.toggleBackground(), 3500);
  }

  ngAfterViewInit(): void {
    // Setup confetti
    const confettiCanvas = this.confettiCanvasRef?.nativeElement;
    if (confettiCanvas) {
      this.confettiCtx = confettiCanvas.getContext('2d', { alpha: true })!;
      this.resizeCanvas(confettiCanvas);
      window.addEventListener('resize', () => this.resizeCanvas(confettiCanvas));
      this.initConfetti();
      this.animateConfetti();
    }
    // Setup fireworks
    const fireworkCanvas = this.fireworkCanvasRef?.nativeElement;
    if (fireworkCanvas) {
      this.fireworkCtx = fireworkCanvas.getContext('2d', { alpha: true })!;
      this.resizeCanvas(fireworkCanvas);
      window.addEventListener('resize', () => this.resizeCanvas(fireworkCanvas));
    }
  }

  private resizeCanvas(canvas: HTMLCanvasElement): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // --- Confetti ---
  private initConfetti(): void {
    this.confettiParticles = Array.from({length: 120}, () => this.createConfettiParticle());
  }

  private createConfettiParticle(): ConfettiParticle {
    const colors = ['#f857a6','#ff5858','#ffe53b','#23e3c9','#4286f4','#fff','#fdc5f5'];
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 5 + Math.random() * 7,
      d: Math.random() * 60,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 20 - 10,
      tiltAngleIncremental: 0.07 + Math.random() * 0.08,
      tiltAngle: 0
    };
  }

  private animateConfetti(): void {
    if (!this.confettiCtx) return;
    const ctx = this.confettiCtx;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = 0; i < this.confettiParticles.length; i++) {
      const p = this.confettiParticles[i];
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 3, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 3);
      ctx.stroke();
      ctx.restore();
    }
    this.updateConfetti();
    this.confettiAnimationId = requestAnimationFrame(() => this.animateConfetti());
  }

  private updateConfetti(): void {
    for (let i = 0; i < this.confettiParticles.length; i++) {
      const p = this.confettiParticles[i];
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(0.01 * p.d);
      p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;
      if (p.y > window.innerHeight + 20) {
        // Reset to top
        this.confettiParticles[i] = this.createConfettiParticle();
        this.confettiParticles[i].y = -10;
      }
    }
  }

  // --- Fireworks ---
  triggerFireworks(): void {
    if (this.fireworksActive) return;
    this.fireworksActive = true;
    this.showNameAfterFireworks = false;
    this.launchFireworks();
  }

  private launchFireworks(): void {
    const count = 7;
    let launched = 0;
    const interval = setInterval(() => {
      this.spawnFirework();
      launched++;
      if (launched >= count) {
        clearInterval(interval);
        setTimeout(() => {
          this.fireworksActive = false;
          // Show name after fireworks finish if name exists in url or input
          if (this.displayName) {
            this.showNameAfterFireworks = true;
            this.cdr.detectChanges();
          }
        }, 1800);
      }
    }, 330);
    if (!this.fireworkAnimationRunning) {
      this.fireworkAnimationRunning = true;
      this.animateFireworks();
    }
  }

  private spawnFirework(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.fireworks.push(new Firework(
      Math.random() * w * 0.75 + w * 0.12,
      h * (0.28 + Math.random() * 0.38),
      this.fireworkCtx
    ));
  }

  private animateFireworks(): void {
    if (!this.fireworkCtx) return;
    const ctx = this.fireworkCtx;
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalAlpha = 1;
    for (const fw of this.fireworks) fw.draw();
    this.fireworks = this.fireworks.filter(fw => !fw.done);
    if (this.fireworks.length > 0 || this.fireworksActive)
      requestAnimationFrame(() => this.animateFireworks());
    else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.fireworkAnimationRunning = false;
    }
  }

  // --- Background ---
  private toggleBackground(): void {
    this.backgroundClass = this.backgroundClass === 'bg-vibrant' ? 'bg-dark' : 'bg-vibrant';
    setTimeout(() => this.toggleBackground(), 6000);
  }

  // --- Local Storage ---
  saveToLocalStorage(): void {
    if (!this.urlHasMessageOrName) {
      localStorage.setItem('birthdayWishesApp', JSON.stringify({ wishesMessage: this.wishesMessage, name: this.name }));
    }
  }
  loadFromLocalStorage(): void {
    if (this.urlHasMessageOrName) return;
    const data = localStorage.getItem('birthdayWishesApp');
    if (data) {
      try {
        const obj = JSON.parse(data);
        if (obj) {
          if (typeof obj.wishesMessage === 'string') {
            this.wishesMessage = obj.wishesMessage;
          }
          if (typeof obj.name === 'string') {
            this.name = obj.name;
          }
        }
      } catch {}
    }
  }

  // --- URL Params Logic ---
  private checkUrlParams(): void {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get('message');
    const nameParam = params.get('name');
    if ((msg && msg.trim().length > 0) || (nameParam && nameParam.trim().length > 0)) {
      if (msg && msg.trim().length > 0) {
        this.wishesMessage = decodeURIComponent(msg);
      }
      if (nameParam && nameParam.trim().length > 0) {
        this.displayName = decodeURIComponent(nameParam);
      } else {
        this.displayName = '';
      }
      this.urlHasMessageOrName = true;
    } else {
      this.loadFromLocalStorage();
      this.displayName = this.name;
      this.urlHasMessageOrName = false;
    }
  }

  copyShareUrl(): void {
    const url = new URL(window.location.href.split('?')[0]);
    url.searchParams.set('message', encodeURIComponent(this.wishesMessage.trim()));
    if (this.name.trim()) {
      url.searchParams.set('name', encodeURIComponent(this.name.trim()));
    }
    const urlString = url.toString();

    // Try Clipboard API first, fallback to execCommand if not available
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(urlString).then(() => {
        this.showCopySuccess();
      }).catch(() => {
        this.fallbackCopy(urlString);
      });
    } else {
      this.fallbackCopy(urlString);
    }
  }

  private fallbackCopy(text: string): void {
    if (this.hiddenCopyInputRef && this.hiddenCopyInputRef.nativeElement) {
      const input = this.hiddenCopyInputRef.nativeElement;
      input.value = text;
      input.style.display = 'block';
      input.select();
      input.setSelectionRange(0, 99999);
      document.execCommand('copy');
      input.style.display = 'none';
      this.showCopySuccess();
    }
  }

  private showCopySuccess(): void {
    this.showCopiedMsg = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showCopiedMsg = false;
      this.cdr.detectChanges();
    }, 1400);
  }
}

// --- Interfaces and Classes ---
interface ConfettiParticle {
  x: number;
  y: number;
  r: number;
  d: number;
  color: string;
  tilt: number;
  tiltAngleIncremental: number;
  tiltAngle: number;
}

class Firework {
  private particles: FireworkParticle[] = [];
  done: boolean = false;
  constructor(private x: number, private y: number, private ctx: CanvasRenderingContext2D) {
    const colors = ['#f857a6','#ff5858','#ffe53b','#23e3c9','#4286f4','#fff','#fdc5f5'];
    for (let i = 0; i < 36; i++) {
      const angle = (2 * Math.PI * i) / 36;
      const speed = 2.9 + Math.random() * 2.1;
      this.particles.push({
        x: this.x, y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0
      });
    }
  }
  draw(): void {
    let alive = false;
    for (const p of this.particles) {
      if (p.alpha <= 0.04) continue;
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2.8, 0, 2 * Math.PI);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 14;
      this.ctx.fill();
      this.ctx.restore();
      // Update
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06; // gravity
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.alpha -= 0.018 + Math.random() * 0.012;
      p.life++;
      if (p.alpha > 0.04) alive = true;
    }
    this.done = !alive;
  }
}
interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
}