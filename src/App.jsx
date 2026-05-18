import React, { useState, useEffect, useRef } from "react";
import "./Cap.css";
import { gsap } from "gsap";
import Loader from "./Loader";

const bgImgPath = "/BG.png";

const CONTEST_URL =
  "https://www.hackerearth.com/challenges/college/codeverse-test/";

const App = () => {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const hasSeenLoader = sessionStorage.getItem('hasSeenLoader');
    if (!hasSeenLoader) {
      setShowLoader(true);
      sessionStorage.setItem('hasSeenLoader', 'true');
    }
  }, []);

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
  const showGuidelinesTimerRef = useRef(null);

  // image onLoad handler -> set initial state then mark loaded
  const handleBgLoad = () => {
    // ensure initial hidden state BEFORE playing reveal (starting oversized)
    if (bgRef.current) {
      gsap.set(bgRef.current, { opacity: 0, scale: 1.3, x: 0 });
    }
    setBgLoaded(true);
  };

   const validTokens = ['287845','459083'];
  const isValid = (username === 'Jatin_18' || username === 'Aditya_rcb' )&& validTokens.includes(token);
  // when bg loaded -> play reveal (one-time) and start infinite motion
  useEffect(() => {
    if (!bgLoaded || showLoader) return;

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
      // show guidelines after a short delay (adjust ms if needed)
      showGuidelinesTimerRef.current = setTimeout(() => {
        setShowGuidelines(true);
      }, 7000); // 7000ms (7s) after reveal end
    });

    // We no longer animate the background motion, to keep it perfectly fit
    revealTl.then(() => {
      // Continuous "Breathing" background loop
      if (bgRef.current) {
        motionTlRef.current = gsap.timeline({ repeat: -1 });
        motionTlRef.current
          .to(bgRef.current, {
            scale: 0.96, // shrink inwards
            duration: 5,
            ease: "sine.inOut"
          })
          .to(bgRef.current, {
            scale: 1.04, // expand outwards
            duration: 5,
            ease: "sine.inOut"
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
  }, [bgLoaded, showLoader]);

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
    if (isValid) {
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
      clearTimeout(showGuidelinesTimerRef.current);
      if (revealTlRef.current) revealTlRef.current.kill();
      if (motionTlRef.current) motionTlRef.current.kill();
    };
  }, []);

  return (
    <div className="app-root">
      {showLoader && <Loader onComplete={() => setShowLoader(false)} />}
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
                <h1 id="guidelines-title" className="card-title">Welcome to Code Verse</h1>
                <div className="card-subtitle">
                  Organized by the Team Code Verse
                  <br />
                  In collaboration with Cybrom Technologies Pvt. Ltd.
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
                    <strong>All the best for Code Verse!</strong>
                    <br />
                    <small>Code. Compete. Conquer. 🚀</small>
                  </p>

                  <div className="signature" style={{ marginTop: 14 }}>
                    <div>Regards,</div>
                    <div>Team Code Verse</div>
                  </div>
                </div>
              </section>
              <div className="card-actions">
                <button className="btn-cancel" onClick={() => setShowGuidelines(false)}>Cancel</button>
                <button
                  ref={goBtnRef}
                  className={`btn-go ${allChecked ? "" : "disabled"} ${!allChecked ? "cursor-not-allowed" : "cursor-pointer"}`}
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



