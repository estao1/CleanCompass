/**
 * Build a multi-leg route on the provided map, with directions in the given panel.
 * @param {google.maps.Map} map            An existing Google Map instance.
 * @param {HTMLElement} panelEl            A DOM element (e.g. <div>) where direction steps / flight info appear.
 * @param {Array} stops                    An array of { location: string, mode: string } in travel order.
 * @param {number} alpha                   0..1 controlling how "flat" flight arcs appear. (0=great-circle, 1=flat)
 */
export async function buildMultiLegRoute(map, panelEl, stops, alpha = 0.5) {
  // Mode emojis for displaying in segment headings and info windows
  const modeEmojis = {
    DRIVING: "🚗",
    WALKING: "🚶",
    BICYCLING: "🚲",
    TRANSIT: "🚌",
    FLIGHT: "✈️",
  };

  // Initialize required Google Maps services
  const geocoder = new google.maps.Geocoder();
  const directionsService = new google.maps.DirectionsService();

  // Arrays to track markers, polylines, and directions renderers
  const letterMarkers = [];
  const polylines = [];
  const directionsRenderers = [];

  // Marker letter index (A, B, C, ...)
  let markerIndex = 0;
  const markerLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // Clear the panel for new directions
  panelEl.innerHTML = "";

  // Utility: Place a lettered marker on the map
  function placeLetterMarker(pos) {
    if (!pos) return;
    const label = markerLetters[markerIndex] || "?";
    markerIndex++;
    const marker = new google.maps.Marker({
      position: pos,
      map: map,
      label: label,
    });
    letterMarkers.push(marker);
  }

  // Utility: Run tasks sequentially
  async function runSequentially(tasks) {
    for (const fn of tasks) {
      await fn();
    }
  }

  // STEP A: Geocode all stops
  const geocodedStops = await Promise.all(
    stops.map((stop) =>
      new Promise((resolve) => {
        const locationStr = (stop.location || "").trim();
        if (!locationStr) {
          alert("Empty location. Skipping.");
          resolve({ ...stop, latLng: null });
          return;
        }
        geocoder.geocode({ address: locationStr }, (results, status) => {
          if (status === "OK" && results[0]) {
            resolve({ ...stop, latLng: results[0].geometry.location });
          } else {
            alert(`Could not geocode "${locationStr}". Skipping.`);
            resolve({ ...stop, latLng: null });
          }
        });
      })
    )
  );

  // Place lettered markers for valid locations
  geocodedStops.forEach((stop) => {
    if (stop.latLng) placeLetterMarker(stop.latLng);
  });

  // STEP B: Build segments for consecutive stops
  const tasks = [];
  for (let i = 0; i < geocodedStops.length - 1; i++) {
    const origin = geocodedStops[i];
    const destination = geocodedStops[i + 1];

    if (!origin.latLng || !destination.latLng) continue;

    if (origin.mode === "FLIGHT") {
      tasks.push(() => doFlightSegment(i, origin, destination));
    } else {
      tasks.push(() => doStandardSegment(i, origin, destination));
    }
  }

  // Run all segment tasks sequentially
  await runSequentially(tasks);

  /**
   * Handle standard segments (driving, walking, transit, etc.)
   */
async function doStandardSegment(index, origin, destination) {
    return new Promise((resolve) => {
        directionsService.route(
            {
                origin: origin.latLng,
                destination: destination.latLng,
                travelMode: origin.mode,
                provideRouteAlternatives: false,
            },
            (result, status) => {
                if (status === "OK") {
                    const route = result.routes[0];
                    if (!route || !route.legs.length) {
                        alert(`No route found for segment ${index + 1}.`);
                        resolve();
                        return;
                    }

                    const leg = route.legs[0];
                    const distMeters = leg.distance?.value || 0;
                    const distKm = distMeters / 1000;
                    const dur = leg.duration?.text || "";

                    // Calculate carbon emissions based on travel mode
                    let carbonEmissions = 0;
                    const emissionFactors = {
                        DRIVING: 0.27, // kg CO2 per vehicle-km
                        TRANSIT: 0.089, // kg CO2 per passenger-km
                        WALKING: 0,
                        BICYCLING: 0,
                    };

                    if (origin.mode in emissionFactors) {
                        carbonEmissions = distKm * emissionFactors[origin.mode];
                    }

                    // Create a DirectionsRenderer
                    const dr = new google.maps.DirectionsRenderer({
                        preserveViewport: true,
                        suppressMarkers: true, // Suppress default markers
                        polylineOptions: { strokeOpacity: 0, strokeWeight: 0 }, // Hide default polyline
                        map: map,
                    });
                    dr.setDirections(result);
                    directionsRenderers.push(dr);

                    // Add segment heading with emoji and emissions
                    const segDiv = document.createElement("div");
                    segDiv.innerHTML = `<div class="segment-heading">
                      Segment ${index + 1} (${origin.mode}): ${modeEmojis[origin.mode] || ""}
                      <div style="font-weight: normal; font-size: 0.85em; margin-top: 4px; color: #5f6368;">
                        ~${distKm.toFixed(2)} km, ${dur}
                      </div>
                      <div style="font-weight: normal; font-size: 0.85em; margin-top: 2px; color: #5f6368;">
                        Estimated carbon emissions: ~${carbonEmissions.toFixed(2)} kg CO<sub>2</sub>
                      </div>
                    </div>`;
                    const stepsDiv = document.createElement("div");
                    segDiv.appendChild(stepsDiv);
                    panelEl.appendChild(segDiv);

                    // Render steps in the stepsDiv
                    dr.setPanel(stepsDiv);

                    // Draw custom polyline
                    const overviewPath = route.overview_path || [];
                    const customPoly = new google.maps.Polyline({
                        path: overviewPath,
                        strokeColor: "#4285F4",
                        strokeWeight: 5,
                        strokeOpacity: 0.9,
                        map: map,
                    });
                    polylines.push(customPoly);

                    // Add hover info window
                    const infoWindow = new google.maps.InfoWindow({
                        content: `<div style="padding:2px 5px;">
                          ${modeEmojis[origin.mode] || ""} ~${distKm.toFixed(2)} km, ${dur}
                          <br>
                          Estimated emissions: ~${carbonEmissions.toFixed(2)} kg CO<sub>2</sub>
                        </div>`,
                    });
                    customPoly.addListener("mouseover", (e) => {
                        infoWindow.setPosition(e.latLng);
                        infoWindow.open(map);
                    });
                    customPoly.addListener("mouseout", () => infoWindow.close());
                } else {
                    alert(`Segment ${index + 1} failed: ${status}`);
                }
                resolve();
            }
        );
    });
}


  /**
   * Handle flight segments with hybrid arcs
   */
  /**
 * Handle flight segments with hybrid arcs
 */
async function doFlightSegment(index, origin, destination) {
    return new Promise((resolve) => {
        const distMeters = google.maps.geometry.spherical.computeDistanceBetween(
            origin.latLng,
            destination.latLng
        );
        const distKm = distMeters / 1000;
        const flightSpeed = 800; // Average flight speed in km/h
        const hrs = distKm / flightSpeed;
        const mins = hrs * 60;

        // Calculate carbon emissions (equation based on research)
        const emissionFactor = 0.115; // 0.115 kg CO2 per passenger-km (economy flight average)
        const carbonEmissions = distKm * emissionFactor; // Total emissions in kg

        const arcPath = buildHybridArcPath(origin.latLng, destination.latLng, 64, alpha);

        const poly = new google.maps.Polyline({
            path: arcPath,
            strokeColor: "#4285F4",
            strokeOpacity: 0.9,
            strokeWeight: 5,
            geodesic: false,
            map: map,
        });
        polylines.push(poly);

        const segDiv = document.createElement("div");
        segDiv.className = "segment-heading";
        segDiv.innerHTML = `
            Segment ${index + 1} (FLIGHT): ${modeEmojis["FLIGHT"] || ""}
            <div style="font-weight: normal; font-size: 0.85em; margin-top: 4px; color: #5f6368;">
                ~${distKm.toFixed(2)} km, ~${mins.toFixed(0)} min
            </div>
            <div style="font-weight: normal; font-size: 0.85em; margin-top: 2px; color: #5f6368;">
                Estimated carbon emissions: ~${carbonEmissions.toFixed(2)} kg CO<sub>2</sub>
            </div>
        `;
        panelEl.appendChild(segDiv);

        const infoWin = new google.maps.InfoWindow({
            content: `<div style="padding:2px 5px;">
                ${modeEmojis["FLIGHT"] || ""} 
                ${distKm.toFixed(2)} km, ~${mins.toFixed(0)} min
                <br>
                Estimated emissions: ~${carbonEmissions.toFixed(2)} kg CO<sub>2</sub>
            </div>`,
        });
        poly.addListener("mouseover", (e) => {
            infoWin.setPosition(e.latLng);
            infoWin.open(map);
        });
        poly.addListener("mouseout", () => infoWin.close());

        resolve();
    });
}

  /**
   * Build a hybrid arc path
   */
  function buildHybridArcPath(start, end, steps, alpha) {
    const path = [];
    const lat1 = start.lat();
    const lng1 = start.lng();
    const lat2 = end.lat();
    const lng2 = end.lng();

    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const gcPt = google.maps.geometry.spherical.interpolate(start, end, f);
      const gcLat = gcPt.lat();
      const gcLng = gcPt.lng();
      const lLat = lat1 + f * (lat2 - lat1);
      const lLng = lng1 + f * (lng2 - lng1);
      const finalLat = alpha * lLat + (1 - alpha) * gcLat;
      const finalLng = alpha * lLng + (1 - alpha) * gcLng;
      path.push(new google.maps.LatLng(finalLat, finalLng));
    }
    return path;
  }

  // Return objects for cleanup if necessary
  return {
    markers: letterMarkers,
    polylines,
    directionsRenderers,
  };
}
