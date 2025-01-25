import React from "react";

const QueryPage = () => {
  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow" style={{ backgroundColor: "#06c409" }}>
        <div className="container">
          <a className="navbar-brand fw-bold" href="#">
            Green For Nature
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
      <div className="container">
        <h1 className="text-center mb-4">Plan Your Sustainable Trip</h1>
        <form>
            {/* Starting Location Input */}
            <div className="mb-3">
            <label htmlFor="startingLocationInput" className="form-label">
                Starting Location
            </label>
            <input
                type="text"
                className="form-control"
                id="startingLocationInput"
                placeholder="Enter your starting location"
            />
            </div>

            {/* Ending Location Input */}
            <div className="mb-3">
            <label htmlFor="endingLocationInput" className="form-label">
                Ending Location
            </label>
            <input
                type="text"
                className="form-control"
                id="endingLocationInput"
                placeholder="Enter your ending location"
            />
            </div>


          {/* Travel Date Input */}
          <div className="mb-3">
            <label htmlFor="travelDateInput" className="form-label">
              Travel Dates
            </label>
            <input
              type="text"
              className="form-control"
              id="travelDateInput"
              placeholder="Enter your travel dates"
            />
          </div>

          {/* Triangle Graph Selector */}
          <div className="mb-3">
            <label htmlFor="graphSelector" className="form-label">
              Preferences: Carbon Emission vs. Time/Distance vs. Cost
            </label>
            <div id="graphSelector" className="border p-3 text-center">
              Triangle Graph Selector Placeholder
            </div>
          </div>

          {/* AI-Generated Tourist Destinations and Activities */}
          <div className="mb-3">
            <label htmlFor="aiSuggestions" className="form-label">
              AI-Generated Tourist Destinations and Activities
            </label>
            <textarea
              className="form-control"
              id="aiSuggestions"
              rows="3"
              placeholder="AI suggestions will appear here..."
              readOnly
            ></textarea>
          </div>

          {/* Additional Requests Text Box */}
          <div className="mb-3">
            <label htmlFor="additionalRequests" className="form-label">
              Additional Requests for AI
            </label>
            <textarea
              className="form-control"
              id="additionalRequests"
              rows="3"
              placeholder="Enter any additional requests..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="d-grid">
            <button type="button" className="btn btn-primary">
              Generate Travel Plan
            </button>
          </div>
        </form>
      </div>


        {/* Map Placeholder Section */}
        <div className="mt-5">
        <div className="input-container mb-3">
            <label>Origin: </label>
            <input type="text" id="origin" className="form-control" placeholder="Enter origin" />
        </div>
        <div className="input-container mb-3">
            <label>Destination: </label>
            <input type="text" id="destination" className="form-control" placeholder="Enter destination" />
        </div>
        <div className="input-container mb-3">
            <label>Mode: </label>
            <select id="modeSelect" className="form-select">
            <option value="DRIVING">Driving</option>
            <option value="WALKING">Walking</option>
            <option value="BICYCLING">Bicycling</option>
            <option value="TRANSIT">Transit</option>
            <option value="FLIGHT">Flight (Custom)</option>
            </select>
        </div>
        <button id="calculateButton" className="btn btn-secondary">
            Calculate Route
        </button>

        {/* Map and Info Panel */}
        <div id="map" className="border mt-4" style={{ height: "300px", width: "100%" }}>
            {/* Map Placeholder */}
            Map will be displayed here
        </div>
        <div id="panel" className="mt-3">
            {/* Directions/Info Panel Placeholder */}
            Route info will be displayed here
        </div>
        </div>

      {/* Trending Section */}
      <div className="container">
        <h2 className="text-center mb-4">Trending Destinations</h2>
        <div className="row">
          {/* Card 1 */}
          <div className="col-md-4">
            <div className="card">
              <img
                src="https://via.placeholder.com/300x200"
                className="card-img-top"
                alt="Destination 1"
              />
              <div className="card-body">
                <h5 className="card-title">Eco-Friendly Beaches</h5>
                <p className="card-text">
                  Explore the most sustainable and eco-friendly beaches in the world.
                </p>
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="col-md-4">
            <div className="card">
              <img
                src="https://via.placeholder.com/300x200"
                className="card-img-top"
                alt="Destination 2"
              />
              <div className="card-body">
                <h5 className="card-title">Green Cities</h5>
                <p className="card-text">
                  Visit cities that prioritize sustainability and green living.
                </p>
              </div>
            </div>
          </div>
          {/* Card 3 */}
          <div className="col-md-4">
            <div className="card">
              <img
                src="https://via.placeholder.com/300x200"
                className="card-img-top"
                alt="Destination 3"
              />
              <div className="card-body">
                <h5 className="card-title">Eco Resorts</h5>
                <p className="card-text">
                  Discover luxurious resorts committed to sustainability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-light py-3 mt-5">
        <div className="container text-center">
          <p>&copy; 2025 Green For Nature. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default QueryPage;
