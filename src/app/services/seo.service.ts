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

/** Company facts taken from the site footer and site-facts.ts. */
const ORG = {
  "@type": ["InsuranceAgency", "Organization"],
  "@id": "https://www.oneinsure.com/#organization",
  name: "OneInsure",
  legalName: "Robinhood Insurance Broker Ltd.",
  url: "https://www.oneinsure.com/",
  logo: "https://www.oneinsure.com/assets/cmn/og-image.png",
  image: "https://www.oneinsure.com/assets/cmn/og-image.png",
  telephone: "+91-86559-86559",
  email: "support@oneinsure.com",
  foundingDate: "2008-03-27",
  identifier: "IRDAI Reg. No. IRDA/DB 407/08",
  address: {
    "@type": "PostalAddress",
    streetAddress: "501-503, Sigma Building, Hiranandani Gardens, Powai",
    addressLocality: "Mumbai",
    addressRegion: "Maharashtra",
    postalCode: "400076",
    addressCountry: "IN"
  },
  sameAs: [
    "https://www.facebook.com/OneInsureOfficial",
    "https://www.instagram.com/getoneinsure/",
    "https://www.linkedin.com/company/oneinsure-robinhood/",
    "https://www.youtube.com/@getoneinsure"
  ]
};

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
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', canonical);

    this.setJsonLd(path ? this.breadcrumbs(title, canonical) : {
      '@context': 'https://schema.org',
      '@graph': [
        ORG,
        { '@type': 'WebSite', '@id': SITE + '/#website', url: SITE + '/', name: 'OneInsure', publisher: { '@id': ORG['@id'] } }
      ]
    }, seo.noindex);
  }

  /** BreadcrumbList: Home > page. The page name is the part of the title before ":" or "|". */
  private breadcrumbs(title: string, url: string): object {
    const name = title.split(/s*[:|]s*/)[0];
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name, item: url }
      ]
    };
  }

  /** Replace the page's JSON-LD block (none on noindex pages). */
  private setJsonLd(data: object, skip?: boolean): void {
    this.doc.head.querySelectorAll('script[data-seo-ld]').forEach(n => n.remove());
    if (skip) return;
    const el = this.doc.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-seo-ld', '');
    el.textContent = JSON.stringify(data);
    this.doc.head.appendChild(el);
  }
}
