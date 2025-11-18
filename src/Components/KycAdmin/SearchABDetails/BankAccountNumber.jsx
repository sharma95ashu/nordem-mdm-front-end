import { Col, Row, Table, Typography } from "antd";
import React, { useState } from "react";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { useServices } from "Hooks/ServicesContext";
import { useQuery } from "react-query";
import ExportBtn from "Components/Shared/ExportBtn";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { PermissionAction } from "Helpers/ats.constants";

// Search by - Bank Account Number component
const BankAccountNumber = () => {
  const [payload, setPayload] = useState(null);
  const { apiService } = useServices();

  const columns = [
    {
      title: "AB No.",
      dataIndex: "ab_no",
      key: "ab_no",
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "AB Name",
      dataIndex: "ab_name",
      key: "ab_name",
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Bank Code",
      dataIndex: "bank_code",
      key: "bank_code",
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Branch Code",
      dataIndex: "branch_code",
      key: "branch_code",
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Account No.",
      dataIndex: "account_no",
      key: "account_no",
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Bank Name",
      dataIndex: "bank_name",
      key: "bank_name",
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Branch Name",
      dataIndex: "branch_name",
      key: "branch_name",
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    }
  ];

  // useQuery to fetch data
  const { data: fetchData, isLoading } = useQuery(
    ["fetchAbDetailsByBankAccNo", payload],
    () => apiService.getAbDetailsByBankAccNo(payload),
    {
      enabled: !!payload, // Fetch only when payload is available
      select: (data) => data?.data || [],
      onError: (error) => {
        //
      }
    }
  );

  // handle search click
  const handleSearchClick = (val) => {
    try {
      if (val) {
        const payload = {
          search_by: "bank_acc_no",
          value: val
        };
        setPayload(payload);
      }
    } catch (error) {}
  };

  // handle search change / search clear
  const handleClear = () => {
    //
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <SearchByComponent
        moduleName={"bank_account_number"}
        handleSearchClick={handleSearchClick}
        handleClear={handleClear}
        searchLoading={isLoading}
        searchInputField={true}
      />
      <Row gutter={[20, 24]}>
        {fetchData ? (
          <div className="kyc_admin_base">
            <Col span={24}>
              <ExportBtn
                columns={columns}
                fetchData={fetchData}
                fileName={"Bank Account Number details"}
              />
            </Col>
            <Col span={24}>
              <Table columns={columns} dataSource={fetchData} bordered pagination={false} />
            </Col>
          </div>
        ) : (
          <>
            <Col span={24}></Col>
            <SearchByFallbackComponent
              title={"Search by Bank Account Number"}
              subTitle={
                "Quickly search the Bank account number to process the Associate Buyer's details."
              }
            />
          </>
        )}
      </Row>
    </>
  ) : (
    <></>
  );
};

export default BankAccountNumber;
