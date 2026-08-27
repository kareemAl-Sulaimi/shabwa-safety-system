import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import DateField from '../components/DateField'
import OpenTypeField from '../components/OpenTypeField'

export default function LostReportPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    item_type: '',
    description: '',
    location: '',
    lost_date: '',
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
      await api.lostReports.create({
        ...form,
        lost_date: new Date(form.lost_date + 'T00:00:00').toISOString(),
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
        <h1 className="page-heading__title">إبلاغ فقدان</h1>
        <p className="page-heading__subtitle">أدخل تفاصيل المفقود حتى يتمكن الآخرون من مساعدتك في العثور عليه</p>
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
            name="description"
            value={form.description}
            onChange={setField('description')}
            required
            rows={4}
            placeholder="صف المفقود بالتفصيل"
          />
        </div>

        <div className="form-group">
          <label>الموقع</label>
          <input
            type="text"
            value={form.location}
            onChange={setField('location')}
            required
            placeholder="أين فقدت الغرض؟"
          />
        </div>

        <DateField
          label="تاريخ الفقدان"
          value={form.lost_date}
          onChange={setField('lost_date')}
          required
        />

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
            {loading ? 'جاري النشر...' : 'نشر البلاغ'}
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={() => navigate('/')}>
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}
