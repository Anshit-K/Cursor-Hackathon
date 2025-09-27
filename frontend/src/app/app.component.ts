import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemoryMapComponent } from './components/memory-map/memory-map.component';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';
import { User } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MemoryMapComponent, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Memory Lane';
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
