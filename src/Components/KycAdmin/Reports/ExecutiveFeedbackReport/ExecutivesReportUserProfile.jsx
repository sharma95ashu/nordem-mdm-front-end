import { Card, Flex, Form, Spin, Typography } from "antd";
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ABDetail from "Components/KycAdmin/AssociateBuyers/ABDetails/ABDetail";
import { useMutation, useQuery } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { hasEditPermission, modifyCustomerResponse } from "Helpers/ats.helper";
import UserProfileCard from "Components/KycAdmin/UserProfileCard";
import { RejectionReason, snackBarSuccessConf } from "Helpers/ats.constants";
import ApproveRejectSection from "Components/KycAdmin/KYC/KycNewEntry/ApproveRejectSection";
import { enqueueSnackbar } from "notistack";
import { KycAdminPaths } from "Router/KYCAdminPaths";

const ExecutivesReportUserProfile = () => {
  // Query Params
  const [searchParams] = useSearchParams();
  const params = {
    ab_id: searchParams.get("ab_id"),
    exec_name: searchParams.get("exec_name"),
    ab_name: searchParams.get("ab_name")
  };

  const [customerData, setCustomerData] = useState({});
  const [showDashboard, setShowDashboard] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { apiService } = useServices();
  const navigate = useNavigate();
  const [kycStatusForm] = Form.useForm();

  // Function to get the associate buyer details...
  const { isLoading } = useQuery(
    ["getAbDetailsForFeeback", params?.ab_id],
    () =>
      apiService.getABDetailsForHeadExecutive({
        dist_no: params?.ab_id
      }),
    {
      enabled: !!params?.ab_id, // Fetch only when payload is available
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

  const onModalCancel = () => {
    setModalVisible(false);
    kycStatusForm.setFieldValue("rejection_remark", customerData?.exec_remark?.remark || ""); // empty { NOT OK remark } on modal close!
    kycStatusForm.setFieldValue(
      "rejection_reasons",
      customerData?.exec_remark?.reasons?.map((e) => e.id) || null
    ); // empty { selected options } on modal close!
  };

  const onFinish = (values) => {
    const { is_checked } = values;

    // If KYC Status is NOT OK, Open dialog and Choose Remark
    if (!is_checked) {
      setModalVisible(true);
      return;
    }

    // If KYC Status is OK, Making Update API Call
    handleKycUpdate();
  };

  const handleCheckboxChange = (checkedValues) => {
    // Clear the NOT OK Remark Field, if Other is deselected!
    if (checkedValues.indexOf(RejectionReason.Other) === -1) {
      kycStatusForm.setFieldValue("rejection_remark", null);
    }
  };

  const resetApplicationStates = () => {
    setShowDashboard(false); // hide dashboard;
    navigate(-1);
  };

  // Handle KYC update
  const handleKycUpdate = () => {
    // destructed form values
    const { is_checked, success_remark, rejection_remark, rejection_reasons } =
      kycStatusForm.getFieldsValue();

    const request = {
      dist_no: customerData.dist_no,
      status: is_checked ? "approved" : "rejected",

      // If Kyc checkox is OK, and remark exist!
      ...(is_checked && success_remark && { remark: success_remark }),

      // If Kyc checkox is NOT OK, and extra remark exist!
      ...(!is_checked &&
        rejection_remark &&
        rejection_reasons?.indexOf(RejectionReason.Other) > -1 && { remark: rejection_remark }),

      // Kyc NOT OK reasons
      ...(!is_checked && rejection_reasons?.length > 0 && { reasons: rejection_reasons })
    };
    updateKycStatusMutate(request); // Actual API Call made!
  };

  const { mutate: updateKycStatusMutate, isLoading: KycUpdateLoading } = useMutation(
    (request) => apiService.updateFinalKYCStatusByHeadExecutive(request),
    {
      // Update confirmation
      onSuccess: ({ success, message }) => {
        if (success) {
          setModalVisible(false); // Close the modal after submission
          resetApplicationStates(); // reset page
          enqueueSnackbar(message, snackBarSuccessConf);
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  return (
    <Spin spinning={isLoading || KycUpdateLoading}>
      <Flex gap={12} vertical>
        <div></div>
        <Flex gap={24} vertical>
          {/* Breadcrumbs */}
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              Executive Feedback
            </Typography.Title>
            <Typography.Text className="removeMargin">
              <Typography.Text type="secondary">
                KYC / View {params?.exec_name && `${params?.exec_name}'s`} Report /
              </Typography.Text>{" "}
              {params?.ab_name && `${params?.ab_name}`}
            </Typography.Text>
          </Flex>
          {/* Card */}

          {showDashboard ? (
            <Card>
              <Flex gap={24} vertical>
                <UserProfileCard className="fullWidth" userDetails={customerData || {}} />
                <ABDetail
                  ABDetails={customerData || {}}
                  moduleType={"executive-feedback-report"}
                  executiveName={params?.exec_name}
                />
                {/*--------------------- KYC Status Update Section ---------------------*/}
                <ApproveRejectSection
                  currentStatus={
                    customerData?.exec_remark?.feedback_status === "rejected"
                      ? false
                      : customerData?.exec_remark?.feedback_status === "approved"
                        ? true
                        : true
                  }
                  kycStatusForm={kycStatusForm}
                  onFinish={onFinish}
                  modalVisible={modalVisible}
                  onModalCancel={onModalCancel}
                  handleCheckboxChange={handleCheckboxChange}
                  handleKycUpdate={handleKycUpdate}
                  KycUpdateLoading={KycUpdateLoading}
                  onBackClick={resetApplicationStates}
                  parentModule={"senior-executive-feedback"}
                  hasActionPermission={hasEditPermission(KycAdminPaths.executiveFeedback_Report)}
                  preSelectedReasons={customerData?.exec_remark?.reasons?.map((e) => e.id) || []}
                  preEnteredRemark={customerData?.exec_remark?.remark || ""}
                />
              </Flex>
            </Card>
          ) : (
            <></>
          )}
        </Flex>
      </Flex>
    </Spin>
  );
};

export default ExecutivesReportUserProfile;
