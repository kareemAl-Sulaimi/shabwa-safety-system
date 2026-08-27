const reminders = [
  {
    title: 'آية قرآنية',
    text: '﴿إِنَّ اللَّهَ يَأْمُرُكُمْ أَنْ تُؤَدُّوا الْأَمَانَاتِ إِلَى أَهْلِهَا وَإِذَا حَكَمْتُمْ بَيْنَ النَّاسِ أَنْ تَحْكُمُوا بِالْعَدْلِ﴾',
    source: 'النساء : ٥٨',
  },
  {
    title: 'حديث نبوي',
    text: 'أَدِّ الأمانةَ إلى من ائتمنك، ولا تخُنْ من خانك.',
    source: 'رواه أبو داود والترمذي',
  },
  {
    title: 'حديث نبوي',
    text: 'المسلمُ أخو المسلمِ، لا يَظْلِمُه ولا يَخْذُلُه ولا يَحتقرُه.',
    source: 'رواه مسلم',
  },
]

export default function RemindersPage() {
  return (
    <div className="reminders-page">
      <header className="page-heading">
        <h1 className="page-heading__title">تذكير</h1>
        <p className="page-heading__subtitle">آيات قرآنية وأحاديث نبوية تعزز قيم الأمانة والعدل</p>
      </header>

      <div className="reminders-list">
        {reminders.map((r, i) => (
          <article key={i} className="reminder-card">
            <span className="reminder-card__badge">{r.title}</span>
            <p className="reminder-card__text">{r.text}</p>
            <p className="reminder-card__source">{r.source}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
