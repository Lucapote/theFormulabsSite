import BookingChecklistSection from "./BookingChecklistSection";

/**
 * BookingChecklistCard
 * Re-exporta BookingChecklistSection para mantener retrocompatibilidad.
 */
export default function BookingChecklistCard(props) {
  return <BookingChecklistSection {...props} />;
}
