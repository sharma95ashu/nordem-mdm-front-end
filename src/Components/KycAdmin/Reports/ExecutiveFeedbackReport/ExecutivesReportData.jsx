import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Col, Flex, Input, Radio, Spin, Table, Typography } from "antd";
import Title from "antd/es/typography/Title";
import ExportBtn from "Components/Shared/ExportBtn";
import { safeString } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KycAdminPaths } from "Router/KYCAdminPaths";

const searchByOptions = [
  { label: "Rejected ID's", value: "rejected" },
  { label: "Approved ID's", value: "approved" }
];

const getModifiedString = (arrayList, key) => {
  return Array.isArray(arrayList)
    ? arrayList
        ?.map((a) => a[key])
        ?.join(", ")
        ?.replace(/\s+/g, " ")
    : arrayList?.replace(/\s+/g, " ")?.toString() || "";
};

const ExecutivesReportData = () => {
  // Query Params
  const [searchParams, setSearchParams] = useSearchParams();
  const params = {
    id: searchParams.get("id"),
    start: searchParams.get("start"),
    end: searchParams.get("end"),
    name: searchParams.get("name"),
    record_type: searchParams.get("record_type")
  };

  const [selectedTab, setSelectedTab] = useState(params?.record_type ?? "rejected");
  const navigate = useNavigate();
  const { apiService } = useServices();
  const [filterData, setFilterData] = useState({ rejected: null, approved: null });
  const [tabData, setTabData] = useState({ rejected: [], approved: [] });
  const [searchValue, setSearchValue] = useState("");
  const [pagination, setPagination] = useState({
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "50", "100"],
    showTotal: (total, range) => `Total ${total} items`,
    onShowSizeChange: (current, size) => {
      setPagination((prevPagination) => ({ ...prevPagination, pageSize: size }));
    }
  });

  const columns = [
    {
      title: "AB ID",
      dataIndex: "ab_id",
      key: "ab_id",
      sorter: (a, b) => safeString(a.ab_id).localeCompare(safeString(b.ab_id)),
      render: (text, record) => (
        <>
          {record?.final_exec_status ? (
            <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
          ) : (
            <Link
              to={`/${KycAdminPaths.executiveFeedback_UserProfile}?ab_id=${record?.ab_id}&exec_name=${params?.name}&ab_name=${record?.ab_name}`}
              className="underline">
              {text}
            </Link>
          )}
        </>
      )
    },
    {
      title: "AB Name",
      dataIndex: "ab_name",
      key: "ab_name",
      sorter: (a, b) => safeString(a.ab_name).localeCompare(safeString(b.ab_name)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Reason",
      dataIndex: "reasons",
      key: "reasons",
      width: 600,
      sorter: (a, b) => safeString(a.reasons).localeCompare(safeString(b.reasons)),
      render: (text) => <Typography.Text type="secondary">{text || "-"}</Typography.Text>
    },
    {
      title: "Remarks",
      dataIndex: "remark",
      key: "remark",
      sorter: (a, b) => safeString(a.remark).localeCompare(safeString(b.remark)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    }
  ];

  const helpers = {
    isValueExist: (o, k, value) => {
      let val = getModifiedString(o[k], k === "reasons" ? "description" : "");
      return val?.toLowerCase().includes(getModifiedString(value, "")?.toLowerCase())
        ? true
        : false;
    },
    canFetchRecords: () => {
      let canFetch = !!params?.id && !!params?.start && !!params?.end ? true : false; // only making the api call if ID, Start date and End date is present...
      return canFetch;
    }
  };

  // handle Search
  const handleSearch = (value) => {
    try {
      //allowed keys for search
      const allowedKeys = ["ab_id", "ab_name", "reasons", "remark"];
      const filterTable =
        tabData[selectedTab].length > 0 &&
        tabData[selectedTab].filter((o) =>
          Object.keys(o).some((k) => {
            // Check if the key matches any of the specified columns and if the value contains the search text
            if (allowedKeys.includes(k) && helpers.isValueExist(o, k, value)) {
              return true;
            }
            return false;
          })
        );
      // setFilterData(filterTable);
      setFilterData((prevData) => ({ ...prevData, [selectedTab]: filterTable }));
    } catch (error) {
      // Handle error
      console.log(error);
    }
  };

  // function to handle search on key down or backspace
  const handleKeyDown = (e) => {
    if (e.nativeEvent.inputType === "deleteContentBackward") {
      if (e.target?.value?.length === 0) {
        // setFilterData(null);
        setFilterData((prevData) => ({ ...prevData, [selectedTab]: null }));
      }
    }
  };

  // Function to fetch Executive records
  const { isLoading: recordsFetchLoading } = useQuery(
    ["getRecords", selectedTab],
    () =>
      apiService.getApprovedRejectedKYCs({
        executive_id: params?.id,
        status: selectedTab,
        start_date: params?.start,
        end_date: params?.end
      }),
    {
      // staleTime: 30 * 1000, // 30 seconds
      // cacheTime: 30 * 1000, // 30 seconds
      enabled: helpers.canFetchRecords(), // checking if we can fetch the records...
      onSuccess: (data) => {
        if (data?.success) {
          /**
           *  Removing the "reasons" key and Adding a additional key to stringfy reasons....
           *  REASON - the "reasons" key is ARRAY type and we need String...
           */

          const newData = [];
          data?.data?.forEach((record) => {
            const { ab_id, ab_name, reasons, ...otherData } = record || {};
            newData.push({
              ab_id,
              ab_name,
              reasons: getModifiedString(reasons, "description") ?? "-",
              ...otherData
            });
          });

          // Store fetched data in the tabData object
          setTabData((prevData) => ({ ...prevData, [selectedTab]: newData }));
          setFilterData((prevData) => ({ ...prevData, [selectedTab]: null }));
        }
      },
      onError: (error) => {
        setFilterData((prevData) => ({ ...prevData, [selectedTab]: null }));
        setTabData((prevData) => ({ ...prevData, [selectedTab]: [] }));
        console.log(error);
      }
    }
  );

  // useEffect to get the records on tab change
  useEffect(() => {
    // updating the [record_type] search param in the URL - toggling "approved" or "rejected"...
    searchParams.set("record_type", selectedTab);
    setSearchParams(searchParams);
  }, [selectedTab]);

  const handleBackBtnClick = () => {
    navigate(`/${KycAdminPaths.executiveFeedback_Report}?start=${params.start}`);
  };

  return (
    <Spin spinning={recordsFetchLoading}>
      <Flex gap={12} vertical>
        <div></div>
        <Flex gap={24} vertical>
          {/* Breadcrumbs */}
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              Executive Feedback
            </Typography.Title>
            <Typography.Text className="removeMargin">
              <Typography.Text type="secondary">KYC / </Typography.Text>
              <Typography.Text type="secondary">Executive Feedback /</Typography.Text> View{" "}
              {params?.name && `${params?.name}'s`} Report
            </Typography.Text>
          </Flex>

          {/* Card */}
          <Card>
            <Flex gap={24} vertical>
              <Flex align="center" gap={12}>
                <Button onClick={handleBackBtnClick}>
                  <ArrowLeftOutlined />
                  Back
                </Button>
                <Title level={5} className="margin-bottom-0">
                  View {params?.name && `${params?.name}'s`} Report
                </Title>
              </Flex>

              <Flex gap={16} vertical>
                <Radio.Group
                  className="fullWidth__radio-buttons"
                  block
                  options={searchByOptions}
                  defaultValue={params?.record_type ?? "rejected"}
                  optionType="button"
                  onChange={(e) => {
                    setSelectedTab(e.target.value); // setting the toggle value
                    setSearchValue(null); // clearing the search field
                    setFilterData((prevData) => ({ ...prevData, [selectedTab]: null })); // setting filter data to null to update all the records
                  }}
                />
                <Flex gap={0} vertical>
                  <Col span={24}>
                    <Flex justify="space-between">
                      <ExportBtn
                        columns={columns}
                        fetchData={
                          filterData[selectedTab] != null
                            ? filterData[selectedTab]
                            : tabData[selectedTab]
                        }
                        fileName={`${params?.name}-feedback-${selectedTab}-report`}
                      />
                      <Input.Search
                        maxLength={50}
                        size="large"
                        value={searchValue}
                        placeholder="Search..."
                        onSearch={handleSearch}
                        allowClear
                        onChange={(e) => setSearchValue(e.target.value)}
                        onInput={handleKeyDown}></Input.Search>
                    </Flex>
                  </Col>
                  <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                    <Table
                      dataSource={
                        filterData[selectedTab] != null
                          ? filterData[selectedTab]
                          : tabData[selectedTab]
                      }
                      columns={columns}
                      bordered
                      scroll={{
                        x: "max-content"
                      }}
                      pagination={pagination}
                    />
                  </Col>
                </Flex>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Flex>
    </Spin>
  );
};

export default ExecutivesReportData;
