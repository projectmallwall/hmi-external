// traffic-ninja.component.ts

import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

/**
 * Features:
 * - 2D top-down crossroad intersection with four roads, each having two lanes (incoming/outgoing)
 * - Visually distinct roads, lanes, intersection, and surrounding area using clear colors
 * - Basic scene setup for the game environment: canvas, static drawing of roads/intersection
 * - Responsive UI layout, ready for further interactive/game logic
 */

@Component({
  selector: 'app-traffic-ninja',
  template: `
    <div class="container my-4 p-3 bg-light rounded shadow">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5>
          <i class="pi pi-car text-primary me-2"></i>Traffic Ninja &mdash; Crossroad Setup
        </h5>
      </div>
      <div class="d-flex justify-content-center">
        <canvas #gameCanvas width="500" height="500"
          style="background: #e9ecef; border-radius:12px; box-shadow:0 0 8px #bbb;">
        </canvas>
      </div>
      <div class="mt-2 small text-muted">
        Four-way intersection with two lanes per road, top-down view.
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep canvas {
      touch-action: none;
      cursor: default;
    }
  `]
})
export class TrafficNinjaComponent extends CommonExternalComponent {

  ngAfterViewInit(): void {
    this.render();
  }

  render(): void {
    const canvas = (document.querySelector('canvas') as HTMLCanvasElement);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 500, 500);

    // Draw surrounding area (sidewalk/grass)
    ctx.save();
    ctx.fillStyle = '#d4edda'; // greenish for grass/sidewalk
    ctx.fillRect(0, 0, 500, 500);
    ctx.restore();

    // Draw main vertical and horizontal roads
    ctx.save();
    ctx.fillStyle = '#444'; // asphalt
    ctx.fillRect(190, 0, 120, 500); // vertical road
    ctx.fillRect(0, 190, 500, 120); // horizontal road
    ctx.restore();

    // Draw intersection center (slightly lighter)
    ctx.save();
    ctx.fillStyle = '#555';
    ctx.fillRect(190, 190, 120, 120);
    ctx.restore();

    // Draw lane markings (white dashed lines)
    ctx.save();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);

    // Vertical lanes (center lines)
    ctx.beginPath();
    ctx.moveTo(220, 0); ctx.lineTo(220, 500); // left center
    ctx.moveTo(280, 0); ctx.lineTo(280, 500); // right center
    ctx.stroke();

    // Horizontal lanes (center lines)
    ctx.beginPath();
    ctx.moveTo(0, 220); ctx.lineTo(500, 220); // top center
    ctx.moveTo(0, 280); ctx.lineTo(500, 280); // bottom center
    ctx.stroke();

    ctx.restore();

    // Draw solid lines for lane edges
    ctx.save();
    ctx.strokeStyle = '#ffc107'; // yellow for outer lane borders
    ctx.lineWidth = 3;
    ctx.setLineDash([]);

    // Vertical edges
    ctx.beginPath();
    ctx.moveTo(190, 0); ctx.lineTo(190, 500);
    ctx.moveTo(310, 0); ctx.lineTo(310, 500);
    ctx.stroke();

    // Horizontal edges
    ctx.beginPath();
    ctx.moveTo(0, 190); ctx.lineTo(500, 190);
    ctx.moveTo(0, 310); ctx.lineTo(500, 310);
    ctx.stroke();

    ctx.restore();
  }
}