export const parseEventResources = (event: any) => {
  // Make a deep copy of the prof array if it exists
  const profArray = event.itemDetails?.occur?.prof
    ? JSON.parse(JSON.stringify(event.itemDetails.occur.prof))
    : null;
  if (!profArray || !Array.isArray(profArray)) {
    return [];
  }

  // Concatenate all rsv arrays from all prof objects
  const allRsv = profArray.reduce((acc, prof) => {
    if (prof.rsv && Array.isArray(prof.rsv)) {
      return [...acc, ...prof.rsv];
    }
    return acc;
  }, []);

  if (allRsv.length === 0) {
    return [];
  }

  // Find the reservation that matches the event date
  const eventDate = event.subject_item_date;

  const matchingReservation = allRsv.find((rsv: any) => {
    if (!rsv.startDt) {
      return false;
    }

    // Extract just the date part from startDt (e.g., "2025-07-15" from "2025-07-15T13:00")
    const reservationDate = rsv.startDt.split("T")[0];
    // Also extract just the date part from eventDate (e.g., "2025-07-16" from "2025-07-16T00:00:00")
    const eventDateOnly = eventDate.split("T")[0];
    const matches = reservationDate === eventDateOnly;
    return matches;
  });

  if (!matchingReservation || !matchingReservation.res) {
    return [];
  }

  // Map the res array to just itemName, quantity, and instruction
  const resources = matchingReservation.res.map((resource: any) => ({
    itemName: resource.itemName,
    quantity: resource.quantity,
    instruction: resource.instruction,
  }));
  return resources;
};
