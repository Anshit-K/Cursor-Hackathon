import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this would be hashed
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly STORAGE_KEY = 'memory_lane_users';
  private readonly CURRENT_USER_KEY = 'memory_lane_current_user';

  constructor() {
    // Initialize demo user if no users exist
    this.initializeDemoUser().then(() => {
      console.log('Demo user initialization completed');
    });
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem(this.CURRENT_USER_KEY);
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  private async initializeDemoUser(): Promise<void> {
    try {
      const users = await this.getUsers();
      if (users.length === 0) {
        const demoUser: User = {
          id: 'demo-user-1',
          username: 'cursorWinner',
          password: 'abcd',
          createdAt: new Date().toISOString()
        };
        users.push(demoUser);
        await this.saveUsers(users);
      }
    } catch (error) {
      console.error('Error initializing demo user:', error);
    }
  }

  async login(credentials: LoginRequest): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const users = await this.getUsers();
      console.log('Available users:', users);
      console.log('Login attempt:', credentials);
      
      const user = users.find(u => 
        u.username.toLowerCase() === credentials.username.toLowerCase() && 
        u.password === credentials.password
      );

      if (user) {
        this.currentUserSubject.next(user);
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
        return { success: true, message: 'Login successful!', user };
      } else {
        console.log('No matching user found');
        return { success: false, message: 'Invalid username or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  async signup(credentials: LoginRequest): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const users = await this.getUsers();
      
      // Check if username already exists
      const existingUser = users.find(u => 
        u.username.toLowerCase() === credentials.username.toLowerCase()
      );

      if (existingUser) {
        return { success: false, message: 'Username already exists' };
      }

      // Create new user
      const newUser: User = {
        id: this.generateId(),
        username: credentials.username,
        password: credentials.password, // In real app, hash this
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      await this.saveUsers(users);

      // Auto-login after signup
      this.currentUserSubject.next(newUser);
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));

      return { success: true, message: 'Account created successfully!', user: newUser };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Signup failed. Please try again.' };
    }
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  private async getUsers(): Promise<User[]> {
    try {
      const usersJson = localStorage.getItem(this.STORAGE_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  private async saveUsers(users: User[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
      throw error;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Public method to manually create demo user (for debugging)
  async createDemoUser(): Promise<void> {
    try {
      const users = await this.getUsers();
      const existingDemo = users.find(u => u.username === 'cursorWinner');
      
      if (!existingDemo) {
        const demoUser: User = {
          id: 'demo-user-1',
          username: 'cursorWinner',
          password: 'abcd',
          createdAt: new Date().toISOString()
        };
        users.push(demoUser);
        await this.saveUsers(users);
        console.log('Demo user created successfully');
      } else {
        console.log('Demo user already exists');
      }
    } catch (error) {
      console.error('Error creating demo user:', error);
    }
  }
}
