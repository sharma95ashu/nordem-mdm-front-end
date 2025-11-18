import { FilterOutlined } from "@ant-design/icons";
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Table,
  Typography
} from "antd";
import ExportBtn from "Components/Shared/ExportBtn";
import { DATEFORMAT } from "Helpers/ats.constants";
import { disableFutureDates } from "Helpers/ats.helper";
import { useMemo } from "react";

export const ChooseLeadForVerification = ({
  assignNewKYCToExecutive,
  columns,
  pagination,
  KYCLeads,
  allKYCLeads,
  applyFilter,
  showFilterCard,
  filterForm,
  toggleFilterCard,
  filterCount,
  resetAllFilter,
  handleSearch,
  handleKeyDown
}) => {
  const hasPending = useMemo(() => {
    return allKYCLeads?.find((e) => e?.feedback_status === "pending") ?? false;
  }, [allKYCLeads]);

  return (
    <Card>
      <Flex vertical gap={24}>
        {/* Header */}

        <Flex gap={24} justify="space-between" align="center">
          <Typography.Title level={5} className="removeMargin">
            Start Your KYC Process Now
          </Typography.Title>
          {hasPending && (
            <Alert
              className="marquee-alert"
              message={
                <marquee>
                  A KYC Lead with No. {hasPending?.associate_buyer_no} is already assigned to you
                </marquee>
              }
              type="warning"
              showIcon
            />
          )}
          <Button
            type="primary"
            size="large"
            onClick={assignNewKYCToExecutive}
            disabled={hasPending}>
            Get KYC
          </Button>
        </Flex>

        {/* Filter */}

        <Row gutter={[24]}>
          <Col span={12}>
            <Flex justify="flex-start" align="flex-start" gap={10}>
              <Badge dot={!!filterCount}>
                <Button size="large" onClick={toggleFilterCard}>
                  <FilterOutlined />
                  {/* Filter */}
                  {filterCount ? `Filters (${filterCount})` : "Filters"}
                </Button>
              </Badge>

              <ExportBtn
                columns={columns}
                fetchData={KYCLeads}
                fileName={`${KYCLeads[0] ? KYCLeads[0].user_name + "-" : "-"}Verification-Leads`}
              />
            </Flex>
          </Col>
          <Col span={12}>
            <Input.Search
              allowClear
              className="marginBottom16"
              size="large"
              maxLength={50}
              onSearch={handleSearch}
              onInput={handleKeyDown}
              placeholder="Search..."></Input.Search>
          </Col>
        </Row>

        {/* Show Filter */}
        {showFilterCard && (
          <Card className="verification__filter__card">
            <Form form={filterForm} layout="vertical" className="fullWidth" onFinish={applyFilter}>
              <Flex vertical gap={12}>
                <Flex align="center" justify="space-between">
                  <Typography.Title level={5}>
                    {" "}
                    {filterCount ? `Filters (${filterCount})` : "Filters"}
                  </Typography.Title>
                  <Flex gap={12}>
                    <Button size="large" onClick={resetAllFilter} htmlType="button">
                      Clear All
                    </Button>
                    <Button size="large" type="primary" htmlType="submit">
                      Apply Filter
                    </Button>
                  </Flex>
                </Flex>
                <Row gutter={[120]}>
                  <Col span={12}>
                    <Form.Item
                      className="margin-bottom-0"
                      label="Date"
                      name="date"
                      rules={[
                        {
                          required: true,
                          message: "This field is required."
                        }
                      ]}>
                      <DatePicker
                        size="large"
                        placeholder="Select date"
                        className="fullWidth"
                        disabledDate={disableFutureDates}
                        format={DATEFORMAT.RANGE_FORMAT}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      className="margin-bottom-0"
                      style={{ marginTop: "var(--ant-margin)" }}
                      label="Status"
                      name="status">
                      <Checkbox.Group
                        options={[
                          { label: "In Progress", value: "pending" },
                          { label: "Verified", value: "approved" },
                          { label: "Rejected", value: "rejected" }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Flex>
            </Form>
          </Card>
        )}

        {/* Table */}

        <Table
          columns={columns}
          dataSource={KYCLeads}
          bordered
          pagination={pagination}
          scroll={{ x: "max-content" }}
        />
      </Flex>
    </Card>
  );
};
