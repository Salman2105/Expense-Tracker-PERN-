import {
  ArrowUpRight,
  CircleDollarSign,
  CreditCard,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";

function SettingsVisual() {
  return (
    <aside className="settings-visual" aria-hidden="true">
      <div className="settings-visual__grid" />
      <div className="settings-visual__glow settings-visual__glow--one" />
      <div className="settings-visual__glow settings-visual__glow--two" />

      <div className="settings-visual__copy">
        <span className="settings-visual__eyebrow">
          <Sparkles size={14} strokeWidth={2.5} />
          Your financial rhythm
        </span>
        <p className="settings-visual__title">Make every decision feel lighter.</p>
        <p className="settings-visual__description">
          Keep your preferences close and your progress in view.
        </p>
      </div>

      <div className="settings-visual__stage">
        <div className="settings-visual__orbit settings-visual__orbit--outer" />
        <div className="settings-visual__orbit settings-visual__orbit--inner" />
        <div className="settings-visual__core">
          <WalletCards size={34} strokeWidth={1.6} />
          <span>in control</span>
        </div>

        <div className="settings-float-card settings-float-card--balance">
          <div className="settings-float-card__icon settings-float-card__icon--green">
            <CircleDollarSign size={17} />
          </div>
          <div>
            <span className="settings-float-card__label">Available balance</span>
            <strong>$2,840.60</strong>
          </div>
          <TrendingUp className="settings-float-card__trend" size={18} />
        </div>

        <div className="settings-float-card settings-float-card--spending">
          <div className="settings-float-card__row">
            <span className="settings-float-card__label">Monthly spending</span>
            <span className="settings-float-card__percentage">64%</span>
          </div>
          <div className="settings-progress"><span /></div>
          <span className="settings-float-card__muted">$1,240 of $1,950</span>
        </div>

        <div className="settings-float-card settings-float-card--expense">
          <div className="settings-float-card__icon settings-float-card__icon--blue">
            <CreditCard size={16} />
          </div>
          <div>
            <span className="settings-float-card__label">Latest expense</span>
            <strong>-$48.20</strong>
          </div>
          <ArrowUpRight className="settings-float-card__arrow" size={17} />
        </div>
      </div>

      <div className="settings-visual__dots settings-visual__dots--one" />
      <div className="settings-visual__dots settings-visual__dots--two" />
    </aside>
  );
}

export default SettingsVisual;