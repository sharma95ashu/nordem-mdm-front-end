import { useCallback } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable"; // This is needed for the table export in PDF
import { Button, Dropdown, Flex, message, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import copyIcon from "Static/img/copyIcon.svg";
import pdfIcon from "Static/img/pdfIcon.svg";
import excelIcon from "Static/img/excelIcon.svg";
import { convertToUppercaseAndCapitalize } from "Helpers/ats.helper";

const ExportBtn = (props) => {
  const { columns, fetchData = [], fileName = "export.xlsx", isLandscape = false } = props;
  let filteredColumns = columns?.filter((column) => !column?.skipColumn);

  const minifyRecords = (fetchData = []) => {
    let data = [];
    fetchData.map((item) => {
      let obj = {};
      filteredColumns?.map((col) => {
        obj[col.dataIndex] = item[col.dataIndex] ?? "-";
      });
      data.push(obj);
    });
    return data || fetchData || [];
  };

  const StyleSheet = {
    icon: {
      width: "16px",
      height: "16px",
      marginRight: "8px"
    },
    btn: { marginBottom: "16px", fontSize: "14px" }
  };

  const convertToReadableFormat = (data) => {
    return data.map((item) => {
      const newItem = {};
      Object.keys(item).forEach((key) => {
        const readableKey = convertToUppercaseAndCapitalize(key, ["AB", "PV", "KYC"]); // Capitalize the first letter of each word
        newItem[readableKey] = Array.isArray(item[key]) ? item[key].join(", ") : item[key];
      });
      return newItem;
    });
  };

  // Copy to Clipboard
  const copyToClipboard = useCallback(() => {
    if (!navigator.clipboard) {
      message.error("Clipboard API is not supported in this browser.");
      return;
    }

    const tableHeaders = filteredColumns.map((col) => col.title).join("\t");
    const tableRows = minifyRecords(fetchData)
      .map((row) =>
        Object.values(row)
          .map((value) => (value !== null ? value : ""))
          .join("\t")
      )
      .join("\n");

    const tableData = `${tableHeaders}\n${tableRows}`;

    navigator.clipboard
      .writeText(tableData)
      .then(() => {
        message.success("Table data copied to clipboard!");
      })
      .catch((err) => {
        message.error("Failed to copy table data.");
        console.error(err);
      });
  }, [fetchData, columns]);

  // Export to Excel
  const exportToExcel = useCallback(() => {
    // Create a workbook and a worksheet
    const transformedData = convertToReadableFormat(fetchData);
    const ws = XLSX.utils.json_to_sheet(transformedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Export the file
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }, [fetchData]);

  // Export to PDF
  const exportToPDF = useCallback(() => {
    const orientation = isLandscape ? "l" : "p"; // "l" for landscape, "p" for portrait
    const doc = new jsPDF(orientation, "mm", isLandscape ? "a3" : "a4");

    // const doc = new jsPDF();

    // Prepare the data for PDF table & Add a table to the PDF
    doc.autoTable({
      head: [filteredColumns.map((col) => col.title)], // Column headers
      body: minifyRecords(fetchData).map((item) => Object.values(item)) // Table data
    });

    // Save the PDF file
    doc.save(`${fileName}.pdf`);
  }, [fetchData, columns]);

  const items = [
    {
      label: (
        <>
          <Flex align="center" justify="flex-start">
            <img src={copyIcon} alt="category" style={StyleSheet.icon} />
            Copy
          </Flex>
        </>
      ),
      key: "copy",
      onClick: copyToClipboard
    },
    {
      label: (
        <>
          <Flex align="center" justify="flex-start">
            <img src={excelIcon} alt="category" style={StyleSheet.icon} />
            Excel
          </Flex>
        </>
      ),

      key: "excel",
      onClick: exportToExcel
    },
    {
      label: (
        <>
          <Flex align="center" justify="flex-start">
            <img src={pdfIcon} alt="category" style={StyleSheet.icon} />
            PDF
          </Flex>
        </>
      ),
      key: "pdf",
      onClick: exportToPDF
    }
  ];

  return (
    <>
      <div className="width100">
        <Dropdown menu={{ items }} disabled={fetchData?.length == 0}>
          <Button size="large" style={StyleSheet.btn}>
            <Space>
              Export As
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </div>
    </>
  );
};

export default ExportBtn;
