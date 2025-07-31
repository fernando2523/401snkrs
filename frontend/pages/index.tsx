import Head from "next/head";
import Image from "next/image";
import * as fa from "react-icons/fa";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";
import React, { Component, useRef, useState, useEffect } from "react";
import {
  compareAsc,
  format,
  subDays,
  lastDayOfMonth,
  startOfMonth,
  startOfWeek,
  lastDayOfWeek,
  startOfDay,
  endOfDay,
  endOfMonth,
} from "date-fns";
import Datepicker from "react-tailwindcss-datepicker";
import useSWR from "swr";
import axios from "axios";
import { BeakerIcon, ClipboardDocumentIcon } from "@heroicons/react/24/solid";
import {
  ArchiveRestore,
  BadgeDollarSign,
  BadgeDollarSignIcon,
  Banknote,
  BarChart4,
  BookKey,
  Box,
  Boxes,
  Check,
  ChevronsUpDown,
  Coffee,
  Coins,
  Container,
  DollarSign,
  DollarSignIcon,
  Dumbbell,
  FileStack,
  Package,
  UserRound,
} from "lucide-react";
import Cookies from "js-cookie";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

let Rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
// Rupiah.format(data.gross_sale)

export default function Home() {
  const [Role, setRole] = useState(Cookies.get("auth_role"));
  const [Channel, setchannel] = useState(Cookies.get("auth_channel"));
  const [isLoading, setisLoading]: any = useState(true);
  const [data_store, setdatastore] = useState([]);
  const [dashboard, setdatadashboard]: any = useState([]);
  const [topten, settopten]: any = useState([]);
  const [TopBrand, setTopBrand]: any = useState([]);
  const [toptenreseller, settoptenreseller]: any = useState([]);

  useEffect(() => {
    loaddashboard(Store, date, area, Role);
    getstore(Role, area);
    return () => { };
  }, []);

  async function loaddashboard(store: any, date: any, area: any, role: any) {
    setisLoading(true);
    await axios({
      method: "post",
      url: `https://api.401snkrs.com/v1/getdashboard`,
      data: {
        store: store,
        date: date,
        area: area,
        role: Role,
      },
    })
      .then(function (response) {
        setdatadashboard(response.data.result);
        setdatatoday(response.data.result.today);
        settopten(response.data.result.list_top_10_produk);
        settoptenreseller(response.data.result.list_top_10_reseller);
        setTopBrand(response.data.result.top_brand);
        setisLoading(false);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const [value, setValue]: any = useState();
  const handleValueChange = (newValue: any) => {
    if (newValue.startDate === null || newValue.endDate === null) {
      setDate(startDate + " to " + lastDate);
    } else {
      setDate(newValue.startDate + " to " + newValue.endDate);
      loaddashboard(Store, newValue.startDate + " to " + newValue.endDate, area, Role);
    }
    setValue(newValue);
  };
  const startDate = format(startOfDay(new Date()), "yyyy-MM-dd");
  const lastDate = format(endOfDay(new Date()), "yyyy-MM-dd");
  const [date, setDate] = useState(startDate + " to " + lastDate);

  const cektoday = new Date();
  const cekHariIni = format(cektoday, 'yyyy-MM-dd');
  const [datatoday, setdatatoday] = useState(cekHariIni);

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

  if ("HEAD-AREA" === Cookies.get("auth_role")) {
    var [Store, setStore] = useState(("all_area"));
  } else {
    var [Store, setStore] = useState(("all"));
  }
  const [area, setarea] = useState((Cookies.get("auth_store")));

  if (!isLoading) {
    var gross_sale = Rupiah.format(dashboard.gross_sale);
    var gross_sale_online = Rupiah.format(dashboard.gross_sale_online);
    var expense = Rupiah.format(dashboard.expense);
    var margin = Rupiah.format(dashboard.margin);
    var transactions = dashboard.transactions;
    var hasil_qty = dashboard.hasil_qty;
    var produkgudangsold = dashboard.produkgudangsold;
    var produkextsold = dashboard.produkextsold;
    var cancel_sales = dashboard.cancel_sales;

    var costgudang = Rupiah.format(dashboard.costgudang);
    var costluar = Rupiah.format(dashboard.costluar);

    var profit = Rupiah.format(dashboard.profit);
    var paid = Rupiah.format(dashboard.paid);
    var pending = Rupiah.format(dashboard.pending);

    var cash = Rupiah.format(dashboard.cash);
    var bca = Rupiah.format(dashboard.bca);
    var qris = Rupiah.format(dashboard.qris);
    var totalpembayaran = Rupiah.format(dashboard.totalpembayaran);
    var pendapatanbersih = Rupiah.format(dashboard.pendapatanbersih);
    var total_discount = Rupiah.format(dashboard.total_discount);
    var total_gross_sales = Rupiah.format(dashboard.total_gross_sales);
  }

  async function getstore(role: any, area: any) {
    await axios({
      method: "post",
      url: `https://api.401snkrs.com/v1/getstore_dashboard`,
      data: {
        role: role,
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
  const fixed_store: any = [];
  if (!isLoading) {
    data_store.map((store: any, index: number) => {
      list_store.push(
        <option key={index} value={store.id_store}>
          {store.store}
        </option>
      );
    });
  }
  // } else {
  // var data_store: any = [];
  // }

  return (
    <div className="p-5">
      <div className="flex flex-wrap gap-3 pb-4 items-center border-b border-[#2125291A] content-center mb-7">
        <div className="font-bold text-xl">Dashboard</div>
        <div className="grow font-normal italic text-sm pt-1">
          Displaying Data : {String(date)}{" "}
        </div>
        <div className="flex text-sm flex-row items-center w-[20%] justify-end">

          <select
            value={Store}
            onChange={(e) => {
              setStore(e.target.value);
              loaddashboard(e.target.value, date, area, Role);
            }}
            className={`appearance-none border h-[45px] w-[100%] px-5  text-gray-700 focus:outline-none rounded-lg`}
          >
            <option value="all">All Store</option>
            {list_store}
          </select>

        </div>
        <div className="shadow rounded-lg ml-auto w-[290px] flex flex-row items-center justify-end">
          {"SUPER-ADMIN" === Cookies.get("auth_role") ? (
            <>
              <Datepicker
                displayFormat="DD-MM-YYYY"
                primaryColor="blue"
                value={value}
                onChange={handleValueChange}
                showShortcuts={true}
                showFooter={true}
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
                placeholder="Select Date"
                inputClassName="text-gray-500 h-[45px] text-start py-2 px-4 w-full rounded-lg focus:outline-none"
              />
            </>) : (
            <>
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
                placeholder="Select Date"
                inputClassName="text-gray-500 h-[45px] text-start py-2 px-4 w-full rounded-lg focus:outline-none"
              />
            </>
          )}
        </div>

        {/* <div className="shadow rounded-lg ml-auto w-[290px] flex flex-row items-center justify-end">
                    <Flatpickr
                        className="text-gray-500 h-[45px] text-start py-2 px-4 w-full rounded-lg focus:outline-none"
                        value={date}
                        placeholder="Select Date Range"
                        options={{
                            mode: "range",
                            dateFormat: "Y-m-d",
                            enableTime: false,
                            // disable: [
                            //   function (date) {
                            //     return !(date.getDate() % 8);
                            //   }
                            // ]
                            onClose: function (selectedDates, dateStr, instance) {
                                setDate(dateStr);
                            },
                        }}
                    />

                    <i className="fi fi-rr-calendar w-[1.12rem] h-[1.12rem] text-center text-gray-500 text-[1.12rem] leading-4 absolute mr-4"></i>
                </div> */}
      </div>

      {"SUPER-ADMIN" === Cookies.get("auth_role") ? (
        <div className="-mt-2">
          <div className=" grow flex flex-row mt-0 gap-3 text-black">
            <div className="basis-1/6 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Total Sales
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {transactions ? transactions : 0} Pesanan
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <ClipboardDocumentIcon className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>

            <div className="grow bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Total Qty
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {hasil_qty ? hasil_qty : 0} Pcs
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <ClipboardDocumentIcon className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>

            <div className="grow bg-gray-50 border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Gross Online Revenue
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {gross_sale_online ? gross_sale_online : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <Box className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>

            <div className="grow bg-lime-100 border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Gross Retail Revenue
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {gross_sale ? gross_sale : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <Box className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>

            <div className="grow bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Total Gross Revenue
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {total_gross_sales ? total_gross_sales : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <Box className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>
          </div>

          <div className=" flex flex-row mt-3 gap-3 text-black">
            <div className="grow bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Discount
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {total_discount ? total_discount : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <ArchiveRestore className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>

            <div className="grow bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Expense
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {expense ? expense : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <ArchiveRestore className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>

            <div className="grow bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Net Revenue
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {pendapatanbersih ? pendapatanbersih : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <Box className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>

            <div className="grow bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4 px-5">
                Cost
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {costgudang ? costgudang : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <BadgeDollarSignIcon className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>

            <div className="grow bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">Profit</div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {profit ? profit : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <BookKey className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>
          </div>

          <div className="  flex flex-row mt-3 gap-3 text-black">
            <div className="basis-1/3 bg-lime-200 border border-gray-300  h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4 px-5">Cash</div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {cash ? cash : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <Banknote className="h-7 w-7 -mt-1 text-black text-right" />
                </div>
              </div>
            </div>
            <div className="basis-1/3 bg-blue-300 border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4 px-5">Debit</div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {bca ? bca : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <Image
                    className="aspect-square h-7 w-[65px]"
                    src="/logodebit.png"
                    width={500}
                    height={300}
                    alt="Picture of the author"
                  />
                </div>
              </div>
            </div>

            <div className="basis-1/3 bg-lime-100 border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4 px-5">
                Total Payment
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {totalpembayaran ? totalpembayaran : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <DollarSign className="h-10 w-10 -mt-1 text-black text-right" />
                </div>
              </div>
            </div>
          </div>

          <div className=' flex flex-row mt-3 gap-3 text-black'>
            <div className='basis-1/4 bg-white border border-gray-300 h-[full] rounded-lg shadow-md'>
              <div className='text-md font-semibold py-4 px-5'>
                TOP Brand
              </div>
              {TopBrand.map((list_topBrand: any, index2: number) => {
                return (
                  <div key={index2} className='flex flex-row text-left mb-3'>
                    <div className='basis-auto mt-1 mx-4 -mr-2'>
                      {index2++ + 1}
                    </div>
                    <div className='basis-auto mt-1 mx-4 -mr-2'>
                      <Boxes className="h-6 w-6 text-black text-right -mt-1" />
                    </div>
                    <div className='grow text-md font-normal py-0 px-5 text-left'>
                      {list_topBrand.brand}
                    </div>
                    <div className='basis-1/6 text-right mt-1 mx-5 text-md font-bold'>
                      {list_topBrand.total_qty} Pcs
                    </div>
                  </div>
                );
              })}
            </div>
            <div className='grow bg-white border border-gray-300 h-[full] rounded-lg shadow-md'>
              <div className='text-md font-semibold py-4 px-5'>
                TOP 20 Product
              </div>
              {topten.map((list_top_10_produk: any, index2: number) => {
                return (
                  <div key={index2} className='flex flex-row text-left mb-3'>
                    <div className='basis-auto mt-1 mx-4 -mr-2'>
                      {index2++ + 1}
                    </div>
                    <div className='basis-auto mt-1 mx-4 -mr-2'>
                      <Boxes className="h-6 w-6 text-black text-right -mt-1" />
                    </div>
                    <div className='basis-full text-md font-normal py-0 px-5 text-left'>
                      {list_top_10_produk.produk}
                    </div>
                    <div className='basis-1/6 text-right mt-1 mx-5 text-md font-bold'>
                      {list_top_10_produk.qty} Pcs
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : "HEAD-AREA" === Cookies.get("auth_role") ? (
        <div className="-mt-2">
          <div className=" grow flex flex-row mt-0 gap-3 text-black">
            <div className="basis-1/6 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Total Sales
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {transactions ? transactions : 0} Pesanan
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <ClipboardDocumentIcon className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>

            <div className="grow bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Total Qty
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {hasil_qty ? hasil_qty : 0} Pcs
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <ClipboardDocumentIcon className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>

            <div className="grow bg-gray-50 border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Gross Online Revenue
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {gross_sale_online ? gross_sale_online : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <Box className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>

            <div className="grow bg-lime-100 border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Gross Retail Revenue
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {gross_sale ? gross_sale : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <Box className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>

            <div className="grow bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Total Gross Revenue
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {total_gross_sales ? total_gross_sales : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <Box className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>
          </div>

          <div className=" flex flex-row mt-3 gap-3 text-black">
            <div className="grow bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Discount
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {total_discount ? total_discount : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <ArchiveRestore className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>

            <div className="grow bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Expense
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {expense ? expense : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <ArchiveRestore className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>

            <div className="grow bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4  px-5">
                Net Revenue
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {pendapatanbersih ? pendapatanbersih : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <Box className="h-7 w-7 -mt-2 text-black text-right" />
                </div>
              </div>
            </div>
          </div>

          <div className="  flex flex-row mt-3 gap-3 text-black">
            <div className="basis-1/3 bg-lime-200 border border-gray-300  h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4 px-5">Cash</div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {cash ? cash : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <Banknote className="h-7 w-7 -mt-1 text-black text-right" />
                </div>
              </div>
            </div>
            <div className="basis-1/3 bg-blue-300 border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4 px-5">Debit</div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {bca ? bca : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <Image
                    className="aspect-square h-7 w-[65px]"
                    src="/logodebit.png"
                    width={500}
                    height={300}
                    alt="Picture of the author"
                  />
                </div>
              </div>
            </div>

            <div className="basis-1/3 bg-lime-100 border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
              <div className="text-md font-semibold py-4 px-5">
                Total Payment
              </div>
              <div className="flex flex-row text-left  mt-2">
                <div className="basis-full text-lg font-semibold py-0 px-5">
                  {totalpembayaran ? totalpembayaran : 0}
                </div>
                <div className=" basis-auto mt-1 mx-5">
                  <DollarSign className="h-10 w-10 -mt-1 text-black text-right" />
                </div>
              </div>
            </div>
          </div>

          <div className=' flex flex-row mt-3 gap-3 text-black'>
            <div className='basis-1/4 bg-white border border-gray-300 h-[full] rounded-lg shadow-md'>
              <div className='text-md font-semibold py-4 px-5'>
                TOP Brand
              </div>
              {TopBrand.map((list_topBrand: any, index2: number) => {
                return (
                  <div key={index2} className='flex flex-row text-left mb-3'>
                    <div className='basis-auto mt-1 mx-4 -mr-2'>
                      {index2++ + 1}
                    </div>
                    <div className='basis-auto mt-1 mx-4 -mr-2'>
                      <Boxes className="h-6 w-6 text-black text-right -mt-1" />
                    </div>
                    <div className='grow text-md font-normal py-0 px-5 text-left'>
                      {list_topBrand.brand}
                    </div>
                    <div className='basis-1/6 text-right mt-1 mx-5 text-md font-bold'>
                      {list_topBrand.total_qty} Pcs
                    </div>
                  </div>
                );
              })}
            </div>
            <div className='grow bg-white border border-gray-300 h-[full] rounded-lg shadow-md'>
              <div className='text-md font-semibold py-4 px-5'>
                TOP 20 Product
              </div>
              {topten.map((list_top_10_produk: any, index2: number) => {
                return (
                  <div key={index2} className='flex flex-row text-left mb-3'>
                    <div className='basis-auto mt-1 mx-4 -mr-2'>
                      {index2++ + 1}
                    </div>
                    <div className='basis-auto mt-1 mx-4 -mr-2'>
                      <Boxes className="h-6 w-6 text-black text-right -mt-1" />
                    </div>
                    <div className='basis-full text-md font-normal py-0 px-5 text-left'>
                      {list_top_10_produk.produk}
                    </div>
                    <div className='basis-1/6 text-right mt-1 mx-5 text-md font-bold'>
                      {list_top_10_produk.qty} Pcs
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        <>
          {"OFFLINE STORE" === Cookies.get("auth_channel") ? (
            <>
              <div className="-mt-2">

                <div className="flex flex-row mt-0 gap-3 text-black">
                  {cekHariIni === datatoday ? (
                    <>
                      <div className="basis-1/4 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                        <div className="text-md font-semibold py-4  px-5">
                          Total Sales
                        </div>
                        <div className="flex flex-row text-left  mt-2">
                          <div className="basis-full text-lg font-semibold py-0 px-5">
                            {transactions ? transactions : 0}
                          </div>
                          <div className=" basis-auto mt-1 mx-5">
                            <ClipboardDocumentIcon className="h-7 w-7 -mt-2 text-black text-right" />
                          </div>
                        </div>
                      </div>

                      <div className="basis-1/4 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                        <div className="text-md font-semibold py-4  px-5">
                          Total Qty
                        </div>
                        <div className="flex flex-row text-left  mt-2">
                          <div className="basis-full text-lg font-semibold py-0 px-5">
                            {hasil_qty ? hasil_qty : 0} Pcs
                          </div>
                          <div className=" basis-auto mt-1 mx-5">
                            <ClipboardDocumentIcon className="h-7 w-7 -mt-2 text-black text-right" />
                          </div>
                        </div>
                      </div>

                      <div className="basis-1/4 bg-lime-100 border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                        <div className="text-md font-semibold py-4  px-5">
                          Gross Retail Revenue
                        </div>
                        <div className="flex flex-row text-left  mt-2">
                          <div className="basis-full text-lg font-semibold py-0 px-5">
                            {gross_sale ? gross_sale : 0}
                          </div>
                          <div className=" basis-auto mt-1 mx-5">
                            <Box className="h-7 w-7 -mt-2 text-black text-right" />
                          </div>
                        </div>
                      </div>

                      <div className="basis-1/4 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                        <div className="text-md font-semibold py-4  px-5">
                          Total Gross Revenue
                        </div>
                        <div className="flex flex-row text-left  mt-2">
                          <div className="basis-full text-lg font-semibold py-0 px-5">
                            {total_gross_sales ? total_gross_sales : 0}
                          </div>
                          <div className=" basis-auto mt-1 mx-5">
                            <Box className="h-7 w-7 -mt-2 text-black text-right" />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="basis-1/2 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                        <div className="text-md font-semibold py-4  px-5">
                          Total Sales
                        </div>
                        <div className="flex flex-row text-left  mt-2">
                          <div className="basis-full text-lg font-semibold py-0 px-5">
                            {transactions ? transactions : 0}
                          </div>
                          <div className=" basis-auto mt-1 mx-5">
                            <ClipboardDocumentIcon className="h-7 w-7 -mt-2 text-black text-right" />
                          </div>
                        </div>
                      </div>

                      <div className="basis-1/2 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                        <div className="text-md font-semibold py-4  px-5">
                          Total Qty
                        </div>
                        <div className="flex flex-row text-left  mt-2">
                          <div className="basis-full text-lg font-semibold py-0 px-5">
                            {hasil_qty ? hasil_qty : 0} Pcs
                          </div>
                          <div className=" basis-auto mt-1 mx-5">
                            <ClipboardDocumentIcon className="h-7 w-7 -mt-2 text-black text-right" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}


                </div>

                <div className=" flex flex-row mt-3 gap-3 text-black">
                  {cekHariIni === datatoday ? (
                    <>
                      <div className="basis-1/3 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                        <div className="text-md font-semibold py-4  px-5">
                          Discount
                        </div>
                        <div className="flex flex-row text-left  mt-2">
                          <div className="basis-full text-lg font-semibold py-0 px-5">
                            {total_discount ? total_discount : 0}
                          </div>
                          <div className=" basis-auto mt-1 mx-5">
                            <ArchiveRestore className="h-7 w-7 -mt-2 text-black text-right" />
                          </div>
                        </div>
                      </div>

                      <div className="basis-1/3 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                        <div className="text-md font-semibold py-4  px-5">
                          Expense
                        </div>
                        <div className="flex flex-row text-left  mt-2">
                          <div className="basis-full text-lg font-semibold py-0 px-5">
                            {expense ? expense : 0}
                          </div>
                          <div className=" basis-auto mt-1 mx-5">
                            <ArchiveRestore className="h-7 w-7 -mt-2 text-black text-right" />
                          </div>
                        </div>
                      </div>

                      <div className="basis-1/3 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                        <div className="text-md font-semibold py-4  px-5">
                          Net Revenue
                        </div>
                        <div className="flex flex-row text-left  mt-2">
                          <div className="basis-full text-lg font-semibold py-0 px-5">
                            {pendapatanbersih ? pendapatanbersih : 0}
                          </div>
                          <div className=" basis-auto mt-1 mx-5">
                            <Box className="h-7 w-7 -mt-2 text-black text-right" />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    null
                  )}
                </div>
                {cekHariIni === datatoday ?
                  (<>
                    <div className="  flex flex-row mt-3 gap-3 text-black">
                      <div className="basis-1/3 bg-lime-200 border border-gray-300  h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                        <div className="text-md font-semibold py-4 px-5">Cash</div>
                        <div className="flex flex-row text-left  mt-2">
                          <div className="basis-full text-lg font-semibold py-0 px-5">
                            {cash ? cash : 0}
                          </div>
                          <div className=" basis-auto mt-1 mx-5">
                            <Banknote className="h-7 w-7 -mt-1 text-black text-right" />
                          </div>
                        </div>
                      </div>
                      <div className="basis-1/3 bg-blue-300 border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                        <div className="text-md font-semibold py-4 px-5">BCA</div>
                        <div className="flex flex-row text-left  mt-2">
                          <div className="basis-full text-lg font-semibold py-0 px-5">
                            {bca ? bca : 0}
                          </div>
                          <div className=" basis-auto mt-1 mx-5">
                            <Image
                              className="aspect-square h-7 w-[65px]"
                              src="/logodebit.png"
                              width={500}
                              height={300}
                              alt="Picture of the author"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="basis-1/3 bg-lime-100 border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                        <div className="text-md font-semibold py-4 px-5">
                          Total Payment
                        </div>
                        <div className="flex flex-row text-left  mt-2">
                          <div className="basis-full text-lg font-semibold py-0 px-5">
                            {totalpembayaran ? totalpembayaran : 0}
                          </div>
                          <div className=" basis-auto mt-1 mx-5">
                            <DollarSign className="h-10 w-10 -mt-1 text-black text-right" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>)
                  :
                  (
                    null
                  )
                }
                <div className=' flex flex-row mt-3 gap-3 text-black'>
                  <div className='basis-1/4 bg-white border border-gray-300 h-[full] rounded-lg shadow-md'>
                    <div className='text-md font-semibold py-4 px-5'>
                      TOP Brand
                    </div>
                    {TopBrand.map((list_topBrand: any, index2: number) => {
                      return (
                        <div key={index2} className='flex flex-row text-left mb-3'>
                          <div className='basis-auto mt-1 mx-4 -mr-2'>
                            {index2++ + 1}
                          </div>
                          <div className='basis-auto mt-1 mx-4 -mr-2'>
                            <Boxes className="h-6 w-6 text-black text-right -mt-1" />
                          </div>
                          <div className='grow text-md font-normal py-0 px-5 text-left'>
                            {list_topBrand.brand}
                          </div>
                          <div className='basis-1/6 text-right mt-1 mx-5 text-md font-bold'>
                            {list_topBrand.total_qty} Pcs
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className='grow bg-white border border-gray-300 h-[full] rounded-lg shadow-md'>
                    <div className='text-md font-semibold py-4 px-5'>
                      TOP 20 Product
                    </div>
                    {topten.map((list_top_10_produk: any, index2: number) => {
                      return (
                        <div key={index2} className='flex flex-row text-left mb-3'>
                          <div className='basis-auto mt-1 mx-4 -mr-2'>
                            {index2++ + 1}
                          </div>
                          <div className='basis-auto mt-1 mx-4 -mr-2'>
                            <Boxes className="h-6 w-6 text-black text-right -mt-1" />
                          </div>
                          <div className='basis-full text-md font-normal py-0 px-5 text-left'>
                            {list_top_10_produk.produk}
                          </div>
                          <div className='basis-1/6 text-right mt-1 mx-5 text-md font-bold'>
                            {list_top_10_produk.qty} Pcs
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </>) :
            (
              <>
                <div className="-mt-2">
                  <div className=" flex flex-row mt-0 gap-3 text-black">
                    {cekHariIni === datatoday ? (
                      <>
                        <div className="basis-1/3 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                          <div className="text-md font-semibold py-4  px-5">
                            Total Sales
                          </div>
                          <div className="flex flex-row text-left  mt-2">
                            <div className="basis-full text-lg font-semibold py-0 px-5">
                              {transactions ? transactions : 0} Pesanan
                            </div>
                            <div className=" basis-auto mt-1 mx-5">
                              <ClipboardDocumentIcon className="h-7 w-7 -mt-2 text-black text-right" />
                            </div>
                          </div>
                        </div>

                        <div className="basis-1/3 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                          <div className="text-md font-semibold py-4  px-5">
                            Total Qty
                          </div>
                          <div className="flex flex-row text-left  mt-2">
                            <div className="basis-full text-lg font-semibold py-0 px-5">
                              {hasil_qty ? hasil_qty : 0} Pcs
                            </div>
                            <div className=" basis-auto mt-1 mx-5">
                              <ClipboardDocumentIcon className="h-7 w-7 -mt-2 text-black text-right" />
                            </div>
                          </div>
                        </div>

                        <div className="basis-1/3 bg-gray-50 border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                          <div className="text-md font-semibold py-4  px-5">
                            Gross Online Revenue
                          </div>
                          <div className="flex flex-row text-left  mt-2">
                            <div className="basis-full text-lg font-semibold py-0 px-5">
                              {gross_sale_online ? gross_sale_online : 0}
                            </div>
                            <div className=" basis-auto mt-1 mx-5">
                              <Box className="h-7 w-7 -mt-2 text-black text-right" />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="basis-1/2 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                          <div className="text-md font-semibold py-4  px-5">
                            Total Sales
                          </div>
                          <div className="flex flex-row text-left  mt-2">
                            <div className="basis-full text-lg font-semibold py-0 px-5">
                              {transactions ? transactions : 0} Pesanan
                            </div>
                            <div className=" basis-auto mt-1 mx-5">
                              <ClipboardDocumentIcon className="h-7 w-7 -mt-2 text-black text-right" />
                            </div>
                          </div>
                        </div>

                        <div className="basis-1/2 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                          <div className="text-md font-semibold py-4  px-5">
                            Total Qty
                          </div>
                          <div className="flex flex-row text-left  mt-2">
                            <div className="basis-full text-lg font-semibold py-0 px-5">
                              {hasil_qty ? hasil_qty : 0} Pcs
                            </div>
                            <div className=" basis-auto mt-1 mx-5">
                              <ClipboardDocumentIcon className="h-7 w-7 -mt-2 text-black text-right" />
                            </div>
                          </div>
                        </div>
                      </>
                    )
                    }
                  </div>

                  <div className=' flex flex-row mt-3 gap-3 text-black'>
                    <div className='basis-1/4 bg-white border border-gray-300 h-[full] rounded-lg shadow-md'>
                      <div className='text-md font-semibold py-4 px-5'>
                        TOP Brand
                      </div>
                      {TopBrand.map((list_topBrand: any, index2: number) => {
                        return (
                          <div key={index2} className='flex flex-row text-left mb-3'>
                            <div className='basis-auto mt-1 mx-4 -mr-2'>
                              {index2++ + 1}
                            </div>
                            <div className='basis-auto mt-1 mx-4 -mr-2'>
                              <Boxes className="h-6 w-6 text-black text-right -mt-1" />
                            </div>
                            <div className='grow text-md font-normal py-0 px-5 text-left'>
                              {list_topBrand.brand}
                            </div>
                            <div className='basis-1/6 text-right mt-1 mx-5 text-md font-bold'>
                              {list_topBrand.total_qty} Pcs
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className='grow bg-white border border-gray-300 h-[full] rounded-lg shadow-md'>
                      <div className='text-md font-semibold py-4 px-5'>
                        TOP 20 Product
                      </div>
                      {topten.map((list_top_10_produk: any, index2: number) => {
                        return (
                          <div key={index2} className='flex flex-row text-left mb-3'>
                            <div className='basis-auto mt-1 mx-4 -mr-2'>
                              {index2++ + 1}
                            </div>
                            <div className='basis-auto mt-1 mx-4 -mr-2'>
                              <Boxes className="h-6 w-6 text-black text-right -mt-1" />
                            </div>
                            <div className='basis-full text-md font-normal py-0 px-5 text-left'>
                              {list_top_10_produk.produk}
                            </div>
                            <div className='basis-1/6 text-right mt-1 mx-5 text-md font-bold'>
                              {list_top_10_produk.qty} Pcs
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
        </>
      )}



    </div>
  );
}
