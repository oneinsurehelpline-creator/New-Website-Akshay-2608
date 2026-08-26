import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { VideoModalService } from '../../shared/video-modal/video-modal.service';

interface SubnavItem {
  id: string;
  label: string;
}

interface VideoItem {
  num: string;
  topic: string;
  dur: string;             // fallback watch time (oEmbed can't provide duration)
  cap: string;
  title: string;           // overwritten live for cards that set a videoId
  desc: string;            // oEmbed can't provide description — stays as written
  url: string;
  videoId?: string;        // set this to enrich the card from YouTube oEmbed
  thumb?: string;          // filled at runtime (thumbnail image URL)
}

@Component({
  selector: 'app-generalinsurance',
  templateUrl: './generalinsurance.component.html',
  styleUrls: ['./generalinsurance.component.scss'],
})
export class GeneralinsuranceComponent implements AfterViewInit, OnDestroy {
  /** Sticky site-header height — keep in sync with --gi-header-h in the SCSS. */
  private readonly headerOffset = 88 + 56;

  /** The scrollable product/CTA sections, tagged with #sectionRef in the template. */
  @ViewChildren('sectionRef')
  private sectionRefs!: QueryList<ElementRef<HTMLElement>>;

  activeSection = 'travel';

  subnav: SubnavItem[] = [
    { id: 'travel', label: 'Travel' },
    { id: 'home', label: 'Home' },
    { id: 'talk', label: 'Talk to an advisor' },
  ];

  travelVideos: VideoItem[] = [
    {
      num: '01',
      cap: '',
      url: 'https://www.youtube.com/watch?v=gi5dyviK0wI',
      videoId: 'gi5dyviK0wI',
      dur: '0:56',
      topic: 'Travel Policies',
      title: '',
      desc: "Medical, baggage, delay, liability — what's in, what's out, in 2 minutes.",
    },
    {
      num: '02',
      cap: 'Domestic vs international policies',
      url: 'https://www.youtube.com/results?search_query=OneInsure+domestic+vs+international+travel+insurance',
      dur: '1:42',
      topic: 'Trip type',
      title: 'Domestic vs international.',
      desc: 'Different cover, different price, different rules — which one you actually need.',
    },
    {
      num: '03',
      cap: 'How to claim from another country',
      url: 'https://www.youtube.com/results?search_query=OneInsure+travel+insurance+claim+process',
      dur: '2:28',
      topic: 'Claims',
      title: 'Claiming abroad.',
      desc: 'The exact steps to take after an accident, theft, or medical emergency overseas.',
    },
    {
      num: '04',
      cap: 'Pre-existing conditions on travel cover',
      url: 'https://www.youtube.com/results?search_query=OneInsure+travel+insurance+pre+existing+conditions',
      dur: '1:58',
      topic: 'Health',
      title: 'Pre-existing conditions.',
      desc: "When they're covered, when they aren't, and how to disclose properly.",
    },
    {
      num: '05',
      cap: 'Annual multi-trip vs single-trip',
      url: 'https://www.youtube.com/results?search_query=OneInsure+annual+multi+trip+travel+insurance',
      dur: '1:36',
      topic: 'Strategy',
      title: 'Annual or single?',
      desc: "If you travel 3+ times a year, the maths usually tips toward annual. Here's why.",
    },
    {
      num: '06',
      cap: 'Student & senior travel cover',
      url: 'https://www.youtube.com/results?search_query=OneInsure+student+senior+travel+insurance',
      dur: '2:12',
      topic: 'Special profiles',
      title: 'Students & seniors.',
      desc: 'Long-stay study cover, age loadings, and what changes after 60.',
    },
  ];

  homeVideos: VideoItem[] = [
    {
      num: '01',
      cap: '',
      url: 'https://www.youtube.com/watch?v=gi5dyviK0wI',
      videoId: 'gi5dyviK0wI',
      dur: '0:56',
      topic: 'Travel Policies',
      title: '',
      desc: 'The difference between structure and contents cover — and why most people need both.',
    },
    {
      num: '02',
      cap: 'Tenant vs owner cover',
      url: 'https://www.youtube.com/results?search_query=OneInsure+tenant+home+insurance',
      dur: '1:36',
      topic: 'Renters',
      title: 'Renting? You still need cover.',
      desc: "The landlord's policy doesn't protect your stuff. Tenant cover does — and it's cheap.",
    },
    {
      num: '03',
      cap: 'Filing a burglary claim — step by step',
      url: 'https://www.youtube.com/results?search_query=OneInsure+home+insurance+burglary+claim',
      dur: '2:20',
      topic: 'Claims',
      title: 'After a break-in.',
      desc: 'FIR, surveyor, inventory, payout — the order matters. Get it right the first time.',
    },
    {
      num: '04',
      cap: 'Natural disasters & your home',
      url: 'https://www.youtube.com/results?search_query=OneInsure+home+insurance+natural+disaster',
      dur: '2:06',
      topic: 'Disasters',
      title: 'Floods, quakes, cyclones.',
      desc: 'What standard home insurance covers — and the add-ons most people skip and regret.',
    },
    {
      num: '05',
      cap: 'The jewellery rider — worth it?',
      url: 'https://www.youtube.com/results?search_query=OneInsure+jewellery+insurance+rider',
      dur: '1:48',
      topic: 'Riders',
      title: 'Jewellery & valuables.',
      desc: "Specie cover and the all-risk jewellery rider. When it's essential. When it isn't.",
    },
    {
      num: '06',
      cap: 'Sum insured: market vs reinstatement',
      url: 'https://www.youtube.com/results?search_query=OneInsure+home+insurance+sum+insured',
      dur: '1:42',
      topic: 'Sum insured',
      title: 'How much cover is enough.',
      desc: 'Market value or reinstatement value — pick wrong, and you under-insure by 40%.',
    },
  ];

  private revealObserver?: IntersectionObserver;

  constructor(
    private host: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef,
    private videoModal: VideoModalService,
  ) { }

  /** Opens the explainer video inline; falls back to a new tab when there's no known videoId. */
  openVideo(v: VideoItem, event: Event): void {
    event.preventDefault();
    if (v.videoId) {
      this.videoModal.open(v.videoId, v.title || v.topic);
    } else {
      window.open(v.url, '_blank', 'noopener');
    }
  }

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const root = this.host.nativeElement;

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            this.revealObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    root
      .querySelectorAll('.reveal, .reveal-left, .reveal-right, .covcard, .pcard, .vcard')
      .forEach((el) => this.revealObserver!.observe(el));

    // Staggered entrance for card grids
    root
      .querySelectorAll<HTMLElement>('.covcard')
      .forEach((el, i) => (el.style.transitionDelay = `${i * 70}ms`));
    root
      .querySelectorAll<HTMLElement>('.pcard')
      .forEach((el, i) => (el.style.transitionDelay = `${i * 90}ms`));

    // Set the initial active subnav item (deferred a tick so it doesn't 
    setTimeout(() => this.updateActiveSection());

    this.enrichVideos();
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
  }

  /** Smoothly scroll to an in-page section; scroll-margin-top (SCSS) clears the sticky bars. */
  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateActiveSection();
  }

  private updateActiveSection(): void {
    if (!this.sectionRefs?.length) {
      return;
    }
    // A section is "active" once its top scrolls up past the sticky bars. 
    const threshold = this.headerOffset + 4;
    let current = this.subnav[0].id;
    this.sectionRefs.forEach((ref) => {
      const el = ref.nativeElement;
      if (el.getBoundingClientRect().top <= threshold) {
        current = el.id;
      }
    });
    this.activeSection = current;
  }

  // Pulls live title + thumbnail for any card that has a `videoId`, using
  // YouTube's public oEmbed endpoint (no API key needed). 
  private enrichVideos(): void {
    [this.travelVideos, this.homeVideos].forEach((list) => this.enrichList(list));
  }

  // Enriches one list of video cards in place.
  private enrichList(list: VideoItem[]): void {
    list.forEach((v) => {
      if (!v.videoId) {
        return;
      }

      // Instant thumbnail — hqdefault always exists, no request required.
      v.thumb = `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`;

      const oembed =
        'https://www.youtube.com/oembed?format=json&url=' +
        encodeURIComponent(`https://www.youtube.com/watch?v=${v.videoId}`);

      fetch(oembed)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) {
            return;
          }
          if (data.title) {
            v.title = data.title;            // real video title from YouTube
          }
          if (data.thumbnail_url) {
            v.thumb = data.thumbnail_url;    // upgrade to the oEmbed thumbnail
          }
          this.cdr.detectChanges();
        })
        .catch(() => { 
        });
    });
  }
}