export default function AboutPage() {
  return (
    <div className="about-page">
      <header className="page-heading">
        <h1 className="page-heading__title">حول المطور</h1>
      </header>

      <div className="about-card">
        <div className="about-card__avatar">K</div>
        <h2 className="about-card__name">Kareem Al-Sulaimi</h2>
        <p className="about-card__role">مطوّر البرنامج</p>

        <div className="about-card__divider" />

        <div className="about-card__meta">
          <div className="about-card__meta-item">
            <span className="about-card__meta-label">النظام</span>
            <span className="about-card__meta-value">نظام شبوة الأمني (SSS)</span>
          </div>
          <div className="about-card__meta-item">
            <span className="about-card__meta-label">الإصدار</span>
            <span className="about-card__meta-value">1.0.0</span>
          </div>
        </div>

        <p className="about-card__desc">
          نظام شبوة الأمني هو منصة رقمية للمساعدة في حل مشكلة المفقودات والموجودات
          في محافظة شبوة، اليمن، من خلال ربط الإبلاغات والإعلانات في مكان واحد.
        </p>
      </div>
    </div>
  )
}
