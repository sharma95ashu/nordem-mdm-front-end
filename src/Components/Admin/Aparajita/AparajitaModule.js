import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Modal, Pagination, Row, Spin, Table, Typography } from "antd";
import { capitalizeFirstLetterAndRemoveUnderScore, downloadExcelData } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
// import { downloadExcel } from "Helpers/ats.helper";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import BrandBulkUpload from "./BulkUpload";
import ProgressCount from "Components/Shared/ProgressCount";

const AparajitaModule = () => {
  const { apiService } = useServices();
  const { setBreadCrumb } = useUserContext();
  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [percentageCountLoading, setPercentageCountLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // column
  const columns = [
    {
      title: "AB ID",
      dataIndex: "ab_id",
      key: "ab_id",
      render: (text) => text || "N/A"
    },
    {
      title: "Aparajita Name",
      dataIndex: "aparajita_name",
      key: "aparajita_name",
      render: (text) => text || "N/A"
    },
    {
      title: "Aparajita Number",
      dataIndex: "aparajita_phone_number",
      key: "aparajita_phone_number",
      render: (text) => text || "N/A"
    },
    {
      title: "AB Phone Number",
      dataIndex: "ab_phone_number",
      key: "ab_phone_number",
      render: (text) => text || "N/A"
    },
    {
      title: "AB Name",
      dataIndex: "ab_name",
      key: "ab_name",
      render: (text) => text || "N/A"
    },
    {
      title: "Pin Level",
      dataIndex: "pin_level",
      key: "pin_level",
      render: (text) => text || "N/A"
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      render: (text) => text || "N/A"
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      render: (text) => text || "N/A"
    },
    {
      title: "Pincode",
      dataIndex: "pincode",
      key: "pincode",
      render: (text) => text || "N/A"
    },
    {
      title: "Type",
      dataIndex: "ab_type",
      key: "ab_type",
      render: (text) => text || "N/A"
    }
  ];

  // setBreadCrumb
  useEffect(() => {
    setBreadCrumb({
      title: "Aparajita",
      icon: "abMessage"
    });
  }, []);

  //  Api method
  const { mutate: getAparajitaApi, isLoading: loadingData } = useMutation(
    "getAllAparajitaData",

    // Function to fetch data of a single brand using apiService.getRequest
    (data) => apiService.getAparajitaData(data),
    {
      // Configuration options
      onSuccess: (data) => {
        if (data?.success) {
          setDataSource(data?.data);
          setTotal(data?.totalCount);
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // handle Export Api call
  const { mutate: HandleExportApi, isLoading: exportloadingData } = useMutation(
    "getAllExportData",

    // Function to fetch data of a single brand using apiService.getRequest
    (data) => apiService.getAparajitaData(data),
    {
      // Configuration options
      onSuccess: (data) => {
        if (data?.success && data?.data?.length > 0) {
          // Format the data based on your provided columns
          const formattedData = data.data.map((item) => ({
            "AB ID": item.ab_id || "N/A",
            "Aparajita Name": item.aparajita_name || "N/A",
            "Aparajita Number": item.aparajita_phone_number || "N/A",
            "AB Phone Number": item.ab_phone_number || "N/A",
            "AB Name": item.ab_name || "N/A",
            "Pin Level": item.pin_level || "N/A",
            State: item.state || "N/A",
            City: item.city || "N/A",
            Pincode: item.pincode || "N/A",
            Type: capitalizeFirstLetterAndRemoveUnderScore(item.ab_type) || "N/A"
          }));
          // download excel file
          downloadExcelData(formattedData, "Aparajita");
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // Api call when page size change or pagination
  useEffect(() => {
    const data = {
      page: current - 1,
      pageSize: pageSize
    };

    // api call
    getAparajitaApi(data);
  }, [current, pageSize]);

  // Handle Export Data
  const handleExportData = () => {
    HandleExportApi();
  };

  // const headers = [
  //   { label: "AB ID" },
  //   { label: "Aparajita Name" },
  //   { label: "AB Phone" },
  //   { label: "Aparajita Phone" },
  //   { label: "City" },
  //   { label: "State" },
  //   { label: "Pincode" },
  //   { label: "Pin Level" }
  // ];

  return (
    <Spin spinning={loadingData}>
      <Row gutter={[0, 20]}>
        <Col span={24}>
          <Typography.Title level={3} style={{ marginBottom: 0, marginTop: 0 }}>
            Aparajita Management
          </Typography.Title>
          <Typography.Text type="secondary">
            Manage and upload your Aparajita data sheets
          </Typography.Text>
        </Col>

        <Col span={24}>
          <Flex justify="space-between">
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              onClick={handleExportData}
              loading={exportloadingData}>
              Export Data
            </Button>
            <Button
              size="large"
              icon={<UploadOutlined />}
              type="primary"
              onClick={() => setIsModalOpen(true)}>
              Upload Sheet
            </Button>
          </Flex>
        </Col>

        <Col span={24}>
          <Table
            dataSource={dataSource}
            columns={columns}
            bordered={true}
            pagination={dataSource?.length > 10 && true}
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
        <Col span={24}>
          {isModalOpen && (
            <BrandBulkUpload
              // recallPincodeApi={recallPincodeApi}
              type={"product"}
              setshowBulkUploadModel={(e) => setIsModalOpen(e)}
              setPercentageCountLoading={setPercentageCountLoading}
            />
          )}
        </Col>
        {percentageCountLoading ? (
          <Modal
            title="Upload Progress"
            centered
            open={true}
            closable={false}
            width={700}
            footer={false}>
            <>
              <Flex justify="center" align="middle" style={{ height: "100%" }}>
                <ProgressCount setPercentageCountLoading={setPercentageCountLoading} />
              </Flex>
            </>
          </Modal>
        ) : (
          <></>
        )}
      </Row>
    </Spin>
  );
};

export default AparajitaModule;
