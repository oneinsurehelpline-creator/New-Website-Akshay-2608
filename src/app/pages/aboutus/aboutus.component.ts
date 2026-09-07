import { AfterViewInit, Component, ElementRef, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LeadService } from 'src/app/services/lead.service';

interface TeamMember {
  name: string;
  title: string;
  image: string;
  linkedin: string;
}

interface LeadershipDto {
  Id: number;
  Name: string;
  Title: string;
  ImageUrl: string;
  Description: string | null;
  Linkedin: string;
  IsActive: number;
}

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.scss'],
})
export class AboutusComponent implements OnInit, AfterViewInit {

  team: TeamMember[] = [];
  loading = true;

  private io?: IntersectionObserver;

  // Number of placeholder cards to show while the API responds.
  skeletons = Array.from({ length: 10 });

  private readonly isBrowser: boolean;

  constructor(
    private host: ElementRef<HTMLElement>,
    private leadService: LeadService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadLeadership();
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }
    this.setupReveal();
  }

  private setupReveal(): void {
    if (!this.isBrowser) {
      return;
    }
    if (!this.io) {
      this.io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              this.io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
      );
    }
    // `:not(.in)` so re-running after the API loads only picks up new cards.
    const els = this.host.nativeElement.querySelectorAll(
      '.reveal:not(.in), .reveal-up:not(.in), .reveal-left:not(.in), .reveal-right:not(.in), .reveal-scale:not(.in)'
    );
    els.forEach((el) => this.io!.observe(el));
  }


  private loadLeadership(): void {
    this.leadService.leadershipDetails({}).subscribe({
      next: (res: any) => {
        const rows: LeadershipDto[] = Array.isArray(res?.[0])
          ? res[0]
          : Array.isArray(res)
            ? res
            : [];

        this.team = rows
          .filter((m) => m?.IsActive === 1)
          .map<TeamMember>((m) => ({
            name: m.Name,
            title: m.Title,
            image: m.ImageUrl,
            linkedin: this.normalizeUrl(m.Linkedin),
          }));

        this.loading = false;
        setTimeout(() => this.setupReveal());
      },
      error: (err) => {
        console.error('leadershipDetails failed', err);
        this.loading = false; // stop skeletons even on error
      },
    });
  }

  private normalizeUrl(url: string): string {
    if (!url) return '#';
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }
}