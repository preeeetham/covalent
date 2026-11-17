/**
 * Demo venues. Names are FICTIONAL and marked as demo; areas are real neighbourhoods.
 * `partner` venues carry the "₹99 off your bill" commitment-credit offer (revenue model §4.1).
 */
export type VenueSeed = {
  slug: string;
  city: string;
  name: string;
  area: string;
  kind: string;
  blurb: string;
  price_band: string;
  partner: boolean;
};

const PARTNER_OFFER = "Your ₹99 commitment becomes ₹99 off the bill here.";

export const VENUES: VenueSeed[] = [
  { slug: "blr-third-wave-tiffin", city: "Bengaluru", name: "Tiffin & Tamper", area: "Indiranagar", kind: "Café", blurb: "Filter coffee, ghee podi idli, quiet corner tables.", price_band: "₹₹", partner: true },
  { slug: "blr-rooftop-mango", city: "Bengaluru", name: "Mango Terrace", area: "Koramangala", kind: "Rooftop café", blurb: "Sunset views, fairy lights, good lemon soda.", price_band: "₹₹₹", partner: true },
  { slug: "blr-dice-den", city: "Bengaluru", name: "Dice Den", area: "HSR Layout", kind: "Board game café", blurb: "300 games, staff who explain the rules patiently.", price_band: "₹₹", partner: true },
  { slug: "blr-page-turner", city: "Bengaluru", name: "Page Turner Books & Brew", area: "Church Street", kind: "Bookstore café", blurb: "Second-hand shelves upstairs, coffee downstairs.", price_band: "₹", partner: false },
  { slug: "blr-cubbon-walk", city: "Bengaluru", name: "Cubbon Park morning walk", area: "Cubbon Park", kind: "Public park", blurb: "Busy, green, safe. Breakfast stalls at the gate.", price_band: "Free", partner: false },
  { slug: "blr-vv-puram", city: "Bengaluru", name: "VV Puram food street", area: "Basavanagudi", kind: "Street food", blurb: "Dosa, holige, gulkand ice cream. Go hungry.", price_band: "₹", partner: false },
  { slug: "blr-clay-studio", city: "Bengaluru", name: "Clay & Co. Studio", area: "Jayanagar", kind: "Pottery workshop", blurb: "Two-hour beginner wheel sessions for two.", price_band: "₹₹₹", partner: true },
  { slug: "hyd-irani-cafe", city: "Hyderabad", name: "Chai Chowk Irani Café", area: "Banjara Hills", kind: "Irani café", blurb: "Irani chai, Osmania biscuits, old-city charm.", price_band: "₹", partner: true },
  { slug: "hyd-lake-deck", city: "Hyderabad", name: "Lake Deck", area: "Gachibowli", kind: "Lakeside café", blurb: "Open-air seating by the lake, great at sunset.", price_band: "₹₹", partner: true },
  { slug: "hyd-meeple", city: "Hyderabad", name: "Meeple Street", area: "Kondapur", kind: "Board game café", blurb: "Strategy games, huge milkshakes, loud laughter.", price_band: "₹₹", partner: true },
  { slug: "hyd-kbr-park", city: "Hyderabad", name: "KBR Park morning walk", area: "Jubilee Hills", kind: "Public park", blurb: "Shaded trail, peacocks, juice stalls after.", price_band: "Free", partner: false },
  { slug: "hyd-gallery", city: "Hyderabad", name: "State Gallery of Art", area: "Madhapur", kind: "Art gallery", blurb: "Rotating exhibitions, quiet and air-conditioned.", price_band: "₹", partner: false },
  { slug: "hyd-biryani-trail", city: "Hyderabad", name: "Biryani trail start point", area: "Ameerpet", kind: "Food trail", blurb: "Two legendary spots ten minutes apart. You decide.", price_band: "₹₹", partner: false },
  { slug: "hyd-open-mic", city: "Hyderabad", name: "The Mic Room", area: "Jubilee Hills", kind: "Comedy & music", blurb: "Open mics on weekdays, small gigs on weekends.", price_band: "₹₹", partner: true },
];

export const venueMapUrl = (v: { area: string; city: string }) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.area}, ${v.city}`)}`;

export const venueOffer = (partner: boolean) => (partner ? PARTNER_OFFER : null);
