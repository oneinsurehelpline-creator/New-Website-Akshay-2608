import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor() { }

  loading(title = 'Please wait…', text = '') {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });
  }

  close() {
    Swal.close();
  }


  success(title: string, text?: string) {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: '#00B0FF',
      timer: 2500,
      timerProgressBar: true
    });
  }

  error(title: string, text?: string) {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#d33',
      timer: 2500,
      timerProgressBar: true
    });
  }

  warning(title: string, text?: string) {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: '#f59e0b',
      timer: 2500,
      timerProgressBar: true
    });
  }

  info(title: string, text?: string) {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonColor: '#00B0FF',
      timer: 2500,
      timerProgressBar: true
    });
  }

  toast(
    icon: SweetAlertIcon,
    title: string,
    position:
      | 'top'
      | 'top-end'
      | 'top-start'
      | 'bottom'
      | 'bottom-end'
      | 'bottom-start' = 'top-end'
  ) {
    return Swal.fire({
      toast: true,
      position,
      icon,
      title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: false
    });
  }

  confirm(
    title: string,
    text: string,
    confirmButtonText = 'Yes',
    cancelButtonText = 'Cancel'
  ) {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00B0FF',
      cancelButtonColor: '#6B7280',
      confirmButtonText,
      cancelButtonText
    });
  }

}
