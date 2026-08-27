export default function OpenTypeField({ label, value, onChange, required = false, error = null }) {
  return (
    <div className={`form-group ${error ? 'form-group--error' : ''}`}>
      <label>{label}</label>
      <div className="open-type">
        <input
          className="open-type__input"
          type="text"
          list="item-types"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder="اكتب نوع الغرض أو اختر من الاقتراحات"
        />
        <datalist id="item-types">
          {['هاتف', 'محفظة', 'مفاتيح', 'حقيبة', 'وثائق', 'إلكترونيات', 'ملابس', 'سيارة', 'أخرى'].map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>
      {error && <span className="form-group__error">{error}</span>}
    </div>
  )
}
