import { Button, Card, Col, Flex, Row, Spin, Tabs } from "antd";
import ABDetail from "Components/KycAdmin/AssociateBuyers/ABDetails/ABDetail";
import ABLedger from "Components/KycAdmin/AssociateBuyers/ABDetails/ABLedger";
import ABRepurchase from "Components/KycAdmin/AssociateBuyers/ABDetails/ABRepurchase";
import UserProfileCard from "Components/KycAdmin/UserProfileCard";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import {
  actionsPermissionValidator,
  hasEditPermission,
  modifyCustomerResponse
} from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
// import { KYC_TERMINATE_REMARK } from "Helpers/ats.constants";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";
import TerminationDialog from "./TerminationDialog";
import TextArea from "antd/es/input/TextArea";
import { enqueueSnackbar } from "notistack";
import { MESSAGES, PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { TooltipWrapper } from "Components/Shared/Wrappers/TooltipWrapper";
import { PopconfirmWrapper } from "Components/Shared/Wrappers/PopConfirmWrapper";

export const TerminateButtonGroup = ({
  distNumber,
  isTerminated,
  setShowDashboard,
  handleRestore,
  resetSearchBar,
  setRemark,
  searchRef
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const { apiService } = useServices();

  // reset dashboard
  const resetDashboard = () => {
    if (searchRef.current) {
      resetSearchBar(); // clear search field
      setShowDashboard(false); // hide dashbaord
    }
  };

  return (
    <>
      <Flex gap={24} vertical style={{ marginTop: "24px" }}>
        {isTerminated && (
          <TextArea
            rows={4}
            placeholder="Enter Remarks Here"
            onChange={(e) => setRemark(e.target.value)}
          />
        )}

        {/* Button Group */}
        <Row gutter={16}>
          <Col span={12}>
            <Button
              onClick={resetDashboard}
              htmlType="button"
              size="large"
              className="fullWidth"
              variant="outlined">
              Back{" "}
            </Button>
          </Col>

          {isTerminated ? (
            // Reactivate Button
            <Col span={12}>
              <PopconfirmWrapper
                title="Restore AB"
                description="Are you sure you want to Restore AB?"
                onConfirm={hasEditPermission() && handleRestore}
                okText="Yes"
                cancelText="No"
                ChildComponent={
                  <Button
                    htmlType="button"
                    disabled={!hasEditPermission()}
                    className="fullWidth"
                    size="large"
                    type="primary"
                    primary>
                    Restore AB
                  </Button>
                }
                addTooltTip={!hasEditPermission()}
                prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
              />
            </Col>
          ) : (
            // Terminate Button
            <Col span={12}>
              <TooltipWrapper
                ChildComponent={
                  <Button
                    onClick={() => setShowDialog(true)}
                    disabled={!hasEditPermission()}
                    htmlType="button"
                    className="fullWidth"
                    size="large"
                    type="primary"
                    primary>
                    Add Remarks & Terminate AB
                  </Button>
                }
                addTooltTip={!hasEditPermission()}
                prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
              />
            </Col>
          )}
        </Row>
      </Flex>

      {/* Terminate Ab Modal Dialog */}
      <TerminationDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        distNumber={distNumber}
        resetSearchBar={resetSearchBar}
        setShowDashboard={setShowDashboard}
        isTerminated={isTerminated}
        updateTerminationAPIMethod={apiService.updateABTerminationStatus}
        module={"terminate-ab"}
      />
    </>
  );
};

const TerminateAb = () => {
  const [payload, setPayload] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [customerData, setCustomerData] = useState({});
  const [remark, setRemark] = useState("");
  const [financialYearsListData, setFinancialYearsListData] = useState([]);
  const { apiService } = useServices();
  const searchRef = useRef();
  const [activeTab, setActiveTab] = useState("1");

  // Leader and Repurchase
  const [ledgerFinancialYear, setLedgerFinancialYear] = useState(null);
  const [repurchaseFinancialYear, setRepurchaseFinancialYear] = useState(null);

  // useQuery to fetch data
  const { isLoading } = useQuery(
    ["fetchAbDetailsByABNo", payload],
    () => apiService.getAbDetailsForTermination(payload),
    {
      enabled: !!payload, // Fetch only when payload is available
      onSuccess: (data) => {
        if (data?.data) {
          setCustomerData(modifyCustomerResponse(data?.data)); // Modifying Customer Data for UI
          setActiveTab("1"); // Set the 1st Tab to be viisible
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

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // this will be triggered on change in Search Input Box...
  useEffect(() => {
    setLedgerFinancialYear(null); // clear the selected year
    setRepurchaseFinancialYear(null); // clear the selected year
  }, [payload]);

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

  // Reset Search Feild
  const resetSearchBar = () => {
    // reset search field
    if (searchRef.current) {
      searchRef.current.resetFields();
      setPayload(null);
    }
  };

  // Handle Restore AB Click
  const handleRestore = () => {
    const request = {
      dist_no: customerData.dist_no,
      ...(remark && { remark })
    };

    // API call
    restoreUserMutation(request);
  };

  // financial Years List Api
  useQuery("financialYearsList", () => apiService.getFinancialYearsList(), {
    enabled: payload ? true : false, // fetching year list when payload is exists!
    onSuccess: (data) => {
      if (data?.success) {
        // Modifying the response for dropdown options
        const list = data?.data?.map((item) => ({
          label: `${item?.fiscal_year_start}-${item?.fiscal_year_end}`,
          value: item?.fiscal_year_code
        }));

        // setting the data for dropdown list
        setFinancialYearsListData(list);
      }
    },
    onError: (error) => {
      console.log(error);
    }
  });

  // Api method - Restore User
  const { mutate: restoreUserMutation, isLoading: restoreUserLoading } = useMutation(
    (request) => apiService.updateABTerminationStatus(request),
    {
      // Update confirmation
      onSuccess: ({ success, message }) => {
        if (success) {
          enqueueSnackbar(message, snackBarSuccessConf); // show confirmation
          resetSearchBar(); // reset search bar field
          setShowDashboard(false); // hide dashboard
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // Tab Items
  const items = [
    {
      key: "1",
      label: "AB Detail",
      children: (
        <>
          <ABDetail ABDetails={customerData || {}} />
          <TerminateButtonGroup
            distNumber={customerData.dist_no}
            isTerminated={customerData.is_terminated}
            searchRef={searchRef}
            setShowDashboard={setShowDashboard}
            handleRestore={handleRestore}
            setRemark={setRemark}
            resetSearchBar={resetSearchBar}
          />
        </>
      )
    },
    {
      key: "2",
      label: "AB Ledger",
      children: (
        <>
          <ABLedger
            dist_no={customerData?.dist_no}
            financialYearsListData={financialYearsListData}
            financialYear={ledgerFinancialYear}
            setFinancialYear={setLedgerFinancialYear}
          />
          <TerminateButtonGroup
            distNumber={customerData.dist_no}
            isTerminated={customerData.is_terminated}
            searchRef={searchRef}
            setShowDashboard={setShowDashboard}
            handleRestore={handleRestore}
            setRemark={setRemark}
            resetSearchBar={resetSearchBar}
          />
        </>
      )
    },
    {
      key: "3",
      label: "AB Repurchase",
      children: (
        <>
          <ABRepurchase
            dist_no={payload?.dist_no}
            financialYearsListData={financialYearsListData}
            financialYear={repurchaseFinancialYear}
            setFinancialYear={setRepurchaseFinancialYear}
          />
          <TerminateButtonGroup
            distNumber={customerData.dist_no}
            isTerminated={customerData.is_terminated}
            searchRef={searchRef}
            setShowDashboard={setShowDashboard}
            handleRestore={handleRestore}
            setRemark={setRemark}
            resetSearchBar={resetSearchBar}
          />
        </>
      )
    }
  ];

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={isLoading || restoreUserLoading}>
      <SearchByComponent
        moduleName={"terminate_ab"}
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
                <Tabs
                  activeKey={activeTab}
                  onChange={handleTabChange}
                  defaultActiveKey="1"
                  items={items}
                  size="large"
                />
              </div>
            </Flex>
          </Card>
        </Row>
      ) : (
        <SearchByFallbackComponent
          title={"Search by Associate Buyer Number / Reference Number"}
          subTitle={
            "Quickly search the Associate Buyer Number / Reference Number to process the Terminate AB details."
          }
          image={searchByIcon}
        />
      )}
    </Spin>
  ) : (
    <></>
  );
};

export default TerminateAb;
