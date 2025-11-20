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
    const startDt = typeof rsv.startDt === "string" ? rsv.startDt : null;
    if (!startDt) {
      return false;
    }
    const reservationDate = startDt.split("T")[0];
    return reservationDate === eventDateOnly;
  });

  if (!matchingReservation || !Array.isArray(matchingReservation.res)) {
    return [];
  }

  return matchingReservation.res.map((resource) => ({
    itemName: resource.itemName,
    quantity: typeof resource.quantity === "number" ? resource.quantity : null,   
    instruction:
      typeof resource.instruction === "string" ? resource.instruction : null,
  }));
};
