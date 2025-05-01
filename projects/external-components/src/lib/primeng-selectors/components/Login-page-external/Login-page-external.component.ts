import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonExternalComponent } from '../common-external/common-external.component';

/*
  Features:
  - Simple login form with email and password fields
  - Inline HTML and CSS
  - Basic validation for required fields and email format
  - Strict type checking
*/

@Component({
  selector: 'app-login-page',
  template: `
    <div class="login-container">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
        <h2>Login</h2>
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" />
          <div *ngIf="submitted && loginForm.controls.email.invalid" class="error">
            Valid email is required.
          </div>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" type="password" formControlName="password" />
          <div *ngIf="submitted && loginForm.controls.password.invalid" class="error">
            Password is required.
          </div>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      width: 320px;
      margin: 40px auto;
      padding: 24px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    h2 {
      text-align: center;
      margin-bottom: 18px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
    }
    input[type="email"],
    input[type="password"] {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
      border: 1px solid #bdbdbd;
      border-radius: 4px;
      font-size: 15px;
    }
    button {
      width: 100%;
      padding: 10px 0;
      background: #1976d2;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover {
      background: #1565c0;
    }
    .error {
      color: #d32f2f;
      font-size: 13px;
      margin-top: 3px;
    }
  `]
})
export class LoginPageComponent extends CommonExternalComponent {
  public loginForm: FormGroup;
  public submitted: boolean = false;

  constructor(private readonly fb: FormBuilder) {
    super();
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  public onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.valid) {
      // Handle successful login here
    }
  }
}