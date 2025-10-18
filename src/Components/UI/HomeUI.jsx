import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

export default function HomeUI({zoomedIn, zoomToSaintVincent, user, handleLogout}) {
    const titleRef = useRef(null);
    const zoomButtonRef = useRef(null);
    const logoutButtonRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!titleRef.current || !zoomButtonRef.current) return;

        if (zoomedIn) {
        // Fade OUT welcome + zoom button
        gsap.to([titleRef.current, zoomButtonRef.current, logoutButtonRef.current], {
            opacity: 0,
            duration: 1,
            delay: 1.2, // <- sync this with the map flyTo duration
            pointerEvents: "none",
        });
    } else {
        // Fade IN welcome + zoom button
        gsap.to([titleRef.current, zoomButtonRef.current, logoutButtonRef.current],
            { 
                opacity: 1, 
                duration: 0.8, 
                delay: 1.8, 
                pointerEvents: "auto" 
            });
        }
    }, [zoomedIn]);

    // --- Dynamic Button Action ---
  const handleMainButtonClick = () => {
    if (user) {
      // If logged in → go explore
      zoomToSaintVincent();
    } else {
      // If not logged in → go to sign-in page
      navigate("/signin");
    }
  };



    return (
        <div
        style={{
            backgroundColor: "#00373783",
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none', // Allow clicks to pass through
            zIndex: 10, // Ensure it's above the map
        }}
        >

            <div ref={titleRef} className="HomeUIContent">
                <img className="HomeLogo" src="/Subtract_white.svg" alt="HexExplorer Logo" />
                <h1 className="HomeUIHeader">Hexplorer</h1>
                <p className="HomeUISubheader">Join the mission to map St. Vincent's unexplored ocean territories. Become an ocean explorer, discover hidden treasures, and help preserve our marine heritage for future generations.</p>
                <div className="HomeUIButtons">
                   <button 
                    className="gotoSV"
                    ref={zoomButtonRef}
                    onClick={handleMainButtonClick}
                    >{user ? "Explore St. Vincent" : "Sign In"}
                    </button> 
                    <button className="LearnMore">Learn More</button>
                    
                </div>
            </div>
            {user && (
                <button
                className="HMLogoutButton"
                ref={logoutButtonRef}
                onClick={handleLogout}
                >
                Logout
                </button>
            )}
        </div>
    );
}