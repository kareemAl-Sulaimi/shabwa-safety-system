import { useState, useEffect, useRef, useMemo } from 'react'
import { api } from '../services/api'
import FilterBar from '../components/FilterBar'
import ItemCard from '../components/ItemCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function HomePage() {
  const [lostReports, setLostReports] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const el = document.querySelector('.page-content')
    const handleScroll = () => {
      if (!el) return
      setShowScrollBtn(el.scrollTop > 320)
    }
    el?.addEventListener('scroll', handleScroll)
    return () => el?.removeEventListener('scroll', handleScroll)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [lost, found] = await Promise.all([
        api.lostReports.list(0, 100),
        api.foundAnnouncements.list(0, 100),
      ])
      setLostReports(lost)
      setFoundItems(found)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action, id, type) => {
    try {
      if (type === 'lost') {
        if (action === 'found') await api.lostReports.markFound(id)
        else if (action === 'close') await api.lostReports.close(id)
      } else {
        if (action === 'deliver') await api.foundAnnouncements.deliver(id)
        else if (action === 'close') await api.foundAnnouncements.close(id)
      }
      await loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const scrollToBottom = () => {
    const el = document.querySelector('.page-content')
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  const allItems = useMemo(() => {
    const items = [
      ...lostReports.map(i => ({ ...i, _type: 'lost' })),
      ...foundItems.map(i => ({ ...i, _type: 'found' })),
    ]
    return items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  }, [lostReports, foundItems])

  const filtered = allItems.filter(item => {
    if (filter === 'lost') return item._type === 'lost'
    if (filter === 'found') return item._type === 'found'
    return true
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className="home-page">
      <div className="home-hero">
        <p className="home-hero__basmala">بسم الله الرحمن الرحيم</p>
        <p className="home-hero__verse">
          ﴿إن الله يأمركم أن تؤدوا الأمانات إلى أهلها وإذا حكمتم بين الناس أن تحكموا بعدل
          إن الله نعما يعظكم به إن الله كان سميعا بصيرا﴾
        </p>
        <p className="home-hero__ref">النساء : ٥٨</p>
      </div>

      <FilterBar active={filter} onChange={setFilter} />

      {error && <div className="alert alert--error">{error}</div>}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">📋</span>
          <p>لا توجد تحديثات</p>
        </div>
      ) : (
        <div className="items-list">
          {filtered.map((item) => (
            <ItemCard
              key={`${item._type}-${item.id}`}
              item={item}
              type={item._type}
              onAction={handleAction}
            />
          ))}
        </div>
      )}

      {showScrollBtn && (
        <button className="scroll-to-bottom" onClick={scrollToBottom} title="العودة لأحدث التحديثات">
          ▼
        </button>
      )}
    </div>
  )
}
