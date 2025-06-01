import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

/*
  Features:
  - Displays a list of important trigonometry formulas.
  - Clean, responsive layout with inline styles.
  - Strict type checking for all variables.
*/

@Component({
  selector: 'app-learning',
  template: `
    <div class="container">
      <h2>Important Trigonometry Formulas</h2>
      <ul>
        <li *ngFor="let formula of formulas">
          <strong>{{formula.title}}:</strong>
          <span [innerHTML]="formula.expression"></span>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 32px auto;
      padding: 24px;
      background: #f7f9fa;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    }
    h2 {
      text-align: center;
      color: #1a237e;
      margin-bottom: 20px;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      background: #fff;
      margin-bottom: 14px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 1.08rem;
      box-shadow: 0 1px 3px rgba(30,40,90,0.06);
    }
    strong {
      color: #1976d2;
    }
  `]
})
export class Learning extends CommonExternalComponent {
  public formulas: ReadonlyArray<{title: string; expression: string}> = [
    { title: 'Pythagorean Identity', expression: 'sin²θ + cos²θ = 1' },
    { title: 'Quotient Identities', expression: 'tanθ = sinθ / cosθ<br>cotθ = cosθ / sinθ' },
    { title: 'Reciprocal Identities', expression: 'cscθ = 1/sinθ<br>secθ = 1/cosθ<br>cotθ = 1/tanθ' },
    { title: 'Angle Sum & Difference', expression: 'sin(A ± B) = sinA cosB ± cosA sinB<br>cos(A ± B) = cosA cosB ∓ sinA sinB' },
    { title: 'Double Angle Formulas', expression: 'sin2θ = 2sinθ cosθ<br>cos2θ = cos²θ - sin²θ' },
    { title: 'Product to Sum', expression: 'sinA sinB = ½[cos(A−B) − cos(A+B)]<br>cosA cosB = ½[cos(A−B) + cos(A+B)]' },
    { title: 'Sum to Product', expression: 'sinA + sinB = 2sin[(A+B)/2]cos[(A−B)/2]' }
  ];
}