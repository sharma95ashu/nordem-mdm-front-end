import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { useServices } from "Hooks/ServicesContext";
import React, { useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { Card, Col, Row } from "antd";

import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { actionsPermissionValidator, hasEditPermission } from "Helpers/ats.helper";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";
import ABBasicDetails from "../AssociateBuyers/ABBasicDetails";
import UserProfileCard from "../UserProfileCard";

const ABIDUnStop = () => {
  const [searchPayload, setSearchPayload] = useState(null);
  const [fetchData, setFetchData] = useState(null);
  const { apiService } = useServices();
  const [modal, setModal] = useState(false);
  const searchRef = useRef();

  // api for fetching ab details by ab no
  const { isLoading } = useQuery(
    ["fetchAbDetailsByAbNo", searchPayload],
    () => apiService.getAbDetailsForABIDStop(searchPayload),
    {
      enabled: !!searchPayload, // Fetch only when payload is available
      onSuccess: (data) => {
        if (data?.data) {
          const {
            dist_no,
            dist_name,
            father_name,
            member_since,
            personal_details: { gender, marital_status, spouse_name },

            proposer,
            proposer_name,
            sponsor,
            sponsor_name
          } = data?.data || {};

          const newData = {
            card_data: {
              dist_no,
              dist_name,
              member_since
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

  // handle modal fn
  const handleModal = (val) => {
    setModal(val);
  };

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
    //
  };

  // reset dashboard
  const resetDashboard = () => {
    if (searchRef.current) {
      searchRef.current.resetFields(); // this will clear the search box
      setFetchData(null);
      setSearchPayload(null);
    }
  };

  // api for AB ID stop
  const { mutate, loadingSubmission } = useMutation(
    "mutateStopAbID",
    (data) => apiService.stopABID(data),
    {
      onSuccess: (res) => {
        if (res?.success) {
          enqueueSnackbar(res.message, snackBarSuccessConf);
          resetDashboard();
        }
      },
      onError: (error) => {
        //
      },
      onSettled: () => {
        handleModal(false);
        setSearchPayload(null);
      }
    }
  );

  // handle final submission
  const finalSubmit = () => {
    try {
      const payload = {
        dist_no: searchPayload?.dist_no
      };
      mutate(payload); // api call
    } catch (error) {}
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <SearchByComponent
        moduleName={"ab_id_unstop"}
        handleSearchClick={handleSearchClick}
        handleClear={handleClear}
        searchLoading={isLoading}
        ref={searchRef}
      />
      <Row gutter={[20, 24]}>
        {fetchData ? (
          <Card className="fullWidth marginTop24">
            <UserProfileCard moduleType={"pan-number"} userDetails={fetchData?.card_data} />
            <ABBasicDetails
              data={fetchData}
              module={"UnStop Associate Buyer ID"}
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
              title={"Search by Associate Buyer Number"}
              subTitle={"Quickly Search by Associate Buyer Number to UnStop AB ID."}
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

export default ABIDUnStop;
