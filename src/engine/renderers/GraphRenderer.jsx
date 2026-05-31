import React, { useRef, useEffect, useCallback } from 'react';

const NODE_COLORS = {
  default: '#94a3b8',
  visited: '#3b82f6',
  current: '#facc15',
  'in-path': '#22c55e',
  found: '#a78bfa',
  sorted: '#2dd4bf',
};

const EDGE_COLORS = {
  default: '#9ca3af',
  visited: '#93c5fd',
  'in-path': '#4ade80',
  highlighted: '#fb923c',
};

const NODE_RADIUS = 22;
const ARROWHEAD_SIZE = 10;

export default React.memo(function GraphRenderer({ steps, currentStep, width = 600, height = 400 }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const stepsRef = useRef(steps);
  const currentStepRef = useRef(currentStep);

  stepsRef.current = steps;
  currentStepRef.current = currentStep;

  const drawArrowhead = useCallback((ctx, fromX, fromY, toX, toY) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const tipX = toX - Math.cos(angle) * NODE_RADIUS;
    const tipY = toY - Math.sin(angle) * NODE_RADIUS;

    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(
      tipX - ARROWHEAD_SIZE * Math.cos(angle - Math.PI / 6),
      tipY - ARROWHEAD_SIZE * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      tipX - ARROWHEAD_SIZE * Math.cos(angle + Math.PI / 6),
      tipY - ARROWHEAD_SIZE * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fill();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const cs = currentStepRef.current;
    const st = stepsRef.current;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    let snapshot = null;
    if (cs >= 0 && st && st[cs]) {
      snapshot = st[cs].snapshot;
    } else if (st && st.length > 0 && st[0].snapshot) {
      snapshot = st[0].snapshot;
    }

    if (!snapshot || !snapshot.nodes || snapshot.nodes.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No graph data to display', width / 2, height / 2);
      return;
    }

    const { nodes, edges } = snapshot;
    const nodeMap = {};
    nodes.forEach((node) => { nodeMap[node.id] = node; });

    if (edges && edges.length > 0) {
      edges.forEach((edge) => {
        const fromNode = nodeMap[edge.from];
        const toNode = nodeMap[edge.to];
        if (!fromNode || !toNode) return;

        const edgeColor = EDGE_COLORS[edge.state] || EDGE_COLORS.default;

        ctx.beginPath();
        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = edge.state === 'in-path' ? 3 : 2;
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();

        if (edge.directed === true) {
          ctx.fillStyle = edgeColor;
          drawArrowhead(ctx, fromNode.x, fromNode.y, toNode.x, toNode.y);
        }

        const label = edge.label !== undefined ? String(edge.label)
          : (edge.weight !== undefined && edge.weight !== null ? String(edge.weight) : null);

        if (label) {
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
          const offsetX = Math.sin(angle) * 12;
          const offsetY = -Math.cos(angle) * 12;

          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const metrics = ctx.measureText(label);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(
            midX + offsetX - metrics.width / 2 - 3,
            midY + offsetY - 7,
            metrics.width + 6,
            14,
          );

          ctx.fillStyle = '#475569';
          ctx.fillText(label, midX + offsetX, midY + offsetY);
        }
      });
    }

    nodes.forEach((node) => {
      const color = NODE_COLORS[node.state] || NODE_COLORS.default;

      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      ctx.stroke();

      const nodeLabel = node.label !== undefined ? String(node.label) : String(node.id);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(nodeLabel, node.x, node.y);
    });
  }, [width, height, drawArrowhead]);

  useEffect(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [draw, steps, currentStep]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        width={width}
        height={height}
      />
    </div>
  );
});
