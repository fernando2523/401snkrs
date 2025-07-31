import Head from "next/head";
import Image from "next/image";
import * as fa from "react-icons/fa";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";
import React, { Component, useEffect, useRef, useState } from "react";
import Link from "next/link";
import TableHeaderRow from "@nextui-org/react/types/table/table-header-row";
import { Collapse } from "react-collapse";
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import axios from "axios";
import {
  compareAsc,
  format,
  subDays,
  lastDayOfMonth,
  startOfMonth,
  startOfWeek,
  lastDayOfWeek,
  startOfYear,
} from "date-fns";
import Datepicker from "react-tailwindcss-datepicker";
import Cookies from "js-cookie";

export default function Refund() {
  const [isLoading, setisLoading]: any = useState(true);
  const [data_refund, setlist_refund]: any = useState([]);
  const [data_store, setdatastore] = useState([]);


  async function getdatarefund(tanggal: any, Store: any, Role: any, area: any, Query: any, datechange: any) {
    await axios
      .post("https://api.401snkrs.com/v1/getretur", {
        tanggal: tanggal,
        store: Store,
        role: Role,
        area: area,
        query: Query,
        datechange: datechange,
      })
      .then(function (response) {
        // handle success
        setlist_refund(response.data.result);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }

  const [Query, setQuery] = useState("all");
  if ("HEAD-AREA" === Cookies.get("auth_role")) {
    var [Store, setStore] = useState(("all_area"));
  } else if (("SUPER-ADMIN" === Cookies.get("auth_role"))) {
    var [Store, setStore] = useState(("all"));
  } else {
    var [Store, setStore] = useState(Cookies.get("auth_store"));
  }

  const [datechange, setdatechange] = useState("dateact");
  const [Role, setRole] = useState(Cookies.get("auth_role"));
  const [area, setarea] = useState((Cookies.get("auth_store")));

  useEffect(() => {
    getdatarefund(date, Store, Role, area, Query, datechange);
    getstore(Role, area);
  }, []);

  async function getstore(Role: any, area: any) {
    await axios({
      method: "post",
      url: `https://api.401snkrs.com/v1/getstoredisplay`,
      data: {
        role: Role,
        store: area,
      },
    })
      .then(function (response) {
        setdatastore(response.data.result);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const list_store: any = [];
  if (isLoading) {
    data_store.map((data_store: any, index: number) => {
      list_store.push(
        <option key={index} value={data_store.id_store}>
          {data_store.store}
        </option>
      );
    });
  }

  const list_produk: any = [];

  if (isLoading) {
    var no_urut = 1;
    var product_counts = data_refund.length;
    data_refund.map((data_refund: any, index: number) => {
      return list_produk.push(
        <div key={index}>
          <div className="mb-2  group hover:shadow-lg ">
            <div className="bg-white flex flex-row h-[40px] rounded-lg items-center px-0 text-[9px]">
              <div className="basis-14 text-center">{no_urut++}</div>
              <div className="basis-36 text-center">{format(new Date(data_refund.tanggal_retur), 'dd-MM-yyyy')}</div>
              <div className="basis-36 text-center">{format(new Date(data_refund.tanggal_input), 'dd-MM-yyyy')}</div>
              <div className="basis-32 text-center">{data_refund.id_pesanan}</div>
              {/* <div className="grow text-center">{data_refund.source}</div> */}
              <div className="basis-32 text-center">{data_refund.id_produk}</div>
              <div className="grow text-left">{data_refund.produk}</div>
              <div className="basis-28 text-center">{data_refund.size_lama}</div>
              <div className="basis-28 text-center">{data_refund.size_baru}</div>
              <div className="basis-28 text-center">{data_refund.qty_retur}</div>
              <div className="basis-32 text-center">{data_refund.store}</div>
              <div className="basis-36 text-center">{data_refund.keterangan}</div>
              <div className="basis-32 text-center">{data_refund.users}</div>
            </div>
          </div >
        </div >
      );
    });
  }

  const [value, setValues]: any = useState({
    startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    endDate: format(lastDayOfMonth(new Date()), "yyyy-MM-dd"),
  });

  const handleValueChange = (newValue: any) => {
    if (newValue.startDate === null || newValue.endDate === null) {
      setDate(startDate + " to " + lastDate);
      getdatarefund(startDate + " to " + lastDate, Store, Role, area, Query, datechange);
    } else {
      setDate(newValue.startDate + " to " + newValue.endDate);
      getdatarefund(newValue.startDate + " to " + newValue.endDate, Store, Role, area, Query, datechange);
    }
    setValues(newValue);
  };

  const startDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const lastDate = format(lastDayOfMonth(new Date()), "yyyy-MM-dd");
  const [date, setDate] = useState(startDate + " to " + lastDate);

  const today: any = "Hari Ini";
  const yesterday: any = "Kemarin";
  const currentMonth: any = "Bulan ini";
  const pastMonth: any = "Bulan Kemarin";
  const mingguinistart: any = format(startOfWeek(new Date()), "yyyy-MM-dd");
  const mingguiniend: any = format(lastDayOfWeek(new Date()), "yyyy-MM-dd");
  const break2month: any = format(subDays(lastDayOfWeek(new Date()), 66), "yyyy-MM-dd");
  const minggukemarinstart: any = format(
    subDays(startOfWeek(new Date()), 7),
    "yyyy-MM-dd"
  );
  const minggukemarinend: any = format(
    subDays(lastDayOfWeek(new Date()), 7),
    "yyyy-MM-dd"
  );
  const todayDate: any = format(new Date(), "yyyy-MM-dd");



  function querySet(e: any) {
    if (e.target.value === "") {
      setQuery("all");
      getdatarefund(date, Store, Role, area, "all", datechange);
    } else {
      setQuery(e.target.value);
      getdatarefund(date, Store, Role, area, e.target.value, datechange);

    }
  }


  return (
    <div className="p-5">
      <div className="font-bold text-3xl border-b border-[#2125291A] h-16 mb-7">
        Return Size
      </div>

      <ToastContainer className="mt-[50px]" />

      <div className="flex flex-wrap items-center content-center mb-6">
        {/* <div className="basis-1/4 rounded-lg w-auto flex flex-row text-center content-center">
          <input
            className="h-[45px] border-0 w-[300px] pr-3 pl-5  text-gray-700 focus:outline-none rounded-l-lg"
            type="text"
            placeholder="Search data refund BY users.."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />

          <button
            type="button"
            className="rounded-r-lg bg-white h-[45px] text-gray-700 font-medium px-5"
          >
            <div className="my-auto">
              <fa.FaSearch size={17} className="text-gray-700" />
            </div>
          </button>
        </div> */}

        <div className="basis-1/4 rounded-lg w-auto flex flex-row text-center content-center">
          {/* <button type="button" className="rounded-l-lg bg-gray-200 hover:bg-gray-300 h-[50px] text-gray-700 font-medium px-4 flex flex-wrap gap-2 content-center">
                        <span>Order ID</span>
                        <div className="my-auto">
                            <fa.FaChevronDown size={10} className="text-gray-700" />
                        </div>
                    </button> */}

          <input
            onChange={(e) => {
              querySet(e);
              // loaddataorder(status_pesanan, Query, Store, date)
            }}
            className="h-[45px] border-0 w-[100%] py-2 pl-5 pr-3 text-gray-700 focus:outline-none rounded-l-lg"
            type="text"
            placeholder="Search..."
          />

          <button
            type="button"
            className="rounded-r-lg bg-white hover:bg-gray-200 h-[45px] text-gray-700 font-medium px-5"
          >
            <div className="my-auto">
              <fa.FaSearch size={17} className="text-gray-700" />
            </div>
          </button>
        </div>

        <select
          value={Store}
          onChange={(e) => {
            setStore(e.target.value);
            getdatarefund(date, e.target.value, Role, area, Query, datechange);
          }}
          className={`ml-3 appearance-none border h-[45px] w-[20%] px-5 text-gray-700 focus:outline-none rounded-lg`}
        >
          {"SUPER-ADMIN" === Cookies.get("auth_role") || "HEAD-AREA" === Cookies.get("auth_role") ? (
            <>
              <option value="all">All Store</option>
              {list_store}
            </>
          ) : (
            <>
              {list_store}
            </>
          )}
        </select>

        <select
          value={datechange}
          onChange={(e) => {
            setdatechange(e.target.value);
            getdatarefund(date, Store, Role, area, Query, e.target.value);
          }}
          className={`ml-3 appearance-none border h-[45px] w-[20%] px-5 text-gray-700 focus:outline-none rounded-lg`}
        >
          <option value="dateact">Tanggal Return</option>
          <option value="dateinput">Tanggal Input</option>
        </select>

        <div className="basis-1/4 ml-auto">
          {"SUPER-ADMIN" === Cookies.get("auth_role") ? (
            <>
              <Datepicker
                displayFormat="DD-MM-YYYY"
                primaryColor="blue"
                value={value}
                onChange={handleValueChange}
                showShortcuts={true}
                showFooter={true}
                // minDate={new Date(break2month)}
                configs={{
                  shortcuts: {
                    today: today,
                    yesterday: yesterday,
                    mingguini: {
                      text: "Minggu Ini",
                      period: {
                        start: mingguinistart,
                        end: mingguiniend,
                      },
                    },
                    minggukemarin: {
                      text: "Minggu Kemarin",
                      period: {
                        start: minggukemarinstart,
                        end: minggukemarinend,
                      },
                    },
                    currentMonth: currentMonth,
                    pastMonth: pastMonth,
                    alltime: {
                      text: "Semua",
                      period: {
                        start: "2023-01-01",
                        end: todayDate,
                      },
                    },
                  },
                  footer: {
                    cancel: "Close",
                    apply: "Apply",
                  },
                }}
                placeholder="Pilih Tanggal"
                inputClassName="text-gray-500 h-[45px] text-start py-2 px-4 w-full rounded-lg focus:outline-none"
              />
            </>) : (<>
              <Datepicker
                displayFormat="DD-MM-YYYY"
                primaryColor="blue"
                value={value}
                onChange={handleValueChange}
                showShortcuts={true}
                showFooter={true}
                minDate={new Date(break2month)}
                configs={{
                  shortcuts: {
                    today: today,
                    yesterday: yesterday,
                    mingguini: {
                      text: "Minggu Ini",
                      period: {
                        start: mingguinistart,
                        end: mingguiniend,
                      },
                    },
                    minggukemarin: {
                      text: "Minggu Kemarin",
                      period: {
                        start: minggukemarinstart,
                        end: minggukemarinend,
                      },
                    },
                    currentMonth: currentMonth,
                    pastMonth: pastMonth,
                    // alltime: {
                    //   text: "Semua",
                    //   period: {
                    //     start: "2023-01-01",
                    //     end: todayDate,
                    //   },
                    // },
                  },
                  footer: {
                    cancel: "Close",
                    apply: "Apply",
                  },
                }}
                placeholder="Pilih Tanggal"
                inputClassName="text-gray-500 h-[45px] text-start py-2 px-4 w-full rounded-lg focus:outline-none"
              />
            </>)}
        </div>



      </div>
      <div className="items-center content-center mb-3 mt-3  scroll-m-96">

        <div className="bg-[#323232] flex flex-row h-[40px] rounded-lg font-bold text-white items-center text-[10px]">
          <div className="basis-14 text-center">No.</div>
          <div className="basis-36 text-center">Date Return</div>
          <div className="basis-36 text-center">Date Input</div>
          <div className="basis-32 text-center">ID Order</div>
          {/* <div className="grow text-center">Source</div> */}
          <div className="basis-32 text-center">ID Product</div>
          <div className="grow text-left">Product</div>
          <div className="basis-28 text-center">Size Old</div>
          <div className="basis-28 text-center">Size New</div>
          <div className="basis-28 text-center">Qty</div>
          <div className="basis-32 text-center">Store</div>
          <div className="basis-36 text-center">Information</div>
          <div className="basis-32 text-center">Users</div>
        </div>

      </div>
      <div className="items-center content-center mb-3 mt-3 ">
        {(function () {
          if (product_counts < 1) {
            return (
              <div className=" text-center mt-10">
                Products are not yet available, please select a warehouse..
              </div>
            );
          } else {
            return list_produk;
          }
        })()}
      </div>
    </div>
  );
}
