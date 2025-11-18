import React, { useRef, useState } from "react";
import ABUserDashboard from "./ABUserDashboard";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { Form } from "antd";
import { actionsPermissionValidator } from "Helpers/ats.helper";

const DeleteBankAccount = () => {
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

  // ----------------  Get User Bank Account Details ---------------
  const { mutate: fetchBankAccountDetails, isLoading } = useMutation(
    (distNumber) => apiService.getBankAccountDetails({ dist_no: distNumber }),
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

  // ----------------  Delete User Bank Account ---------------

  const deleteBankAccount = (distNumber, remark) => {
    deleteMutate({ dist_no: distNumber, remark: remark || "" });
  };

  const { mutate: deleteMutate } = useMutation(
    (request) => apiService.deleteBankAccountDetails(request),
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

  // function to reset dashboard
  const onBackClick = () => {
    setShow(false); // hide dashboard
    if (searchRef.current) {
      searchRef.current.resetFields(); // this will clear the search box item
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <ABUserDashboard
      handleAfterSearch={fetchBankAccountDetails}
      handleConfirmDelete={deleteBankAccount}
      isDeleteModalOpen={isDeleteModalOpen}
      setIsDeleteModalOpen={setIsDeleteModalOpen}
      show={show}
      ABDetails={ABDetails}
      module={{ TYPE: "bank-account", NAME: "associate_buyer_bank_account_delete" }}
      isLoading={isLoading}
      submissionForm={submissionForm}
      fallBackSubtitle={
        "Quickly search the Associate Buyer Number to enable the Bank Account details."
      }
      searchRef={searchRef}
      onBackClick={onBackClick}
    />
  ) : (
    <></>
  );
};

export default DeleteBankAccount;
