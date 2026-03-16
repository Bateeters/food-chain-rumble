import React from "react";
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <div className="home-page">
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">Food Chain Rumble</h1>
                    <p className="hero-subtitle">
                        Battle your way to the top of the food chain in this competitive platform brawler!
                    </p>
                    {/*
                    <div className="hero-buttons">
                        {isAuthenticated ? (
                            <Link>Go to Dashboard</Link>
                        ) : (
                            <>
                                <Link>Get Started</Link>
                                <Link>Login</Link>
                            </>
                        )}
                    </div>
                    */}
                </div>
            </section>

            <section className="features">
                <div className="features-container">
                    <div className="feature-card">
                        <h3>Unique Characters</h3>
                        <p>Choose from a diverse roster of animals, each with unique abilities and playstyles.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Competitive Ranked</h3>
                        <p>Become the alpha predator in 1v1 or increase your chances of survival in the wild and team up for 2v2 or 3v3.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Fair-Play Matchmaking</h3>
                        <p>Advanced matchmaking ensures fair and balanced ranked matches.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;