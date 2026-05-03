import React from "react";

const SpeedGauge = ({ speed, progress, label, color }) => {
  const size = 300; 
  const strokeWidth = 24; 
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const arcDegrees = 260; 
  const arcLength = (arcDegrees / 360) * circumference;
  const rotation = 140; 

  const calculatePiecewiseProgress = (currentSpeed) => {
    if (currentSpeed <= 0) return 0;
    if (currentSpeed >= 1000) return 1;

    const points = [
      { speed: 0, fraction: 0 },
      { speed: 5, fraction: 1 / 8 },
      { speed: 10, fraction: 2 / 8 },
      { speed: 50, fraction: 3 / 8 },
      { speed: 100, fraction: 4 / 8 },
      { speed: 250, fraction: 5 / 8 },
      { speed: 500, fraction: 6 / 8 },
      { speed: 750, fraction: 7 / 8 },
      { speed: 1000, fraction: 1 }
    ];

    for (let i = 0; i < points.length - 1; i++) {
      const low = points[i];
      const high = points[i + 1];

      if (currentSpeed >= low.speed && currentSpeed <= high.speed) {
        const segmentProgress = (currentSpeed - low.speed) / (high.speed - low.speed);
        return low.fraction + (segmentProgress * (high.fraction - low.fraction));
      }
    }
    return 1;
  };

  const visualProgress = calculatePiecewiseProgress(speed);
  const activeLength = visualProgress * arcLength;

  const metrics = [0, 5, 10, 50, 100, 250, 500, 750, 1000];

  return (
    <div style={styles.wrapper}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e2730" 
          strokeWidth={strokeWidth}
          strokeLinecap="round" 
          strokeDasharray={`${arcLength} ${circumference}`}
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${activeLength} ${circumference}`}
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          style={{
            transition: "stroke-dasharray 0.25s ease-out", 
            filter: `drop-shadow(0px 0px 8px ${color}88)` 
          }}
        />

        {metrics.map((val, i) => {
          const angleDeg = rotation + (i * (arcDegrees / 8));
          const angleRad = (angleDeg * Math.PI) / 180;
          
          const textRadius = 105; 
          
          const x = (size / 2) + textRadius * Math.cos(angleRad);
          const y = (size / 2) + textRadius * Math.sin(angleRad);

          return (
            <text 
              key={val} 
              x={x} 
              y={y} 
              fill="#7a8594" 
              fontSize="14" 
              fontWeight="bold" 
              textAnchor="middle" 
              dominantBaseline="central"
            >
              {val}
            </text>
          );
        })}
      </svg>

      <div style={styles.textContainer}>
        <div style={styles.speedWrapper}>
          <div style={styles.speedText}>{speed.toFixed(1)}</div>
          <div style={styles.unitText}>Mbps</div>
        </div>
        <div style={styles.label}>{label}</div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    position: "relative",
    width: "300px",
    height: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  speedWrapper: {
    position: "relative",
    display: "inline-block",
  },
  speedText: {
    fontSize: "64px",
    fontWeight: "300",
    color: "white",
    lineHeight: "1",
    letterSpacing: "-1px"
  },
  unitText: {
    position: "absolute",
    left: "100%", 
    bottom: "4px", 
    paddingLeft: "4px", 
    fontSize: "14px",
    fontWeight: "400",
    color: "#666666",
    letterSpacing: "0.5px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    marginTop: "4px", 
  },
};

export default SpeedGauge;