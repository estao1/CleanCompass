import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import landingImage from "/assets/earthlandingpic.png";

const LandingPage = () => {
  return (
    <>
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-dark shadow-lg"
        style={{
          backgroundColor: "#198754",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000, // Ensure it stays on top
        }}
      >
        <div className="container">
          <a className="navbar-brand fw-bold d-flex align-items-center" href="#">
            <i className="bi bi-compass me-2"></i>
            CleanCompass
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#">
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="h-screen w-screen" style={{ display: "flex" }}>
        {/* Left Side */}
        <div className="d-flex flex-column align-items-center justify-content-center px-4" style={{
            flex: 2, // 1/3 of the screen
            marginRight: "-200px"
          }}>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="display-4 fw-bold text-center"
          >
            CleanCompass
          </motion.h1>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="btn btn-success mt-4 shadow-lg"
          >
            <Link to="/plan" className="text-white text-decoration-none">
              Plan a trip &#8594;
            </Link>
          </motion.button>
        </div>

        {/* Right Side: Animated Image Section */}
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            flex: 3, // 2/3 of the screen
          }}
        >
          {/* Animated Image */}
          <motion.img
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            src={landingImage}
            alt="Earth"
            style={{ width: "75%", height: "auto" }}
          />
        </div>
      </div>
    </>
  );
};

export default LandingPage;