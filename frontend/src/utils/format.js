const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export function toArabicDigits(input) {
  if (input === null || input === undefined) return input
  return String(input).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)])
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return '—'
  return toArabicDigits(d.toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  }))
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return '—'
  return toArabicDigits(d.toLocaleDateString('ar-EG', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }))
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return '—'
  return toArabicDigits(d.toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }))
}
