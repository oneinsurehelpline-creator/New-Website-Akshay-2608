import { Component, OnInit, OnDestroy } from '@angular/core';
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

  label = 'Prefer meeting us in-person?';
  placeholder = 'Enter pincode to check';
  locationType = 3;

  pincode = '';
  locations: any[] = [];            // full list from the API
  filteredLocations: any[] = [];    // branches shown in the list
  selectedLocation: any = null;     // branch shown on the map
  mapUrl: SafeResourceUrl | null = null;
  noExactMatch = false;             // true when a searched pincode had no direct hit
  searchedPin = '';
  loaded = false;

  constructor(
    private leadService: LeadService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['branchPage'] ? 'page' : 'control';
    this.getLocations();

    // On the page, re-render whenever the ?pincode query param changes.
    if (this.mode === 'page') {
      this.route.queryParamMap.subscribe((pm) => {
        this.pincode = (pm.get('pincode') || '').replace(/\D/g, '').slice(0, 6);
        this.renderPage();
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
      if (this.mode === 'page') { this.renderPage(); }
    });
  }

  // ---- control mode: open the full page in a new tab, then clear the box ----
  search(): void {
    if (!this.canSearch) { return; }
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/BranchLocator'], {
        queryParams: { pincode: this.pincode.trim() },
      }),
    );
    window.open(url, '_blank');
    this.pincode = '';   // reset the input after launching the search
  }

  // ---- page mode: refine search updates the URL (keeps it shareable/back-able) ----
  pageSearch(): void {
    if (!this.canSearch) { return; }
    this.router.navigate(['/BranchLocator'], {
      queryParams: { pincode: this.pincode.trim() },
    });
  }

  /** Clear the field. On the page, drop the ?pincode so ALL branches show again. */
  clearPincode(): void {
    this.pincode = '';
    if (this.mode === 'page') {
      // No query params -> the queryParamMap subscription re-renders with all branches.
      this.router.navigate(['/BranchLocator']);
    }
  }

  /** Build the list + selection for the full page from the current pincode. */
  private renderPage(): void {
    if (!this.loaded) { return; }               // wait until locations arrive
    const q = this.pincode.trim();

    if (/^\d{6}$/.test(q)) {
      this.searchedPin = q;
      const exact = this.locations.filter(
        (l) => (l.Pincode || '').toString().trim() === q,
      );
      this.noExactMatch = exact.length === 0;
      this.filteredLocations = exact.length ? exact : this.locations;
    } else {
      // No / invalid pincode (e.g. the footer link) -> show everything.
      this.searchedPin = '';
      this.noExactMatch = false;
      this.filteredLocations = this.locations;
    }

    this.selectLocation(this.filteredLocations[0] ?? null);
  }

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