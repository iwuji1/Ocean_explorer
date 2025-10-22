import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import HamburgerIcon from "../../assets/menu_24px.svg";
import HomeLogo from "/Subtract_white.svg";
import "./Ui.css";

export default function LeftMenu({ LeftMenuRef ,zoomedIn, onMenuToggle }) {

  useEffect(() => {
    if (LeftMenuRef.current) {
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
  }, [zoomedIn]);

  return (
    <div className="LeftMenuDocked" ref={LeftMenuRef}>
      <img
        className="LeftMenu_logo"
        src={HomeLogo}
        alt="HexExplorer Logo"
        title="Go Home"
      />

      <div
        className="LeftMenu_button"
        onClick={onMenuToggle}
      >
        <img
          src={HamburgerIcon}
          alt="Open Menu"
          className="LeftMenu_hamburger"
        />
      </div>

      <div className="LeftMenu_content">
        <h3>Navigation</h3>
        <ul>
          <li><button>🌍 Explore</button></li>
          <li><button>🧭 Hexpedition</button></li>
          <li><button>💰 Purchase</button></li>
        </ul>
      </div>
    </div>
  );
}