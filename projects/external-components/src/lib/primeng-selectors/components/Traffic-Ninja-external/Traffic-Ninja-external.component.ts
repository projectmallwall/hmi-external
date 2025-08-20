import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

/**
 * TrafficNinjaComponent
 *
 * Features:
 * - Four-way intersection simulation with two lanes per road.
 * - Realistic traffic signal system: green, yellow, and red phases for each direction (north-south & east-west).
 * - Signals change automatically every 10 seconds.
 * - North-South and East-West signals are always complementary for safe crossing.
 * - Road-end centered, visually accurate traffic lights.
 * - Responsive mobile UI using Bootstrap 5 and PrimeIcons v7.
 * - Vehicles: Cars (red/blue/silver) and Motorcycles (black/green/yellow), sized to fit one lane.
 * - Cars have rounded rectangles with window details; motorcycles are tapered with headlight.
 * - Vehicles spawn at far ends, move forward in their lane, stop before intersection if signal is red/yellow.
 * - Vehicles never overlap or collide; lane occupancy and collision avoidance enforced.
 * - Mix of cars/motorcycles, random intervals, no overcrowding, no lane overlap.
 * - User data stored in localStorage by default.
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

type VehicleType = 'car' | 'motorcycle';

interface Vehicle {
  id: string;
  type: VehicleType;
  color: string;
  road: 'north' | 'south' | 'east' | 'west';
  lane: 0 | 1; // 0: left/incoming, 1: right/outgoing (from that road's perspective)
  pos: number; // 0=start, 1=intersection entry
  speed: number; // px/ms
  stopped: boolean;
}

interface TrafficNinjaData {
  lastPhaseStart: number;
  nsPhase: SignalPhase;
  vehicles: Vehicle[];
}

@Component({
  selector: 'app-traffic-ninja',
  template: `
    <div class="card shadow my-3 mx-auto" style="max-width:420px;">
      <div class="card-header d-flex align-items-center bg-primary text-white justify-content-between">
        <span class="d-flex align-items-center">
          <i class="pi pi-car me-2"></i>
          <span class="fw-bold">Traffic Ninja – 4-Way Intersection</span>
        </span>
      </div>
      <div class="card-body p-2">
        <!-- Intersection Visualization -->
        <div class="intersection-container-mobile mx-auto my-2 position-relative">
          <!-- Draw roads and lane markings -->
          <div class="road-horizontal"></div>
          <div class="road-vertical"></div>
          <div class="lane-marking horizontal"></div>
          <div class="lane-marking vertical"></div>
          <!-- Place traffic signals at road ends and centers -->
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
          <!-- Vehicles on all roads -->
          <ng-container *ngFor="let vehicle of vehicles">
            <div
              class="vehicle"
              [ngClass]="vehicle.type"
              [ngStyle]="vehicleStyle(vehicle)"
              [attr.data-id]="vehicle.id"
              [attr.title]="vehicle.type | titlecase"
            >
              <!-- Car SVG -->
              <ng-container *ngIf="vehicle.type==='car'">
                <svg width="100%" height="100%" viewBox="0 0 44 22">
                  <!-- Car body -->
                  <rect x="2" y="2.5" rx="6" ry="8" width="40" height="17"
                    [attr.fill]="vehicle.color" stroke="#444" stroke-width="1.5"/>
                  <!-- Windows -->
                  <rect x="9" y="5.5" width="5" height="5" rx="1.5" fill="#fff" opacity="0.85"/>
                  <rect x="30" y="5.5" width="5" height="5" rx="1.5" fill="#fff" opacity="0.85"/>
                </svg>
              </ng-container>
              <!-- Motorcycle SVG -->
              <ng-container *ngIf="vehicle.type==='motorcycle'">
                <svg width="100%" height="100%" viewBox="0 0 24 12">
                  <!-- Bike body (tapered front) -->
                  <polygon [attr.points]="motorcycleBodyPoints" [attr.fill]="vehicle.color" stroke="#222" stroke-width="1.2"/>
                  <!-- Headlight -->
                  <circle cx="21" cy="6" r="2.1" fill="#fff" opacity="0.95"/>
                </svg>
              </ng-container>
            </div>
          </ng-container>
        </div>

        <!-- Timer Display -->
        <div class="d-flex justify-content-center gap-3 mt-3 flex-wrap">
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
    :host {
      display: block;
      width: 100vw;
      min-height: 100vh;
      background: #f8fafb;
    }
    .card { border-radius: 18px; margin-top: 0.5rem; margin-bottom: 0.5rem; }
    .intersection-container-mobile {
      position: relative;
      width: 94vw;
      max-width: 390px;
      height: 62vw;
      max-height: 260px;
      min-width: 210px;
      min-height: 140px;
      background: #e9ecef;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 0 8px #adb5bd;
      touch-action: none;
      margin-bottom: 1.2rem;
    }
    .road-horizontal, .road-vertical {
      position: absolute;
      background: #343a40;
      z-index: 1;
    }
    .road-horizontal {
      top: 50%; left: 0; width: 100%;
      height: 17vw; max-height: 55px; min-height: 22px;
      transform: translateY(-50%);
    }
    .road-vertical {
      left: 50%; top: 0; width: 17vw; max-width: 55px; min-width: 22px; height: 100%;
      transform: translateX(-50%);
    }
    .lane-marking.horizontal {
      position: absolute; top: 50%; left: 0; width: 100%;
      height: 2.5vw; max-height: 8px; min-height: 3px;
      background: repeating-linear-gradient(to right, #fff 0 12px, transparent 12px 24px);
      transform: translateY(-50%); z-index: 2; opacity: 0.7;
    }
    .lane-marking.vertical {
      position: absolute; left: 50%; top: 0;
      width: 2.5vw; max-width: 8px; min-width: 3px; height: 100%;
      background: repeating-linear-gradient(to bottom, #fff 0 12px, transparent 12px 24px);
      transform: translateX(-50%); z-index: 2; opacity: 0.7;
    }
    /* Road-end centered traffic signal positioning */
    .signal-north { position: absolute; top: 2px; left: 50%; transform: translateX(-50%); z-index: 20; }
    .signal-south { position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); z-index: 20; }
    .signal-east { position: absolute; right: 2px; top: 50%; transform: translateY(-50%); z-index: 20; }
    .signal-west { position: absolute; left: 2px; top: 50%; transform: translateY(-50%); z-index: 20; }
    .traffic-signal-box {
      width: 38px; height: 74px; user-select: none;
      background: rgba(255,255,255,0.08); border-radius: 10px;
      box-shadow: 0 2px 6px #21252933; padding: 2px 0 4px 0;
    }
    .traffic-signal-visual {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: #23272b; border-radius: 8px; padding: 3px 0;
      width: 28px; height: 56px; margin: 0 auto; box-shadow: 0 0 5px #0005;
    }
    .light { width: 15px; height: 15px; border-radius: 50%; margin: 2px 0; background: #555; opacity: 0.25; border: 2px solid #222; transition: background 0.2s, opacity 0.2s; }
    .light-red.on { background: #ff2c2c; opacity: 1; box-shadow: 0 0 6px 1.5px #ff2c2c99; }
    .light-yellow.on { background: #ffd700; opacity: 1; box-shadow: 0 0 6px 1.5px #ffd70099; }
    .light-green.on { background: #17dd17; opacity: 1; box-shadow: 0 0 6px 1.5px #17dd1799; }
    .signal-label { color: #495057; font-size: 0.82em; text-align: center; }
    .text-green { color: #17dd17 !important; }
    .text-yellow { color: #ffd700 !important; }
    .text-red { color: #ff2c2c !important; }
    /* VEHICLES */
    .vehicle {
      position: absolute;
      z-index: 11;
      will-change: transform;
      pointer-events: none;
      transition: filter 0.15s;
    }
    .vehicle.car { width: 44px; height: 22px; }
    .vehicle.motorcycle { width: 24px; height: 12px; }
    @media (max-width: 480px) {
      .intersection-container-mobile { min-width: 120px; min-height: 90px; }
      .traffic-signal-box { width: 30px; height: 60px; }
      .traffic-signal-visual { width: 20px; height: 40px; }
      .light { width: 10px; height: 10px; }
      .vehicle.car { width: 29px; height: 14px; }
      .vehicle.motorcycle { width: 15px; height: 8px; }
    }
    body, html { overscroll-behavior-y: contain; overscroll-behavior-x: contain; }
  `]
})
export class TrafficNinjaComponent extends CommonExternalComponent {
  private static readonly PHASES: SignalPhase[] = ['green', 'yellow', 'red'];
  private static readonly DURATIONS: Record<SignalPhase, number> = {
    green: 10,
    yellow: 10,
    red: 10
  };

  signals: TrafficSignal[] = [
    { id: 'north', label: 'North End', controls: 'Northbound', position: 'signal-north', direction: 'north', currentPhase: 'red' },
    { id: 'south', label: 'South End', controls: 'Southbound', position: 'signal-south', direction: 'south', currentPhase: 'red' },
    { id: 'east',  label: 'East End',  controls: 'Eastbound',  position: 'signal-east',  direction: 'east',  currentPhase: 'red' },
    { id: 'west',  label: 'West End',  controls: 'Westbound',  position: 'signal-west',  direction: 'west',  currentPhase: 'red' }
  ];

  nsPhase: SignalPhase = 'green';
  ewPhase: SignalPhase = 'red';
  timeLeft: number = 0;

  vehicles: Vehicle[] = [];
  private vehicleIdCounter = 1;

  private intervalId: number | null = null;
  private vehicleAnimId: number | null = null;
  private spawnTimers: Partial<Record<'north'|'south'|'east'|'west', number>> = {};

  // For motorcycle SVG
  get motorcycleBodyPoints(): string { return "2,2 20,2 23,6 20,10 2,10"; }

  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {
    super();
    this.loadSettings();
    this.startSignalCycle();
    this.restoreVehicles();
    this.zone.runOutsideAngular(() => this.startVehicleAnimation());
    this.spawnInitialVehicles();
    this.setupSpawners();
  }

  ngOnDestroy(): void {
    if (this.intervalId !== null) window.clearInterval(this.intervalId);
    if (this.vehicleAnimId !== null) window.cancelAnimationFrame(this.vehicleAnimId);
    Object.values(this.spawnTimers).forEach(id => clearTimeout(id));
  }

  // --- TRAFFIC SIGNAL LOGIC ---

  private startSignalCycle(): void {
    if (this.intervalId !== null) window.clearInterval(this.intervalId);

    let now: number = Date.now();
    let lastPhaseStart: number = now;
    let nsPhase: SignalPhase = this.nsPhase;
    let cycleOrder: SignalPhase[] = TrafficNinjaComponent.PHASES;
    let phaseIdx: number = cycleOrder.indexOf(nsPhase);

    const saved = localStorage.getItem('trafficNinjaData');
    if (saved) {
      try {
        const data: TrafficNinjaData = JSON.parse(saved);
        lastPhaseStart = data.lastPhaseStart;
        nsPhase = data.nsPhase;
        phaseIdx = cycleOrder.indexOf(nsPhase);
      } catch {}
    }

    this.setPhases(nsPhase);
    this.timeLeft = TrafficNinjaComponent.DURATIONS[nsPhase] - Math.floor((now - lastPhaseStart)/1000);

    this.intervalId = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastPhaseStart) / 1000);
      const duration = TrafficNinjaComponent.DURATIONS[cycleOrder[phaseIdx]];
      this.timeLeft = Math.max(duration - elapsed, 0);

      if (elapsed >= duration) {
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
    this.ewPhase = nsPhase === 'red' ? 'green' : (nsPhase === 'green' ? 'red' : 'yellow');
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

  // --- VEHICLE LOGIC ---

  private carColors = ['#e53935', '#1976d2', '#bdbdbd'];
  private motorcycleColors = ['#111', '#43a047', '#fbc02d'];

  private roadInfo = {
    north: { axis: 'y', dir: 1,   xBase: 0.5, yBase: 0,   length: 1, phaseKey: 'ns' },
    south: { axis: 'y', dir: -1,  xBase: 0.5, yBase: 1,   length: 1, phaseKey: 'ns' },
    east:  { axis: 'x', dir: -1,  xBase: 1,   yBase: 0.5, length: 1, phaseKey: 'ew' },
    west:  { axis: 'x', dir: 1,   xBase: 0,   yBase: 0.5, length: 1, phaseKey: 'ew' }
  } as const;

  // Lane offsets (percentages of road width/height)
  private laneOffsets = [ -0.13, +0.13 ]; // for 2-lane (centered)

  // Lane pixel widths (will be scaled)
  private laneWidthPx = 26; // approx for both car and bike

  // Intersection boundary: vehicles stop at this normalized point (0..1, from road end toward center)
  private stopBeforeIntersection = 0.19; // ~19% away from edge

  // --- SPAWNING ---

  private setupSpawners(): void {
    (['north','south','east','west'] as const).forEach(road => {
      this.scheduleNextSpawn(road);
    });
  }

  private scheduleNextSpawn(road: 'north'|'south'|'east'|'west'): void {
    // Irregular intervals: 900ms–2400ms
    const delay = 900 + Math.random() * 1500;
    this.spawnTimers[road] = window.setTimeout(() => {
      this.spawnVehicle(road);
      this.scheduleNextSpawn(road);
    }, delay);
  }

  private spawnInitialVehicles(): void {
    (['north','south','east','west'] as const).forEach(road => {
      for (let i = 0; i < 2 + Math.floor(Math.random()*2); ++i) {
        this.spawnVehicle(road, true, i*0.18 + Math.random()*0.06);
      }
    });
  }

  /**
   * Checks whether a new vehicle can be spawned in the given road/lane without causing overlap.
   * Prevents spawning if another vehicle is too close at the start of the lane.
   */
  private canSpawnInLane(road: 'north'|'south'|'east'|'west', lane: 0|1): boolean {
    // Find vehicles in this road/lane, sort by position ascending
    const candidates = this.vehicles.filter(v => v.road === road && v.lane === lane).sort((a,b) => a.pos - b.pos);
    if (candidates.length === 0) return true;
    // Get size in normalized units
    const vSizeNorm = this.vehicleLengthNorm(lane, candidates[0].type);
    // If first vehicle is sufficiently far (>1.1x length), allow spawn
    return candidates[0].pos > vSizeNorm * 1.05;
  }

  /**
   * Returns the normalized length of a vehicle (relative to lane length, which is 1).
   */
  private vehicleLengthNorm(lane: 0|1, type: VehicleType): number {
    // Use container size for scaling
    const container = this.getContainerSize();
    const info = this.roadInfo['north']; // all lanes same length
    const pxLen = type === 'car'
      ? this.vehiclePixelSize({type:'car'} as Vehicle).h
      : this.vehiclePixelSize({type:'motorcycle'} as Vehicle).h;
    // Lane length in px (vertical or horizontal)
    const lanePx = info.axis === 'y' ? container.h : container.w;
    return pxLen / lanePx;
  }

  private spawnVehicle(
    road: 'north'|'south'|'east'|'west',
    initial: boolean = false,
    customPos?: number
  ): void {
    // Only allow up to 3 vehicles per incoming direction per road
    const incomingCount = this.vehicles.filter(v => v.road === road && v.lane === 0 && v.pos < 1).length;
    if (!initial && incomingCount >= 3) return;

    // Randomly select type and color
    const type: VehicleType = Math.random() < 0.67 ? 'car' : 'motorcycle';
    const color = type === 'car'
      ? this.carColors[Math.floor(Math.random() * this.carColors.length)]
      : this.motorcycleColors[Math.floor(Math.random() * this.motorcycleColors.length)];

    // Lane assignment: randomly pick incoming lane (0 or 1, but keep balance)
    const lane: 0|1 = 0; // Only incoming lane used in this version

    // Collision prevention: avoid spawn if another vehicle is too close at start
    if (!initial && !this.canSpawnInLane(road, lane)) return;

    const id = 'v'+(this.vehicleIdCounter++);
    const pos = typeof customPos === 'number' ? customPos : 0;

    // Speed: cars slower, bikes faster (in px/ms, scaled later)
    const speed = type === 'car'
      ? 0.038 + Math.random()*0.008 // px/ms
      : 0.052 + Math.random()*0.012;

    this.vehicles.push({
      id, type, color, road, lane: 0, pos, speed, stopped: false
    });

    this.saveVehicles();
  }

  // --- VEHICLE MOVEMENT LOOP ---

  private startVehicleAnimation(): void {
    let lastTs = performance.now();
    const animate = (ts: number) => {
      const dt = Math.min(ts - lastTs, 40); // cap frame delta
      lastTs = ts;
      let changed = false;

      // Move vehicles, sorted by road and lane and position descending (rear-most first)
      for (const road of ['north','south','east','west'] as const) {
        for (const lane of [0,1] as const) {
          // Only process vehicles in this road/lane, sorted rear-to-front
          const laneVehicles = this.vehicles
            .filter(v => v.road === road && v.lane === lane)
            .sort((a, b) => a.pos - b.pos);

          for (let i = 0; i < laneVehicles.length; ++i) {
            const v = laneVehicles[i];
            // Only move if not stopped
            if (!v.stopped) {
              // Determine if should stop (at intersection, red/yellow)
              const approaching = v.pos < this.stopBeforeIntersection+0.01;
              if (approaching && !this.canEnterIntersection(v.road)) {
                if (v.pos + v.speed*dt/15 > this.stopBeforeIntersection) {
                  v.pos = this.stopBeforeIntersection;
                  v.stopped = true;
                  changed = true;
                  continue;
                }
              }
              // COLLISION AVOIDANCE: check vehicle ahead
              let maxAdvance = v.speed * dt / 15;
              if (i > 0) {
                // There's a vehicle ahead
                const vAhead = laneVehicles[i-1];
                const vLenNorm = this.vehicleLengthNorm(lane, v.type);
                // Don't get closer than vLenNorm * 1.02
                const distToAhead = vAhead.pos - v.pos;
                const minGap = vLenNorm * 1.02;
                if (distToAhead - maxAdvance < minGap) {
                  maxAdvance = Math.max(0, distToAhead - minGap);
                  if (maxAdvance < 1e-5) {
                    v.stopped = true;
                    changed = true;
                    continue;
                  }
                }
              }
              v.pos += maxAdvance;
              if (v.pos > 1.09) {
                // Remove vehicle if out of screen/intersection
                this.vehicles = this.vehicles.filter(x => x !== v);
                changed = true;
                continue;
              }
              changed = true;
            } else {
              // If stopped, check if can go now
              let canGo = this.canEnterIntersection(v.road);
              // Also check if blocked by vehicle ahead
              if (i > 0) {
                const vAhead = laneVehicles[i-1];
                const vLenNorm = this.vehicleLengthNorm(lane, v.type);
                const distToAhead = vAhead.pos - v.pos;
                const minGap = vLenNorm * 1.02;
                if (distToAhead < minGap + 1e-4) {
                  canGo = false;
                }
              }
              if (canGo) {
                v.stopped = false;
                changed = true;
              }
            }
          }
        }
      }

      if (changed) {
        this.saveVehicles();
        this.zone.run(() => this.cdr.markForCheck());
      }
      this.vehicleAnimId = window.requestAnimationFrame(animate);
    };
    this.vehicleAnimId = window.requestAnimationFrame(animate);
  }

  private canEnterIntersection(road: 'north'|'south'|'east'|'west'): boolean {
    // Check signal for this road
    const info = this.roadInfo[road];
    const phase = info.phaseKey === 'ns' ? this.nsPhase : this.ewPhase;
    return phase === 'green';
  }

  // --- VEHICLE RENDERING ---

  vehicleStyle(vehicle: Vehicle): {[k:string]: string} {
    // Container size
    const container = this.getContainerSize();
    // Road geometry
    const info = this.roadInfo[vehicle.road];

    // Lane offset: left/right of road center
    const laneOffset = this.laneOffsets[vehicle.lane];
    // Road thickness (in px)
    const roadW = info.axis === 'x' ? container.h : container.w;
    const laneCenter = 0.5 + laneOffset;

    // Calculate position along road
    let x = container.w * info.xBase;
    let y = container.h * info.yBase;
    if (info.axis === 'y') {
      y += (container.h * info.dir) * vehicle.pos * info.length;
      x += (roadW * laneOffset);
    } else {
      x += (container.w * info.dir) * vehicle.pos * info.length;
      y += (roadW * laneOffset);
    }

    // Center vehicle so it doesn't overflow the road
    const vW = this.vehiclePixelSize(vehicle).w;
    const vH = this.vehiclePixelSize(vehicle).h;
    x -= vW/2;
    y -= vH/2;

    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${vW}px`,
      height: `${vH}px`,
      transition: vehicle.stopped ? 'filter 0.15s' : '',
      filter: vehicle.stopped ? 'grayscale(0.5) brightness(0.93)' : ''
    };
  }

  private getContainerSize(): {w:number,h:number} {
    // Use DOM if available, else fallback to max sizes
    const el = document.querySelector('.intersection-container-mobile') as HTMLElement;
    if (el) return { w: el.offsetWidth, h: el.offsetHeight };
    return { w: 390, h: 260 };
  }

  private vehiclePixelSize(vehicle: Vehicle): {w:number,h:number} {
    // Responsive sizing
    const el = document.querySelector('.intersection-container-mobile') as HTMLElement;
    const baseCar = { w: 44, h: 22 }, baseBike = { w: 24, h: 12 };
    if (el && el.offsetWidth < 200) {
      return vehicle.type === 'car'
        ? { w: 29, h: 14 }
        : { w: 15, h: 8 };
    }
    return vehicle.type === 'car' ? baseCar : baseBike;
  }

  // --- DATA PERSISTENCE ---

  saveSettings(lastPhaseStart?: number, nsPhase?: SignalPhase): void {
    const data: TrafficNinjaData = {
      lastPhaseStart: lastPhaseStart ?? Date.now(),
      nsPhase: nsPhase ?? this.nsPhase,
      vehicles: this.vehicles
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

  private saveVehicles(): void {
    const saved = localStorage.getItem('trafficNinjaData');
    let data: TrafficNinjaData = {
      lastPhaseStart: Date.now(),
      nsPhase: this.nsPhase,
      vehicles: this.vehicles
    };
    if (saved) {
      try {
        data = {...JSON.parse(saved), vehicles: this.vehicles};
      } catch {}
    }
    localStorage.setItem('trafficNinjaData', JSON.stringify(data));
  }

  private restoreVehicles(): void {
    const saved = localStorage.getItem('trafficNinjaData');
    if (saved) {
      try {
        const data: TrafficNinjaData = JSON.parse(saved);
        this.vehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
      } catch { this.vehicles = []; }
    }
  }
}