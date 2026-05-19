import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, Subscription, fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  activeSection = 'home';
  private readonly landingSections = ['home', 'about', 'contact'];
  private subs: Subscription[] = [];

  constructor(public authService: AuthService, private router: Router) {}

  get role(): string {
    return this.authService.getRole;
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get username(): string {
    return this.authService.getUsername();
  }

  ngOnInit(): void {
    this.subs.push(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(() => this.onRouteOrHashChange())
    );
    this.subs.push(
      fromEvent(window, 'scroll')
        .pipe(throttleTime(100))
        .subscribe(() => this.updateActiveSectionFromScroll())
    );
    this.onRouteOrHashChange();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToSection(section: string, event: MouseEvent): void {
    if (!this.landingSections.includes(section)) {
      return;
    }
    if (this.isLandingRoute()) {
      event.preventDefault();
      this.scrollToSection(section, true);
      history.replaceState(null, '', `#${section}`);
    } else {
      this.router.navigate(['/'], { fragment: section });
    }
  }

  private isLandingRoute(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return path === '' || path === '/';
  }

  private onRouteOrHashChange(): void {
    if (!this.isLandingRoute()) {
      this.activeSection = '';
      return;
    }

    const hash = (window.location.hash || '#home').replace('#', '');
    const section = this.landingSections.includes(hash) ? hash : 'home';

    setTimeout(() => {
      this.scrollToSection(section, false);
      this.updateActiveSectionFromScroll();
    }, 50);
  }

  private scrollToSection(id: string, smooth: boolean): void {
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });
    this.activeSection = id;
  }

  private updateActiveSectionFromScroll(): void {
    if (!this.isLandingRoute()) {
      return;
    }

    const marker = window.scrollY + 100;
    let current = 'home';

    for (const id of this.landingSections) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= marker) {
        current = id;
      }
    }

    this.activeSection = current;
  }
}
