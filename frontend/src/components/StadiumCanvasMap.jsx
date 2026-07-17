import React, { useEffect, useRef } from 'react';

export const NODE_COORDINATES = {
  "Gate A": { x: 15, y: 30 },
  "Gate B": { x: 50, y: 10 },
  "Gate C": { x: 85, y: 30 },
  "Section 101": { x: 30, y: 45 },
  "Section 102": { x: 70, y: 45 },
  "Section 204": { x: 50, y: 65 },
  "Elevator 1": { x: 30, y: 25 },
  "Ramp North": { x: 50, y: 25 },
  "Restroom Block A": { x: 20, y: 55 },
  "Concession Stand North": { x: 50, y: 42 }
};

export const STADIUM_EDGES = [
  ["Gate A", "Section 101"], ["Gate A", "Elevator 1"], ["Gate A", "Restroom Block A"],
  ["Gate B", "Ramp North"], ["Gate B", "Concession Stand North"],
  ["Gate C", "Section 102"], ["Gate C", "Ramp North"],
  ["Section 101", "Elevator 1"], ["Section 101", "Restroom Block A"],
  ["Section 102", "Elevator 1"], ["Section 102", "Concession Stand North"],
  ["Section 204", "Ramp North"], ["Section 204", "Elevator 1"],
  ["Restroom Block A", "Section 101"], ["Concession Stand North", "Section 102"]
];

export default function StadiumCanvasMap({ path, startNode, endNode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    let animationFrameId;
    let offset = 0;

    const draw = () => {
      // Clear
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, width, height);

      // Draw Stadium Boundary
      ctx.strokeStyle = 'rgba(70, 243, 255, 0.12)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.44, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Concourse Inner Ring
      ctx.strokeStyle = 'rgba(70, 243, 255, 0.06)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.28, 0, Math.PI * 2);
      ctx.stroke();

      // Draw static connections (Edges)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      STADIUM_EDGES.forEach(([n1, n2]) => {
        const p1 = NODE_COORDINATES[n1];
        const p2 = NODE_COORDINATES[n2];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo((p1.x / 100) * width, (p1.y / 100) * height);
          ctx.lineTo((p2.x / 100) * width, (p2.y / 100) * height);
          ctx.stroke();
        }
      });

      // Highlight calculated shortest route connections (Path)
      if (path && path.length > 1) {
        ctx.strokeStyle = '#46F3FF';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(70, 243, 255, 0.8)';
        ctx.beginPath();
        
        const startPt = NODE_COORDINATES[path[0]];
        if (startPt) {
          ctx.moveTo((startPt.x / 100) * width, (startPt.y / 100) * height);
          for (let i = 1; i < path.length; i++) {
            const pt = NODE_COORDINATES[path[i]];
            if (pt) {
              ctx.lineTo((pt.x / 100) * width, (pt.y / 100) * height);
            }
          }
        }
        ctx.stroke();
        
        // Reset shadows for nodes
        ctx.shadowBlur = 0;

        // Draw animated marching ants particles on the path
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 12]);
        ctx.lineDashOffset = -offset;
        ctx.beginPath();
        if (startPt) {
          ctx.moveTo((startPt.x / 100) * width, (startPt.y / 100) * height);
          for (let i = 1; i < path.length; i++) {
            const pt = NODE_COORDINATES[path[i]];
            if (pt) {
              ctx.lineTo((pt.x / 100) * width, (pt.y / 100) * height);
            }
          }
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
      }

      // Draw all nodes
      Object.entries(NODE_COORDINATES).forEach(([name, node]) => {
        const xCoord = (node.x / 100) * width;
        const yCoord = (node.y / 100) * height;

        const isStart = name === startNode;
        const isEnd = name === endNode;
        const isPath = path && path.includes(name);

        // Node circle
        ctx.beginPath();
        ctx.arc(xCoord, yCoord, isStart || isEnd ? 7 : 5, 0, Math.PI * 2);
        
        if (isStart) {
          ctx.fillStyle = '#22c55e'; // Green start
        } else if (isEnd) {
          ctx.fillStyle = '#ef4444'; // Red end
        } else if (isPath) {
          ctx.fillStyle = '#46F3FF'; // Cyan path
        } else {
          ctx.fillStyle = '#1e293b'; // Slate default
        }
        ctx.fill();

        ctx.strokeStyle = isPath ? '#46F3FF' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node text label
        ctx.fillStyle = isStart || isEnd || isPath ? '#ffffff' : 'rgba(255, 255, 255, 0.45)';
        ctx.font = isStart || isEnd || isPath ? 'bold 9px sans-serif' : '7.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name, xCoord, yCoord - 9);
      });
    };

    const animate = () => {
      offset = (offset + 0.4) % 18;
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [path, startNode, endNode]);

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={300} 
      style={{
        width: '100%', 
        height: '240px', 
        borderRadius: '6px', 
        border: '1px solid rgba(255,255,255,0.06)'
      }}
      aria-label="Stadium interactive concourse map displaying nodes and computed paths."
      role="img"
    />
  );
}
