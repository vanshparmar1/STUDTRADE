/**
 * Public catalog label: campus locality first (matches server Item.listingArea).
 * Falls back to city · PIN for older listings without locality.
 */
export function formatListingAreaFromPickup(pickupAddress) {
  if (!pickupAddress) return null;
  const locality = (pickupAddress.locality || '').trim();
  if (locality) return locality;
  const city = (pickupAddress.city || '').trim();
  const pin = (pickupAddress.pincode || '').trim();
  if (city && pin) return `${city} · ${pin}`;
  if (city) return city;
  if (pin) return `PIN ${pin}`;
  return null;
}
