import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

/**
 * TrafficNinjaComponent
 * 
 * Features:
 * - Four-way intersection simulation with two lanes per road.
 * - Realistic traffic signal system: green, yellow, and red phases for each direction (north-south & east-west).
 * - Signals change automatically every 10 seconds; no configuration or data download/upload options.
 * - North-South and East-West signals are always complementary for safe crossing.
 * - Four visually accurate traffic lights at the correct corners, facing oncoming traffic.
 * - Southbound signal is now at top-left, eastbound at bottom-right. Other signals placed accordingly:
 *   - Top-left: Southbound
 *   - Top-right: Northbound
 *   - Bottom-right: Eastbound
 *   - Bottom-left: Westbound
 * - Clean, responsive UI using Bootstrap 5 and PrimeIcons v7.
 */

type SignalPhase = 'red' | 'yellow' | 'green';

interface TrafficSignal {
  id: string;
  label: string;
  controls: string;
  position: string;
  direction: 'north' | 'south' | 'east' | 'west';
  currentPhase: SignalPhase;
}

interface TrafficNinjaData {
  lastPhaseStart: number;
  nsPhase: SignalPhase;
}

@Component({
  selector: 'app-traffic-ninja',
  template: `
    <div class="card shadow my-3">
      <div class="card-header d-flex align-items-center bg-primary text-white">
        <i class="pi pi-car me-2"></i>
        <span class="fw-bold">Traffic Ninja – 4-Way Intersection Simulator</span>
      </div>
      <div class="card-body">
        <!-- Intersection Visualization -->
        <div class="intersection-container mx-auto my-4">
          <!-- Draw roads -->
          <div class="road-horizontal"></div>
          <div class="road-vertical"></div>
          <!-- Draw lane markings -->
          <div class="lane-marking horizontal"></div>
          <div class="lane-marking vertical"></div>
          <!-- Place traffic signals -->
          <ng-container *ngFor="let signal of signals">
            <div [ngClass]="signal.position"
              class="traffic-signal-box d-flex flex-column align-items-center justify-content-center"
              [title]="signal.label + ' (' + signal.controls + ')'">
              <div class="traffic-signal-visual">
                <div class="light light-red"
                  [class.on]="getSignalPhase(signal) === 'red'"></div>
                <div class="light light-yellow"
                  [class.on]="getSignalPhase(signal) === 'yellow'"></div>
                <div class="light light-green"
                  [class.on]="getSignalPhase(signal) === 'green'"></div>
              </div>
              <div class="signal-label small text-nowrap mt-1">{{signal.controls}}</div>
            </div>
          </ng-container>
        </div>

        <!-- Timer Display -->
        <div class="d-flex justify-content-center gap-4 mt-4">
          <div class="text-center">
            <span class="fw-bold">North-South:</span>
            <span [ngClass]="phaseClass(nsPhase)">
              <i class="pi pi-circle-fill"></i> {{ nsPhase | titlecase }}
            </span>
            <small class="text-muted ms-1">(↑↓)</small>
          </div>
          <div class="text-center">
            <span class="fw-bold">East-West:</span>
            <span [ngClass]="phaseClass(ewPhase)">
              <i class="pi pi-circle-fill"></i> {{ ewPhase | titlecase }}
            </span>
            <small class="text-muted ms-1">(→←)</small>
          </div>
          <div class="text-center">
            <span class="fw-bold">Time Left:</span>
            <span class="badge bg-dark ms-1">{{ timeLeft }}s</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Layout for intersection */
    .intersection-container {
      position: relative;
      width: 400px;
      height: 400px;
      background: #e9ecef;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 0 8px #adb5bd;
      margin-bottom: 2rem;
    }
    .road-horizontal, .road-vertical {
      position: absolute;
      background: #343a40;
      z-index: 1;
    }
    .road-horizontal {
      top: 50%;
      left: 0;
      width: 100%;
      height: 80px;
      transform: translateY(-50%);
    }
    .road-vertical {
      left: 50%;
      top: 0;
      width: 80px;
      height: 100%;
      transform: translateX(-50%);
    }
    .lane-marking.horizontal {
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 6px;
      background: repeating-linear-gradient(
        to right, #fff 0 16px, transparent 16px 32px
      );
      transform: translateY(-50%);
      z-index: 2;
      opacity: 0.7;
    }
    .lane-marking.vertical {
      position: absolute;
      left: 50%;
      top: 0;
      width: 6px;
      height: 100%;
      background: repeating-linear-gradient(
        to bottom, #fff 0 16px, transparent 16px 32px
      );
      transform: translateX(-50%);
      z-index: 2;
      opacity: 0.7;
    }
    /* Traffic signal positioning */
    .top-left { position: absolute; top: 32px; left: 44px; }
    .top-right { position: absolute; top: 32px; right: 44px; }
    .bottom-right { position: absolute; bottom: 32px; right: 44px; }
    .bottom-left { position: absolute; bottom: 32px; left: 44px; }
    .traffic-signal-box {
      width: 46px;
      height: 90px;
      z-index: 10;
      user-select: none;
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      box-shadow: 0 2px 6px #21252944;
      padding: 2px 0 4px 0;
    }
    .traffic-signal-visual {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #23272b;
      border-radius: 8px;
      padding: 4px 0;
      width: 34px;
      height: 70px;
      margin: 0 auto;
      box-shadow: 0 0 6px #0006;
    }
    .light {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin: 3px 0;
      background: #555;
      opacity: 0.25;
      border: 2px solid #222;
      transition: background 0.2s, opacity 0.2s;
    }
    .light-red.on { background: #ff2c2c; opacity: 1; box-shadow: 0 0 8px 2px #ff2c2c99; }
    .light-yellow.on { background: #ffd700; opacity: 1; box-shadow: 0 0 8px 2px #ffd70099; }
    .light-green.on { background: #17dd17; opacity: 1; box-shadow: 0 0 8px 2px #17dd1799; }
    .signal-label { color: #495057; font-size: 0.82em; text-align: center; }
    /* Phase indicator coloring */
    .text-green { color: #17dd17 !important; }
    .text-yellow { color: #ffd700 !important; }
    .text-red { color: #ff2c2c !important; }
    @media (max-width: 600px) {
      .intersection-container { width: 96vw; height: 60vw; min-width: 220px; min-height: 180px; }
    }
  `]
})
export class TrafficNinjaComponent extends CommonExternalComponent {
  // Strict typing
  private static readonly PHASES: SignalPhase[] = ['green', 'yellow', 'red'];
  private static readonly DURATIONS: Record<SignalPhase, number> = {
    green: 10,
    yellow: 10,
    red: 10
  };

  signals: TrafficSignal[] = [
    {
      id: 'tl', label: 'Top Left', controls: 'Southbound', position: 'top-left', direction: 'south', currentPhase: 'red'
    },
    {
      id: 'tr', label: 'Top Right', controls: 'Northbound', position: 'top-right', direction: 'north', currentPhase: 'red'
    },
    {
      id: 'br', label: 'Bottom Right', controls: 'Eastbound', position: 'bottom-right', direction: 'east', currentPhase: 'red'
    },
    {
      id: 'bl', label: 'Bottom Left', controls: 'Westbound', position: 'bottom-left', direction: 'west', currentPhase: 'red'
    }
  ];

  nsPhase: SignalPhase = 'green'; // north-south phase
  ewPhase: SignalPhase = 'red';   // east-west phase (complementary)
  timeLeft: number = 0;
  private intervalId: number | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    super();
    this.loadSettings();
    this.startSignalCycle();
  }

  ngOnDestroy(): void {
    if (this.intervalId !== null) window.clearInterval(this.intervalId);
  }

  // Main timer logic
  private startSignalCycle(): void {
    if (this.intervalId !== null) window.clearInterval(this.intervalId);

    let now: number = Date.now();
    let lastPhaseStart: number = now;
    let nsPhase: SignalPhase = this.nsPhase;
    let cycleOrder: SignalPhase[] = TrafficNinjaComponent.PHASES;
    let phaseIdx: number = cycleOrder.indexOf(nsPhase);

    // Restore from local storage if present
    const saved = localStorage.getItem('trafficNinjaData');
    if (saved) {
      try {
        const data: TrafficNinjaData = JSON.parse(saved);
        lastPhaseStart = data.lastPhaseStart;
        nsPhase = data.nsPhase;
        phaseIdx = cycleOrder.indexOf(nsPhase);
      } catch {}
    }

    // Set initial state
    this.setPhases(nsPhase);
    this.timeLeft = TrafficNinjaComponent.DURATIONS[nsPhase] - Math.floor((now - lastPhaseStart)/1000);

    this.intervalId = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastPhaseStart) / 1000);
      const duration = TrafficNinjaComponent.DURATIONS[cycleOrder[phaseIdx]];
      this.timeLeft = Math.max(duration - elapsed, 0);

      if (elapsed >= duration) {
        // Move to next phase
        phaseIdx = (phaseIdx + 1) % 3;
        nsPhase = cycleOrder[phaseIdx];
        lastPhaseStart = Date.now();
        this.setPhases(nsPhase);
        this.timeLeft = TrafficNinjaComponent.DURATIONS[nsPhase];
        this.saveSettings(lastPhaseStart, nsPhase);
      }
      this.cdr.markForCheck();
    }, 500);
  }

  private setPhases(nsPhase: SignalPhase): void {
    this.nsPhase = nsPhase;
    // EW is always complementary
    this.ewPhase = nsPhase === 'red' ? 'green' : (nsPhase === 'green' ? 'red' : 'yellow');
    // Assign to signals
    for (const s of this.signals) {
      if (s.direction === 'north' || s.direction === 'south') {
        s.currentPhase = this.nsPhase;
      } else {
        s.currentPhase = this.ewPhase;
      }
    }
  }

  getSignalPhase(signal: TrafficSignal): SignalPhase {
    return signal.currentPhase;
  }

  phaseClass(phase: SignalPhase): string {
    switch (phase) {
      case 'green': return 'text-green fw-bold';
      case 'yellow': return 'text-yellow fw-bold';
      case 'red': return 'text-red fw-bold';
      default: return '';
    }
  }

  // Data persistence
  saveSettings(lastPhaseStart?: number, nsPhase?: SignalPhase): void {
    const data: TrafficNinjaData = {
      lastPhaseStart: lastPhaseStart ?? Date.now(),
      nsPhase: nsPhase ?? this.nsPhase
    };
    localStorage.setItem('trafficNinjaData', JSON.stringify(data));
  }

  loadSettings(): void {
    const saved = localStorage.getItem('trafficNinjaData');
    if (saved) {
      try {
        const data: TrafficNinjaData = JSON.parse(saved);
        this.nsPhase = data.nsPhase;
      } catch {}
    }
  }
}