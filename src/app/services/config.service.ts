import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;
  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {


  }
  loadConfig(): Promise<void> {
    // Relative asset URLs have no resolvable origin during server-side
    // prerendering — skip the fetch there; the browser re-runs this
    // initializer on hydration and populates the config as usual.
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }
    return this.http.get('assets/config.json')
      .toPromise()
      .then(data => {
        this.config = data;
      });
  }
 
  get baseUrl(): string {
    return this.config?.api?.baseUrl;
  }
  get careersFromEmail(): string {
    return this.config?.Careers?.FromEmail;
  } 
  get careersToEmail(): string {
    return this.config?.Careers?.ToEmail;
  }
  get claimAssignedUserName(): string {
    return this.config?.ClaimSrNumber?.AssignedUserName;
  }

}
