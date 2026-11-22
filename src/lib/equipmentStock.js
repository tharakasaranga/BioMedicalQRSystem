export function calculateEquipmentStock(equipment, faults) {
  const totalQty = Math.max(1, Math.floor(Number(equipment.quantity) || 1));
  let operationalQty = totalQty;
  let maintenanceQty = 0;
  let outOfOrderQty = 0;

  const activeFaults = [...faults]
    .filter((fault) => fault.status !== "Resolved")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  for (const fault of activeFaults) {
    const faultyQuantity = Math.max(1, Math.floor(Number(fault.faultyQuantity) || 1));
    const affectedQuantity = Math.min(faultyQuantity, operationalQty);

    if (fault.deviceStoppedWorking) {
      outOfOrderQty += affectedQuantity;
      operationalQty -= affectedQuantity;
    } else if (!fault.isMinorCosmetic && fault.priority !== "Low") {
      maintenanceQty += affectedQuantity;
      operationalQty -= affectedQuantity;
    }
  }

  return {
    operationalQty,
    maintenanceQty,
    outOfOrderQty,
    status: outOfOrderQty > 0
      ? "Out of Order"
      : maintenanceQty > 0
        ? "Under Maintenance"
        : "Operational",
  };
}
