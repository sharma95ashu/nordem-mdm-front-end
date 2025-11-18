import { Button, Card, Col, Flex, Form, Input, Row, Table, Typography } from "antd";
import React, { useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import {
  actionsPermissionValidator,
  getDateTimeFormat,
  validateABAndReferenceNumber,
  validationNumber
} from "Helpers/ats.helper";
import ExportBtn from "Components/Shared/ExportBtn";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";
import { abNoMaxLength, PermissionAction } from "Helpers/ats.constants";

const DeclarationReport = () => {
  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [declarationForm] = Form.useForm();
  const { apiService } = useServices();
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

  // Table columns
  const columns = [
    {
      title: "Join Date",
      dataIndex: "join_date",
      key: "join_date",
      render: (join_date) => (
        <Typography.Text type="secondary">{join_date}</Typography.Text>
      )
    },

    {
      title: "Associate Buyer Number",
      dataIndex: "associate_buyer_number",
      key: "associate_buyer_number",
      render: (associate_buyer_number) => <Typography.Text type="secondary">{associate_buyer_number}</Typography.Text>
    },
    {
      title: "Associate Buyer Name",
      dataIndex: "associate_buyer_name",
      key: "associate_buyer_name",
      render: (associate_buyer_name) => <Typography.Text type="secondary">{associate_buyer_name}</Typography.Text>
    }
  ];

  // handle search click
  const handleSearchClick = (values) => {
    try {
      // api call to fetch report data
      getDeclarationReportData(values);
    } catch (error) {
      console.log(error);
    }
  };

  // Api method
  const { mutate: getDeclarationReportData, isLoading: loadingDeclarationReport } = useMutation(
    (data) => apiService.kycDeclarationReport(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success) {
          const updatedData = data?.data.map((item) => {
            if (item.join_date) {
              item.join_date = getDateTimeFormat(item?.join_date, "YYYY/MM/DD hh:mm A");
            }
            return item;
          });

          setTableData(updatedData);
          setShow(true);
        }
      },
      onError: (error) => {
        setShow(false);
        setTableData([]);
        console.log(error);
      }
    }
  );

  // style sheet
  const StyleSheet = {
    marginTop8: {
      marginTop: "8px"
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Row gutter={[20, 24]} style={StyleSheet.marginTop8}>
        <Col span={24}>
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              Associate Buyer Declaration Report
            </Typography.Title>
            <Typography.Text style={StyleSheet.fontSize14} className="removeMargin">
              <Typography.Text type="secondary">Reports /</Typography.Text> Declaration Report
            </Typography.Text>
          </Flex>
        </Col>
        <Card className="fullWidth">
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}
            className="removePadding">
            <Form
              name="search_form_declaration_report"
              form={declarationForm}
              layout="vertical"
              onFinish={handleSearchClick}>
              <Form.Item
                name="dist_no"
                label={"Associate Buyer Number / Reference Number"}
                required
                rules={[
                  {
                    validator: validateABAndReferenceNumber
                  }
                ]}
                className="removeMargin">
                <Input.Search
                  minLength={3}
                  maxLength={abNoMaxLength}
                  placeholder="Enter Associate Buyer Number / Reference Number"
                  size="large"
                  onInput={(e) => validationNumber(e)}
                  enterButton={
                    <Button
                      icon={<SearchOutlined />}
                      loading={loadingDeclarationReport}
                      type="primary"
                      size="large">
                      Search
                    </Button>
                  }
                  onSearch={() => declarationForm.submit()} // This submits the form
                  allowClear
                />
              </Form.Item>
            </Form>
          </Col>
        </Card>
        {show ? (
          <>
            <Card className="fullWidth">
              <Col span={24}>
                <ExportBtn
                  columns={columns}
                  fetchData={tableData}
                  fileName={"declaration-report"}
                />
              </Col>
              <Col span={24}>
                <Table
                  dataSource={tableData}
                  columns={columns}
                  bordered
                  pagination={tableData?.length > 10 ? pagination : false}
                />
              </Col>
              <Col span={24}></Col>
            </Card>
          </>
        ) : (
          <SearchByFallbackComponent
            title={"Search by Associate Buyer Number"}
            subTitle={"Quickly search the Associate Buyer Number / Reference Number to process the Declaration Report"}
            image={searchByIcon}
          />
        )}
      </Row>
    </>
  ) : (
    <></>
  );
};

export default DeclarationReport;
