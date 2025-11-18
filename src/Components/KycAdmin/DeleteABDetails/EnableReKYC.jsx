import React, { useState, useRef } from "react";
import ABUserDashboard from "./ABUserDashboard";
import { useServices } from "Hooks/ServicesContext";
import { Form } from "antd";
import { useMutation } from "react-query";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import { actionsPermissionValidator } from "Helpers/ats.helper";

const EnableReKyc = () => {
  const [show, setShow] = useState(false);
  const [ABDetails, setABDetails] = useState({});
  const { apiService } = useServices();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [submissionForm] = Form.useForm();
  const searchRef = useRef();

  const resetDashboard = () => {
    setShow(false);
    setABDetails({});
    setIsDeleteModalOpen(false);
    submissionForm.resetFields();
  };

  // ----------------  Get AB number Details ---------------
  const { mutate: fetchABNumberDetails, isLoading } = useMutation(
    (distNumber) => apiService.getKycRefillABDetails({ dist_no: distNumber }),
    {
      // Configuration options for the mutation
      onSuccess: ({ data, success }) => {
        if (success) {
          setShow(true);
          setABDetails(data);
        }
      },
      onError: (error) => {
        resetDashboard();
      }
    }
  );

  // ----------------  Enable Re fill KYC Details ---------------
  const enableReKYC = (distNumber) => {
    enableMutate({ dist_no: distNumber });
  };

  const { mutate: enableMutate } = useMutation((request) => apiService.enableRefillKyc(request), {
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
      // enqueueSnackbar(error.message, snackBarErrorConf);
    }
  });

  // function to reset dashboard
  const onBackClick = () => {
    setShow(false); // hide dashboard
    if (searchRef.current) {
      searchRef.current.resetFields(); // this will clear the search box item
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <ABUserDashboard
        handleAfterSearch={fetchABNumberDetails}
        handleConfirmDelete={enableReKYC}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        show={show}
        ABDetails={ABDetails}
        module={{ TYPE: "enable-re-kyc", NAME: "kyc_enable_refill_kyc" }}
        isLoading={isLoading}
        submissionForm={submissionForm}
        fallBackSubtitle={"Quickly search the Associate Buyer Number to Enable Re-KYC."}
        searchRef={searchRef}
        onBackClick={onBackClick}
      />
    </>
  ) : (
    <></>
  );
};

export default EnableReKyc;
