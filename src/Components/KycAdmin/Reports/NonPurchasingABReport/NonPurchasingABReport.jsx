import { Alert, Col, Flex, Input, Pagination, Row, Table, Typography } from "antd";
import SearchByComponent from "Components/Shared/SearchByComponent";
import { PermissionAction } from "Helpers/ats.constants";
import { actionsPermissionValidator, getDateTimeFormat, safeString } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { KycAdminPaths } from "Router/KYCAdminPaths";
import { Link as RouterLink } from "react-router-dom";

const NonPurchasingABReport = () => {
  const { apiService } = useServices();
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchEnable, setISearchEnable] = useState(false);

  // table columns
  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "sr_no",
      key: "sr_no",
      sorter: (a, b) => a.sr_no - b.sr_no,
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "AB No.",
      dataIndex: "associate_buyer_no",
      key: "associate_buyer_no",
      sorter: (a, b) => Number(a.associate_buyer_no) - Number(b.associate_buyer_no),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "AB Name",
      dataIndex: "ab_name",
      key: "ab_name",
      sorter: (a, b) => safeString(a.ab_name).localeCompare(safeString(b.ab_name)),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "Join Date",
      dataIndex: "join_date",
      key: "join_date",
      sorter: (a, b) => new Date(a?.join_date).getTime() - new Date(b?.join_date).getTime(),
      render: (text) => <Typography.Text>{text}</Typography.Text>
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      sorter: (a, b) =>
        safeString(a.associate_buyer_name).localeCompare(safeString(b.associate_buyer_name)),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      sorter: (a, b) => safeString(a.district).localeCompare(safeString(b.district)),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      sorter: (a, b) => safeString(a.state).localeCompare(safeString(b.state)),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "Mobile No.",
      dataIndex: "ab_phone",
      key: "ab_phone",
      sorter: (a, b) => Number(a.ab_phone) - Number(b.ab_phone),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "Terminate Date",
      dataIndex: "terminated_on",
      key: "terminated_on",
      sorter: (a, b) => new Date(a?.terminated_on).getTime() - new Date(b?.terminated_on).getTime(),
      render: (text) => <Typography.Text>{text}</Typography.Text>
    },
    {
      title: "Terminate Reason",
      dataIndex: "terminated_due_to",
      key: "terminated_due_to",
      sorter: (a, b) =>
        safeString(a.terminated_due_to).localeCompare(safeString(b.terminated_due_to)),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    }
  ];

  // fetch assocaite buyer report data
  const { mutate: getNonPurchasingABReport } = useMutation(
    (data) => apiService.getNonPurchasingABReport(data),
    {
      // Configuration options for the mutation
      onSuccess: (res) => {
        if (res?.data) {
          const tempArr = res?.data?.map((item, index) => ({
            sr_no: index + 1, // Add serial number starting from 1
            ...item,
            join_date: item?.join_date ? getDateTimeFormat(item?.join_date, "DD MMM, YYYY") : null,
            terminated_on: item?.terminated_on
              ? getDateTimeFormat(item?.terminated_on, "DD MMM, YYYY")
              : null
          }));
          setDataSource(tempArr);
          setTotal(res?.totalCount); // set total count
        }
      },
      onError: (error) => {
        setTotal(0);
        setDataSource([]);
        console.log(error);
      }
    }
  );

  // handle search change
  const handleChange = (e) => {
    try {
      if (e) {
        const value = e.target.value;
        // Update the state with the numeric value
        setSearchValue(value);
      }

      // If the input is cleared, trigger refetch
      if (isSearchEnable && !e.target.value) {
        const data = {
          page: current - 1,
          pageSize: pageSize
        };
        setISearchEnable(false);
        current == 1 ? getNonPurchasingABReport(data) : setCurrent(1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle search
  const handleSearch = (values) => {
    try {
      const trimmedValue = values?.trim();
      if (!trimmedValue) return;
      setSearchValue(values);
      const data = {
        page: current - 1,
        pageSize: pageSize,
        searchTerm: values
      };
      current == 1 ? getNonPurchasingABReport(data) : setCurrent(1);
      setISearchEnable(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const data = {
      page: current - 1,
      pageSize: pageSize,
      ...(searchValue && { searchTerm: searchValue })
    };
    getNonPurchasingABReport(data);
  }, [current, pageSize]);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <SearchByComponent moduleName={"non_pruchasing_ab_report"} />
      <Row gutter={[20, 24]}>
        <div className="kyc_admin_base">
          <Flex gap={18} vertical>
            <Alert
              className="bordered__info__alert"
              message={
                <span>
                  Note: This report only includes users who have not made any purchases in the last
                  [6 months], for all terminated users list please refer to{" "}
                  <RouterLink to={"/" + KycAdminPaths.allTermination}>
                    <b>All Termination Report.</b>
                  </RouterLink>{" "}
                </span>
              }
              type="info"
              showIcon
            />
            <div></div>
          </Flex>

          <Flex justify="flex-start" align="flex-start" gap={10}>
            <Input.Search
              allowClear
              className="marginBottom16"
              size="large"
              maxLength={50}
              value={searchValue}
              onSearch={handleSearch}
              onChange={handleChange}
              placeholder="Search by Associate Buyer Number or Name"></Input.Search>
          </Flex>
          <div style={{ position: "relative" }}>
            <Table
              columns={columns}
              dataSource={dataSource}
              bordered
              pagination={false}
              scroll={{ x: "max-content" }}
            />
            <Col span={24}>
              <div className="paginationStyle">
                <Pagination
                  align="end"
                  total={total}
                  showTotal={(total) => `Total ${total} items`}
                  current={current}
                  onChange={(newPage, newPageSize) => {
                    setCurrent(newPage);
                    setPageSize(newPageSize);
                  }}
                  showSizeChanger={true}
                  showQuickJumper
                />
              </div>
            </Col>
          </div>
        </div>
      </Row>
    </>
  ) : (
    <></>
  );
};

export default NonPurchasingABReport;
