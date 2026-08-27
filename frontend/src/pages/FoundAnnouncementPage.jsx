import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import DateField from '../components/DateField'
import OpenTypeField from '../components/OpenTypeField'

export default function FoundAnnouncementPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    item_type: '',
    description: '',
    location: '',
    found_date: '',
    pickup_conditions: '',
    contact: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const setField = (key) => (e) => {
    const val = e?.target ? e.target.value : e
    setForm(prev => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.foundAnnouncements.create({
        ...form,
        found_date: new Date(form.found_date + 'T00:00:00').toISOString(),
      })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      <header className="page-heading">
        <h1 className="page-heading__title">إعلان إيجاد</h1>
        <p className="page-heading__subtitle">أدخل تفاصيل الغرض الموجود حتى يتمكن صاحبه من استلامه</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form onSubmit={handleSubmit} className="report-form">
        <OpenTypeField
          label="نوع الغرض"
          value={form.item_type}
          onChange={setField('item_type')}
          required
        />

        <div className="form-group">
          <label>الوصف</label>
          <textarea
            value={form.description}
            onChange={setField('description')}
            required
            rows={4}
            placeholder="صف الغرض الموجود بالتفصيل"
          />
        </div>

        <div className="form-group">
          <label>موقع العثور</label>
          <input
            type="text"
            value={form.location}
            onChange={setField('location')}
            required
            placeholder="أين وجدت الغرض؟"
          />
        </div>

        <DateField
          label="تاريخ العثور"
          value={form.found_date}
          onChange={setField('found_date')}
          required
        />

        <div className="form-group">
          <label>شروط الاستلام</label>
          <textarea
            value={form.pickup_conditions}
            onChange={setField('pickup_conditions')}
            required
            rows={3}
            placeholder="حدد شروط استلام الغرض"
          />
        </div>

        <div className="form-group">
          <label>رقم التواصل</label>
          <input
            type="tel"
            value={form.contact}
            onChange={setField('contact')}
            required
            placeholder="رقم الهاتف للتواصل"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'جاري النشر...' : 'نشر الإعلان'}
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={() => navigate('/')}>
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}
