import { Component, Input, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LeadService } from 'src/app/services/lead.service';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss'],
})
export class BranchComponent implements OnInit, OnDestroy {

  mode: 'control' | 'page' = 'control';


  placeholder = 'Enter city name';
  @Input() label = 'Prefer meeting us in-person?';
  locationType = 3;

  pincode = '';
  locations: any[] = [];            // full list from the API
  filteredLocations: any[] = [];    // branches shown in the list
  selectedLocation: any = null;     // branch shown on the map
  mapUrl: SafeResourceUrl | null = null;
  noExactMatch = false;             // true when a searched pincode had no direct hit
  searchedPin = '';
  loaded = false;
  city: any;
  existCity: any;
  private readonly isBrowser: boolean;

  constructor(
    private leadService: LeadService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['branchPage'] ? 'page' : 'control';
    if (this.isBrowser) {
      this.getLocations();
    }

    // On the page, re-render whenever the ?pincode query param changes.
    if (this.mode === 'page') {
      this.route.queryParamMap.subscribe((pm) => {
        this.city = (pm.get('city') || '');
        this.branchSearch(this.city);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      });

    }
  }

  /** Clear the field when the host component is destroyed (i.e. leaves the page). */
  ngOnDestroy(): void {
    this.pincode = '';
  }

  /** Enabled only once a full 6-digit pincode is present. */
  get canSearch(): boolean {
    return /^\d{6}$/.test(this.pincode.trim());
  }

  // ---- input: digits only ----

  /** Block any non-digit character before it lands in the input (desktop). */
  onKeyPress(e: KeyboardEvent): void {
    // Printable single chars only; let control keys / shortcuts through.
    if (e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  }

  /** Strip non-digits from pasted text and cap at 6. */
  onPaste(e: ClipboardEvent): void {
    e.preventDefault();
    const text = e.clipboardData?.getData('text') ?? '';
    this.pincode = text.replace(/\D/g, '').slice(0, 6);
  }

  /** Keep the field numeric and capped at 6 digits. */
  onPinChange(value: string): void {
    this.pincode = (value || '').replace(/\D/g, '').slice(0, 6);
  }

  private getLocations(): void {
    const cdto = { Type: this.locationType };
    this.leadService.GetLocations(cdto).subscribe((res: any) => {
      // The API returns a nested array: [[{...}, {...}]] -> unwrap it.
      this.locations = Array.isArray(res?.[0]) ? res[0]
        : Array.isArray(res) ? res
          : [];
      this.loaded = true;
      if (this.mode === 'page') { this.branchSearch(this.city); }
    });
  }
  branchSearch(city: any) {
    if (!city) {
      this.filteredLocations = this.locations;
      this.selectLocation(this.filteredLocations[0] ?? null);
      return;
    }
    const search = city?.trim().toLowerCase();

    if (!search) {
      this.filteredLocations = this.locations;
      return;
    }

    this.filteredLocations = this.locations.filter((location: any) =>
      location.City?.toLowerCase().includes(search)
    );
    this.selectLocation(this.filteredLocations[0] ?? null);
  }

  // ---- control mode: open the full page in a new tab, then clear the box ----
  // search(): void {
  //   if (!this.canSearch) { return; }
  //   const url = this.router.serializeUrl(
  //     this.router.createUrlTree(['/BranchLocator'], {
  //       queryParams: { pincode: this.pincode.trim() },
  //     }),
  //   );
  //   window.open(url, '_blank');
  //   this.pincode = '';   // reset the input after launching the search
  // }

  // ---- page mode: refine search updates the URL (keeps it shareable/back-able) ----
  pageSearch(city: any): void {
    // if (!this.canSearch) { return; }

    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/branch-locator'], {
        queryParams: { city: city },
      }),
    );
    window.open(url, '_blank');
    this.existCity= '';
    this.pincode = '';
  }

  /** Clear the field. On the page, drop the ?pincode so ALL branches show again. */
  // clearPincode(): void {
  //   this.pincode = '';
  //   if (this.mode === 'page') {
  //     // No query params -> the queryParamMap subscription re-renders with all branches.
  //     this.router.navigate(['/BranchLocator']);
  //   }
  // }

  selectLocation(loc: any): void {
    this.selectedLocation = loc;
    if (loc && loc.Lat != null && loc.Lng != null) {
      const url = `https://maps.google.com/maps?q=${loc.Lat},${loc.Lng}&z=16&hl=en&output=embed`;
      this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      this.mapUrl = null;
    }
  }
}