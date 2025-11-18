import React, { useState } from "react";
import { Col, Input, Row, Button, Typography, Form, Table, Alert, Card, Spin, Flex } from "antd";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { monthsArray, PermissionAction } from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  safeString,
  validateABnumber,
  validationNumber
} from "Helpers/ats.helper";

const { Text } = Typography;

const DiamondClubPurchaseReport = () => {
  const [abForm] = Form.useForm();
  const { apiService } = useServices();
  const [data, setData] = useState(null);
  const [distName, setDistName] = useState(false);

  const tableColumns = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      sorter: (a, b) => safeString(a?.month).localeCompare(safeString(b?.month)),
      render: (_, record) => monthsArray[record.month - 1] + "-" + record.year
    },
    {
      title: "Nutricharge P.V. 1 to 10",
      dataIndex: "nutricharge_pv_1_10",
      key: "nutricharge_pv_1_10",
      sorter: (a, b) => Number(a?.nutricharge_pv_1_10) - Number(b?.nutricharge_pv_1_10),
      render: (_, record) => (
        <span>{record.nutricharge_pv_1_10 ? record.nutricharge_pv_1_10 : 0}</span>
      )
    },
    {
      title: "Nutricharge P.V. Month",
      dataIndex: "nutricharge_pv_month",
      key: "nutricharge_pv_month",
      sorter: (a, b) => Number(a?.nutricharge_pv_month) - Number(b?.nutricharge_pv_month),
      render: (_, record) => (
        <span>{record.nutricharge_pv_month ? record.nutricharge_pv_month : 0}</span>
      )
    },
    {
      title: "P.V. 1 to 10",
      dataIndex: "pv_1_10",
      key: "pv_1_10",
      sorter: (a, b) => Number(a?.pv_1_10) - Number(b?.pv_1_10),
      render: (_, record) => <span>{record.pv_1_10 ? record.pv_1_10 : 0}</span>
    },
    {
      title: "P.V. Month",
      dataIndex: "pv_month",
      key: "pv_month",
      sorter: (a, b) => Number(a?.pv_month) - Number(b?.pv_month),
      render: (_, record) => <span>{record.pv_month ? record.pv_month : 0}</span>
    }
  ];

  // get downline data
  const { mutate: fetchData, isLoading: loading } = useMutation(
    (data) => {
      return apiService.getDiamondClubData({ dist_no: data });
    },
    {
      onSuccess: (res) => {
        if (res.success && res?.data?.length > 0) {
          let fdata = res.data;
          setDistName(`${res?.dist_name || ""} [${res?.dist_no || ""}]`);
          setData(fdata);
        } else {
          setData([]);
        }
      },
      onError: (error) => {
        setData([]);
        console.error("ERROR:", error);
      }
    }
  );

  const handleSearch = (value) => {
    let data = value.buyerNumber || abForm.getFieldValue("buyerNumber");

    if (data?.length > 0) {
      if (!value || value.length === 0) {
        return;
      }
      fetchData(data);
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={loading}>
      <Flex vertical gap={24}>
        <Form layout="vertical" onFinish={handleSearch} form={abForm}>
          <Row>
            <Col span={24} className="marginBottom24">
              <Typography.Title level={4} className="removeMargin">
                Diamond Club Purchase
              </Typography.Title>
            </Col>
            <Col span={24} className="removeMargin marginBottom16DW ">
              <Card className="removePadding removeMargin cardBodyPaddingSixteen">
                <Row gutter={[20, 20]}>
                  <Col span={12} className="paddingRight12">
                    <Form.Item
                      name={"buyerNumber"}
                      label={"Associate Buyer Number"}
                      className="removeMargin"
                      required
                      rules={[{ validator: validateABnumber }]}>
                      <Input
                        placeholder={`Enter Associate Buyer Number`}
                        size="large"
                        type="text"
                        maxLength={18}
                        onInput={validationNumber}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12} className="paddingLeft12">
                    <Form.Item label={<></>}>
                      <Button size="large" type="primary" htmlType="submit" shape="round" block>
                        Show
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Form>

        {/* Sponsor / Proposer Section */}
        {data?.length > 0 && (
          <>
            <Card>
              <Flex gap={24} vertical>
                <Text className="fontSizeTwenty fontWeightSix">{`Purchase of ${distName}`}</Text>
                <Table
                  columns={tableColumns}
                  dataSource={data}
                  bordered={true}
                  pagination={false}
                  loading={loading}
                  scroll={{
                    x: "max-content"
                  }}
                />
              </Flex>
            </Card>
          </>
        )}
        <Alert
          message="5,000 P.V. Required every month between 1st to 10th on Personal ID for Diamond Club"
          type="warning"
          showIcon
        />
      </Flex>
    </Spin>
  ) : (
    <></>
  );
};

export default DiamondClubPurchaseReport;
