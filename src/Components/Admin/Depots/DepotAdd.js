import React from "react";
import AddEditDepot from "./Shared/AddEditDepot";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { PermissionAction } from "Helpers/ats.constants";

const DepotAdd = () => {
  return actionsPermissionValidator(location.pathname, PermissionAction.ADD) ? (
    <AddEditDepot isEdit={false} />
  ) : (
    <></>
  );
};

export default DepotAdd;
