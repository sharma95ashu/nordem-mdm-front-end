import React, { useRef, useState } from "react";
import ABUserDashboard from "./ABUserDashboard";
import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import { actionsPermissionValidator } from "Helpers/ats.helper";

const DeletePhoto = () => {
  const [show, setShow] = useState(false);
  const [ABDetails, setABDetails] = useState({});
  const { apiService } = useServices();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const searchRef = useRef();

  const resetDashboard = () => {
    setShow(false);
    setABDetails({});
    setIsDeleteModalOpen(false);
  };

  // ----------------  Get User Profile Photo ---------------
  const { mutate: fetchProfilePhoto, isLoading } = useMutation(
    (distNumber) => apiService.getABProfilePhoto({ dist_no: distNumber }),
    {
      // Configuration options for the mutation
      onSuccess: ({ data, success }) => {
        if (success) {
          setShow(true);
          setABDetails(data);
        }
      },
      onError: (error) => {
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // ----------------  Delete User Profile Photo ---------------
  const deleteProfilePhoto = (distNumber) => {
    deleteMutate(distNumber);
  };

  const { mutate: deleteMutate } = useMutation(
    (distNumber) => apiService.deleteABProfilePhoto({ dist_no: distNumber }),
    {
      // Delete confirmation
      onSuccess: ({ data, success, message }) => {
        if (success) {
          enqueueSnackbar(message, snackBarSuccessConf);
          resetDashboard();

          // reset search field
          if (searchRef.current) {
            searchRef.current.resetFields();
          }
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <ABUserDashboard
        handleAfterSearch={fetchProfilePhoto}
        handleConfirmDelete={deleteProfilePhoto}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        show={show}
        ABDetails={ABDetails}
        module={{ TYPE: "photo-delete", NAME: "associate_buyer_photo_delete" }}
        isLoading={isLoading}
        fallBackSubtitle={
          "Quickly search the Associate Buyer Number to enable the Associate Buyer Photo."
        }
        searchRef={searchRef}
      />
    </>
  ) : (
    <></>
  );
};

export default DeletePhoto;
