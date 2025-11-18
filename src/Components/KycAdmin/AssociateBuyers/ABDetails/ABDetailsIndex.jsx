import SearchByComponent from "Components/Shared/SearchByComponent";
import { useServices } from "Hooks/ServicesContext";
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import UserProfileCard from "../../UserProfileCard";
import { Card, Col, Flex, Row, Spin, Tabs, Typography } from "antd";
import ABDetail from "./ABDetail";
import ABLedger from "./ABLedger";
import ABRepurchase from "./ABRepurchase";
import { actionsPermissionValidator, modifyCustomerResponse } from "Helpers/ats.helper";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";
import { PermissionAction } from "Helpers/ats.constants";

const ABDetailsIndex = () => {
  const [searchParams] = useSearchParams();
  const [payload, setPayload] = useState(null);
  const [financialYearsListData, setFinancialYearsListData] = useState([]);
  const [show, setShow] = useState(false);
  const [customerData, setCustomerData] = useState({});
  const [activeTab, setActiveTab] = useState("1");
  const { apiService } = useServices();
  const abId = searchParams.get("ab_id");
  const searchRef = useRef();
  const navigate = useNavigate();

  // Leader and Repurchase
  const [ledgerFinancialYear, setLedgerFinancialYear] = useState(null);
  const [repurchaseFinancialYear, setRepurchaseFinancialYear] = useState(null);

  // useQuery to fetch data
  const { isLoading } = useQuery(
    ["fetchAbDetailsByABNo", payload],
    () => apiService.getAssociateDetailsByAbNo(payload),
    {
      enabled: !!payload, // Fetch only when payload is available
      onSuccess: (data) => {
        if (data?.data) {
          // Modifying Customer Data for UI
          let response = modifyCustomerResponse(data?.data);
          setCustomerData(response);
          setActiveTab("1"); // Set the 1st Tab to be viisible
          setShow(true); // Show Dashboard
        } else {
          return {};
        }
      },
      onError: (error) => {
        setShow(false); // Hide Dashboard
      }
    }
  );

  // clear the param from URL
  const removeSearchParams = (paramName) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete(paramName);
    navigate({ pathname: location.pathname, search: searchParams.toString() });
  };

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

  // handle search change / search clear
  const handleClear = () => {
    // setPayload(null);
  };

  // this will be triggered on change in Search Input Box...
  useEffect(() => {
    removeSearchParams("ab_id");
    setLedgerFinancialYear(null); // clear the selected year
    setRepurchaseFinancialYear(null); // clear the selected year
  }, [payload]);

  // Set payload to DIST NO. if params exist
  useEffect(() => {
    if (abId) {
      // Set Value in the input box
      if (searchRef.current) {
        searchRef.current.setFormField("search_by", abId);
      }
      // Set payload, to make API call with the query search param dist no.
      setPayload({
        dist_no: abId
      });
    }
  }, [abId]);

  // downLine api
  useQuery("financialYearsList", () => apiService.getFinancialYearsList(), {
    enabled: payload ? true : false, // fetching year list when payload is exists!
    onSuccess: (data) => {
      if (data?.success) {
        const list = data?.data?.map((item) => ({
          label: `${item?.fiscal_year_start}-${item?.fiscal_year_end}`,
          value: item?.fiscal_year_code
        }));

        setFinancialYearsListData(list);
      }
    },
    onError: (error) => {
      console.log(error);
    }
  });

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Tabs
  const items = [
    {
      key: "1",
      label: <Typography.Text className="font-size-16">AB Detail</Typography.Text>,
      children: (
        <>
          <ABDetail ABDetails={customerData || {}} />
        </>
      )
    },
    {
      key: "2",
      label: <Typography.Text className="font-size-16">AB Ledger</Typography.Text>,
      children: (
        <>
          <ABLedger
            dist_no={customerData?.dist_no}
            financialYearsListData={financialYearsListData}
            financialYear={ledgerFinancialYear}
            setFinancialYear={setLedgerFinancialYear}
          />
        </>
      )
    },
    {
      key: "3",
      label: <Typography.Text className="font-size-16">AB Repurchase</Typography.Text>,
      children: (
        <>
          <ABRepurchase
            dist_no={customerData?.dist_no}
            financialYearsListData={financialYearsListData}
            financialYear={repurchaseFinancialYear}
            setFinancialYear={setRepurchaseFinancialYear}
          />
        </>
      )
    }
  ];

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={isLoading}>
      <SearchByComponent
        moduleName={"associate_buyer_detail"}
        handleSearchClick={handleSearchClick}
        searchLoading={isLoading}
        handleClear={handleClear}
        ref={searchRef}
      />
      {show ? (
        <Row gutter={[20, 12]}>
          <Col span={24}></Col>
          <Card className="fullWidth">
            <Flex gap={24} vertical={true}>
              <UserProfileCard className="fullWidth" userDetails={customerData} />
              <div className="kycTab">
                <Tabs
                  activeKey={activeTab}
                  defaultActiveKey="1"
                  items={items}
                  onChange={handleTabChange}
                />
              </div>
            </Flex>
          </Card>
        </Row>
      ) : (
        <SearchByFallbackComponent
          title={"Search by Associate Buyer Number / Reference Number"}
          subTitle={
            "Quickly search the Associate Buyer Number / Reference Number to retrieve the relevant details and deactivate the corresponding AB ID."
          }
          image={searchByIcon}
        />
      )}
    </Spin>
  ) : (
    <></>
  );
};

export default ABDetailsIndex;
