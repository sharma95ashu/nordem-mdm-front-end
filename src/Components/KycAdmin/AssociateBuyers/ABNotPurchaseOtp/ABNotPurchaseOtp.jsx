import { Button, Card, Col, Flex, Radio, Row, Spin, Typography } from "antd";
import RowColumnData from "Components/KycAdmin/KYC/Shared/RowColumnData";
import UserProfileCard from "Components/KycAdmin/UserProfileCard";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { PopconfirmWrapper } from "Components/Shared/Wrappers/PopConfirmWrapper";
import { MESSAGES, PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { actionsPermissionValidator, getDocumentPath, hasEditPermission } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import React, { useCallback, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";

const ABNotPurchaseOtp = () => {
  const [show, setShow] = useState(false);
  const [payload, setPayload] = useState(null);
  const [isActivated, setIsActivated] = useState(false);
  const [customerData, setCustomerData] = useState({});
  const { apiService } = useServices();
  const searchRef = useRef();

  // handle search click
  const handleSearchClick = useCallback((val) => {
    try {
      if (val) {
        const payload = {
          dist_no: val
        };
        setPayload(payload);
      }
    } catch (error) {}
  }, []);

  // useQuery to fetch data
  const { isLoading } = useQuery(
    ["getABDetailsForOtpCheck", payload],
    () => apiService.getABDetailsForOtpCheck(payload),
    {
      enabled: !!payload, // Fetch only when payload is available
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const newData = {
            ...data.data,
            basicDetail: {
              ["Gender"]: data?.data?.personal_details?.gender,
              ["Marital Status"]: data?.data?.personal_details?.marital_status,
              ["Father’s / Husband’s Name"]: data?.data?.father_name,
              ["Spouse Name"]: data?.data?.personal_details?.spouse_name,
              ["Sponsor Number"]: data?.data?.sponsor,
              ["Sponsor Name"]: data?.data?.sponsor_name,
              ["Proposer Number"]: data?.data?.proposer,
              ["Proposer Name"]: data?.data?.proposer_name
            },
            ["doc_path"]: getDocumentPath(data?.data?.files_meta, "applicant_photo")
          };
          setCustomerData(newData);
          setShow(true); // show dashboard

          // state update for radio options
          setIsActivated(data?.data?.purchase_otp_req || false);
        }
      },
      onError: (error) => {
        setShow(false); // hide dashboard
        console.log(error);
      }
    }
  );

  // Api method - Restore User
  const { mutate: updateABOtpMutate, isLoading: updateMutateLoading } = useMutation(
    (request) => apiService.updateABDetailsForOtpCheck(request),
    {
      // Update confirmation
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          enqueueSnackbar(data.message, snackBarSuccessConf);
          resetDashboard(); // reset dashboard
        }
      },
      onError: (error) => {
        setShow(false); // hide dashboard
        console.log(error);
      }
    }
  );

  // triggered on button click, will update the preference
  const handleUpdate = () => {
    let request = {
      dist_no: customerData?.dist_no,
      otp_check: isActivated ? true : false
    };

    // api call
    updateABOtpMutate(request);
  };

  // reset dashboard
  const resetDashboard = () => {
    if (searchRef.current) {
      searchRef.current.resetFields(); // this will clear the search box
      setShow(false);
      setPayload(null);
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={isLoading || updateMutateLoading}>
      <SearchByComponent
        moduleName={"ab_not_purchase_otp"}
        handleSearchClick={handleSearchClick}
        searchLoading={isLoading}
        handleClear={() => {
          //
        }}
        ref={searchRef}
      />
      {show ? (
        <Row gutter={[20, 12]}>
          <Col span={24}></Col>
          <Card className="fullWidth">
            <Flex gap={24} vertical={true}>
              <UserProfileCard className="fullWidth" userDetails={customerData} />
              <Flex className="fullWidth" span={24} vertical gap={24}>
                {/* Basic Details */}
                <RowColumnData title={"Basic Details"} columnData={customerData.basicDetail} />

                {/* Manage OTP Access */}
                <Flex vertical gap={12}>
                  <Typography.Text strong className={"color-primary"}>
                    {"Manage OTP Access"}
                  </Typography.Text>
                  <Flex gap={10}>
                    <div></div>
                    <Radio.Group
                      block
                      options={[
                        {
                          label: "Activate OTP",
                          value: "activate"
                        },
                        {
                          label: "Deactivate OTP",
                          value: "deactivate"
                        }
                      ]}
                      onChange={(e) => setIsActivated(e.target.value === "activate" ? true : false)}
                      defaultValue={isActivated ? "activate" : "deactivate"}></Radio.Group>
                  </Flex>
                </Flex>

                {/* Button Group */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Button
                      htmlType="button"
                      size="large"
                      className="width100"
                      variant="outlined"
                      onClick={resetDashboard}>
                      Back{" "}
                    </Button>
                  </Col>
                  <Col span={12}>
                    <PopconfirmWrapper
                      title="Are you sure ?"
                      description={
                        <Typography.Text type="secondary">
                          {(isActivated ? "Activate OTP" : "Deactivate OTP") +
                            " for Associate Buyer"}
                        </Typography.Text>
                      }
                      onConfirm={hasEditPermission() && handleUpdate}
                      okText="Yes"
                      cancelText="No"
                      ChildComponent={
                        <Button
                          disabled={!hasEditPermission()}
                          size="large"
                          className="width100"
                          type="primary"
                          primary>
                          Update
                        </Button>
                      }
                      addTooltTip={!hasEditPermission()}
                      prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                    />
                  </Col>
                </Row>
              </Flex>
            </Flex>
          </Card>
        </Row>
      ) : (
        <SearchByFallbackComponent
          title={"Search by Associate Buyer Number / Reference Number"}
          subTitle={
            "Quickly search the Associate Buyer Number / Reference Number to process the Associate Buyer details."
          }
          image={searchByIcon}
        />
      )}
    </Spin>
  ) : (
    <></>
  );
};

export default ABNotPurchaseOtp;
