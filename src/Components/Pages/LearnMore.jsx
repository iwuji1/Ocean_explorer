import "./pages.css"
import { useNavigate } from "react-router-dom";


export default function LearnMore() {
    const navigate = useNavigate();

    return (
        <div className="Learn-container">
            <h1>Learn More About Ocean Citizen Explorer</h1>
            <p>
                Ocean Citizen Explorer is an initiative by Map the Gaps to engage citizens in ocean exploration and conservation. Through this platform, users can explore marine environments, contribute to data collection, and support conservation efforts.
            </p>
            <h2>Features</h2>
            <ul>
                <li>Interactive Maps: Explore detailed maps of marine areas.</li>
                <li>Data Collection: Participate in citizen science by submitting observations.</li>
                <li>Educational Resources: Access articles, videos, and tutorials about ocean conservation.</li>
            </ul>
            <h2>Get Involved</h2>
            <p>
                Join the Ocean Citizen Explorer community today! Sign up to start exploring, contributing, and making a difference for our oceans.
            </p>

            <div className="Adopt-sec">
                <div className="adopt-text">

                </div>
                <div className="adopt-img">

                </div>

            </div>
        </div>
    );
}