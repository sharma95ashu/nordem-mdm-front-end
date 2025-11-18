import { Col, Flex, Input, Pagination, Row, Table, Typography } from "antd";
import ExportBtn from "Components/Shared/ExportBtn";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { PermissionAction, snackBarErrorConf } from "Helpers/ats.constants";
import { actionsPermissionValidator, safeString, validationNumber } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";

const AbStopPayment = () => {
  const { apiService } = useServices();
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [searchPayload, setSearchPayload] = useState({});
  const [fetchData, setFetchedData] = useState([]);
  const [isSearchEnable, setISearchEnable] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(false);

  const columns = [
    {
      title: "AB ID",
      dataIndex: "ab_id",
      key: "ab_id",
      sorter: (a, b) => safeString(a.ab_id).localeCompare(safeString(b.ab_id)),
      render: (value) => (
        <Typography.Text className="textCapitalize">{value ?? "-"}</Typography.Text>
      )
    },
    {
      title: "AB Name",
      dataIndex: "ab_name",
      key: "ab_name",
      sorter: (a, b) => safeString(a.ab_name).localeCompare(safeString(b.ab_name)),
      render: (value) => (
        <Typography.Text className="textCapitalize">{value ?? "-"}</Typography.Text>
      )
    },
    {
      title: "Sponsor",
      dataIndex: "sponsor",
      key: "sponsor",
      sorter: (a, b) => safeString(a.sponsor).localeCompare(safeString(b.sponsor)),
      render: (value) => (
        <Typography.Text className="textCapitalize">{value ?? "-"}</Typography.Text>
      )
    },
    {
      title: "Sponsor Name",
      dataIndex: "sponser_name",
      key: "sponser_name",
      sorter: (a, b) => safeString(a.sponser_name).localeCompare(safeString(b.sponser_name)),
      render: (value) => (
        <Typography.Text className="textCapitalize">{value ?? "-"}</Typography.Text>
      )
    },
    {
      title: "Business",
      dataIndex: "business",
      key: "business",
      sorter: (a, b) => safeString(a.business).localeCompare(safeString(b.business)),
      render: (value) => (
        <Typography.Text className="textCapitalize">{value ?? "-"}</Typography.Text>
      )
    },
    {
      title: "Purchase",
      dataIndex: "purchase",
      key: "purchase",
      sorter: (a, b) => safeString(a.purchase).localeCompare(safeString(b.purchase)),
      render: (value) => (
        <Typography.Text className="textCapitalize">{value ?? "-"}</Typography.Text>
      )
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => safeString(a.date).localeCompare(safeString(b.date)),
      render: (value) => (
        <Typography.Text className="textCapitalize">{value ?? "-"}</Typography.Text>
      )
    },
    {
      title: "Commission Rate",
      dataIndex: "commission_rate",
      key: "commission_rate",
      sorter: (a, b) => safeString(a.commission_rate).localeCompare(safeString(b.commission_rate)),
      render: (value) => (
        <Typography.Text className="textCapitalize">{value ?? "-"}</Typography.Text>
      )
    },
    {
      title: "Performance Bonus",
      dataIndex: "performance_bonus",
      key: "performance_bonus",
      sorter: (a, b) =>
        safeString(a.performance_bonus).localeCompare(safeString(b.performance_bonus)),
      render: (value) => (
        <Typography.Text className="textCapitalize">{value ?? "-"}</Typography.Text>
      )
    },
    {
      title: "Royalty",
      dataIndex: "royalty",
      key: "royalty",
      sorter: (a, b) => safeString(a.royalty).localeCompare(safeString(b.royalty)),
      render: (value) => (
        <Typography.Text className="textCapitalize">{value ?? "-"}</Typography.Text>
      )
    },
    {
      title: "Technical",
      dataIndex: "technical",
      key: "technical",
      sorter: (a, b) => safeString(a.technical).localeCompare(safeString(b.technical)),
      render: (value) => (
        <Typography.Text className="textCapitalize">{value ?? "-"}</Typography.Text>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      fixed: "right"
      // Status column does not need safeString as per your request
    }
  ];

  // UseQuery hook for fetching financial year
  const { data: financialYearsList } = useQuery(
    "getFinancialYearsrsList",
    () => apiService.getFinancialYearsList(),
    {
      select: (data) => {
        if (data?.data) {
          return data?.data?.map((item) => ({
            label: `${item?.fiscal_year_start}-${item?.fiscal_year_end}`,
            value: item?.fiscal_year_code
          }));
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // fetch ab payment stop details
  const { mutate, isLoading } = useMutation(
    "fetchAbStopPaymentDetails",
    (payload) => apiService.getAbStopPaymentDetails(payload, current - 1, pageSize, searchValue),
    {
      onSuccess: (data) => {
        if (data?.data) {
          setFetchedData(data?.data || []);
          setTotal(data?.totalCount);
            setIsFirstLoad(true); // Set to false after the first call
        }
      },
      onError: (error) => {
        setFetchedData([]);
          setIsFirstLoad(false); // Ensure it's set to false on error as well
      }
    }
  );

  // handle search click
  const handleSearchBtnClick = (val) => {
    try {
      if (val) {
        setSearchPayload(val);
        mutate(val); // api call
      }
    } catch (error) {}
  };

  // handle search change / search clear
  const handleClear = () => {
    //
  };

  useEffect(() => {
    Object.keys(searchPayload).length > 0 && mutate(searchPayload); // api call
  }, [current, pageSize]);

  // handle search-input click
  const handleSearch = (values) => {
    try {
      if (values) {
        setSearchValue(values);
        setISearchEnable(true);

        current == 1
          ? mutate(searchPayload) // api call
          : setCurrent(1);
      }
    } catch (error) {
      //
    }
  };

  const handleChange = (e) => {
    try {
      const value = e.target.value;
      const updateSearchVal = new Promise((resolve, reject) => {
        setSearchValue(value);
        resolve(true);
      });
      updateSearchVal
        .then(() => {
          // If the input is cleared, trigger refetch
          if (isSearchEnable && !e.target.value) {
            setISearchEnable(false);
            current == 1
              ? mutate(searchPayload) // api call
              : setCurrent(1);
          }
        })
        .catch((err) => {
          //
        });
    } catch (error) {
      //
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <SearchByComponent
        moduleName={"ab_payment_detail"}
        handleSearchClick={handleSearchBtnClick}
        handleClear={handleClear}
        searchLoading={isLoading}
        isFirstLoad={isFirstLoad}
        dropdownOptions={financialYearsList}
      />

      <Row gutter={[20, 24]}>
        {isFirstLoad ? (
          <div className="kyc_admin_base">
            <Col span={24}>
              <Flex justify="space-between">
                <ExportBtn
                  columns={columns}
                  fetchData={fetchData}
                  fileName={"AssociateBuyerStopPaymentDetail"}
                />
                <Input.Search
                  onSearch={handleSearch}
                  onChange={handleChange}
                  onInput={validationNumber}
                  value={searchValue}
                  className="removeMargin"
                  size="large"
                  allowClear
                  placeholder="Search by Business, Purchase, Commission Rate, Performance Bonus, Royalty, and Technical..."></Input.Search>
              </Flex>
            </Col>
            <Col span={24}>
              <Table
                columns={columns}
                scroll={{
                  x: "max-content"
                }}
                dataSource={fetchData}
                bordered
                pagination={false}
              />
            </Col>
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
        ) : (
          <SearchByFallbackComponent
            title={"Search by Associate Buyer Number / Reference Number"}
            subTitle={
              "Quickly search the Associate Buyer Number / Reference Number to process the Associate Buyer Payment Detail"
            }
            image={searchByIcon}
          />
        )}
      </Row>
    </>
  ) : (
    <></>
  );
};

export default AbStopPayment;
