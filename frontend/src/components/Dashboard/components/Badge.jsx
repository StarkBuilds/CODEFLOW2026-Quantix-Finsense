import { cc } from '../../../utils/helpers.js';

/**
 * Coloured pill badge for a transaction category.
 *
 * @param {{ cat: string }} props
 */
export default function Badge({ cat }) {
  const color = cc(cat);

  return (
    <span
      className="category-badge"
      style={{
        background: color + '18',
        color,
        border: `1px solid ${color}30`,
      }}
    >
      {cat || 'Other'}
    </span>
  );
}