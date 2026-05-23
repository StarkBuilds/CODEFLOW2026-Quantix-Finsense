/**
 * White bordered card used as a section wrapper throughout the Dashboard.
 *
 * @param {{ title?: string, children: React.ReactNode, className?: string }} props
 */
export default function CardSection({ title, children, className = '' }) {
  return (
    <div className={`card-section ${className}`}>
      {title && <h3 className="card-section__title">{title}</h3>}
      {children}
    </div>
  );
}