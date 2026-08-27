import { useRef } from 'react'
import { formatDate } from '../utils/format'

export default function DateField({ label, value, onChange, required = false, error = null }) {
  const inputRef = useRef(null)

  const handleFocus = () => {
    if (inputRef.current) inputRef.current.showPicker?.()
  }

  return (
    <div className={`form-group ${error ? 'form-group--error' : ''}`}>
      <label>{label}</label>
      <div className="date-field">
        <input
          ref={inputRef}
          className="date-field__picker"
          type="date"
          value={value}
          onChange={onChange}
          onClick={handleFocus}
        />
        <div className="date-field__view" onClick={handleFocus}>
          {value ? formatDate(value) : <span className="date-field__placeholder">اختر التاريخ</span>}
          <span className="date-field__icon" aria-hidden>📅</span>
        </div>
      </div>
      {error && <span className="form-group__error">{error}</span>}
    </div>
  )
}
