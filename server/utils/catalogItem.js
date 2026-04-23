/**
 * Strip street-level pickup fields from public catalog / seller-grid JSON.
 * City + pincode remain so clients can show listingArea for delivery estimates.
 */
export function toCatalogItem(doc) {
    const o = doc.toJSON();
    if (o.pickupAddress) {
        delete o.pickupAddress.fullAddress;
        delete o.pickupAddress.landmark;
    }
    return o;
}
