import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function MatchdayClock() {
  const [localTime, setLocalTime] = useState('');
  const [matchStatusText, setMatchStatusText] = useState('');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Generate a fixed kickoff time for demonstration: today at 19:30 (7:30 PM) local time
    // If the current time is past 19:30, we set it to tomorrow 19:30 so there's always a countdown
    const now = new Date();
    let kickoff = new Date();
    kickoff.setHours(19, 30, 0, 0);

    if (now.getTime() > kickoff.getTime() + 120 * 60 * 1000) {
      // If past match duration, set kickoff for tomorrow
      kickoff.setDate(kickoff.getDate() + 1);
    }

    const timer = setInterval(() => {
      const currentTime = new Date();
      
      // Update local time string
      setLocalTime(currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));

      const diffMs = kickoff.getTime() - currentTime.getTime();

      if (diffMs > 0) {
        // Before kickoff -> Countdown
        const totalSecs = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        
        const pad = (num) => String(num).padStart(2, '0');
        setMatchStatusText(`T-MINUS ${pad(hours)}:${pad(mins)}:${pad(secs)}`);
        setIsLive(false);
      } else {
        // During match (lasts 120 mins including halftime/stoppage)
        const elapsedSecs = Math.floor(-diffMs / 1000);
        const elapsedMins = Math.floor(elapsedSecs / 60);
        const secs = elapsedSecs % 60;
        const pad = (num) => String(num).padStart(2, '0');

        if (elapsedMins < 45) {
          setMatchStatusText(`1ST HALF ${pad(elapsedMins)}:${pad(secs)}`);
          setIsLive(true);
        } else if (elapsedMins < 60) {
          setMatchStatusText(`HALF TIME`);
          setIsLive(false);
        } else if (elapsedMins < 105) {
          setMatchStatusText(`2ND HALF ${pad(elapsedMins - 15)}:${pad(secs)}`);
          setIsLive(true);
        } else if (elapsedMins < 120) {
          setMatchStatusText(`STOPPAGE TIME`);
          setIsLive(true);
        } else {
          setMatchStatusText(`FT — MATCH FINISHED`);
          setIsLive(false);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const showMatchStatus = matchStatusText && !matchStatusText.startsWith('T-MINUS');

  return (
    <div className="matchday-scoreboard-clock" aria-label="Matchday Scoreboard Clock">
      <div className="clock-local">
        <Clock size={14} className="text-amber" />
        <span className="font-mono text-amber">{localTime || '00:00:00'}</span>
      </div>
      {showMatchStatus && (
        <>
          <div className="clock-separator">|</div>
          <div className="clock-match-status">
            <span className={`status-pulse-dot ${isLive ? 'live-match' : 'pre-match'}`}></span>
            <span className="font-mono match-countdown">{matchStatusText}</span>
          </div>
        </>
      )}
    </div>
  );
}
