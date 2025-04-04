/* global chrome */
import React, { useEffect, useState } from "react";
import "./Form.css";
import {
  Row,
  Col,
  Typography,
  Input,
  Form,
  Checkbox,
  Select,
  Card,
  Alert,
  Divider,
  List,
  Modal,
  Button,
  Space,
  ConfigProvider,
  Spin,
  Tabs,
  Grid,
  notification,
  Avatar,
  Flex,
} from "antd";
import {
  PhoneOutlined,
  GlobalOutlined,
  MailOutlined,
  HomeOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { VscAccount } from "react-icons/vsc";
import { IoLocationOutline, IoHomeOutline } from "react-icons/io5";
import { MdKey } from "react-icons/md";
import { Autoplay } from "swiper/modules";
import countryList from "../countryList.json";
import langList from "../lang.json";
import logo from "../images/logo.png";
import i18next from "i18next";
import { useTranslation } from "react-i18next";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ITEM_HEIGHT = 36;
const MOBILE_ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MENU_ITEMS = 6;
const TAB_ITEMS = ["home", "data", "setting", "help"];
const font = "'Poppins', sans-serif";

const MyForm = () => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [rData, setRData] = useState({});
  const sites = [
    {
      name: "2gis United Arab Emirates",
      website: "2gis.ae",
      searchUrl: "https://2gis.ae/dubai/search/",
      city: "Dubai"
    },
    {
      name: "2gis Azerbaijan",
      website: "2gis.az",
      searchUrl: "https://2gis.az/baku/search/",
      city: "Baku"
    },
  ];

  const [site, setSite] = useState(0);
  const [theme, setTheme] = useState({
    token: {
      colorPrimary: "#0855a4",
      fontFamily: font,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [setting, setSetting] = useState(null);
  const [licenseDetails, setLicenseDetails] = useState(null);
  const [isLicenseValid, setIsLicenseValid] = useState(false);
  const [licenseMessage, setLicenseMessage] = useState("");
  const [scrapData, setScrapData] = useState({});
  const [selectedKeywordId, setSelectedKeywordId] = useState("select");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const [country, setCountry] = useState("India");
  const [city, setCity] = useState("");
  const [key, setKey] = useState("");
  const [keyIsValid, setKeyIsValid] = useState(false);
  const [selectedTabId, setSelectedTabId] = useState(0);
  const [delay, setDelay] = useState(1);
  const [selectLang, setSelectLang] = useState("en");
  const [dataFormate, setDataFormate] = useState("csv");
  const [removeDuplicate, setRemoveDuplicate] = useState("only_phone");
  const [columns, setColumns] = useState([]);
  const [extractCol, setExtractCol] = useState({});
  const [keyword, setKeyword] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [licenceKeyErrorMessage, setLicenceKeyErrorMessage] = useState(t("invalidLicenseKey"));
  const [activeStep, setActiveStep] = useState(0);
  const [renewKey, setRenewKey] = useState("");
  const [renewOpen, setRenewOpen] = useState(false);
  const [localmanifestVersion, setLocalmanifestVersion] = useState("");
  const [isUpdate, setIsUpdate] = useState(true);

  const renewOpenForm = () => {
    setRenewKey("");
    setRenewOpen(true);
  };
  const renewCloseForm = () => {
    setRenewOpen(false);
  };

  const isEmailIsValid = (emailAddress) => {
    let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
    return regex.test(emailAddress);
  };

  const sendChromeMessage = (data, callback) => {
    try {
      chrome.runtime.sendMessage(data, (response) => {
        callback(response);
      });
    } catch (e) {
      console.log("sendMessage Error:", e);
      callback({
        status: false,
        message: "Something is wrong",
      });
    }
  };

  const getProductData = () => {
    sendChromeMessage({ type: "get_product" }, (response) => {
      console.log("get_product", response);
      if (response.status) {
        setProduct(response.product);
      }
    });
  };

  const getColumns = () => {
    sendChromeMessage({ type: "columns" }, (response) => {
      setColumns(response.columns);
      response.columns.forEach((x) => {
        setExtractCol((col) => ({ ...col, [x.value]: true }));
      });
    });
  };

  const getResellerData = () => {
    sendChromeMessage({ type: "get_data" }, (response) => {
      if (response.status == true) {
        setRData(response.data);
        setPhone("+" + response.data.country_code);
        const c = countryList.find((c) => c.countryCode == (response.data.country ?? "IN"));
        if (c) setCountry(c.countryNameEn);
        else console.log("Country name not found");
      }
    });
  };

  const getScrapeData = () => {
    sendChromeMessage({ type: "get_scrap" }, (response) => {
      if (response.status == true) setScrapData(response.data);
      else setScrapData({});
    });
  };

  const getSetting = () => {
    sendChromeMessage({ type: "get_setting" }, (response) => {
      if (response.status == true) {
        const data = response.setting;
        setSetting(data);
        setDataFormate(data.exportForm);
        setRemoveDuplicate(data.removeDuplicate);
        setDelay(data.delay);
        setExtractCol(data.extractCol);
        setSelectLang(data.lang ?? "en");
        i18next.changeLanguage(data.lang ?? "en");
      } else {
        api.error({
          key: "error",
          message: t(response.message),
          duration: 2,
          placement: "bottomLeft",
        })
      }
    });
  };

  const expireDate = () => {
    if (licenseDetails) return dateFormat(licenseDetails.expireAt);
    return "";
  };

  const dateFormat = (dateString) => {
    let expDate = new Date(dateString);
    const year = expDate.getUTCFullYear();
    const month = expDate.getUTCMonth() + 1;
    const day = expDate.getUTCDate();
    return `${day}-${month}-${year}`;
  };

  const renewLicenseKey = () => {
    sendChromeMessage({ key: licenseDetails.key, renew_key: renewKey, type: "renew" }, (response) => {
      if (response.status == true) {
        api.success({
          key: "success",
          message: response.message,
          duration: 2,
          placement: "bottomLeft",
        });
        setTimeout(() => renewCloseForm(), 500);
      } else {
        api.error({
          key: "error",
          message: t(response.message),
          duration: 2,
          placement: "bottomLeft",
        })
      }
    });
  };

  const getLicenseDetails = () => {
    sendChromeMessage({ type: "get_details" }, (response) => {
      console.log("get_details", response);
      if (response.status == true) {
        setIsLicenseValid(true);
        setLicenseMessage("");
      } else {
        setIsLicenseValid(true);
        setLicenseDetails(null);
        setLicenseMessage(response.message);
      }
      if (response.detail) {
        setLicenseDetails(response.detail);
        setName(response.detail.name ?? "");
        setEmail(response.detail.email ?? "");
        setPhone(response.detail.phone ?? "");
        setCity(response.detail.place ?? "");
        setCountry(response.detail.country ?? "");
        setKey(response.detail.key ?? "");
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    getResellerData();
    getColumns();
    getSetting();
    getProductData();
    getLicenseDetails();
    getVersion();
    getScrapeData();
  }, []);

  useEffect(() => {
    var color = "#0855a4";
    if (product) color = product.color;
    if (rData.theme_setting && rData.theme_setting["primary-color"]) color = rData.theme_setting["primary-color"];
    setTheme({ token: { colorPrimary: color, fontFamily: font } });
  }, [product, rData]);

  useEffect(() => {
    if (showValidation) setTimeout(() => setShowValidation(false), 2000);
  }, [showValidation]);

  useEffect(() => {
    checkLicense(key);
  }, [key]);

  function checkLicense(key) {
    if (key.length === 19) {
      sendChromeMessage({ license_key: key, type: "license_verify" }, (response) => {
        setKeyIsValid(response.status);
        setLicenceKeyErrorMessage(response.status ? "" : response.message || t("invalidLicenseKey"));
      });
    } else {
      setKeyIsValid(false);
      setLicenceKeyErrorMessage(t("invalidLicenseKey"));
    }
  }

  const onActivateSubmit = async (e) => {
    setShowValidation(true);
    // if (name == "") return notificationApi.error({ message: t("nameRequired") });
    // if (email == "") return notificationApi.error({ message: t("emailRequired") });
    // if (!isEmailIsValid(email)) return notificationApi.error({ message: t("emailInvalid") });
    // if (phone == "") return notificationApi.error({ message: t("phoneInvalid") });
    // if (city == "") return notificationApi.error({ message: t("cityRequired") });
    // if (country == "") return notificationApi.error({ message: t("countryRequired") });
    // if (key == "") return api.error({ message: t("licenseKeyRequired") });
    // if (!keyIsValid) return api.error({ message: t("licenseKeyInvalid") });

    const msg = { name, email, phone: `+${phone}`, city, country, key };
    sendChromeMessage({ data: msg, type: "license_active" }, (response) => {
      if (response.status == true) {
        setIsLicenseValid(true);
        getLicenseDetails();
        api.success({
          key: "success",
          message: response.message,
          duration: 2,
          placement: "bottomLeft",
        });
      } else {
        setIsLicenseValid(false);
        api.error({
          key: "error",
          message: t(response.message),
          duration: 2,
          placement: "bottomLeft",
        })
      }
    });
  };

  const onSaveSetting = (e) => {
    e.preventDefault();
    setShowValidation(true);
    let data = { exportForm: dataFormate, removeDuplicate, delay, extractCol, lang: selectLang };
    sendChromeMessage({ setting: data, type: "save_setting" }, (response) => {
      if (response.status) {
        // notificationApi.success({ message: t("settingSave") });
        api.success({
          key: "success",
          message: response.message,
          duration: 2,
          placement: "bottomLeft",
        });
        i18next.changeLanguage(selectLang);
      } else {
        // notificationApi.error({ message: t("settingSaveFailed") });
        api.error({
          key: "error",
          message: t("settingSaveFailed"),
          duration: 2,
          placement: "bottomLeft",
        })
      }
    });
  };

  const onScrape = (e) => {
    e.preventDefault();
    setShowValidation(true);
    if (keyword == "") return
    // notificationApi.error({ message: t("keywordRequired") });
    api.error({
      key: "error",
      message: t("keywordRequired"),
      duration: 2,
      placement: "bottomLeft",
    })
    sendChromeMessage({ keyword, site: sites[site], type: "scrap" }, (response) => {
      if (response.status == true)
        api.success({
          key: "success",
          message: response.message,
          duration: 2,
          placement: "bottomLeft",
        });
      else
        // notificationApi.error({ message: t(response.message) });
        api.error({
          key: "error",
          message: t(response.message),
          duration: 2,
          placement: "bottomLeft",
        })
    });
  };

  const onDownloadScrapData = () => {
    sendChromeMessage({ type: "download", keyword: selectedKeywordId }, (response) => {
      if (response.status == true) {
        api.success({
          key: "success",
          message: response.message,
          duration: 2,
          placement: "bottomLeft",
        });
        setSelectedKeywordId("select");
      } else {
        api.error({
          key: "error",
          message: t(response.message),
          duration: 2,
          placement: "bottomLeft",
        })
      }
    });
  };

  const onDeleteScrapData = () => {
    sendChromeMessage({ type: "delete_scrap", keyword: selectedKeywordId }, (response) => {
      if (response.status == true) {
        api.success({
          key: "success",
          message: response.message,
          duration: 2,
          placement: "bottomLeft",
        });
        setSelectedKeywordId("select");
        getScrapeData();
      } else {
        api.error({
          key: "error",
          message: t(response.message),
          duration: 2,
          placement: "bottomLeft",
        })
      }
    });
  };

  const onClearScrapData = () => {
    sendChromeMessage({ type: "clear_scrap", keyword: selectedKeywordId }, (response) => {
      if (response.status == true) {
        api.success({
          key: "success",
          message: response.message,
          duration: 2,
          placement: "bottomLeft",
        });
        setScrapData({});
      } else {
        api.error({
          key: "error",
          message: t(response.message),
          duration: 2,
          placement: "bottomLeft",
        })
      }
    });
  };

  const get_youtube_thumbnail = (url, quality) => {
    if (url) {
      var video_id, thumbnail, result;
      if ((result = url.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/))) video_id = result.pop();
      else if ((result = url.match(/youtu.be\/(.{11})/))) video_id = result.pop();
      if (video_id) {
        if (typeof quality == "undefined") quality = "high";
        var quality_key = "maxresdefault";
        if (quality == "low") quality_key = "sddefault";
        else if (quality == "medium") quality_key = "mqdefault";
        else if (quality == "high") quality_key = "hqdefault";
        return "http://img.youtube.com/vi/" + video_id + "/" + quality_key + ".jpg";
      }
    }
    return false;
  };

  const getTrial = () => {
    sendChromeMessage({ type: "get_trial" }, (response) => {
      console.log("get one day trial demo", response);
      if (response.status) {
        setKey(response.key);
        api.success({
          key: "success",
          message: response.message,
          duration: 2,
          placement: "bottomLeft",
        });
      } else {
        setKey(response.key);
        api.error({
          key: "error",
          message: t(response.message),
          duration: 2,
          placement: "bottomLeft",
        })
      }
    });
  };

  const getVersion = () => {
    sendChromeMessage({ type: "get_version" }, (response) => {
      console.log("Background check version0", response);
      setLocalmanifestVersion(response.version);
    });
  };

  const updateCancel = () => {
    let data = product?.forceUpdate ?? "";
    if (data) setIsUpdate(true);
    else setIsUpdate(false);
  };

  const totalSlider = () => {
    var count = 0;
    if (product != null) {
      if (product.showAd) count++;
      if (product.demoVideoUrl != "" && (product.demoVideoUrl ?? "").includes("youtube.com")) count++;
    }
    return count;
  };
  return (
    <>
      {contextHolder}
      <ConfigProvider theme={theme}>
        <Modal
          title={t("renewLicense")}
          open={renewOpen}
          onCancel={renewCloseForm}
          footer={[
            <Space>
              <Button key="renew" type="primary" onClick={renewLicenseKey}>
                {t("renew")}
              </Button>
              {product && rData?.active_shop == true && (
                <Button key="buy">
                  <a href={product?.siteUrl ? product.siteUrl : rData?.buy_url} target="_blank" rel="noopener noreferrer">
                    {t("buyNow")}
                  </a>
                </Button>
              )}
            </Space>,
          ]}
        >
          <Input
            value={renewKey}
            onChange={(e) => setRenewKey(e.target.value)}
            placeholder={t("enterLicenseKey")}
            prefix={<KeyOutlined />}
            suffix={keyIsValid ? <CheckCircleOutlined style={{ color: "#52c41a" }} /> : <CloseCircleOutlined />}
          />
          <Paragraph>{t("renewDBMbeforeExpire")}</Paragraph>
          <Paragraph>{t("subscription1Y")}</Paragraph>
          <Paragraph>{t("subscription3M")}</Paragraph>
          <Paragraph>{t("subscription1M")}</Paragraph>
        </Modal>

        <div style={{ width: "100%", height: 100, backgroundColor: theme.token.colorPrimary, opacity: 0.9 }}>
          <Space direction="vertical" align="center" style={{ width: "100%", paddingTop: 8 }}>
            <Space>
              <img width={45} height={45} src={logo} alt={product?.name ?? ""} />
              <Text style={{ color: "white" }}>{rData?.name ?? t("appName")}</Text>
            </Space>
            {isLicenseValid && (
              <Space>
                <Text style={{ color: "white" }}>{t("expireDate")}</Text>
                <span style={{ border: "1px solid #17F8F0", color: "#17F8F0", padding: "2px 4px", borderRadius: 4, fontSize: 10 }}>{expireDate()}</span>
                <span
                  style={{ border: "1px solid white", color: "white", padding: "2px 4px", borderRadius: 4, fontSize: 10, cursor: "pointer" }}
                  onClick={renewOpenForm}
                >
                  {t("renewLabel")}
                </span>
              </Space>
            )}
          </Space>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
            <Spin tip={t("loading")} />
          </div>
        ) : (
          <div>
            {isLicenseValid ? (
              <>
                <div style={{ backgroundColor: theme.token.colorPrimary }}>
                  <Row justify="center" align="middle" style={{ padding: "8px 10px" }}>
                    {TAB_ITEMS.map((x, i) => (
                      <Col span={6} key={"tab-" + i} style={{ display: "flex", justifyContent: "center" }}>
                        <Button
                          type={selectedTabId === i ? "default" : "text"}
                          style={{
                            color: selectedTabId === i ? theme.token.colorText : "white",
                            minWidth: "100px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          onClick={() => setSelectedTabId(i)}
                        >
                          {t(x)}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </div>

                <div className="mainBox" style={{ padding: 16 }}>
                  {selectedTabId === 0 && (
                    <Row justify="center">
                      <Col>
                        <form onSubmit={onScrape} style={{ padding: "8px", marginTop: "-31px" }}>
                          <Title level={5}>{t("welcome")} {licenseDetails?.name ?? ""}</Title>
                          <div style={{ marginTop: 16 }}>
                            <Select
                              value={site}
                              onChange={(value) => setSite(value)}
                              placeholder={t("website")}
                              style={{ width: 300, height: "40px" }}
                            >
                              {sites.map((site, i) => (
                                <Option key={"site-" + i} value={i}>
                                  {site.name} ({site.website})
                                </Option>
                              ))}
                            </Select>
                          </div>
                          <div style={{ marginTop: 16 }}>
                            <Input
                              value={keyword}
                              onChange={(e) => setKeyword(e.target.value)}
                              placeholder={`e.g Hotels in ${sites[site].city}(City)`}
                              style={{ width: 300, height: "40px" }}
                            />
                            {keyword === "" && showValidation && <Text type="danger">{t("keywordIsRequired")}</Text>}
                          </div>
                          <Space style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                            <Button type="primary" htmlType="submit">
                              {t("start")}
                            </Button>
                          </Space>
                        </form>
                        {product != null && rData?.show_ads == true && (
                          <div style={{ marginTop: 16, width: 355 }}>
                            <Swiper
                              modules={[Autoplay]}
                              autoplay={{ delay: 15000 }}
                              onSlideChange={(swiper) => setActiveStep(swiper.activeIndex)}
                            >
                              {product.showAd && (
                                <SwiperSlide>
                                  <a href={product.adBannerUrl ?? ""} target="_blank" rel="noopener noreferrer">
                                    <img src={product.adBannerUrl ?? ""} alt={product.adBannerUrl ?? ""} style={{ height: 200, width: "100%" }} />
                                  </a>
                                </SwiperSlide>
                              )}
                              {product.demoVideoUrl != "" && (product.demoVideoUrl ?? "").includes("youtube.com") && (
                                <SwiperSlide>
                                  <a href={product.demoVideoUrl ?? ""} target="_blank" rel="noopener noreferrer">
                                    <div style={{ position: "relative" }}>
                                      <PlayCircleOutlined style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 110, color: "grey", opacity: 0.8 }} />
                                      <img src={get_youtube_thumbnail(product.demoVideoUrl ?? "", "high")} alt={product.demoVideoUrl ?? ""} style={{ height: 200, width: "100%" }} />
                                    </div>
                                  </a>
                                </SwiperSlide>
                              )}
                            </Swiper>
                            <Space style={{ width: "91%", justifyContent: "space-between", marginTop: "1" }}>
                              <Button
                                style={{ width: 100 }}
                                disabled={activeStep === 0}
                                onClick={() => setActiveStep(activeStep - 1)}
                              >
                                <LeftOutlined /> {t("back")}
                              </Button>
                              <Button
                                style={{ width: 100 }}
                                disabled={activeStep === totalSlider() - 1}
                                onClick={() => setActiveStep(activeStep + 1)}
                              >
                                {t("next")} <RightOutlined />
                              </Button>
                            </Space>

                          </div>
                        )}
                      </Col>
                    </Row>
                  )}

                  {selectedTabId === 1 && (
                    <div>
                      {Object.keys(scrapData ?? {}).length === 0 ? (
                        <Alert message={t("noDataFound")} type="warning" />
                      ) : (
                        <>
                          <Form.Item style={{ marginTop: "-15px" }} label={<Typography.Title level={5}>{t("keyword")}</Typography.Title>}>
                            <Select value={selectedKeywordId} onChange={(value) => setSelectedKeywordId(value)} style={{ width: 300, marginTop: "8px", height: "40px" }}>
                              <Option value="select">Select</Option>
                              {Object.keys(scrapData).map((key) => (

                                <Option key={key} value={key}>
                                  {scrapData[key].name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>

                          {selectedKeywordId !== "select" && (
                            <>
                              <Space direction="vertical" style={{ marginTop: 12 }}>
                                <Text>{t("totalData")}: {(scrapData[selectedKeywordId]?.data ?? []).length}</Text>
                                <Text>{t("lastDate")}: {dateFormat(scrapData[selectedKeywordId]?.createdAt)}</Text>
                              </Space>
                              <Row justify="center" style={{ marginTop: 16 }}>
                                <Space>
                                  <Button type="primary" onClick={onDownloadScrapData}>
                                    {t("download")}
                                  </Button>
                                  <Button danger onClick={onDeleteScrapData}>
                                    {t("delete")}
                                  </Button>
                                </Space>
                              </Row>
                            </>
                          )}
                          <Button
                            danger
                            type="dashed"
                            onClick={onClearScrapData}
                            style={{ marginTop: 16, display: "block", marginLeft: "auto", marginRight: "auto" }}
                          >
                            {t("clearAll")}
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {selectedTabId === 2 && (
                    <div style={{ padding: "5px" }}>
                      <form onSubmit={onSaveSetting}>
                        <Form layout="vertical">
                          <Form.Item
                            label={t("removeDuplicate")}
                            labelCol={{ style: { fontWeight: "bold" } }}
                          >
                            <Select value={removeDuplicate} onChange={(value) => setRemoveDuplicate(value)}>
                              <Select.Option value="only_phone">{t("onlyPhone")}</Select.Option>
                              <Select.Option value="only_address">{t("onlyAddress")}</Select.Option>
                              <Select.Option value="phone_and_address">{t("phoneAndaddress")}</Select.Option>
                            </Select>
                          </Form.Item>

                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                label={t("delay")}
                                labelCol={{ style: { fontWeight: "bold" } }}
                              >
                                <Input
                                  type="number"
                                  value={delay}
                                  onChange={(e) => setDelay(e.target.value)}
                                  min={1}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                label={t("language")}
                                labelCol={{ style: { fontWeight: "bold" } }}
                              >
                                <Select
                                  value={selectLang}
                                  onChange={setSelectLang}
                                  showSearch
                                  filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                  }
                                  style={{ width: "100%" }}
                                  placeholder={t("selectLanguage")}
                                >
                                  {langList.map((x) => (
                                    <Select.Option key={x.key} value={x.key}>
                                      {x.name}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>

                          <Text strong>{t("extractingCol")}</Text>
                          <Row>
                            {columns.map((col) => (
                              <Col span={12} key={col.value}>
                                <Checkbox
                                  checked={extractCol[col.value]}
                                  onChange={(e) => setExtractCol((ec) => ({ ...ec, [col.value]: e.target.checked }))}
                                >
                                  {t(col.label)}
                                </Checkbox>
                              </Col>
                            ))}
                          </Row>

                          <Form.Item style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
                            <Button onClick={onSaveSetting} type="primary" htmlType="submit">
                              {t("save")}
                            </Button>
                          </Form.Item>
                        </Form>
                      </form>
                    </div>
                  )}


                  {selectedTabId === 3 && (
                    <div style={{ padding: "7px", marginTop: "-32px" }}>
                      <Title level={5}>{t("helpMsg")}</Title>
                      <Text>{t("contactWithEmail")}</Text>
                      <List>
                        {rData?.active_shop == true ? (
                          product.contactNumber && (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Avatar icon={<PhoneOutlined />} />}
                                title={t("phone")}
                                description={<a href={"tel:" + product?.contactNumber}>{product?.contactNumber}</a>}
                              />
                            </List.Item>
                          )
                        ) : (
                          rData.phone && (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Avatar icon={<PhoneOutlined />} />}
                                title={t("phone")}
                                description={<a href={"tel:" + rData?.phone}>{rData?.phone}</a>}
                              />
                            </List.Item>
                          )
                        )}
                        {rData?.active_shop == true ? (
                          product.email && (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Avatar icon={<MailOutlined />} />}
                                title={t("email")}
                                description={<a href={"mailto:" + product?.email}>{product?.email}</a>}
                              />
                            </List.Item>
                          )
                        ) : (
                          rData.email && (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Avatar icon={<MailOutlined />} />}
                                title={t("email")}
                                description={<a href={"mailto:" + rData?.email}>{rData?.email}</a>}
                              />
                            </List.Item>
                          )
                        )}
                        {rData?.active_shop == true ? (
                          product.siteUrl && (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Avatar icon={<GlobalOutlined />} />}
                                title={t("website")}
                                description={<a href={product?.siteUrl} target="_blank" rel="noopener noreferrer">{product?.siteUrl}</a>}
                              />
                            </List.Item>
                          )
                        ) : (
                          rData.siteUrl && (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Avatar icon={<GlobalOutlined />} />}
                                title={t("website")}
                                description={<a href={rData?.siteUrl} target="_blank" rel="noopener noreferrer">{rData?.siteUrl}</a>}
                              />
                            </List.Item>
                          )
                        )}
                      </List>
                      <Title level={5} style={{ marginTop: "-10px" }}>{t("disclaimer")}:</Title>
                      <Text>{t("certified2gis")}</Text>
                    </div>
                  )}
                </div>

                <div style={{ position: "absolute", bottom: 0, width: "100%", textAlign: "center" }}>
                  <Row justify="center" align="middle">
                    <Typography.Text type="secondary">
                      {`V ${localmanifestVersion?.localVersion ?? ""}`}
                    </Typography.Text>
                  </Row>
                </div>
              </>
            ) : (
              <Form
                form={form}
                style={{ padding: 12, maxWidth: 400, margin: "0 auto" }}
                layout="vertical"
                onFinish={onActivateSubmit} // Handles form submission
              >
                {/* Name */}
                <Form.Item name="name" rules={[{ required: true, message: t("nameRequired") }]}>
                  <Input value={name} onChange={(e) => setName(e.target.value)} prefix={<VscAccount style={{ fontSize: "1.2rem" }} />} placeholder={t("enterName")} />
                </Form.Item>
                {/* Email */}
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: t("emailRequired") },
                    { type: "email", message: t("emailInvalid") }
                  ]}
                >
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} prefix={<MailOutlined />} placeholder={t("enterEmail")} />
                </Form.Item>
                {/* Phone */}
                <Form.Item name="phone" rules={[{ required: true, message: t("phoneRequired") }]}>
                  <PhoneInput value={phone} onChange={(phone) => setPhone(phone)} country={"in"} inputStyle={{ width: "100%" }} />
                </Form.Item>
                {/* City */}
                <Form.Item name="city" rules={[{ required: true, message: t("cityRequired") }]}>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} prefix={<IoHomeOutline style={{ fontSize: "1.2rem" }} />} placeholder={t("enterCity")} />
                </Form.Item>
                {/* Country */}
                <Form.Item name="country" rules={[{ required: true, message: t("selectCountry") }]}>
                  {/* <IoLocationOutline style={{ fontSize: "1.2rem" }} /> */}
                  <Select value={country} onChange={(value) => setCountry(value)} prefix={<IoLocationOutline style={{ fontSize: "1.2rem" }} />} placeholder={t("selectCountry")} showSearch>
                    {countryList.map((x) => (
                      <Option key={x.countryCode}
                        value={x.countryNameEn}
                        label={x.countryNameEn}>
                        {x.countryNameEn}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                {/* License Key */}
                <Form.Item
                  name="key"
                  validateStatus={!keyIsValid && licenceKeyErrorMessage ? "error" : ""}
                  help={!keyIsValid && licenceKeyErrorMessage ? licenceKeyErrorMessage : ""}
                  rules={[{ required: true, message: t("enterLicenseKey") }]}
                >
                  <Input
                    value={key}
                    onChange={(e) => {
                      setKey(e.target.value);
                      checkLicense(e.target.value); // Call checkLicense when user types
                    }}
                    prefix={<MdKey style={{ fontSize: "1.2rem" }} />}
                    suffix={keyIsValid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    placeholder={t("enterLicenseKey")}
                  />
                </Form.Item>

                {/* Get Trial */}
                <Form.Item style={{ textAlign: "right", marginTop: "-10px" }}>
                  <Text style={{ cursor: "pointer" }} onClick={getTrial}>
                    {t("getTrial")}
                  </Text>
                </Form.Item>
                {/* Buttons */}
                <Flex justify="center">
                  <Space>
                    <Button type="primary" htmlType="submit">
                      {t("activate")}
                    </Button>
                    {(product?.siteUrl || rData?.buy_url) && (
                      <Button>
                        <a href={product?.siteUrl || rData?.buy_url} target="_blank" rel="noopener noreferrer">
                          {t("buyNow")}
                        </a>
                      </Button>
                    )}
                  </Space>
                </Flex>
              </Form>
            )}
          </div>
        )}
      </ConfigProvider>
    </>
  );
};

export default MyForm;