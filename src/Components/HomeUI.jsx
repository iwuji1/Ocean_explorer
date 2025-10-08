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
            <h1 
            className="HomeUIHeader"
            ref={titleRef}
            style={{
              textAlign: "center",
              marginBottom: "1rem",
              opacity: 1,
              pointerEvents: "auto",
            }}>
                Welcome To The Experience</h1>
            <button 
            className="gotoSV"
            ref={zoomButtonRef}
            onClick={zoomToSaintVincent}
            style={{
              padding: "0.8rem 1.2rem",
              fontSize: "1rem",
              borderRadius: "6px",
              cursor: "pointer",
              opacity: 1,
              pointerEvents: "auto",
            }}
            >Explore
            </button>
            <button 
            className="gotoHome"
            ref={homeButtonRef}
            onClick={goHome} 
            style={{
                position: "absolute",
                top: "5%",
                left: "2%",
                padding: "0.8rem 1.2rem",
                fontSize: "1rem",
                borderRadius: "6px",
                cursor: "pointer",
                opacity: 0,
                pointerEvents: "auto",
            }}
            >
            Home
            </button>
            </div>
    );
}