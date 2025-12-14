import React, { useState, useEffect, useRef } from "react";
import "./Cap.css";
import { gsap } from "gsap";
import bgImgPath from "../public/BG.jpg";
import load from "../public/loader.png";
import vid from "../public/vdo.mp4";

const CONTEST_URL =
  "https://www.hackerearth.com/challenges/college/code-sprint-30/";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [minLoaderDone, setMinLoaderDone] = useState(false);

  // UI states
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // checkboxes state
  const [checks, setChecks] = useState({ a: false, b: false, c: false, d: false, e: false });

  // refs for GSAP animations & timers
  const bgRef = useRef(null);
  const goBtnRef = useRef(null);
  const submitBtnRef = useRef(null);
  const cinematicRef = useRef(null);
  const revealTlRef = useRef(null);
  const motionTlRef = useRef(null);
  const minLoaderTimerRef = useRef(null);
  const showGuidelinesTimerRef = useRef(null);

  const MIN_LOADER_MS = 8300;


  useEffect(() => {
    minLoaderTimerRef.current = setTimeout(() => setMinLoaderDone(true), MIN_LOADER_MS);
    return () => {
      clearTimeout(minLoaderTimerRef.current);
    };
  }, []);

  // image onLoad handler -> set initial state then mark loaded
  const handleBgLoad = () => {
    // ensure initial hidden / shifted state BEFORE playing reveal
    if (bgRef.current) {
      gsap.set(bgRef.current, { opacity: 0, scale: 1.06, x: -10 });
    }
    setBgLoaded(true);
  };

   const validTokens = ['281234', '981536', '631732', '581294', '687891'];
  const isValid = username === 'Shivam_07' && validTokens.includes(token);
  // when both bg loaded and min loader done -> play reveal (one-time) and start infinite motion
  useEffect(() => {
    if (!(bgLoaded && minLoaderDone)) return;

    // cleanup previous timelines if any
    if (revealTlRef.current) {
      revealTlRef.current.kill();
      revealTlRef.current = null;
    }
    if (motionTlRef.current) {
      motionTlRef.current.kill();
      motionTlRef.current = null;
    }

    // reveal timeline (one-shot)
    const revealTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    revealTlRef.current = revealTl;

    // fade out cinematic loader (make sure it won't block pointer-events)
    if (cinematicRef.current) {
      revealTl.to(cinematicRef.current, {
        opacity: 0,
        duration: 0.35,
        onComplete: () => {
          // remove pointer-events so it stops blocking clicks
          cinematicRef.current.style.pointerEvents = "none";
        },
      });
    }

    // reveal background image
    if (bgRef.current) {
      revealTl.to(
        bgRef.current,
        { opacity: 1, scale: 1, x: 0, duration: 1.2 },
        "-=0.25"
      );
    }

    // when reveal completes:
    revealTl.call(() => {
      setIsLoading(false);

      // show guidelines after a short delay (adjust ms if needed)
      showGuidelinesTimerRef.current = setTimeout(() => {
        setShowGuidelines(true);
      }, 600); // 600ms after reveal end
    });

    // start continuous slow motion separately (so reveal timeline completes)
    revealTl.then(() => {
      if (bgRef.current) {
        motionTlRef.current = gsap.to(bgRef.current, {
          duration: 14,
          scale: 1.06,
          x: -40,
          yoyo: true,
          repeat: -1,
          ease: "none",
        });
      }
    });

    return () => {
      if (revealTlRef.current) {
        revealTlRef.current.kill();
        revealTlRef.current = null;
      }
      if (motionTlRef.current) {
        motionTlRef.current.kill();
        motionTlRef.current = null;
      }
      clearTimeout(showGuidelinesTimerRef.current);
    };
  }, [bgLoaded, minLoaderDone]);

  // animate floating Go button and submit button when guidelines/login visible
  useEffect(() => {
    let gAnim, sAnim;
    if (showGuidelines && goBtnRef.current) {
      gAnim = gsap.to(goBtnRef.current, {
        y: -10,
        duration: 1.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }
    if (showLogin && submitBtnRef.current) {
      sAnim = gsap.to(submitBtnRef.current, {
        y: -6,
        duration: 1.1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }
    return () => {
      if (gAnim) gAnim.kill();
      if (sAnim) sAnim.kill();
    };
  }, [showGuidelines, showLogin]);

  const handleCheckbox = (k) =>
    setChecks((p) => ({ ...p, [k]: !p[k] }));

  const allChecked = Object.values(checks).every(Boolean);

  const handleGoToContestClick = () => {
    if (!allChecked) {
      // small shake feedback
      if (goBtnRef.current) {
        gsap.fromTo(
          goBtnRef.current,
          { x: -6 },
          { x: 6, duration: 0.08, yoyo: true, repeat: 4, ease: "power1.inOut" }
        );
      }
      return;
    }
    setShowGuidelines(false);
    setTimeout(() => setShowLogin(true), 220);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
    setUsername("");
    setToken("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "Shivam_07" && (token === "281234" || token === "981536" || token === "631732" || token === "581294" || token === "687891")) {
      window.open(CONTEST_URL, "_blank", "noopener,noreferrer");
    } else {
      if (submitBtnRef.current) {
        gsap.fromTo(
          submitBtnRef.current,
          { x: -6 },
          { x: 6, duration: 0.07, yoyo: true, repeat: 4, ease: "power1.inOut" }
        );
      }
      alert("Invalid Username or Passcode");
    }
  };

  // cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(minLoaderTimerRef.current);
      clearTimeout(showGuidelinesTimerRef.current);
      if (revealTlRef.current) revealTlRef.current.kill();
      if (motionTlRef.current) motionTlRef.current.kill();
    };
  }, []);

  return (
    <div className="app-root">
      {/* Cinematic Loader */}
      {isLoading && (
        <div className="cinematic-loader" ref={cinematicRef}>
          <video src={vid} autoPlay muted></video>
        </div>
      )}

      {/* Background image */}
      <img
        ref={bgRef}
        src={bgImgPath}
        alt="Contest background"
        className={`bg-img`}
        onLoad={handleBgLoad}
        draggable="false"
      />

      {/* backdrop */}
      <div className={`backdrop ${showGuidelines || showLogin ? "visible" : ""}`} />

      {/* Guidelines modal */}
      {showGuidelines && (
        <div className="modal-wrap" aria-modal>
          <div className="modal glass guidelines-wrap" role="dialog" aria-labelledby="guidelines-title">
            <div className="guidelines-card mt-50">

              <header className="card-head">
                <h1 id="guidelines-title" className="card-title">Welcome to CodeSprint 3.0</h1>
                <div className="card-subtitle">
                  Organized by the Technocrats Developers Club
                  <br />
                  In collaboration with Sheryians Coding School
                </div>
              </header>

              <section className="section-guidelines">
                <div className="section-heading">
                  <span className="icon">⚠️</span>
                  <h3>Guidelines for Participants</h3>
                </div>

                <ul className="guidelines-list" aria-hidden={false}>
                  <li>
                    <input
                      type="checkbox"
                      id="g1"
                      checked={checks.a}
                      onChange={() => handleCheckbox("a")}
                    />
                    <label htmlFor="g1">Stable and uninterrupted internet connection is required.</label>
                  </li>

                  <li>
                    <input
                      type="checkbox"
                      id="g2"
                      checked={checks.b}
                      onChange={() => handleCheckbox("b")}
                    />
                    <label htmlFor="g2">Do not switch tabs during the contest; repeated switches may lead to disqualification.</label>
                  </li>

                  <li>
                    <input
                      type="checkbox"
                      id="g3"
                      checked={checks.c}
                      onChange={() => handleCheckbox("c")}
                    />
                    <label htmlFor="g3">Avoid refreshing, closing, or reloading the contest window.</label>
                  </li>

                  <li>
                    <input
                      type="checkbox"
                      id="g4"
                      checked={checks.d || false}
                      onChange={() => handleCheckbox("d")}
                    />
                    <label htmlFor="g4">Use a single device and browser throughout the contest.</label>
                  </li>

                  <li>
                    <input
                      type="checkbox"
                      id="g5"
                      checked={checks.e || false}
                      onChange={() => handleCheckbox("e")}
                    />
                    <label htmlFor="g5">Follow all on-screen instructions carefully.</label>
                  </li>
                </ul>
              </section>

              <section className="section-next">
                <div className="section-heading small">
                  <span className="icon">➡️</span>
                  <h3>Next Step</h3>
                </div>

                <div className="next-text">
                  <p>
                    After clicking the <strong>Go to Contest</strong> button, you will be asked to enter your Passkey and Passcode.
                    These credentials will be provided to you by the organizers only.
                  </p>

                  <p style={{ marginTop: "8px" }}>
                    Once verified, you will be redirected to the main coding interface.
                  </p>

                  <p className="wish" style={{ textAlign: "center", marginTop: 18 }}>
                    <strong>All the best for CodeSprint 3.0!</strong>
                    <br />
                    <small>Code. Compete. Conquer. 🚀</small>
                  </p>

                  <div className="signature" style={{ marginTop: 14 }}>
                    <div>Regards,</div>
                    <div>Team CodeSprint 3.0</div>
                    <div>Technocrats Developers Club</div>
                  </div>
                </div>
              </section>

              <div className="card-actions">
                <button className="btn-cancel" onClick={() => setShowGuidelines(false)}>Cancel</button>

                <button
                  ref={goBtnRef}
                  className={`btn-go ${allChecked ? "" : "disabled"} cursor-pointer`}
                  onClick={handleGoToContestClick}
                  aria-disabled={!allChecked}
                  title={allChecked ? "Proceed to login" : "Please accept all terms"}
                >
                  Go to Contest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login modal */}
      {showLogin && (
        <div className="modal-wrap" aria-modal>
          <div className="modal glass">
            <button className="close-x" onClick={handleCloseLogin} aria-label="close">
              ×
            </button>

            <h2 className="title">Enter Access Details</h2>
            <p className="subtitle">Only authorised users can join this contest</p>

            <form className="form" onSubmit={handleSubmit}>
              <label className="label">
                Passkey
                <input
                  className="input"
                  type="text"
                  placeholder="Enter Passkey"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>

              <label className="label">
                Passcode
                <input
                  className="input"
                  type="password"
                  placeholder="Enter Passcode"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
                <h2 className={isValid ? "text-green-500" : "text-red-500"}>
                  {isValid ? "Correct credentials" : "Please enter valid credentials"}
                  {isValid && <span className="success-tick" aria-hidden> ✔</span>}
                </h2>
              </label>


              <div className="modal-actions single">
                <button
                  ref={submitBtnRef}
                  type="submit"
                  className="btn btn-primary fancy-border full"
                >
                  Submit & Open Contest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;



