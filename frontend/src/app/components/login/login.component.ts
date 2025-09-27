import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSignupMode = false;
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'error';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.message = '';

      const credentials: LoginRequest = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value
      };

      if (this.isSignupMode) {
        this.handleSignup(credentials);
      } else {
        this.handleLogin(credentials);
      }
    }
  }

  private async handleLogin(credentials: LoginRequest): Promise<void> {
    try {
      const result = await this.authService.login(credentials);
      this.message = result.message;
      this.messageType = result.success ? 'success' : 'error';
      
      if (result.success) {
        // Login successful - the auth service will handle navigation
        setTimeout(() => {
          window.location.reload(); // Simple way to navigate to main app
        }, 1000);
      }
    } catch (error) {
      this.message = 'Login failed. Please try again.';
      this.messageType = 'error';
    } finally {
      this.isLoading = false;
    }
  }

  private async handleSignup(credentials: LoginRequest): Promise<void> {
    try {
      const result = await this.authService.signup(credentials);
      this.message = result.message;
      this.messageType = result.success ? 'success' : 'error';
      
      if (result.success) {
        // Signup successful - switch to login mode
        setTimeout(() => {
          this.isSignupMode = false;
          this.message = 'Account created! Please log in.';
          this.messageType = 'success';
        }, 1000);
      }
    } catch (error) {
      this.message = 'Signup failed. Please try again.';
      this.messageType = 'error';
    } finally {
      this.isLoading = false;
    }
  }

  toggleMode(): void {
    this.isSignupMode = !this.isSignupMode;
    this.message = '';
    this.loginForm.reset();
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  async createDemoUser(): Promise<void> {
    try {
      await this.authService.createDemoUser();
      this.message = 'Demo user created! Try logging in with cursorWinner / abcd';
      this.messageType = 'success';
    } catch (error) {
      this.message = 'Failed to create demo user';
      this.messageType = 'error';
    }
  }
}
