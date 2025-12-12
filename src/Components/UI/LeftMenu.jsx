import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import HamburgerIcon from "../../assets/menu_24px.svg";
import HomeLogo from "/Subtract_white.svg";
import "./Ui.css";

export default function LeftMenu({ LeftMenuRef ,zoomedIn, isLeftMenuOpen, goHome, handleLogout, gotoProfile}) {

  const navigate = useNavigate();

  useEffect(() => {
    if (LeftMenuRef.current) {

      const isMobile = window.innerWidth <= 768; // tweak breakpoint if needed
      if (isMobile) return; // let CSS handle mobile, no GSAP

      if (zoomedIn) {
        // Fade / slide in when zoomed in
        gsap.fromTo(
          LeftMenuRef.current,
          { x: "-100%", opacity: 0 },
          { x: "0%", opacity: 1, duration: 1, ease: "power3.out" }
        );
      } else {
        // Fade / slide out when zoomed out
        gsap.to(LeftMenuRef.current, {
          x: "-100%",
          opacity: 0,
          duration: 0.8,
          ease: "power2.in",
        });
      }
    }
  }, [zoomedIn, LeftMenuRef]);

  return (
    <div className={`LeftMenuDocked ${isLeftMenuOpen ? "is-open" : ""}`} ref={LeftMenuRef}>
      <div className="menu-content">
      <img
        className="LeftMenu_logo"
        src={HomeLogo}
        alt="HexExplorer Logo"
        title="Go Home"
        onClick={goHome}
      />
      <button className="LogoutButton" onClick={handleLogout}>
        Logout
      </button>

      <button className="ProfileButton" onClick={gotoProfile}>
          Profile
      </button>
      </div>
      {/* <button
        type="button"
        className="LeftMenu_button"
        onClick={onMenuToggle}
        aria-label={isLeftMenuOpen ? "Close menu" : "Open menu"}
      >
        <img
          src={HamburgerIcon}
          alt="Open Menu"
          className="LeftMenu_hamburger"
        />
      </button> */}

      <div className="LeftMenu_content">
        <h3>Navigation</h3>
        <ul>
          <li><button onClick={() => navigate("/mainmap")}>🌍 Explore</button></li>
          <li><button onClick={() => navigate("/expeditionmap")}>🧭 Hexpedition</button></li>
          <li><button onClick={() => navigate("/moneymap")}>💰 Purchase</button></li>
        </ul>
      </div>
    </div>
  );
}