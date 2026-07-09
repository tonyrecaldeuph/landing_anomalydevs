import { useEffect, useRef } from 'react';
import { generateNetworkNodes, buildConnections } from '../../three/networkGeometry';

interface NodeNetworkFallbackProps {
  interactive?: boolean;
}

export function NodeNetworkFallback({ interactive: _interactive = true }: NodeNetworkFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const nodes = generateNetworkNodes(120, 7);
    const connections = buildConnections(nodes, 1.8);
    const anomalyIndex = nodes.findIndex((n) => n.isAnomaly);

    function project(p: [number, number, number]): [number, number] {
      return [width / 2 + p[0] * (width / 14), height / 2 + p[1] * (height / 14)];
    }

    function handleResize() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
    }
    window.addEventListener('resize', handleResize);

    let raf: number;
    function draw() {
      frame += 1;
      ctx!.fillStyle = 'rgba(6, 10, 7, 0.4)';
      ctx!.fillRect(0, 0, width, height);

      ctx!.strokeStyle = 'rgba(28, 107, 58, 0.5)';
      ctx!.lineWidth = 1;
      for (let i = 0; i < connections.length; i += 6) {
        const [x1, y1] = project([connections[i], connections[i + 1], connections[i + 2]]);
        const [x2, y2] = project([connections[i + 3], connections[i + 4], connections[i + 5]]);
        ctx!.beginPath();
        ctx!.moveTo(x1, y1);
        ctx!.lineTo(x2, y2);
        ctx!.stroke();
      }

      nodes.forEach((node, i) => {
        const [x, y] = project(node.position);
        if (i === anomalyIndex) {
          const pulse = 4 + Math.sin(frame * 0.05) * 2;
          ctx!.fillStyle = '#33FF77';
          ctx!.beginPath();
          ctx!.arc(x, y, pulse, 0, Math.PI * 2);
          ctx!.fill();
        } else {
          ctx!.fillStyle = 'rgba(157, 255, 192, 0.5)';
          ctx!.beginPath();
          ctx!.arc(x, y, 1.6, 0, Math.PI * 2);
          ctx!.fill();
        }
      });

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
}
