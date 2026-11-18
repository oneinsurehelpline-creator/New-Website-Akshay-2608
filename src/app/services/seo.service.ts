import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SeoData {
  title?: string;
  description?: string;
  noindex?: boolean;
}

const SITE = 'https://www.oneinsure.com';
const DEFAULTS: Required<Pick<SeoData, 'title' | 'description'>> = {
  title: 'OneInsure: Insurance Policy Comparison | Manage, Renew & Buy any Insurance Plan',
  description: 'Compare, buy and renew Health, Term Life, Motor, Travel and Investment Insurance Plans from 40+ insurers with OneInsure.'
};

/** Sets title, description, self-referencing canonical, og:* and robots per route (from route `data.seo`). */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private router = inject(Router);
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  init(): void {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
      let route: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
      while (route.firstChild) route = route.firstChild;
      this.update((route.data['seo'] ?? {}) as SeoData, (e as NavigationEnd).urlAfterRedirects);
    });
  }

  private update(seo: SeoData, url: string): void {
    const path = url.split(/[?#]/)[0].replace(/\/+$/, '');
    const canonical = SITE + path + (path ? '' : '/');
    const title = seo.title ?? DEFAULTS.title;
    const description = seo.description ?? DEFAULTS.description;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: seo.noindex ? 'noindex,nofollow' : 'index,follow' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonical });

    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', canonical);
  }
}
