import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { useServices } from "Hooks/ServicesContext";
import React, { useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";

import { Card, Col, Row } from "antd";
import UserProfileCard from "../UserProfileCard";
import ABBasicDetails from "./ABBasicDetails";
import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { actionsPermissionValidator, getDocumentPath, hasEditPermission } from "Helpers/ats.helper";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";

const AbResetPassword = () => {
  const [searchPayload, setSearchPayload] = useState(null);
  const { apiService } = useServices();
  const [modal, setModal] = useState(false);
  const [fetchData, setFetchData] = useState(null);
  const searchRef = useRef();

  // useQuery to fetch data
  const { isLoading } = useQuery(
    ["fetchAbDetailsByAbNo", searchPayload],
    () => apiService.getAbDetailsForABResetPswrd(searchPayload),
    {
      enabled: !!searchPayload, // Fetch only when payload is available
      onSuccess: (data) => {
        if (data?.data) {
          const {
            dist_no,
            dist_name,
            father_name,
            member_since,
            user_phone_number,
            personal_details: { gender, marital_status, spouse_name },

            proposer,
            proposer_name,
            sponsor,
            sponsor_name,
            files_meta
          } = data?.data || {};

          const newData = {
            card_data: {
              dist_no,
              dist_name,
              member_since,
              user_phone_number,
              doc_path:
                files_meta?.length > 0 ? getDocumentPath(files_meta, "applicant_photo") : null,
              gender: gender == "M" ? "Male" : gender == "F" ? "Female" : gender
            },
            basic_details: {
              gender: gender == "M" ? "Male" : gender == "F" ? "Female" : gender,
              marital_status,
              father_husband_name:
                gender == "M"
                  ? father_name
                  : marital_status == "married"
                    ? spouse_name
                    : father_name,

              spouse_name: marital_status == "married" ? spouse_name : "N/A",
              sponsor_number: sponsor,
              sponsor_name,
              proposer_number: proposer,
              proposer_name
            }
          };

          setFetchData(newData);
        } else {
          return {};
        }
      },
      onError: (error) => {
        setFetchData(null);
        console.error(error);
      }
    }
  );
  // handle search click
  const handleSearchClick = (val) => {
    try {
      if (val) {
        const payload = {
          dist_no: val
        };
        setSearchPayload(payload);
      }
    } catch (error) {}
  };

  // handle search change / search clear
  const handleClear = () => {
    // setSearchPayload(null);
  };

  const handleModal = (val) => {
    setModal(val);
  };

  const { mutate, loadingSubmission } = useMutation(
    "mutateResetPswrd",
    (data) => apiService.resetABPswrd(data),
    {
      onSuccess: (res) => {
        if (res?.success) {
          enqueueSnackbar(res.message, snackBarSuccessConf);
          resetDashboard();
        }
      },
      onError: (error) => {
        //
        resetDashboard();
      },
      onSettled: () => {
        handleModal(false);
        setSearchPayload(null);
      }
    }
  );

  const finalSubmit = () => {
    const payload = {
      dist_no: searchPayload?.dist_no
    };
    mutate(payload); // api all
  };

  // handle back button
  // reset dashboard
  const resetDashboard = () => {
    if (searchRef.current) {
      searchRef.current.resetFields(); // this will clear the search box
      setFetchData(null);
      setSearchPayload(null);
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <SearchByComponent
        moduleName={"reset_associate_buyer_password"}
        handleSearchClick={handleSearchClick}
        handleClear={handleClear}
        searchLoading={isLoading}
        searchInputField={true}
        ref={searchRef}
      />
      <Row gutter={[20, 24]}>
        {fetchData ? (
          <Card className="fullWidth marginTop24">
            <UserProfileCard userDetails={fetchData?.card_data} />
            <ABBasicDetails
              data={fetchData}
              module={"Reset Password"}
              danger={false}
              finalSubmit={finalSubmit}
              loadingSubmission={loadingSubmission}
              modal={modal}
              handleModal={handleModal}
              onBackClick={resetDashboard}
              hasActionPermission={hasEditPermission()}
            />
          </Card>
        ) : (
          <>
            <Col span={24}></Col>
            <SearchByFallbackComponent
              title={"Search by Associate Buyer Number / Reference Number"}
              subTitle={
                "Quickly search the Associate Buyer Number / Reference Number to Reset Password"
              }
              image={searchByIcon}
            />
          </>
        )}
      </Row>
    </>
  ) : (
    <></>
  );
};

export default AbResetPassword;
