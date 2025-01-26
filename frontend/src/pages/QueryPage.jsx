import React, { Component } from "react";

import axios from "axios";
import { buildMultiLegRoute } from "../static/scripts/map";
import "../styles/styles.css";

import EchoBeach from "/assets/EchoBeach.png";
import GreenCities from "/assets/GreenCities.jpg";
import EcoResorts from "/assets/EcoResorts.jpg";

class QueryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      middleLocations: [],
      startingLocation: "",
      endingLocation: "",
      startDate: "",
      endDate: "",
      fixOrder: false,
      additionalRequests: "",
      serverResponse: null,
    };
  }

  handleAddMiddleLocation = () => {
    this.setState((prevState) => ({
      middleLocations: [...prevState.middleLocations, ""],
    }));
  };

  handleRemoveMiddleLocation = (index) => {
    this.setState((prevState) => {
      const updatedLocations = [...prevState.middleLocations];
      updatedLocations.splice(index, 1);
      return { middleLocations: updatedLocations };
    });
  };

  handleMiddleLocationChange = (index, value) => {
    this.setState((prevState) => {
      const updatedLocations = [...prevState.middleLocations];
      updatedLocations[index] = value;
      return { middleLocations: updatedLocations };
    });
  };

  handleChange = (event) => {
    const { name, type, checked, value } = event.target;

    if (type === "checkbox") {
      this.setState({ [name]: checked });
    } else {
      this.setState({ [name]: value });
    }
  };

  handleSubmit = async (event) => {
    event.preventDefault(); // Stop the full page reload

    const {
      startingLocation,
      endingLocation,
      middleLocations,
      startDate,
      endDate,
      fixOrder,
      additionalRequests,
    } = this.state;

    try {
      const response = await axios.post("http://127.0.0.1:5000/plan_trip", {
        startingLocation,
        endingLocation,
        middleLocations,
        startDate,
        endDate,
        fixOrder,
        additionalRequests,
      });

      console.log("Response from server:", response.data);

      const { stops, activities } = response.data;

      if (window.google) {
        // 1) Create a Google Map instance
        const googleMap = new window.google.maps.Map(
          document.getElementById("map"),
          {
            center: { lat: 39.5, lng: -98.35 },
            zoom: 4,
          }
        );
        document.getElementById("map").style.display = "block";
        document.getElementById("modal-button").style.display = "block";

        const style = document.createElement("style");
        style.innerHTML = `
          .adp-placemark {
            display: none !important;
          }
          
          .segment-container {
            margin-bottom: 15px;
          }
          
          .segment-heading {
            font-weight: bold;
            font-size: 1.2em;
            margin-top: 10px;
            margin-bottom: 5px;
          }
          
          .segment-details {
            font-size: 0.9em;
            color: #555;
            margin-bottom: 10px;
          }
          
          .segment-distance,
          .segment-duration {
            display: inline-block;
            margin-right: 10px;
          }

        `;

        document.head.appendChild(style);

        // 2) Build your stops array

        // 3) Call buildMultiLegRoute directly!
        buildMultiLegRoute(
          googleMap,
          document.getElementById("panel"),
          stops,
          0.5 // alpha factor
        )
          .then(() => console.log("Routes built!"))

          .catch((err) => console.error(err));
      } else {
        console.error("Google Maps not loaded yet.");
      }

      // Store Flask's response in state so we can show it in render()
      this.setState({ serverResponse: { stops, activities } });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  render() {
    const {
      middleLocations,
      startingLocation,
      endingLocation,
      startDate,
      endDate,
      fixOrder,
      additionalRequests,
      serverResponse,
    } = this.state;

    return (
      <>
        {/* Navbar */}
        <nav
          className="navbar navbar-expand-lg navbar-dark shadow"
          style={{ backgroundColor: "#198754" }}
        >
          <div className="container">
            <a
              className="navbar-brand fw-bold d-flex align-items-center"
              href="#"
            >
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
        <div className="container" style={{ width: "65%" }}>
          <h1 className="custom-header text-center mb-5 mt-5">
            Plan Your Sustainable Trip
          </h1>
          <form method="POST" onSubmit={this.handleSubmit}>
            <div className="row">
              {/* Left Column */}
              <div className="col-md-6">
                {/* Starting Location Input */}
                <div className="mb-3">
                  <label htmlFor="startingLocationInput" className="form-label">
                    Starting Location
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="startingLocationInput"
                    name="startingLocation"
                    style={{ width: "47.5vw" }}
                    placeholder="Enter your starting location"
                    value={this.state.startingLocation}
                    onChange={this.handleChange}
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
                    name="endingLocation"
                    style={{ width: "47.5vw" }}
                    placeholder="Enter your ending location"
                    value={this.state.endingLocation}
                    onChange={this.handleChange}
                  />
                </div>

                {/* Middle Locations */}
                {middleLocations.map((location, index) => (
                  <div key={index} className="mb-3">
                    <label
                      htmlFor={`middleLocation${index}`}
                      className="form-label"
                    >
                      Middle Location {index + 1}:
                    </label>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <input
                        type="text"
                        className="form-control"
                        id={`middleLocation${index}`}
                        name="middleLocation[]"
                        placeholder="Enter middle location"
                        value={location}
                        onChange={(e) =>
                          this.handleMiddleLocationChange(index, e.target.value)
                        }
                        style={{ minWidth: "29vw" }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={(e) => {
                          this.handleRemoveMiddleLocation(index);
                          e.target.blur();
                        }}
                      >
                        -
                      </button>
                    </div>
                  </div>
                ))}
                {/* Add Middle Location Button */}
                <div className="mb-3">
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={(e) => {
                      this.handleAddMiddleLocation();
                      e.target.blur();
                    }}
                  >
                    + Add Middle Location
                  </button>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-md-6 d-flex flex-column align-items-end">
                {/* Travel Date Input */}
                <div className="mb-3">
                  <label htmlFor="startDate" className="form-label">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className="form-control"
                    style={{ width: "13.99999999vw" }}
                    value={this.state.startDate}
                    onChange={this.handleChange}
                    min="2023-01-01"
                    max="2030-12-31"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="endDate" className="form-label">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className="form-control"
                    style={{ width: "13.99999999vw" }}
                    value={this.state.endDate}
                    onChange={this.handleChange}
                    min="2023-01-01"
                    max="2030-12-31"
                  />
                </div>

                {/* Fix Order Checkbox */}
                <div className="input-container mb-5">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="fixOrderCheckbox"
                      name="fixOrder"
                      value={this.state.fixOrder}
                      onChange={this.handleChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="fixOrderCheckbox"
                    >
                      Fixed Order
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {/* Submit Button */}
            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-success"
                onMouseDown={(e) => e.preventDefault()}
              >
                Generate Travel Plan
              </button>
            </div>
            {/* Add a section to display the stops and activities */}
            {serverResponse && (
              <div className="mt-5">
                <h2 className="text-center mb-4">Generated Travel Plan</h2>
                <div className="card shadow p-4 mb-5 bg-light rounded">
                  {/* Stops Section */}
                  <div className="mb-4">
                    <h4 className="text-success mb-3">
                      <i className="bi bi-map-fill me-2"></i>Stops
                    </h4>
                    <ul className="list-group">
                      {serverResponse.stops.map((stop, index) => (
                        <li
                          key={index}
                          className="list-group-item d-flex justify-content-between align-items-center border-0 mb-2 shadow-sm rounded"
                          style={{
                            backgroundColor: "#f9f9f9",
                            padding: "15px",
                          }}
                        >
                          <div>
                            <strong>{stop.location}</strong>
                          </div>
                          {stop.mode && (
                            <span className="badge bg-primary text-white rounded-pill px-3 py-2">
                              {stop.mode}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Activities Section */}
                  <div className="mb-4">
                    <h4 className="text-info mb-3">
                      <i className="bi bi-geo-alt me-2"></i>Activities
                    </h4>
                    <ul className="list-group">
                      {Object.entries(serverResponse.activities).map(
                        ([location, activities], index) => (
                          <li
                            key={index}
                            className="list-group-item border-0 mb-2 shadow-sm rounded"
                            style={{
                              backgroundColor: "#f4f8fc",
                              padding: "15px",
                            }}
                          >
                            <div>
                              <strong>{location}:</strong>
                            </div>
                            <ul className="mt-2">
                              {Array.isArray(activities) ? (
                                activities.map((activity, idx) => (
                                  <li key={idx} className="text-muted">
                                    {activity}
                                  </li>
                                ))
                              ) : (
                                <li className="text-muted">{activities}</li>
                              )}
                            </ul>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {/* Existing map and panel sections */}
          </form>
          {/* Map Placeholder Section */}
          <div className="mt-5">
            {/* Map and Info Panel */}
            <div
              id="map"
              className="border mt-4"
              style={{ height: "500px", width: "100%", display: "none" }}
            >
              {/* Map Placeholder */}
              Map will be displayed here
            </div>
            <div>
              {/* Button to trigger the modal */}
              <button
                type="button"
                className="btn btn-success mt-3"
                data-bs-toggle="modal"
                data-bs-target="#exampleModal"
                style={{ display: "none" }}
                onMouseDown={(e) => e.preventDefault()}
                id="modal-button"
              >
                Show Directions
              </button>

              {/* Modal */}
              <div
                className="modal fade"
                id="exampleModal"
                tabIndex="-1"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="exampleModalLabel">
                        Directions
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body" id="panel"></div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-bs-dismiss="modal"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div></div>
          </div>
          {/* Trending Section */}
          <div className="container">
            <h2 className="text-center mb-4">Trending Destinations</h2>
            <div className="row">
              {/* Card 1 */}

              <div className="col-md-4">
                <a
                  href="https://curiositysavestravel.com/22-sustainable-beach-tips-to-plan-an-eco-friendly-beach-trip/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="card">
                    <img
                      src={EchoBeach}
                      className="card-img-top"
                      alt="Destination 1"
                    />

                    <div className="card-body">
                      <h5 className="card-title">Eco-Friendly Beaches</h5>

                      <p className="card-text">
                        Explore the most sustainable and eco-friendly beaches in
                        the world.
                      </p>
                    </div>
                  </div>
                </a>
              </div>

              {/* Card 2 */}
              <div className="col-md-4">
                <a
                  href="https://unity.edu/articles/greenest-cities-in-the-world/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="card">
                    <img
                      src={GreenCities}
                      className="card-img-top"
                      alt="Destination 2"
                    />
                    <div className="card-body">
                      <h5 className="card-title">Green Cities</h5>
                      <p className="card-text">
                        Visit cities that prioritize sustainability and green
                        living.
                      </p>
                    </div>
                  </div>
                </a>
              </div>
              {/* Card 3 */}
              <div className="col-md-4">
                <a
                  href="https://blog.remoovit.com/2022/07/06/top-10-eco-friendly-resorts-in-the-world/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="card">
                    <img
                      src={EcoResorts}
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
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <footer className="custom-footer bg-light mt-5">
          <div className="container text-center">
            <div className="row">
              {/* Website Title */}
              <div className="col-md-4 justify-content-center">
                <h1 className="website-title">CleanCompass</h1>
              </div>
              {/* Social Media */}
              <div className="col-md-4 mb-4 mt-1">
                <h5>Follow Us</h5>
                <div className="d-flex justify-content-center">
                  <a href="https://facebook.com" className="footer-social me-3">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="https://twitter.com" className="footer-social me-3">
                    <i className="bi bi-twitter"></i>
                  </a>
                  <a href="https://instagram.com" className="footer-social">
                    <i className="bi bi-instagram"></i>
                  </a>
                </div>
              </div>
              {/* Quick Links */}
              <div className="col-md-4 mb-4 mt-1">
                <h5>Quick Links</h5>
                <ul className="list-unstyled">
                  <li>
                    <a href="#about" className="footer-link">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/estao1/CleanCompass"
                      className="footer-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://devpost.com/software/865319/joins/wVgnSeKMYOhVnKKW6oBYXQ"
                      className="footer-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Devpost
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <p className="mt-5">
              &copy; 2025 CleanCompass. All rights reserved.
            </p>
          </div>
        </footer>
      </>
    );
  }
}

export default QueryPage;
