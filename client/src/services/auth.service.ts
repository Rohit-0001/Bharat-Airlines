import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

// const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes idle
const IDLE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes idle
@Injectable({ providedIn: 'root' })
export class AuthService {

  private idleTimer: any;
  private readonly SESSION_KEY = 'gladiator_session';

  constructor(private router: Router, private ngZone: NgZone) {
    this.initIdleWatcher();
    this.initCrossTabSync();
  }

  saveAuth(token: string, role: string, userId: string, username: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    // Tab-specific: also store in sessionStorage so other-browser tabs can't access
    
    sessionStorage.setItem(this.SESSION_KEY, 'active');
    this.resetIdleTimer();
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  get getRole(): string {
    const token = this.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || '';
    } catch { return ''; }
  }

  getUserId(): string {
    return localStorage.getItem('userId') || '';
  }
  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  isLoggedIn(): boolean {
    // Must have token AND session marker (prevents cross-browser-tab copy)
    const hasToken = !!localStorage.getItem('token') && !this.isTokenExpired();
    const hasSession = !!sessionStorage.getItem(this.SESSION_KEY);
    return hasToken && hasSession;
  }
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    sessionStorage.removeItem(this.SESSION_KEY);
    // Broadcast logout to all same-browser tabs
    localStorage.setItem('logout_event', Date.now().toString());
    localStorage.removeItem('logout_event');
    clearTimeout(this.idleTimer);
  }

  /** Reset idle timer on user activity */
  resetIdleTimer(): void {
    clearTimeout(this.idleTimer);
    if (!this.isLoggedIn()) return;
    this.idleTimer = setTimeout(() => {
      this.ngZone.run(() => {
        this.logout();
        this.router.navigate(['/login'], { queryParams: { reason: 'idle' } });
      });
    }, IDLE_TIMEOUT_MS);
  }

  /** Watch mouse/keyboard/touch to reset idle timer */
  private initIdleWatcher(): void {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event =>
      document.addEventListener(event, () => this.resetIdleTimer(), { passive: true })
    );
  }

  /** Sync logout across same-browser tabs */
  private initCrossTabSync(): void {
    window.addEventListener('storage', (e) => {
      if (e.key === 'logout_event') {
        this.ngZone.run(() => {
          sessionStorage.removeItem(this.SESSION_KEY);
          this.router.navigate(['/login']);
        });
      }
      // If token is set in another tab (new login), update session
      if (e.key === 'token' && e.newValue) {
        sessionStorage.setItem(this.SESSION_KEY, 'active');
      }
    });
  }
}
