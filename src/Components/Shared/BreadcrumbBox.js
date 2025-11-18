import React, { useEffect, useState } from "react";
import { Breadcrumb } from "antd";

import { useUserContext } from "Hooks/UserContext";

import { returnMenuIcon } from "Helpers/ats.constants";
import { Paths } from "Router/Paths";
import { useNavigate } from "react-router-dom";

export default function BreadcrumbBox() {
  const { breadCrumb } = useUserContext();
  const navigate = useNavigate();
  const [breadCrumbArray, setBreadCrumbArray] = useState([]);
  const [userTypecheck, setUsertype] = React.useState(false);

  React.useEffect(() => {
    const userType = localStorage.getItem("crmUser");
    setUsertype(userType == "true" ? true : false);
  }, [localStorage.getItem("crmUser")]);

  /**
   * UseEffect function to check breadcrumb and update breadCrumb Array
   */
  useEffect(() => {
    if (breadCrumb) {
      const breadcrumbItems = [
        {
          href: userTypecheck == true ? Paths.Crm : Paths.users,
          title: (
            <>
              {returnMenuIcon("dashboard")}
              {/* <span>{"Dashboard"}</span> */}
            </>
          )
        }
      ];

      if (breadCrumb.subtitle !== undefined) {
        breadcrumbItems.push({
          href: breadCrumb.titlePath || "",
          title: (
            <>
              {returnMenuIcon(breadCrumb.icon)}
              <span>{breadCrumb.title}</span>
            </>
          )
        });
        breadcrumbItems.push({
          title: breadCrumb.subtitle || breadCrumb.title
        });
      }
      if (!breadCrumb.subtitle && breadCrumb.title !== "Home") {
        breadcrumbItems.push({
          title: breadCrumb.subtitle || breadCrumb.title
        });
      }

      setBreadCrumbArray(breadcrumbItems);
    }
  }, [breadCrumb]);

  /**
   * Function to navigate to specified path
   * @param {*} path
   */
  const navigateToPath = (path) => {
    if (path.href) {
      navigate(`/${path.href}`);
    }
  };

  return (
    <>
      <Breadcrumb separator="/">
        {breadCrumbArray.map((item, index) => (
          <Breadcrumb.Item
            key={index}
            className={item?.href ? "breadNavigation" : ""}
            onClick={() => {
              navigateToPath(item);
            }}>
            {item.title}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </>
  );
}
