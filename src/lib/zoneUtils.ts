import type { Feature, GeoJsonObject, MultiPolygon, Polygon } from 'geojson';

// A point is represented as [lng, lat] in GeoJSON
type Point = [number, number];

/**
 * Checks if a point is inside a single polygon ring using the ray-casting algorithm.
 * @param point The point to check, as [lng, lat].
 * @param ring The polygon ring, an array of points.
 * @returns `true` if the point is inside the ring, `false` otherwise.
 */
const isPointInRing = (point: Point, ring: Point[]): boolean => {
  const [x, y] = point;
  let isInside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      isInside = !isInside;
    }
  }

  return isInside;
};

/**
 * Checks if a point is inside a GeoJSON Polygon, accounting for holes.
 * @param point The point to check, as [lng, lat].
 * @param polygon The GeoJSON Polygon geometry.
 * @returns `true` if the point is inside the polygon, `false` otherwise.
 */
const isPointInPolygon = (point: Point, polygon: Polygon): boolean => {
  const exteriorRing = polygon.coordinates[0];

  // Check if the point is inside the outer boundary.
  if (!isPointInRing(point, exteriorRing as Point[])) {
    return false;
  }

  // Check if the point is inside any of the holes.
  for (let i = 1; i < polygon.coordinates.length; i++) {
    const holeRing = polygon.coordinates[i];
    if (isPointInRing(point, holeRing as Point[])) {
      return false; // Point is in a hole, so it's not in the polygon.
    }
  }

  return true;
};

/**
 * Checks if a point is inside a GeoJSON MultiPolygon.
 * @param point The point to check, as [lng, lat].
 * @param multiPolygon The GeoJSON MultiPolygon geometry.
 * @returns `true` if the point is inside any of the polygons, `false` otherwise.
 */
const isPointInMultiPolygon = (
  point: Point,
  multiPolygon: MultiPolygon,
): boolean => {
  for (const polygonCoords of multiPolygon.coordinates) {
    const polygon: Polygon = {
      type: 'Polygon',
      coordinates: polygonCoords,
    };
    if (isPointInPolygon(point, polygon)) {
      return true;
    }
  }
  return false;
};

/**
 * Checks if a coordinate is inside a given barangay feature.
 * Handles both Polygon and MultiPolygon geometries.
 * @param lat Latitude of the point.
 * @param lng Longitude of the point.
 * @param feature A GeoJSON Feature with Polygon or MultiPolygon geometry.
 * @returns `true` if the point is inside the feature's geometry.
 */
export const isInsideBarangay = (
  lat: number,
  lng: number,
  feature: Feature,
): boolean => {
  const point: Point = [lng, lat];
  const { geometry } = feature;

  if (!geometry) {
    return false;
  }

  if (geometry.type === 'Polygon') {
    return isPointInPolygon(point, geometry as Polygon);
  }

  if (geometry.type === 'MultiPolygon') {
    return isPointInMultiPolygon(point, geometry as MultiPolygon);
  }

  return false;
};

/**
 * Checks if a coordinate is inside any of the Poblacion barangays.
 * Poblacion barangays are identified if their name property includes "Poblacion".
 * @param lat Latitude of the point.
 * @param lng Longitude of the point.
 * @param geoJson The full GeoJSON object containing all features.
 * @returns `true` if the point is inside any Poblacion barangay.
 */
export const isInsidePoblacion = (
  lat: number,
  lng: number,
  geoJson: GeoJsonObject,
): boolean => {
  if (geoJson.type !== 'FeatureCollection') {
    return false;
  }

  for (const feature of geoJson.features) {
    if (feature.properties?.name?.includes('Poblacion')) {
      if (isInsideBarangay(lat, lng, feature)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Finds the name of the barangay that a coordinate is inside.
 * @param lat Latitude of the point.
 * @param lng Longitude of the point.
 * @param geoJson The full GeoJSON object containing all features.
 * @returns The name of the barangay, or `null` if not found.
 */
export const getBarangay = (
  lat: number,
  lng: number,
  geoJson: GeoJsonObject,
): string | null => {
  if (geoJson.type !== 'FeatureCollection') {
    return null;
  }

  for (const feature of geoJson.features) {
    if (feature.properties?.name && isInsideBarangay(lat, lng, feature)) {
      return feature.properties.name;
    }
  }

  return null;
};