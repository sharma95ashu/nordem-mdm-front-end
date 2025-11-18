import React from "react";
import AddEditDepot from "./Shared/AddEditDepot";
import { PermissionAction } from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";

const DepotEdit = () => {
  return actionsPermissionValidator(location.pathname, PermissionAction.EDIT) ? (
    <AddEditDepot isEdit={true} />
  ) : (
    <></>
  );
};

export default DepotEdit;
