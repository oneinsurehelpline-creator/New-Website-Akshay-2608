import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';


export interface Lead {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  help: string;
  time: string;
}

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  /**
   * Point this at your backend endpoint.
   * e.g. environment.apiBaseUrl + '/leads'
   */
  private readonly apiUrl = 'http://localhost:4000/api/';
  private jsonUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.jsonUrl = this.configService.baseUrl;
  }
  userId: number | string | null = null;
  submit(payload: Lead): Observable<unknown> {
    return this.http.post(this.jsonUrl, payload);
  }
  GetLocations(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/getLocations", cdto, { 'headers': header })
  }
  waitListEmail(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/waitListEmail", cdto, { 'headers': header })
  }
  CustomerDetails(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/CustomerDetails", cdto, { 'headers': header })
  }
  leadershipDetails(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    console.log("leadershipDetails", cdto);
    return this.http.post(this.jsonUrl + "OneinsureApi/leadershipDetails", cdto, { 'headers': header })
  }
  companyDetails(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/companyDetails", cdto, { 'headers': header })
  }
  insurerImgs(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/insurerImgs", cdto, { 'headers': header })
  }
  saveJobApplicationDetails(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/saveJobApplicationDetails", cdto, { 'headers': header })
  }
  saveclaimFile(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/claimFile", cdto, { 'headers': header })
  }
  CreateNewSR(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post("https://crmwebapi.oneinsure.com/api/request/CreateNewSR", cdto, { 'headers': header })
  }
  becomePartner(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/becomePartner", cdto, { 'headers': header })
  }
  InvestmentPlanDetails(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/InvestmentPlanDetails", cdto, { 'headers': header })
  }
  generateOtp(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/generate-otp", cdto, { 'headers': header })
  }
  verifyOtp(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/verifyOtp", cdto, { 'headers': header })
  }
  getInfo(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/getInfo", cdto, { 'headers': header })
  }
  customerClaimsList(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/customerClaimsList", cdto, { 'headers': header })
  }
  healthClaims(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/healthClaims", cdto, { 'headers': header })
  }
  motorClaims(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/motorClaims", cdto, { 'headers': header })
  }
  lifeClaims(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/lifeClaims", cdto, { 'headers': header })
  }
  getpolicies(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/getpolicies", cdto, { 'headers': header })
  }
  getPolicyDetails(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/getPolicyDetails", cdto, { 'headers': header })
  }
    registerUser(cdto: any): Observable<any> {
    let header = new HttpHeaders();
    return this.http.post(this.jsonUrl + "OneinsureApi/registerUser", cdto, { 'headers': header })
  }
} 