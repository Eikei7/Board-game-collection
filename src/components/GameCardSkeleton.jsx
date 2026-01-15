import { memo } from 'react';

export const GameCardSkeleton = memo(() => (
  <div className="game-card skeleton">
    <div className="game-thumbnail skeleton-img" />
    <div className="game-info" style={{ flex: 1 }}>
      <div className="skeleton-line" style={{ height: '20px', marginBottom: '8px' }} />
      <div className="skeleton-line short" style={{ height: '14px', width: '70%', marginBottom: '8px' }} />
      <div className="skeleton-line short" style={{ height: '14px', width: '60%' }} />
    </div>
  </div>
));