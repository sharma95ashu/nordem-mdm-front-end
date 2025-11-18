/* eslint-disable no-unused-vars */
import { Button, Card, Col, Flex, Form, Row, Spin, Switch } from "antd";
import ABDetail from "Components/KycAdmin/AssociateBuyers/ABDetails/ABDetail";
import UserProfileCard from "Components/KycAdmin/UserProfileCard";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { PermissionAction, RejectionReason, snackBarSuccessConf } from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  hasEditPermission,
  modifyCustomerResponse
} from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";
import TerminationDialog from "../TerminateAb/TerminationDialog";
import ApproveRejectSection from "Components/KycAdmin/KYC/KycNewEntry/ApproveRejectSection";
import { enqueueSnackbar } from "notistack";

const SoftTerminate = () => {
  const [customerData, setCustomerData] = useState({});
  const [showDashboard, setShowDashboard] = useState(false);
  const [payload, setPayload] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const { apiService } = useServices();
  const searchRef = useRef();
  const [softTerminateForm] = Form.useForm();

  // Function to get the associate buyer details...
  const { isLoading } = useQuery(
    ["getUserForSoftTermination", payload],
    () => apiService.getUserForSoftTermination(payload),
    {
      enabled: !!payload, // Fetch only when payload is available
      onSuccess: (data) => {
        if (data.success && data?.data) {
          setCustomerData(modifyCustomerResponse(data?.data)); // Modifying Customer Data for UI
          setShowDashboard(true); // Show Dashboard
        } else {
          return {};
        }
      },
      onError: (error) => {
        setShowDashboard(false); // hide dashboard
        console.log(error);
      }
    }
  );

  // handle search click
  const handleSearchClick = (val) => {
    try {
      if (val) {
        const payload = {
          dist_no: val
        };
        setPayload(payload);
      }
    } catch (error) {}
  };

  // reset dashboard
  const resetDashboard = () => {
    if (searchRef.current) {
      // clear search field
      if (searchRef.current) {
        searchRef.current.resetFields();
        setPayload(null);
      }
      setShowDashboard(false); // hide dashbaord
    }
  };

  const onModalCancel = () => {
    setShowDialog(false);
    softTerminateForm.setFieldValue("rejection_remark", null); // empty { NOT OK remark } on modal close!
    softTerminateForm.setFieldValue("rejection_reasons", null); // empty { selected options } on modal close!
  };

  const handleCheckboxChange = (checkedValues) => {
    // Clear the NOT OK Remark Field, if Other is deselected!
    if (checkedValues.indexOf(RejectionReason.Other) === -1) {
      softTerminateForm.setFieldValue("rejection_remark", null);
    }
  };

  const onFinish = (values) => {
    const { is_checked } = values;

    // If KYC Status is NOT OK, Open dialog and Choose Remark
    if (!is_checked) {
      setShowDialog(true);
      return;
    }

    // If KYC Status is OK, Making Update API Call
    handleTermination();
  };

  //   Function will trigger on the final termination OK....
  const handleTermination = () => {
    const { is_checked, rejection_remark, rejection_reasons } = softTerminateForm.getFieldsValue();

    const request = {
      dist_no: customerData?.dist_no,
      // If OTHER is checked...
      ...(rejection_reasons?.indexOf(RejectionReason.Other) > -1 && {
        remark: rejection_remark
      }),
      // Termination Reasons...
      ...(rejection_reasons?.length > 0 && { reasons: rejection_reasons }),
      status: is_checked ? "approved" : "rejected"
    };

    terminateUserMutation(request); // Actual API Call made!
  };

  //   API Method for terminate User
  const { mutate: terminateUserMutation, isLoading: TerminateUserLoading } = useMutation(
    (request) => apiService.softTerminateUser(request),
    {
      // Update confirmation
      onSuccess: (data) => {
        if (data?.success) {
          setShowDialog(false); // Close the modal after submission
          softTerminateForm.resetFields(); // reset the form fields
          enqueueSnackbar(data?.message, snackBarSuccessConf); // show confirmation
          resetDashboard(); // reset search bar field
          setShowDashboard(false); // hide dashboard
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={isLoading || TerminateUserLoading}>
      <SearchByComponent
        moduleName={"soft_terminate_ab"}
        handleSearchClick={handleSearchClick}
        searchLoading={isLoading}
        handleClear={() => {
          //
        }}
        ref={searchRef}
      />
      {showDashboard ? (
        <Row gutter={[20, 12]}>
          <Col span={24}></Col>
          <Card className="fullWidth">
            <Flex gap={24} vertical={true}>
              <UserProfileCard className="fullWidth" userDetails={customerData} />
              <div className="kycTab">
                <Flex gap={24} vertical>
                  <ABDetail ABDetails={customerData || {}} />
                </Flex>

                {/*--------------------- KYC Status Update Section ---------------------*/}
                <ApproveRejectSection
                  currentStatus={
                    customerData?.exec_remark?.feedback_status === "rejected"
                      ? false
                      : customerData?.exec_remark?.feedback_status === "approved"
                        ? true
                        : true
                  }
                  kycStatusForm={softTerminateForm}
                  onFinish={onFinish}
                  modalVisible={showDialog}
                  onModalCancel={onModalCancel}
                  handleCheckboxChange={handleCheckboxChange}
                  handleKycUpdate={handleTermination}
                  KycUpdateLoading={TerminateUserLoading}
                  onBackClick={resetDashboard}
                  parentModule={"executive-feedback"}
                  hasActionPermission={hasEditPermission()}
                  preSelectedReasons={customerData?.exec_remark?.reasons?.map((e) => e.id) || []}
                  preEnteredRemark={customerData?.exec_remark?.remark || ""}
                />
              </div>
            </Flex>
          </Card>
        </Row>
      ) : (
        <SearchByFallbackComponent
          title={"Search by Associate Buyer Number"}
          subTitle={"Quickly search the Associate Buyer Number to Soft Terminate the AB"}
          image={searchByIcon}
        />
      )}
    </Spin>
  ) : (
    <></>
  );
};

export default SoftTerminate;
