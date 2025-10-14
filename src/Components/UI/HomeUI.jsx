import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function HomeUI({zoomedIn, zoomToSaintVincent, goHome}) {
    const titleRef = useRef(null);
    const zoomButtonRef = useRef(null);
    const homeButtonRef = useRef(null);

    useEffect(() => {
        if (!titleRef.current || !zoomButtonRef.current || !homeButtonRef.current) return;

        if (zoomedIn) {
        // Fade OUT welcome + zoom button
        gsap.to([titleRef.current, zoomButtonRef.current], {
            opacity: 0,
            duration: 1,
            delay: 1.2, // <- sync this with the map flyTo duration
            pointerEvents: "none",
        });

        // Fade IN home button after
        gsap.to(homeButtonRef.current, {
            opacity: 1, 
            duration: 0.8, 
            delay: 1.4, 
            pointerEvents: "auto" 
        });
        } else {
        // Fade OUT home button
        gsap.to(homeButtonRef.current, {
            opacity: 0,
            duration: 0.5,
            pointerEvents: "none",
        });

        // Fade IN welcome + zoom button
        gsap.to([titleRef.current, zoomButtonRef.current],
            { 
                opacity: 1, 
                duration: 0.8, 
                delay: 1.8, 
                pointerEvents: "auto" 
            });
        }
    }, [zoomedIn]);


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
            zIndex: 1, // Ensure it's above the map
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
                    onClick={zoomToSaintVincent}
                    >Explore
                    </button> 
                    <button
                    className="LearnMore"
                    >Learn More</button>
                </div>
            </div>
            <button 
            className="gotoHome"
            ref={homeButtonRef}
            onClick={goHome} 
            >
            Home
            </button>
            </div>
    );
}