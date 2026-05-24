import './ProcessingScreen.css';

/**
 * @param {{ logs: Array<{ id: number|string, msg: string }> }} props
 */
export default function ProcessingScreen({ logs }) {
  return (
    <div className="processing-screen">
      <div className="processing-card">
        {/* Spinner */}
        <div className="processing-spinner" aria-hidden="true" />

        <h2 className="processing-title">Analysing your statement</h2>

        {/* Progress log */}
        <ul className="processing-log" aria-live="polite" aria-label="Analysis progress">
          {logs.map((entry, i) => {
            const isDone    = i < logs.length - 1;
            const isCurrent = i === logs.length - 1;
            return (
              <li
                key={entry.id}
                className={`processing-log__item ${isCurrent ? 'processing-log__item--active' : ''}`}
              >
                <span className="processing-log__icon" aria-hidden="true">
                  {isDone ? '✅' : '⏳'}
                </span>
                <span className="processing-log__msg">{entry.msg}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}