/**
 * Build a multi-leg route on the provided map, with directions in the given panel.
 * @param {google.maps.Map} map            An existing Google Map instance.
 * @param {HTMLElement} panelEl            A DOM element (e.g. <div>) where direction steps / flight info appear.
 * @param {Array} stops                    An array of { location: string, mode: string } in travel order.
 * @param {number} alpha                   0..1 controlling how "flat" flight arcs appear. (0=great-circle, 1=flat)
 */
export async function buildMultiLegRoute(map, panelEl, stops, alpha = 0.5) {
  // === Add the modeEmojis here ===
  const modeEmojis = {
    DRIVING: "🚗",
    WALKING: "🚶",
    BICYCLING: "🚲",
    TRANSIT: "🚌",
    FLIGHT: "✈️",
  };

  // 1) We'll need a Geocoder + DirectionsService
  const geocoder = new google.maps.Geocoder();
  const directionsService = new google.maps.DirectionsService();

  // 2) Arrays to keep track of what we draw (for clearing if needed)
  const letterMarkers = [];
  const polylines = [];
  const directionsRenderers = [];

  // For labeling markers (A,B,C,...)
  let markerIndex = 0;
  const markerLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // Clear the panel
  panelEl.innerHTML = "";

  // --- Utility to place a lettered marker
  function placeLetterMarker(pos) {
    if (!pos) return;
    const label = markerLetters[markerIndex] || "?";
    markerIndex++;
    const m = new google.maps.Marker({
      position: pos,
      map: map,
      label: label,
    });
    letterMarkers.push(m);
  }

  // --- Utility to run functions sequentially
  async function runSequentially(tasks) {
    for (const fn of tasks) {
      await fn();
    }
  }

  // --- STEP A: Geocode all stops
  //     If a stop fails, we set latLng = null and skip it
  const geocodedStops = await Promise.all(
    stops.map((s) => {
      return new Promise((resolve) => {
        const locationStr = (s.location || "").trim();
        if (!locationStr) {
          alert("Empty location. Skipping.");
          return resolve({ ...s, latLng: null });
        }
        geocoder.geocode({ address: locationStr }, (results, status) => {
          if (status === "OK" && results[0]) {
            resolve({ ...s, latLng: results[0].geometry.location });
          } else {
            alert(`Could not geocode "${locationStr}". Skipping this stop.`);
            resolve({ ...s, latLng: null });
          }
        });
      });
    })
  );

  // Place lettered markers for each valid latLng
  geocodedStops.forEach((stop) => {
    if (stop.latLng) placeLetterMarker(stop.latLng);
  });

  // --- STEP B: Build segments from i..i+1
  const tasks = [];
  for (let i = 0; i < geocodedStops.length - 1; i++) {
    const origin = geocodedStops[i];
    const destination = geocodedStops[i + 1];
    // Skip if missing latLng
    if (!origin.latLng || !destination.latLng) continue;

    if (origin.mode === "FLIGHT") {
      tasks.push(() => doFlightSegment(i, origin, destination));
    } else {
      tasks.push(() => doStandardSegment(i, origin, destination));
    }
  }

  // Run them sequentially
  await runSequentially(tasks);

  /**
   * Standard segment (driving/walking/etc.)
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
              return resolve();
            }
            const leg = route.legs[0];
            const dist = leg.distance?.text || "";
            const dur = leg.duration?.text || "";

            // 1) Create a DirectionsRenderer for the styled steps in panel
            const dr = new google.maps.DirectionsRenderer({
              preserveViewport: true,
              suppressMarkers: true, // we do our own markers
              // We'll hide the built-in polyline so we can do a custom one
              polylineOptions: { strokeOpacity: 0, strokeWeight: 0 },
              map: map,
            });
            dr.setDirections(result);
            directionsRenderers.push(dr);

            // 2) Create a container in panel for "Segment i"
            const segDiv = document.createElement("div");
            segDiv.innerHTML = `<div class="segment-heading">
              Segment ${index + 1} (${origin.mode})
            </div>`;
            const stepsDiv = document.createElement("div");
            segDiv.appendChild(stepsDiv);
            panelEl.appendChild(segDiv);

            // Let DirectionsRenderer fill stepsDiv
            dr.setPanel(stepsDiv);

            // 3) Draw our own polyline so we can handle hover
            const overviewPath = route.overview_path || [];
            const customPoly = new google.maps.Polyline({
              path: overviewPath,
              strokeColor: "#4285F4",
              strokeWeight: 5,
              strokeOpacity: 0.9,
              map: map,
            });
            polylines.push(customPoly);

            // 4) Hover InfoWindow with distance/time
            const contentStr = `<div style="padding:2px 5px;">
              ${modeEmojis[origin.mode] || ""} ${dist}, ${dur}
            </div>`;
            const infoWindow = new google.maps.InfoWindow({ content: contentStr });
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
   * Flight segment => "Hybrid" arc
   */
  async function doFlightSegment(index, origin, destination) {
    return new Promise((resolve) => {
      // 1) distance/time
      const distMeters = google.maps.geometry.spherical.computeDistanceBetween(
        origin.latLng,
        destination.latLng
      );
      const distKm = distMeters / 1000;
      const flightSpeed = 800;
      const hrs = distKm / flightSpeed;
      const mins = hrs * 60;

      // 2) Build a blended arc
      const arcPath = buildHybridArcPath(origin.latLng, destination.latLng, 64, alpha);

      // 3) Draw the poly
      const poly = new google.maps.Polyline({
        path: arcPath,
        strokeColor: "#4285F4",
        strokeOpacity: 0.9,
        strokeWeight: 5,
        geodesic: false, // we don't want to warp further
        map: map,
      });
      polylines.push(poly);

      // 4) Panel heading
      const segDiv = document.createElement("div");
      segDiv.className = "segment-heading";
      segDiv.innerHTML = `
        Segment ${index + 1} (FLIGHT): 
        ~${distKm.toFixed(2)} km, ~${mins.toFixed(0)} min
      `;
      panelEl.appendChild(segDiv);

      // 5) Hover InfoWindow
      const infoWin = new google.maps.InfoWindow({
        content: `<div style="padding:2px 5px;">
          ${modeEmojis["FLIGHT"] || ""} 
          ${distKm.toFixed(2)} km, ~${mins.toFixed(0)} min
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
   * Build a "hybrid" arc path by mixing
   * half great-circle + half linear lat/lng
   * (or some fraction controlled by alpha)
   */
  function buildHybridArcPath(start, end, steps, alphaVal) {
    const path = [];
    // Linear references
    const lat1 = start.lat();
    const lng1 = start.lng();
    const lat2 = end.lat();
    const lng2 = end.lng();

    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      // Great-circle point
      const gcPt = google.maps.geometry.spherical.interpolate(start, end, f);
      const gcLat = gcPt.lat();
      const gcLng = gcPt.lng();
      // Linear point
      const lLat = lat1 + f * (lat2 - lat1);
      const lLng = lng1 + f * (lng2 - lng1);

      // Weighted combination
      const finalLat = alphaVal * lLat + (1 - alphaVal) * gcLat;
      const finalLng = alphaVal * lLng + (1 - alphaVal) * gcLng;
      path.push(new google.maps.LatLng(finalLat, finalLng));
    }
    return path;
  }

  // Return references if you need to clear them later
  return {
    markers: letterMarkers,
    polylines,
    directionsRenderers,
  };
}
