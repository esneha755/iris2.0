"use client";

import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YjIxYjgyYy01NWNiLTRiYTMtODM1OC05Yjc2NjkwNTBmY2IiLCJpZCI6MzQwMTY2LCJpYXQiOjE3NTc1MjEwNTd9._FD4RBe-8LYXN2BT5GNwNqFFzSyHnKsMaY8w_kSodEw"; 

export default function EarthGlobeView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    (window as any).CESIUM_BASE_URL = "/cesium";

    const viewer = new Cesium.Viewer(containerRef.current, {
      baseLayerPicker: false,
      animation: false,
      timeline: false,
      infoBox: false,
      selectionIndicator: false,
    });

    // ---------- nanosat (orbiting) ----------
    const altitudeMeters = 400000; // 400 km LEO
    const earthRadius = Cesium.Ellipsoid.WGS84.maximumRadius;
    const inclinationDeg = 45;
    const inclinationRad = Cesium.Math.toRadians(inclinationDeg);
    const meanMotionSec = 5400; // ~90 min orbit

    const satEntity = viewer.entities.add({
      id: "nanosat",
      name: "Nanosat",
      position: new Cesium.CallbackPositionProperty((time?: Cesium.JulianDate) => {
        if (!time) return Cesium.Cartesian3.ZERO;

        // compute a simple circular inclined orbit (demo)
        const seconds = Cesium.JulianDate.toDate(time).getTime() / 1000.0;
        const angle = ((2 * Math.PI) / meanMotionSec) * seconds; // radians

        // longitude in degrees (wrap to -180..180)
        let lonDeg = Cesium.Math.toDegrees(angle) % 360;
        if (lonDeg > 180) lonDeg -= 360;

        // latitude oscillates with inclination
        const latDeg = inclinationDeg * Math.sin(angle * 0.5);

        return Cesium.Cartesian3.fromDegrees(lonDeg, latDeg, earthRadius + altitudeMeters);
      }, false),
      point: {
        pixelSize: 10,
        color: Cesium.Color.CYAN,
      },
      label: {
        text: "Nanosat",
        pixelOffset: new Cesium.Cartesian2(0, -22),
        fillColor: Cesium.Color.WHITE,
        font: "14px sans-serif",
      },
    });

    // ---------- ground stations ----------
    // (6 stations, can be edited/expanded)
    const stations = [
      { name: "Station 1", lat: 40.0, lon: -75.0 },  // e.g., New York area
      { name: "Station 2", lat: 34.0, lon: -118.2 }, // LA
      { name: "Station 3", lat: 51.5, lon: -0.12 },  // London
      { name: "Station 4", lat: 35.7, lon: 139.7 },  // Tokyo
      { name: "Station 5", lat: -33.9, lon: 151.2 }, // Sydney
      { name: "Station 6", lat: 28.6, lon: 77.2 },   // Delhi
    ];

    // parameters for ripple
    const rippleMin = 500000; // 50 km
    const rippleMax = 1200000; // 120 km
    const ripplePeriod = 2.0; // seconds

    stations.forEach((st, idx) => {
      const center = Cesium.Cartesian3.fromDegrees(st.lon, st.lat, 0);

      // base dot + label
      viewer.entities.add({
        id: `station-base-${idx}`,
        position: center,
        point: {
          pixelSize: 8,
          color: Cesium.Color.MAGENTA,
        },
        label: {
          text: st.name,
          font: "14px sans-serif",
          pixelOffset: new Cesium.Cartesian2(0, -20),
          fillColor: Cesium.Color.WHITE,
        },
      });

      // ripple ellipse (semiMajorAxis/semiMinorAxis must be >=)
      viewer.entities.add({
        id: `station-ripple-${idx}`,
        position: center,
        ellipse: {
          semiMajorAxis: new Cesium.CallbackProperty(() => {
            const t = ((Date.now() / 1000) + idx * (ripplePeriod / 6)) % ripplePeriod;
            const fraction = t / ripplePeriod; // 0..1
            const size = rippleMin + fraction * (rippleMax - rippleMin);
            // ensure semiMajor >= semiMinor (we'll use equal for circular ripple)
            return Math.max(size, rippleMin);
          }, false),
          semiMinorAxis: new Cesium.CallbackProperty(() => {
            // keep consistent with semiMajor (circular)
            const t = ((Date.now() / 1000) + idx * (ripplePeriod / 6)) % ripplePeriod;
            const fraction = t / ripplePeriod;
            const size = rippleMin + fraction * (rippleMax - rippleMin);
            return Math.max(1, size * 0.95); // small guard
          }, false),
          material: new Cesium.ColorMaterialProperty(
            new Cesium.CallbackProperty(() => {
              const t = ((Date.now() / 1000) + idx * (ripplePeriod / 6)) % ripplePeriod;
              const fraction = t / ripplePeriod;
              // fade out as it expands
              const alpha = Math.max(0.05, 0.35 * (1 - fraction));
              return Cesium.Color.MAGENTA.withAlpha(alpha);
            }, false)
          ),
          // outline disabled to reduce visual noise
          outline: false,
        },
      });

      // flashing overlay when nanosat is overhead — separate entity so material & size can change independently
      viewer.entities.add({
        id: `station-flash-${idx}`,
        position: center,
        ellipse: {
          semiMajorAxis: new Cesium.CallbackProperty((time?: Cesium.JulianDate) => {
            if (!time) return 1.0;
            const satPos = satEntity.position?.getValue(time);
            if (!satPos) return 1.0;

            const satCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(satPos);
            const satLatRad = satCarto.latitude;
            const satLonRad = satCarto.longitude;

            const stLatRad = Cesium.Math.toRadians(st.lat);
            const stLonRad = Cesium.Math.toRadians(st.lon);

            // haversine-like angular distance
            const dLat = satLatRad - stLatRad;
            const dLon = satLonRad - stLonRad;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
              + Math.cos(stLatRad) * Math.cos(satLatRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.asin(Math.min(1, Math.sqrt(a)));
            const angularDeg = Cesium.Math.toDegrees(c);

            const thresholdDeg = 8; // when within ~8° consider overhead (tweakable)
            if (angularDeg < thresholdDeg) {
              // larger flash radius
              return 60000;
            }
            return 1; // effectively invisible small ellipse
          }, false),
          semiMinorAxis: new Cesium.CallbackProperty((time?: Cesium.JulianDate) => {
            // keep semiMinor <= semiMajor — when flashing, match same radius
            if (!time) return 1.0;
            const satPos = satEntity.position?.getValue(time);
            if (!satPos) return 1.0;

            const satCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(satPos);
            const satLatRad = satCarto.latitude;
            const satLonRad = satCarto.longitude;

            const stLatRad = Cesium.Math.toRadians(st.lat);
            const stLonRad = Cesium.Math.toRadians(st.lon);

            const dLat = satLatRad - stLatRad;
            const dLon = satLonRad - stLonRad;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
              + Math.cos(stLatRad) * Math.cos(satLatRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.asin(Math.min(1, Math.sqrt(a)));
            const angularDeg = Cesium.Math.toDegrees(c);

            const thresholdDeg = 8;
            return angularDeg < thresholdDeg ? 60000 : 1;
          }, false),
          material: new Cesium.ColorMaterialProperty(
            new Cesium.CallbackProperty((time?: Cesium.JulianDate) => {
              if (!time) return Cesium.Color.TRANSPARENT;
              const satPos = satEntity.position?.getValue(time);
              if (!satPos) return Cesium.Color.TRANSPARENT;

              const satCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(satPos);
              const satLatRad = satCarto.latitude;
              const satLonRad = satCarto.longitude;

              const stLatRad = Cesium.Math.toRadians(st.lat);
              const stLonRad = Cesium.Math.toRadians(st.lon);

              const dLat = satLatRad - stLatRad;
              const dLon = satLonRad - stLonRad;
              const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(stLatRad) * Math.cos(satLatRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
              const c = 2 * Math.asin(Math.min(1, Math.sqrt(a)));
              const angularDeg = Cesium.Math.toDegrees(c);

              const thresholdDeg = 8;
              if (angularDeg < thresholdDeg) {
                // create a smooth alpha transition based on angular distance
                const alpha = Math.max(0.15, 0.8 * (1 - angularDeg / thresholdDeg));
                return Cesium.Color.RED.withAlpha(alpha);
              }
              return Cesium.Color.TRANSPARENT;
            }, false)
          ),
          outline: false,
        },
      });
    });

    viewer.zoomTo(satEntity).catch(() => { /* ignore zoom failure in some environments */ });

    // cleanup
    return () => {
      try {
        viewer.destroy();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
