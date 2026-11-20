// Apple Liquid Glass themed SweetAlert2 helpers.
// All native alert/confirm/prompt calls in the app route through here.
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const base = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  focusCancel: false,
  backdrop: true,
  customClass: {
    container: 'glass-swal-container',
    popup: 'glass-swal-popup',
    title: 'glass-swal-title',
    htmlContainer: 'glass-swal-html',
    icon: 'glass-swal-icon',
    actions: 'glass-swal-actions',
    confirmButton: 'glass-swal-btn glass-swal-btn-primary',
    denyButton: 'glass-swal-btn glass-swal-btn-danger',
    cancelButton: 'glass-swal-btn glass-swal-btn-secondary',
    input: 'glass-swal-input',
    validationMessage: 'glass-swal-validation',
  },
  showClass: { popup: 'glass-swal-show', backdrop: 'glass-swal-backdrop-show' },
  hideClass: { popup: 'glass-swal-hide', backdrop: 'glass-swal-backdrop-hide' },
});

const toastBase = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
  customClass: {
    popup: 'glass-swal-toast',
    title: 'glass-swal-toast-title',
    htmlContainer: 'glass-swal-toast-html',
    timerProgressBar: 'glass-swal-toast-progress',
  },
  showClass: { popup: 'glass-swal-toast-show' },
  hideClass: { popup: 'glass-swal-toast-hide' },
  didOpen: (el) => {
    el.addEventListener('mouseenter', Swal.stopTimer);
    el.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

/** Ask for confirmation. Resolves to true when the user confirms. */
export async function confirmAction({
  title = 'Are you sure?',
  text = '',
  html,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon = 'question',
  danger = false,
} = {}) {
  const res = await base.fire({
    title,
    text: html ? undefined : text,
    html,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      container: 'glass-swal-container',
      popup: 'glass-swal-popup',
      title: 'glass-swal-title',
      htmlContainer: 'glass-swal-html',
      actions: 'glass-swal-actions',
      confirmButton: `glass-swal-btn ${danger ? 'glass-swal-btn-danger' : 'glass-swal-btn-primary'}`,
      cancelButton: 'glass-swal-btn glass-swal-btn-secondary',
    },
  });
  return res.isConfirmed;
}

/** Modal alert (replaces window.alert). */
export function showAlert({ title, text = '', icon = 'info', confirmText = 'Got it' } = {}) {
  return base.fire({ title, text, icon, confirmButtonText: confirmText });
}

export const showSuccess = (title, text = '') => showAlert({ title, text, icon: 'success' });
export const showError = (title, text = '') => showAlert({ title, text, icon: 'error', confirmText: 'Close' });

/** Non-blocking toast in the top-right corner. */
export function toast(title, { icon = 'success', text = '', timer } = {}) {
  // SweetAlert shows one popup at a time: never let a toast replace an open dialog
  // (that would silently dismiss a pending confirm or a success message).
  const open = Swal.isVisible() ? Swal.getPopup() : null;
  if (open && !open.classList.contains('swal2-toast')) return Promise.resolve(null);
  return toastBase.fire({ title, text, icon, ...(timer ? { timer } : {}) });
}

/** Numeric prompt. Resolves to a positive integer or null if cancelled. */
export async function promptNumber({
  title,
  text = '',
  defaultValue = '',
  min = 1,
  max = 1440,
  confirmText = 'Save',
  placeholder = '',
} = {}) {
  const res = await base.fire({
    title,
    text,
    input: 'number',
    inputValue: defaultValue,
    inputPlaceholder: placeholder,
    inputAttributes: { min: String(min), max: String(max), step: '1' },
    showCancelButton: true,
    confirmButtonText: confirmText,
    inputValidator: (value) => {
      const n = parseInt(value, 10);
      if (Number.isNaN(n) || n < min || n > max) {
        return `Enter a number between ${min} and ${max}.`;
      }
      return undefined;
    },
  });
  return res.isConfirmed ? parseInt(res.value, 10) : null;
}

export default Swal;
