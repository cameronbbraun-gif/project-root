import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SERVICE_AREA_POLYGON = [
  { lat: 27.9703446, lng: -82.5535114 },
  { lat: 27.9388052, lng: -82.5500781 },
  { lat: 27.9175715, lng: -82.5384052 },
  { lat: 27.8908719, lng: -82.5493915 },
  { lat: 27.8665938, lng: -82.5583179 },
  { lat: 27.8131628, lng: -82.5432117 },
  { lat: 27.8113408, lng: -82.4676807 },
  { lat: 27.8659868, lng: -82.4553211 },
  { lat: 27.9017953, lng: -82.447768 },
  { lat: 27.8939063, lng: -82.4257953 },
  { lat: 27.8932994, lng: -82.3832233 },
  { lat: 27.9278856, lng: -82.3468311 },
  { lat: 27.9721639, lng: -82.360564 },
  { lat: 28.023698, lng: -82.3509509 },
  { lat: 28.0812658, lng: -82.3475177 },
  { lat: 28.1127635, lng: -82.2431476 },
  { lat: 28.3982421, lng: -82.1655567 },
  { lat: 28.3879733, lng: -82.2610004 },
  { lat: 28.350514, lng: -82.3221118 },
  { lat: 28.3190863, lng: -82.3763568 },
  { lat: 28.3305706, lng: -82.49034 },
  { lat: 28.2906726, lng: -82.5500781 },
  { lat: 28.2011499, lng: -82.5706775 },
  { lat: 28.1563605, lng: -82.5933368 },
  { lat: 28.1145804, lng: -82.5919635 },
  { lat: 28.0739958, lng: -82.6276691 },
  { lat: 28.0449108, lng: -82.6599414 },
  { lat: 28.0006623, lng: -82.6764209 },
  { lat: 27.9576086, lng: -82.5782306 },
  { lat: 27.9600347, lng: -82.5617511 },
  { lat: 27.9703446, lng: -82.5535114 },
];

function isPointInsidePolygon(point, polygon) {
  const x = point.lng;
  const y = point.lat;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

function getAddressFields(body) {
  return {
    street: String(body?.street || "").trim(),
    city: String(body?.city || "").trim(),
    state: String(body?.state || "").trim(),
    zip: String(body?.zip || "").trim(),
  };
}

async function geocodeWithGoogle(fullAddress, apiKey) {
  if (!apiKey) return null;

  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    fullAddress
  )}&key=${apiKey}`;

  const geocodeRes = await fetch(geocodeUrl, {
    method: "GET",
    cache: "no-store",
  });

  if (!geocodeRes.ok) {
    const errorText = await geocodeRes.text().catch(() => "");
    console.error("[service-area] Google geocoding failed", geocodeRes.status, errorText);
    return null;
  }

  const data = await geocodeRes.json().catch(() => null);
  const location = data?.results?.[0]?.geometry?.location;

  if (
    location &&
    typeof location.lat === "number" &&
    typeof location.lng === "number"
  ) {
    return { lat: location.lat, lng: location.lng, provider: "google" };
  }

  console.error("[service-area] Google geocoding returned no usable result", data?.status || "unknown");
  return null;
}

async function geocodeWithNominatim(fullAddress) {
  const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${encodeURIComponent(
    fullAddress
  )}`;

  const geocodeRes = await fetch(geocodeUrl, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Accept-Language": "en-US",
      "User-Agent": "detailgeeks-service-area-check/1.0",
    },
  });

  if (!geocodeRes.ok) {
    const errorText = await geocodeRes.text().catch(() => "");
    console.error("[service-area] Nominatim geocoding failed", geocodeRes.status, errorText);
    return null;
  }

  const data = await geocodeRes.json().catch(() => null);
  const match = Array.isArray(data) ? data[0] : null;
  const lat = Number(match?.lat);
  const lng = Number(match?.lon);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng, provider: "nominatim" };
  }

  console.error("[service-area] Nominatim returned no usable result");
  return null;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const { street, city, state, zip } = getAddressFields(body);

    if (!street || !city || !state || !zip) {
      return NextResponse.json({ status: "incomplete" }, { status: 400 });
    }

    const apiKey = String(
      process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GMAPS_API_KEY || ""
    ).trim();

    const fullAddress = `${street}, ${city}, ${state} ${zip}`;
    const googleLocation = await geocodeWithGoogle(fullAddress, apiKey);
    const location = googleLocation || (await geocodeWithNominatim(fullAddress));

    if (!location) {
      return NextResponse.json({ status: "unverified" }, { status: 200 });
    }

    const insidePolygon = isPointInsidePolygon(
      { lat: location.lat, lng: location.lng },
      SERVICE_AREA_POLYGON
    );

    return NextResponse.json({
      status: insidePolygon ? "inside" : "outside",
      location: { lat: location.lat, lng: location.lng },
      provider: location.provider,
    });
  } catch (error) {
    console.error("[service-area] Unexpected error", error);
    return NextResponse.json({ status: "unverified" }, { status: 500 });
  }
}
