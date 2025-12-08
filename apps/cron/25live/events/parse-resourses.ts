import type { RawEvent } from "../schemas";

type Reservation = NonNullable<
  NonNullable<NonNullable<RawEvent["itemDetails"]>["occur"]>["prof"]
>[number]["rsv"];

export const parseEventResources = (event: RawEvent) => {
  const profArray = event.itemDetails?.occur?.prof;
  if (!Array.isArray(profArray)) {
    return [];
  }

  const allRsv = profArray.flatMap<NonNullable<Reservation>[number]>((prof) =>
    Array.isArray(prof.rsv) ? prof.rsv : []
  );

  if (allRsv.length === 0 || !event.subject_item_date) {
    return [];
  }

  const eventDateOnly = event.subject_item_date.split("T")[0];
  const matchingReservation = allRsv.find((rsv) => {
    const startDt =
      typeof rsv.reservation_start_dt === "string"
        ? rsv.reservation_start_dt
        : null;
    if (!startDt) {
      return false;
    }
    const reservationDate = startDt.split("T")[0];
    return reservationDate === eventDateOnly;
  });

  if (!matchingReservation || !matchingReservation.resource_reservation) {
    return [];
  }

  // Handle both single object and array of objects
  const resourceReservations = Array.isArray(matchingReservation.resource_reservation)
    ? matchingReservation.resource_reservation
    : [matchingReservation.resource_reservation];

  return resourceReservations
    .map((resourceReservation) => {
      const resource = resourceReservation.resource;
      if (!resource || !resource.resource_name) {
        return null;
      }
      return {
        itemName: resource.resource_name,
        quantity:
          typeof resourceReservation.quantity === "number"
            ? resourceReservation.quantity
            : null,
        instruction:
          typeof resourceReservation.resource_instructions === "string"
            ? resourceReservation.resource_instructions
            : null,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
};
