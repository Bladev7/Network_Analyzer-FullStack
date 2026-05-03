import { useState } from "react";
import SpeedGauge from "./SpeedGauge";

function App() {
  const [phase, setPhase] = useState("idle"); 
  const [speed, setSpeed] = useState(0);
  const [ping, setPing] = useState(null);
  
  const [finalDownload, setFinalDownload] = useState(null);
  const [finalUpload, setFinalUpload] = useState(null);

  const handleStartClick = () => {
    setPhase("starting");
    setTimeout(() => {
      startDownloadTest();
    }, 500); 
  };

  // Triggers the smooth synchronized fade-out before restarting
  const handleRestartClick = () => {
    setPhase("resetting"); 
    setTimeout(() => {
      startDownloadTest(); 
    }, 500);
  };

  // Reusable animation function for that cinematic gauge sweep
  const animateGaugeToTarget = (targetValue, onComplete) => {
    let start = null;
    const duration = 2500; // 2.5 seconds to sweep to the final number

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentVal = targetValue * easeProgress;

      // Tiny visual jitter while moving
      const jitter = progress < 1 ? (Math.random() * 0.4 - 0.2) : 0;
      setSpeed(Math.max(0, currentVal + jitter));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setSpeed(targetValue);
        if (onComplete) onComplete();
      }
    };
    
    requestAnimationFrame(step);
  };

  const startDownloadTest = async () => {
    setPhase("download");
    setSpeed(0);
    setPing(null);
    setFinalDownload(null);
    setFinalUpload(null);

    try {
      // Wait for the API to run the test and return the final data
      const dlRes = await fetch("https://bias-determining-humor-channels.trycloudflare.com/test/download");
      const dlData = await dlRes.json();
      
      const sessionId = dlData.session_id;

      const targetDownload = dlData.download;
      setPing(dlData.ping);
      setFinalDownload(targetDownload);

      // Animate the gauge from 0 to the final result
      animateGaugeToTarget(targetDownload, () => {
        setPhase("transition"); 
        setTimeout(() => {
          // FIX: Pass the sessionId down to the upload function
          startUploadTest(sessionId);
        }, 500);
      });

    } catch (err) {
      console.error("Download failed:", err);
      setPhase("finished");
    }
  };

  // FIX: Accept the sessionId as a parameter
  const startUploadTest = async (sessionId) => {
    setPhase("upload");
    setSpeed(0); 

    try {
      // FIX: Use the passed sessionId in the URL
      const ulRes = await fetch(`https://bias-determining-humor-channels.trycloudflare.com/test/upload?session_id=${sessionId}`);
      const ulData = await ulRes.json();
      
      const targetUpload = ulData.upload;
      setFinalUpload(targetUpload);

      animateGaugeToTarget(targetUpload, () => {
        setPhase("finished");
      });

    } catch (err) {
      console.error("Upload failed:", err);
      setPhase("finished");
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .go-button {
          position: relative;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: linear-gradient(#111111, #111111) padding-box, 
                      linear-gradient(to bottom right, #00ffcc, #0088ff) border-box;
          border: 3px solid transparent;
          color: white;
          font-size: 64px;
          font-weight: 300;
          letter-spacing: 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.6s ease,
                      opacity 0.5s ease;
          z-index: 1;
        }
        .go-button.fade-out {
          opacity: 0;
          transform: scale(0.8); 
          pointer-events: none; 
        }
        .go-button::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 110, 255, 0.2) 0%, transparent 80%);
          opacity: 0;
          transition: opacity 0.6s ease;
          z-index: -1;
        }
        .go-button::before {
          content: '';
          position: absolute;
          top: -3px; left: -3px; right: -3px; bottom: -3px; 
          border-radius: 50%;
          border: 1px solid #007bff; 
          z-index: -2;
          animation: pulse-ring 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        .go-button:hover {
          transform: scale(1.03); 
          box-shadow: 0 0 40px rgba(0, 85, 255, 0.4); 
        }
        .go-button:hover::after {
          opacity: 1; 
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .active-test {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
          width: 100%;
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .gauge-fade-in {
          animation: fadeInScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .gauge-fade-out {
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.5s ease-in-out;
        }
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {phase === "idle" || phase === "starting" ? (
        <button 
          className={`go-button ${phase === "starting" ? "fade-out" : ""}`} 
          onClick={handleStartClick}
        >
          <span style={{ position: "relative", zIndex: 2 }}>GO</span>
        </button>
      ) : (
        <div className="active-test">
          
          {/* THE METRICS ROW WITH RESET FADE-OUT */}
          <div style={{
            ...styles.metricsRow,
            opacity: phase === "resetting" ? 0 : 1,
            transform: phase === "resetting" ? "translateY(-15px)" : "translateY(0)",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Ping</span>
              <span style={styles.metricValue}>{ping !== null ? `${Math.round(ping)} ms` : "--"}</span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Download</span>
              <span style={styles.metricValue}>{finalDownload !== null ? finalDownload.toFixed(1) : "--"}</span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Upload</span>
              <span style={styles.metricValue}>{finalUpload !== null ? finalUpload.toFixed(1) : "--"}</span>
            </div>
          </div>

          <div style={styles.gaugeWrapper}>
            {(phase === "download" || phase === "transition") && (
              <div 
                style={styles.gaugeLayer} 
                className={phase === "transition" ? "gauge-fade-out" : "gauge-fade-in"}
              >
                <SpeedGauge speed={speed} label="Download" color="#00ddff" />
              </div>
            )}

            {/* UPLOAD GAUGE WITH RESET FADE-OUT */}
            {(phase === "upload" || phase === "finished" || phase === "resetting") && (
              <div 
                style={styles.gaugeLayer} 
                className={phase === "resetting" ? "gauge-fade-out" : "gauge-fade-in"}
              >
                <SpeedGauge speed={speed} label="Upload" color="#b300ff" /> 
              </div>
            )}
          </div>

          <div style={styles.buttonPlaceholder}>
            <button 
              style={{
                ...styles.restartButton,
                opacity: phase === "finished" ? 1 : 0,
                transform: phase === "finished" 
                  ? "translateY(0) scale(1)" 
                  : phase === "resetting" 
                    ? "translateY(0) scale(0.8)" 
                    : "translateY(15px)",
                pointerEvents: phase === "finished" ? "auto" : "none",
              }} 
              onClick={handleRestartClick} 
            >
              Test Again
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    background: "#111111", 
    color: "white",
    gap: "30px", 
    fontFamily: "system-ui, -apple-system, sans-serif"
  },
  metricsRow: {
    display: "flex",
    gap: "60px",
    marginBottom: "10px"
  },
  metricItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px"
  },
  metricLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  metricValue: {
    fontSize: "24px",
    fontWeight: "300",
    color: "#ffffff",
  },
  gaugeWrapper: {
    position: "relative",
    width: "300px",
    height: "300px",
  },
  gaugeLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  buttonPlaceholder: {
    height: "50px", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  restartButton: {
    padding: "12px 30px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#ffffff",
    border: "2px solid #ffffff",
    borderRadius: "6px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
  },
};

export default App;