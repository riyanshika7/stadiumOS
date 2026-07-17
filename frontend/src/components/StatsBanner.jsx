import React from 'react';
import LiveCounter from './LiveCounter';

const StatsBanner = React.memo(function StatsBanner() {
  return (
    <div className="stats-banner smooth-section-reveal">
      <div className="stat-card-item">
        <div className="stat-value-neon">
          <LiveCounter end={80} suffix="K+" />
        </div>
        <div className="stat-label-text">Fans Per Match</div>
      </div>
      <div className="stat-card-item">
        <div className="stat-value-neon">
          <LiveCounter end={15} suffix="m" />
        </div>
        <div className="stat-label-text">Redirection Pre-warn</div>
      </div>
      <div className="stat-card-item">
        <div className="stat-value-neon">
          <LiveCounter end={8} suffix="+" />
        </div>
        <div className="stat-label-text">Languages Translated</div>
      </div>
      <div className="stat-card-item">
        <div className="stat-value-neon">
          <LiveCounter end={93} suffix="%" />
        </div>
        <div className="stat-label-text">Core Safety SLA</div>
      </div>
    </div>
  );
});

export default StatsBanner;
