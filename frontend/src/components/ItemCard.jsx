import { useAuth } from '../context/AuthContext'
import StatusBadge from './StatusBadge'
import { formatDate } from '../utils/format'

export default function ItemCard({ item, type, onAction }) {
  const { user } = useAuth()
  const isLost = type === 'lost'
  const isOwner = user && item.user_id === user.id
  const isActive = item.state === 'ACTIVE'

  const lostFields = [
    { label: 'نوع الغرض', value: item.item_type },
    { label: 'الوصف', value: item.description },
    { label: 'الموقع', value: item.location },
    { label: 'تاريخ الفقدان', value: formatDate(item.lost_date) },
    { label: 'رقم التواصل', value: item.contact },
  ]

  const foundFields = [
    { label: 'نوع الغرض', value: item.item_type },
    { label: 'الوصف', value: item.description },
    { label: 'موقع العثور', value: item.location },
    { label: 'تاريخ العثور', value: formatDate(item.found_date) },
    { label: 'شروط الاستلام', value: item.pickup_conditions },
    { label: 'رقم التواصل', value: item.contact },
  ]

  const fields = isLost ? lostFields : foundFields

  return (
    <div className={`item-card ${isLost ? 'item-card--lost' : 'item-card--found'}`}>
      <div className="item-card__header">
        <span className="item-card__type">{isLost ? '🔍 مفقود' : '✨ موجود'}</span>
        <StatusBadge state={item.state} />
      </div>

      <div className="item-card__body">
        {fields.map(({ label, value }) => (
          <div key={label} className="item-card__field">
            <span className="item-card__label">{label}</span>
            <span className="item-card__value">{value || '—'}</span>
          </div>
        ))}
      </div>

      {isActive && isOwner && (
        <div className="item-card__actions">
          {isLost ? (
            <>
              <button className="btn btn--success btn--sm" onClick={() => onAction('found', item.id, type)}>
                ✓ تم العثور عليه
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => onAction('close', item.id, type)}>
                إغلاق
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--success btn--sm" onClick={() => onAction('deliver', item.id, type)}>
                ✓ تم التسليم
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => onAction('close', item.id, type)}>
                إغلاق
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
