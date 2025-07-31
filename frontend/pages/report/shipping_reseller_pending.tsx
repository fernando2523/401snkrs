import Head from "next/head";
import Image from "next/image";
import * as fa from "react-icons/fa";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";
import React, { Component, useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  compareAsc,
  format,
  subDays,
  lastDayOfMonth,
  startOfMonth,
  startOfWeek,
  lastDayOfWeek,
  endOfDay,
  startOfDay,
} from "date-fns";
import Datepicker from "react-tailwindcss-datepicker";
import Link from "next/link";
import { count } from "console";
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import useSWR from "swr";
import styles from "../../styles/Table.module.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Icons from "react-icons/fa";
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
import CurrencyInput from "react-currency-input-field";
import { useForm } from "react-hook-form";


let Rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function Shipping() {
  const router = useRouter();
  const [isLoading, setisLoading]: any = useState(true);
  const [data_order, setdataorder] = useState([]);
  const [count_order, setdatacount]: any = useState([]);
  const [data_header, setdataheader]: any = useState([]);
  const [data_ware, setdataware] = useState([]);
  const [data_store, setdatastore] = useState([]);
  const [data_supplier, setdatasupplier] = useState([]);

  useEffect(() => {
    loaddataorder(status_pesanan, Query, Store, date);
    getheaderpesanan(status_pesanan, Query, Store, date);
    ordercount(Store, Query, date);
    getwarehouse();
    getstore(Role);
    getsupplier();
    return () => { };
  }, []);

  async function loaddataorder(
    status_pesanan: any,
    query: any,
    store: any,
    date: any
  ) {
    setisLoading(true);
    await axios({
      method: "post",
      url: `https://api.401snkrs.com/v1/orderresellerpending`,
      data: {
        status_pesanan: status_pesanan,
        query: query,
        store: store,
        date: date,
      },
    })
      .then(function (response) {
        console.log(response.data.result);

        setdataorder(response.data.result);
        // console.log(response.data.result)
        setisLoading(false);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const [Role, setRole] = useState(Cookies.get("auth_role"));
  const [value, setValue]: any = useState();
  const handleValueChange = (newValue: any) => {
    if (newValue.startDate === null || newValue.endDate === null) {
      setDate(startDate + " to " + lastDate);
    } else {
      setDate(newValue.startDate + " to " + newValue.endDate);
      loaddataorder(
        status_pesanan,
        Query,
        Store,
        newValue.startDate + " to " + newValue.endDate
      );
      getheaderpesanan(status_pesanan, Query, Store, newValue.startDate + " to " + newValue.endDate);
      ordercount(Store, Query, newValue.startDate + " to " + newValue.endDate);
    }

    setValue(newValue);
  };


  const startDate = format(startOfDay(new Date()), "yyyy-MM-dd");
  const lastDate = format(endOfDay(new Date()), "yyyy-MM-dd");
  const [date, setDate] = useState(startDate + " to " + lastDate);

  const today: any = "Hari Ini";
  const yesterday: any = "Kemarin";
  const currentMonth: any = "Bulan ini";
  const pastMonth: any = "Bulan Kemarin";
  const mingguinistart: any = format(startOfWeek(new Date()), "yyyy-MM-dd");
  const mingguiniend: any = format(lastDayOfWeek(new Date()), "yyyy-MM-dd");
  const minggukemarinstart: any = format(
    subDays(startOfWeek(new Date()), 7),
    "yyyy-MM-dd"
  );
  const minggukemarinend: any = format(
    subDays(lastDayOfWeek(new Date()), 7),
    "yyyy-MM-dd"
  );
  const todayDate: any = format(new Date(), "yyyy-MM-dd");

  const [Query, setQuery] = useState("all");
  const [Store, setStore] = useState("all");

  function querySet(e: any) {
    if (e.target.value === "") {
      setQuery("all");
      loaddataorder(status_pesanan, "all", Store, date);
      getheaderpesanan(status_pesanan, "all", Store, date);
      ordercount(Store, "all", date);
    } else {
      setQuery(e.target.value);
      loaddataorder(status_pesanan, e.target.value, Store, date);
      getheaderpesanan(status_pesanan, e.target.value, Store, date);
      ordercount(Store, e.target.value, date);
    }
  }

  const [tabactive, settabactive] = React.useState("SELESAI");
  const [status_pesanan, setstatus_pesanan] = React.useState("SELESAI");

  function tabActive(select: any) {
    setdataorder([]);
    settabactive(select);
    setstatus_pesanan(select);
    loaddataorder(select, Query, Store, date);
    getheaderpesanan(select, Query, Store, date);
    ordercount(Store, Query, date);
  }

  async function ordercount(store: any, query: any, date: any) {
    await axios({
      method: "post",
      url: `https://api.401snkrs.com/v1/ordercountresellerpending`,
      data: {
        store: store,
        query: query,
        date: date,
      },
    })
      .then(function (response) {
        setdatacount(response.data.result[0]);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  if (!isLoading) {
    var count_dikirim = count_order.dikirim;
    var count_selesai = count_order.selesai;
    var count_cancel = count_order.cancel;
  }

  async function getheaderpesanan(
    status_pesanan: any,
    query: any,
    store: any,
    date: any
  ) {
    await axios({
      method: "post",
      url: `https://api.401snkrs.com/v1/getheaderpesananresellerpending`,
      data: {
        status_pesanan: status_pesanan,
        query: query,
        store: store,
        date: date,
      },
    })
      .then(function (response) {
        setdataheader(response.data.result[0]);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  if (!isLoading) {
    var modal = Rupiah.format(data_header.modal);
    var net_sales = Rupiah.format(data_header.net_sales);
    var omzet = Rupiah.format(data_header.omzet);
    var qty_sales = data_header.qty_sales;
    var sales = data_header.sales;
  }

  async function getwarehouse() {
    await axios({
      method: "get",
      url: `https://api.401snkrs.com/v1/getwarehouse`,
    })
      .then(function (response) {
        setdataware(response.data.data_warehouse);
        // console.log(response.data.data_warehouse)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const list_warehouse: any = [];
  if (!isLoading) {
    data_ware.map((area: any, index: number) => {
      list_warehouse.push(
        <option key={index} value={area.id_ware}>
          {area.warehouse}
        </option>
      );
    });
  }

  async function getstore(role: any) {
    await axios({
      method: "post",
      url: `https://api.401snkrs.com/v1/getstore_sales`,
      data: {
        role: role,
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
      // fixed_store.push(
      //   <span>{store.id_store}</span>
      // );
    });
  }

  const [returLuarModal, setreturLuarModal] = React.useState(false);
  const [LuarProduk, setLuarProduk] = React.useState("");
  const [LuarIdPesanan, setLuarIdPesanan] = React.useState("");
  const [LuarIdProduk, setLuarIdProduk] = React.useState("");
  const [LuarSize, setLuarSize] = React.useState("");
  const [LuarSizeold, setLuarSizeold] = React.useState("");
  const [LuarOldQty, setLuarOldQty] = React.useState(0);
  const [LuarSupplier, setLuarSupplier] = React.useState("");
  const [LuarHargaBeli, setLuarHargaBeli] = React.useState(0);
  const [LuarPayment, setLuarPayment] = React.useState("");
  const [LuarStatusBarangRetur, setLuarStatusBarangRetur] = React.useState("");
  const [LuarQtyNew, setLuarQtyNew] = React.useState(1);
  const [returLuarBTN, setreturLuarBTN] = React.useState(false);

  async function openReturLuarModal(
    produk: any,
    id_produk: any,
    size: any,
    qty: any,
    source: any,
    id_pesanan: any,
    idpo: any,
    id_ware: any
  ) {
    setLuarSizeold(size);
    setreturLuarBTN(false);
    setreturLuarModal(true);
    setLuarProduk(produk);
    setLuarOldQty(qty);
    setLuarSupplier("");
    setLuarIdPesanan(id_pesanan);
    setLuarIdProduk(id_produk);
    setLuarSize("");
    setLuarHargaBeli(0);
    setLuarQtyNew(1);
  }

  function setQtymanualluar(type: any) {
    if (type === "plus") {
      if (LuarQtyNew >= LuarOldQty) {
        toast.warning("Jumlah Melebihi Stok Pesanan!", {
          position: toast.POSITION.TOP_RIGHT,
          pauseOnHover: false,
          autoClose: 2000,
        });
      } else {
        setLuarQtyNew(LuarQtyNew + 1);
      }
    } else if (type === "min") {
      if (LuarQtyNew > 1) {
        setLuarQtyNew(LuarQtyNew - 1);
      }
    }
  }

  async function sumbitReturLuar() {
    if (
      LuarSupplier === "" ||
      LuarSize === "" ||
      LuarHargaBeli < 1 ||
      LuarPayment === "" ||
      LuarStatusBarangRetur === ""
    ) {
      toast.warning("Mohon Lengkapi Data", {
        position: toast.POSITION.TOP_RIGHT,
        pauseOnHover: false,
        autoClose: 2000,
      });
    } else {
      setreturLuarBTN(true);
      await axios
        .post(`https://api.401snkrs.com/v1/returLuar`, {
          LuarProduk: LuarProduk,
          LuarSize: LuarSize,
          LuarOldQty: LuarOldQty,
          LuarSupplier: LuarSupplier,
          LuarHargaBeli: LuarHargaBeli,
          LuarQtyNew: LuarQtyNew,
          LuarIdPesanan: LuarIdPesanan,
          LuarIdProduk: LuarIdProduk,
          LuarPayment: LuarPayment,
          LuarSizeold: LuarSizeold,
          StatusBarangRetur: LuarStatusBarangRetur,
        })
        .then(function (response) {
          // console.log(response.data);
          // mutate();
          // count_mutate();
          setreturLuarModal(false);

          toast.success("Data berhasil Retur", {
            position: toast.POSITION.TOP_RIGHT,
            pauseOnHover: false,
            autoClose: 2000,
          });
        });
    }
  }

  const [returModal, setreturModal] = React.useState(false);
  const [id_produkretur, setid_produkretur] = React.useState("");
  const [produkretur, setprodukretur] = React.useState("");
  const [sizeretur, setsizeretur] = React.useState("");
  const [qtyoldretur, setqtyoldretur] = React.useState(0);
  const [SourceRetur, setSourceRetur] = React.useState("");
  const [Id_pesanan, setId_pesanan] = React.useState("");
  const [old_ware, setold_ware] = React.useState("");

  const [pilih_warehouse, setpilih_warehouse] = React.useState("close");
  const [datasize, setdatasize] = React.useState([]);
  const [sizeSelected, setsizeSelected] = React.useState(null);
  const [stokReady, setstokReady] = React.useState(0);
  const [returmodal_qty, setreturmodal_qty] = React.useState(1);
  const [returmodal_submit, setreturmodal_submit] = React.useState(true);
  const [Returware, setReturware] = React.useState(true);

  const [returidpo, setreturidpo] = React.useState("");

  const list_size: any = [];

  {
    for (let index = 0; index < datasize.length; index++) {
      if (datasize[index].qty > 0) {
        list_size.push(
          <div
            onClick={() => {
              setsizeSelected(datasize[index].size);
              setstokReady(parseInt(datasize[index].qty));
              setreturmodal_qty(1);
              setreturmodal_submit(false);
            }}
            key={index}
            className={`${sizeSelected === datasize[index].size
              ? "bg-blue-500 text-white"
              : "text-blue-500"
              } font-medium py-2 text-center rounded-lg border border-blue-500 cursor-pointer`}
          >
            {datasize[index].size} = {datasize[index].qty}
          </div>
        );
      } else {
        list_size.push(
          <div
            key={index}
            className=" text-gray-500 font-medium py-2 text-center rounded-lg border border-gray-500"
          >
            {datasize[index].size} = {datasize[index].qty}
          </div>
        );
      }
    }
  }

  const {
    register,
    unregister,
    control,
    resetField,
    reset,
    trigger,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    // defaultValues: {
    //     produk: '',
    //     brand: '',
    //     warehouse: '',
    //     supplier: '',
    //     harga_beli: '',
    //     harga_jual: '',
    //     quality: '',
    //     kategori: '',
    //     deskripsi: '',
    //     img: '',
    // }
  });

  async function getStock(e: any) {
    setpilih_warehouse("loading");
    setsizeSelected(null);
    setstokReady(0);
    setreturmodal_qty(1);
    setreturmodal_submit(true);

    setReturware(e.target.value);

    if (e.target.value === "") {
      setpilih_warehouse("close");
    } else {
      await axios
        .post(`https://api.401snkrs.com/v1/getsizeretur`, {
          idware: e.target.value,
          idproduct: id_produkretur,
          size: sizeretur,
        })
        .then(function (response) {
          setpilih_warehouse("open");
          setdatasize(response.data.result);
          // console.log(response.data.result);
        });
    }
  }

  function setQty(type: any) {
    if (type === "plus") {
      if (returmodal_qty < stokReady) {
        if (returmodal_qty >= qtyoldretur) {
          toast.warning("Jumlah Melebihi Stok Pesanan!", {
            position: toast.POSITION.TOP_RIGHT,
            pauseOnHover: false,
            autoClose: 2000,
          });
        } else {
          setreturmodal_qty(returmodal_qty + 1);
        }
      } else {
        toast.warning("Jumlah Melebihi Stok Yang Tersedia!", {
          position: toast.POSITION.TOP_RIGHT,
          pauseOnHover: false,
          autoClose: 2000,
        });
      }
    } else if (type === "min") {
      if (returmodal_qty > 1) {
        setreturmodal_qty(returmodal_qty - 1);
      }
    }
  }

  async function openReturModal(
    produk: any,
    id_produk: any,
    size: any,
    qty: any,
    source: any,
    id_pesanan: any,
    idpo: any,
    id_ware: any
  ) {
    setreturModal(true);
    setid_produkretur(id_produk);
    setprodukretur(produk);
    setsizeretur(size);
    setqtyoldretur(qty);
    setSourceRetur(source);
    setId_pesanan(id_pesanan);
    setold_ware(id_ware);

    setreturmodal_qty(1);
    setreturmodal_submit(true);
    setpilih_warehouse("close");
    setreturidpo(idpo);
  }

  async function sumbitRetur() {
    await axios
      .post(`https://api.401snkrs.com/v1/retur`, {
        id_pesanan: Id_pesanan,
        id_produk: id_produkretur,
        produk: produkretur,
        size_old: sizeretur,
        qty_old: qtyoldretur,
        source: SourceRetur,
        size_new: sizeSelected,
        qty_new: returmodal_qty,
        old_id_ware: old_ware,
        new_id_ware: Returware,
        idpo: returidpo,
      })
      .then(function (response) {
        // console.log(response.data);
        // mutate();
        // count_mutate();
        setreturModal(false);

        toast.success("Data berhasil Update", {
          position: toast.POSITION.TOP_RIGHT,
          pauseOnHover: false,
          autoClose: 2000,
        });
      });
  }

  const [refundModal, setrefundModal] = useState(false);
  const [idRefundProduct, setidRefundProduct] = useState(null);
  const [btnrefund, setbtnrefund] = useState(false);

  async function openrefundModal(
    produk: any,
    id_produk: any,
    size: any,
    qty: any,
    source: any,
    id_pesanan: any,
    idpo: any,
    id_ware: any,
    id: any
  ) {
    setbtnrefund(false);
    setrefundModal(true);
    setreturmodal_submit(false);

    setid_produkretur(id_produk);
    setaddproduk_produk(produk);
    setaddproduk_size(size);
    setrefund_oldqty(qty);
    setSourceRetur(source);
    setId_pesanan(id_pesanan);
    setidRefundProduct(id);
    setaddproduk_qty(1);
    setreturidpo(idpo);
  }

  async function sumbitrefund() {
    setbtnrefund(true);
    await axios
      .post(`https://api.401snkrs.com/v1/refund`, {
        id_produk: id_produkretur,
        produk: addproduk_produk,
        size: addproduk_size,
        old_qty: refund_oldqty,
        source: SourceRetur,
        id_pesanan: Id_pesanan,
        id: idRefundProduct,
        qty_refund: addproduk_qty,
        idpo: returidpo,
      })
      .then(function (response) {
        console.log(response.data);
        // mutate();
        // count_mutate();
        setrefundModal(false);

        toast.success("Data berhasil Refund", {
          position: toast.POSITION.TOP_RIGHT,
          pauseOnHover: false,
          autoClose: 2000,
        });
      });
  }

  const [addproduk_produk, setaddproduk_produk] = React.useState("");
  const [addproduk_size, setaddproduk_size] = React.useState("");
  const [addproduk_qty, setaddproduk_qty] = React.useState(1);
  const [refund_oldqty, setrefund_oldqty] = React.useState(1);
  const [addproduk_supplier, setaddproduk_supplier] = React.useState("");
  const [addproduk_hargabeli, setaddproduk_hargabeli] = React.useState("0");

  function setQtymanual(type: any) {
    if (type === "plus") {
      if (addproduk_qty >= refund_oldqty) {
        toast.warning("Jumlah Melebihi Stok Pesanan!", {
          position: toast.POSITION.TOP_RIGHT,
          pauseOnHover: false,
          autoClose: 2000,
        });
      } else {
        setaddproduk_qty(addproduk_qty + 1);
      }
    } else if (type === "min") {
      if (addproduk_qty > 1) {
        setaddproduk_qty(addproduk_qty - 1);
      }
    }
  }

  async function getsupplier() {
    await axios({
      method: "get",
      url: `https://api.401snkrs.com/v1/getsupplier`,
    })
      .then(function (response) {
        setdatasupplier(response.data.data_supplier);
        // console.log(response.data.data_warehouse)
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  // const {
  //   data: supplier_data,
  //   error: supplier_error,
  //   isLoading: supplier_isLoading,
  //   mutate: supplier_mutate,
  // } = useSWR(`https://api.401snkrs.com/getsupplier`, fetcher);
  const list_supplier: any = [];
  if (!isLoading) {
    data_supplier.map((area: any, index: number) => {
      list_supplier.push(
        <option key={index} value={area.id_sup}>
          {area.supplier}
        </option>
      );
    });
  }

  const [start, setStart] = useState(30);
  const [hasMore, setHasMore] = useState(true);

  const list_order: any = [];

  if (!isLoading) {
    data_order.map((order: any, index: number) => {
      return list_order.push(
        <div className="shadow hover:shadow-md bg-white border" key={index}>
          <div className="flex flex-row h-[full] items-center justify-center content-center border text-[11px]">
            <div className="basis-28 h-full text-center content-center">
              <span>{1 + index++}</span>
            </div>
            <div
              className={`${order.type_customer === "Reseller"
                ? "text-lime-600"
                : "text-cyan-600"
                }  text-center basis-56 h-full content-center font-semibold `}
            >
              {order.type_customer} <br></br>
              <span className="text-black">
                {format(new Date(order.tanggal_order), "dd MMMM, Y")}
                <br></br>
                {format(new Date(order.created_at), "h:mm:ss a")}
              </span>
            </div>

            <div className=" text-center basis-64 h-full content-center">
              {order.type_customer === "Retail" ? (
                <>{order.store}</>
              ) : (
                <>
                  <span className="font-semibold">
                    {order.store} : {order.reseller}
                  </span>
                </>
              )}
              <br></br>
              {order.id_pesanan}
              <br></br>
              {"SUPER-ADMIN" === Cookies.get("auth_role") ||
                "HEAD-AREA" === Cookies.get("auth_role") ||
                "HEAD-STORE" === Cookies.get("auth_role") ? (
                <>
                  <button
                    onClick={() => hapus_pesanan(order.id_pesanan, index)}
                    className="text-[9px] text-red-500 hover:underline font-bold  mb-2 "
                  >
                    DELETE SALES
                  </button>
                </>
              ) : null}
            </div>
            <div className="basis-1/12  text-center h-full content-center">
              {order.users}
            </div>

            <div className="basis-full  text-left h-full content-center">
              {(function (rows: any, i, len) {
                for (let j = 0; j < len; j++) {
                  rows.push(
                    <div key={j}>
                      <div className="flex flex-row grow">
                        <div className="grow px-2 ">
                          <div className="flex flex-row">
                            <div className="grow">
                              {order.details_order[j].produk} :{" "}
                              {order.details_order[j].id_produk}
                            </div>
                            <div className="basis-1/12 text-right">
                              <button
                                disabled={
                                  parseInt(
                                    order.details_order[j].sudah_dibayar
                                  ) === order.details_order[j].subtotal
                                    ? true
                                    : false
                                }
                                onClick={() => {
                                  openmodalpaysatuan(
                                    order.id_invoice,
                                    order.details_order[j].produk,
                                    order.details_order[j].id_produk,
                                    order.details_order[j].qty,
                                    order.details_order[j].size,
                                    order.details_order[j].selling_price,
                                    order.details_order[j].diskon_item,
                                    order.details_order[j].subtotal,
                                    order.data_store[0].id_store,
                                    order.data_store[0].id_area
                                  );
                                }}
                                type="button"
                                className={`${parseInt(
                                  order.details_order[j].sudah_dibayar
                                ) === order.details_order[j].subtotal
                                  ? "bg-gray-500"
                                  : "hover:bg-lime-800 bg-lime-600"
                                  }  text-center rounded-md mt-1 p-1  text-white  flex flex-wrap  content-center  text-xs font-bold`}
                              >

                                PAY PRODUCT
                              </button>
                            </div>
                          </div>
                          {"SUPER-ADMIN" === Cookies.get("auth_role") ||
                            "HEAD-AREA" === Cookies.get("auth_role") ||
                            "HEAD-STORE" === Cookies.get("auth_role") ? (
                            <>
                              {(function (
                                produk: any,
                                id_produk: any,
                                size: any,
                                qty: any,
                                source: any,
                                id_pesanan: any,
                                idpo: any,
                                id_ware: any,
                                id: any
                              ) {
                                if (tabactive != "CANCEL") {
                                  if (source === "Barang Gudang") {
                                    return (
                                      <div>
                                        <button
                                          onClick={() => {
                                            openReturModal(
                                              produk,
                                              id_produk,
                                              size,
                                              qty,
                                              source,
                                              id_pesanan,
                                              idpo,
                                              id_ware
                                            );
                                          }}
                                          className="text-[9px] text-blue-500 font-bold"
                                        >
                                          Return Size
                                        </button>
                                        <span> | </span>
                                        <button
                                          onClick={() =>
                                            openrefundModal(
                                              produk,
                                              id_produk,
                                              size,
                                              qty,
                                              source,
                                              id_pesanan,
                                              idpo,
                                              id_ware,
                                              id
                                            )
                                          }
                                          className="text-[9px] text-red-500 font-bold"
                                        >
                                          Refund
                                        </button>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div>
                                        <button
                                          onClick={() => {
                                            openReturLuarModal(
                                              produk,
                                              id_produk,
                                              size,
                                              qty,
                                              source,
                                              id_pesanan,
                                              idpo,
                                              id_ware
                                            );
                                          }}
                                          className="text-[9px] text-blue-500 font-bold"
                                        >
                                          Tukar Size
                                        </button>
                                        <span> | </span>
                                        <button
                                          onClick={() =>
                                            openrefundModal(
                                              produk,
                                              id_produk,
                                              size,
                                              qty,
                                              source,
                                              id_pesanan,
                                              idpo,
                                              id_ware,
                                              id
                                            )
                                          }
                                          className="text-[9px] text-red-500 font-bold"
                                        >
                                          Refund
                                        </button>
                                      </div>
                                    );
                                  }
                                }
                              })(
                                order.details_order[j].produk,
                                order.details_order[j].id_produk,
                                order.details_order[j].size,
                                order.details_order[j].qty,
                                order.details_order[j].source,
                                order.id_pesanan,
                                order.details_order[j].idpo,
                                order.details_order[j].id_ware,
                                order.details_order[j].id
                              )}
                            </>
                          ) : null}
                        </div>
                        <div className="basis-28  text-center content-center">
                          {order.details_order[j].size}
                        </div>
                        <div className="basis-16  text-center content-center">
                          {order.details_order[j].qty}
                        </div>
                        <div className="basis-28  text-center content-center">
                          {Rupiah.format(
                            order.details_order[j].selling_price
                          )}
                        </div>
                        <div className="basis-28 text-center content-center">
                          {Rupiah.format(
                            order.details_order[j].diskon_item
                          )}
                        </div>
                        <div className="basis-1/12 text-center content-center">
                          {Rupiah.format(order.details_order[j].subtotal)}
                        </div>

                        {"SUPER-ADMIN" === Cookies.get("auth_role") ? (
                          <>
                            <div className="basis-1/12 text-center content-center">
                              {Rupiah.format(
                                order.details_order[j].m_price
                              )}
                            </div>
                            <div className="basis-1/12 text-center content-center">
                              {Rupiah.format(
                                parseInt(order.details_order[j].subtotal) -
                                parseInt(order.details_order[j].m_price)
                              )}
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  );
                }
                return rows;
              })([], 0, order.details_order.length)}
            </div>

            {/* <div className="basis-1/12 text-center h-full border-r content-center">
          {Rupiah.format(order.subtotalstandar)}
        </div> */}
          </div>

          <div className="flex flex-row h-[full] items-center justify-center content-center text-[11px] py-2">
            <div className="basis-28 text-center font-bold">Payment :</div>
            <div className="basis-56">
              <button
                onClick={() => {
                  var sisa_payment = order.data_payment.reduce(function (
                    acc: any,
                    obj: any
                  ) {
                    return parseInt(acc) + parseInt(obj.total_payment);
                  },
                    0);
                  openmodalpayall(
                    order.id_invoice,
                    parseInt(order.total_amount) - parseInt(sisa_payment),
                    order.data_store[0].id_store,
                    order.data_store[0].id_area
                  );
                }}
                type="button"
                className="shadow rounded-md bg-lime-600 text-center hover:bg-lime-800 font-bold text-white px-1 flex flex-wrap gap-2 content-center"
              >
                PAY ALL NOTA
              </button>
            </div>
            <div className="basis-64 text-center">
              <button
                type="button"
                onClick={() =>
                  showprintpending(
                    order.id_pesanan,
                    order.reseller,
                  )
                }
                className=" text-black flex flex-row rounded-md ml-6"
              >
                <span className="font-semibold">Print Nota</span>
                <div className="">
                  <fa.FaPrint size={12} className="text-black mt-1 ml-2" />
                </div>
              </button>
            </div>
            <div className="basis-1/12 text-white">s</div>

            <div className="basis-full font-bold h-full text-[10px] content-center flex flex-row">
              <div className="grow  text-white">s</div>
              <div className="basis-28 text-center">Grand Total :</div>
              <div className="basis-16 text-center">{order.qty}</div>
              <div className="basis-28 bg-white-100 text-white">s</div>
              <div className="basis-28 bg-white-100 text-center">
                {Rupiah.format(order.total_diskon)}
              </div>
              <div className="basis-1/12 text-center">
                {Rupiah.format(order.total_amount)}
              </div>
              {"SUPER-ADMIN" === Cookies.get("auth_role") ? (
                <>
                  <div className="basis-1/12 text-center">
                    {Rupiah.format(order.modalakhir)}
                  </div>
                  <div className="basis-1/12 text-center">
                    {Rupiah.format(order.subtotalakhir - order.modalakhir)}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div >
      );
    });

    var count_orders = list_order.length;
  }

  const [paysatuan, setpaysatuan] = React.useState(false);
  const [payall, setpayall] = React.useState(false);

  const [datapaymentsatuan, setdatapaymentsatuan]: any = React.useState([]);
  const [produkpaysatuan, setprodukpaysatuan] = React.useState("");
  const [qtypay, setqtypay] = React.useState(0);
  const [qtyrpay, setqtyrpay] = React.useState(1);
  const [hargasatuanpay, sethargasatuanpay] = React.useState(0);
  const [diskonsatuanpay, setdiskonsatuanpay] = React.useState(0);
  const [ps_cash, setps_cash] = React.useState(0);
  const [ps_bca, setps_bca] = React.useState(0);
  const [ps_qris, setps_qris] = React.useState(0);
  const [ps_id_store, setps_id_store] = React.useState("");
  const [ps_id_area, setps_id_area] = React.useState("");
  const [id_invoicepay, setid_invoicepay] = React.useState("");

  const [payall_cash, setpayall_cash] = React.useState(0);
  const [payall_bca, setpayall_bca] = React.useState(0);
  const [payall_qris, setpayall_qris] = React.useState(0);
  const [id_invoicepayall, setpayall_idinvoice] = React.useState("");
  const [total_amountall, setpayall_total_amount] = React.useState(0);

  const [id_produkpay, setid_produkpay] = React.useState("");
  const [sizesatuanpay, setsizesatuanpay] = React.useState("");

  function setQtypay(type: any) {
    if (type === "plus") {
      if (qtyrpay >= qtypay) {
        toast.warning("Jumlah Melebihi Stok Pesanan!", {
          position: toast.POSITION.TOP_RIGHT,
          pauseOnHover: false,
          autoClose: 2000,
        });
      } else {
        setqtyrpay(qtyrpay + 1);
      }
    } else if (type === "min") {
      if (qtyrpay > 1) {
        setqtyrpay(qtyrpay - 1);
      }
    }
  }

  async function openmodalpaysatuan(
    idinvoice: any,
    produk: any,
    idproduk: any,
    qty: any,
    size: any,
    hargasatuan: any,
    diskonsatuan: any,
    totalamount: any,
    id_store: any,
    id_area: any
  ) {


    setid_invoicepay(idinvoice);
    setid_produkpay(idproduk);

    setps_cash(0);
    setps_bca(0);
    setps_qris(0);

    setps_id_store(id_store);
    setps_id_area(id_area);

    setsizesatuanpay(size);
    sethargasatuanpay(hargasatuan);
    setdiskonsatuanpay(diskonsatuan);
    setprodukpaysatuan(produk);
    setqtypay(qty);

    setqtyrpay(1);

    await axios
      .post(`https://api.401snkrs.com/v1/gethistorypay`, {
        id_invoice: idinvoice,
        id_produk: idproduk,
        size: size,
      })
      .then(function (response) {
        setdatapaymentsatuan(response.data);
        var result = response.data.result;

        if (result.length > 0) {
          setqtypay(parseInt(qty) - parseInt(result[0].qty));
        }
        setpaysatuan(true);
      });
  }

  async function submitpaymentsatuan() {
    const totalamount = (hargasatuanpay - diskonsatuanpay) * qtyrpay;
    const totalpay = ps_cash + ps_bca + ps_qris;

    if (totalpay != totalamount) {
      alert("Nominal Tidak Sama");
    } else {
      console.log(id_invoicepay);
      console.log(id_produkpay);
      console.log(sizesatuanpay);
      console.log(qtyrpay);
      console.log((hargasatuanpay - diskonsatuanpay) * qtyrpay);
      console.log(ps_cash);
      console.log(ps_bca);
      console.log(ps_qris);
      console.log(ps_id_store);
      console.log(ps_id_area);
      await axios
        .post(`https://api.401snkrs.com/v1/paysatuan`, {
          id_invoice: id_invoicepay,
          id_produk: id_produkpay,
          size: sizesatuanpay,
          qty: qtyrpay,
          amount: totalamount,
          cash: ps_cash,
          bca: ps_bca,
          qris: ps_qris,
          id_store: ps_id_store,
          id_area: ps_id_area,
        })
        .then(function (response) {
          setpaysatuan(false);
          loaddataorder(status_pesanan, Query, Store, date);
          getheaderpesanan(status_pesanan, Query, Store, date);
        });
    }
  }

  async function openmodalpayall(
    idinvoice: any,
    total_amount: any,
    id_store: any,
    id_area: any
  ) {
    setpayall_idinvoice(idinvoice);
    setpayall_total_amount(total_amount);
    setps_id_store(id_store);
    setps_id_area(id_area);
    setpayall_cash(0);
    setpayall_bca(0);
    setpayall_qris(0);

    setpayall(true);
  }

  const [tipe_print, setTipe_print] = useState('');

  const handleChange = (e: any) => {
    setTipe_print(e.target.value);
  };

  const [printpending, setprintpending] = React.useState(false);
  const [print_id_invoice, setprint_id_invoice] = React.useState("");
  const [print_reseller, setprint_reseller] = React.useState("");

  async function showprintpending(
    id_invoice: any,
    reseller: any,
  ) {
    setprint_id_invoice(id_invoice);
    setprint_reseller(reseller);

    setprintpending(true);
  }

  async function submitpaymentall() {
    const totalpay = payall_cash + payall_bca + payall_qris;
    console.log(totalpay);
    console.log(total_amountall);

    if (totalpay != total_amountall) {
      alert("Nominal Tidak Sama");
    } else {
      await axios
        .post(`https://api.401snkrs.com/v1/payall`, {
          id_invoice: id_invoicepayall,
          cash: payall_cash,
          bca: payall_bca,
          qris: payall_qris,
          total_amount: total_amountall,
          id_store: ps_id_store,
          id_area: ps_id_area,
        })
        .then(function (response) {
          setpayall(false);
          loaddataorder(status_pesanan, Query, Store, date);
          getheaderpesanan(status_pesanan, Query, Store, date);
        });
    }
  }

  const [selesaiOrdermodal, setselesaiOrdermodal] = React.useState(false);
  const [cancelOrderModal, setcancelOrderModal] = React.useState(false);
  const [hapuspesanan, sethapuspesanan] = React.useState(false);
  const [id_pesanan, setid_pesanan] = React.useState(null);

  function hapus_pesanan(id_pesanan: any, index: number) {
    setid_pesanan(id_pesanan);
    sethapuspesanan(true);
  }

  function showSelesaimodal(id_pesanan: any, index: number) {
    setid_pesanan(id_pesanan);
    setselesaiOrdermodal(true);
  }

  function showCancelmodal(id_pesanan: any, index: number) {
    setid_pesanan(id_pesanan);
    setcancelOrderModal(true);
  }

  async function updatePesanan(status: any) {
    await axios
      .post(`https://api.401snkrs.com/v1/updatepesanan`, {
        id_pesanan: id_pesanan,
        status,
      })
      .then(function (response) {
        loaddataorder(status_pesanan, Query, Store, date);
        getheaderpesanan(status_pesanan, Query, Store, date);
        ordercount(Store, Query, date);
        toast.success("Data berhasil Update", {
          position: toast.POSITION.TOP_RIGHT,
          pauseOnHover: false,
          autoClose: 2000,
        });

        setselesaiOrdermodal(false);
        setcancelOrderModal(false);
      });
  }

  async function deletePesanan() {
    await axios
      .post(`https://api.401snkrs.com/v1/deletepesanan`, {
        id_pesanan: id_pesanan,
        status: tabactive,
      })
      .then(function (response) {
        loaddataorder(status_pesanan, Query, Store, date);
        getheaderpesanan(status_pesanan, Query, Store, date);
        ordercount(Store, Query, date);
        toast.success("Data berhasil dihapus", {
          position: toast.POSITION.TOP_RIGHT,
          pauseOnHover: false,
          autoClose: 2000,
        });

        sethapuspesanan(false);
      });
  }

  async function blob_print_sales(id_invoice: any, reseller: any) {

    if (tipe_print === "") {
      toast.warning("Pilih Tipe Print", {
        position: toast.POSITION.TOP_RIGHT,
        pauseOnHover: false,
        autoClose: 1000,
      });
      return;
    }

    try {
      // 1) Ambil data dari backend lokal
      const responseLocal = await axios.post(
        "https://api.401snkrs.com/v1/printpending",
        {
          tipe_print: tipe_print,
          id_invoice: id_invoice,
          reseller: reseller,
        }
      );

      // Asumsi responseLocal.data.result berbentuk array
      const invoiceList = responseLocal.data.result;
      if (!invoiceList || invoiceList.length === 0) {
        console.log("Tidak ada data invoice yang ditemukan.");
        return;
      }

      // Di sini kita ambil invoice pertama (atau gabungkan jika perlu).
      const item = invoiceList[0];

      // 2) Bentuk ulang data agar mirip dengan struktur "lama"
      //    (supaya Blade di Laravel tetap bisa membaca dengan benar)
      const data_items = {
        id_invoice: item.id_pesanan,       // Samakan penamaan
        store: item.store,
        address: item.address,
        tanggal: item.tanggal,
        payment: item.payment,
        qty: item.qty,
        grandtotal: item.grandtotal,
        bca: item.bca || 0,
        cash: item.cash || 0,
        mandiri: 0,                     // Hardcode jika memang dibutuhkan
        qris: item.qris || 0,
        timestamp: new Date().toISOString(), // Atau item.created_at jika ada
        users: item.users,
        reseller: item.reseller,
        details: item.details || [],
      };
      console.log(data_items);

      // 3) Kirim ke https://4mediakreatif.site/print_sales_new 
      //    dengan key "data_items" persis seperti versi lama.
      const responsePrint = await axios.post(
        "https://4mediakreatif.site/print_sales_new",
        {
          data_items, // BUKAN dataitems
        },
        {
          withCredentials: false,
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // 4) Tangani hasil PDF (blob)
      const file = new Blob([responsePrint.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);

      // 5) Redirect atau aksi lainnya
      router.replace("/report/shipping_reseller_pending");
    } catch (error) {
      console.error("Error dalam blob_print_sales:", error);
    }
  }

  return (
    <div className="p-5">
      <ToastContainer className="mt-[50px]" />

      <div className="h-[5%] p-0 ">
        <span className="text-xl font-bold">
          Daftar Pesanan Reseller Pending
        </span>
      </div>

      <div className="mt-3 mb-4">
        <div className=" flex flex-row mt-0 gap-3 text-black">
          <div className="basis-1/3 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
            <div className="text-md font-semibold py-4  px-5">
              Total Pesanan
            </div>
            <div className="flex flex-row text-left  mt-2">
              <div className="basis-full text-lg font-semibold py-0 px-5">
                {sales ? sales + " Pesanan" : "0 Pesanan"}
              </div>
              <div className=" basis-auto mt-1 mx-5">
                <ClipboardDocumentIcon className="h-6 w-6 text-black text-right" />
              </div>
            </div>
          </div>
          <div className="basis-1/3 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
            <div className="text-md font-semibold py-4  px-5">Qty Pesanan</div>
            <div className="flex flex-row text-left  mt-2">
              <div className="basis-full text-lg font-semibold py-0 px-5">
                {qty_sales ? qty_sales + " Pcs" : "0 Pcs"}
              </div>
              <div className=" basis-auto mt-1 mx-5">
                <Box className="h-6 w-6 text-black text-right" />
              </div>
            </div>
          </div>

          <div className="basis-1/3 bg-white border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
            <div className="text-md font-semibold py-4  px-5">Omzet</div>
            <div className="flex flex-row text-left  mt-2">
              <div className="basis-full text-lg font-semibold py-0 px-5">
                {omzet ? omzet : 0}
              </div>
              <div className=" basis-auto mt-1 mx-5">
                <DollarSignIcon className="h-6 w-6 text-black text-right" />
              </div>
            </div>
          </div>

          {"SUPER-ADMIN" === Cookies.get("auth_role") ? (
            <>
              <div className="basis-1/3 bg-red-300 border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                <div className="text-md font-semibold py-4  px-5">Modal</div>
                <div className="flex flex-row text-left  mt-2">
                  <div className="basis-full text-lg font-semibold py-0 px-5">
                    {modal ? modal : 0}
                  </div>
                  <div className=" basis-auto mt-1 mx-5">
                    <ArchiveRestore className="h-6 w-6 text-black text-right" />
                  </div>
                </div>
              </div>

              <div className="basis-1/3 bg-lime-300 border border-gray-300 h-[110px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                <div className="text-md font-semibold py-4  px-5">Margin</div>
                <div className="flex flex-row text-left  mt-2">
                  <div className="basis-full text-lg font-semibold py-0 px-5">
                    {net_sales ? net_sales : 0}
                  </div>
                  <div className=" basis-auto mt-1 mx-5">
                    <BookKey className="h-6 w-6 text-black text-right" />
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center content-center mb-4">
        <div className="shadow grow rounded-lg w-auto flex flex-row text-center content-center">
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
            placeholder="Pencarian..."
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

        <div className="flex text-sm flex-row items-center w-[20%] justify-end">
          {/* {"SUPER-ADMIN" === Cookies.get("auth_role") ||
            "HEAD-AREA" === Cookies.get("auth_role") ? (
            <>
              <select
                value={Store}
                onChange={(e) => {
                  setStore(e.target.value);
                  loaddataorder(status_pesanan, Query, e.target.value, date);
                }}
                className={`appearance-none border h-[45px] w-[100%] px-5  text-gray-700 focus:outline-none rounded-lg`}
              >
                <option value="all">All Store</option>
                {list_store}
              </select>
            </>
          ) : (
            <>
              <select
                value={Store}
                onChange={(e) => {
                  setStore(e.target.value);
                }}
                className={`appearance-none border h-[45px] w-[100%] px-5  text-gray-700 focus:outline-none rounded-lg`}
              >
                {list_store}
              </select>
            </>
          )} */}

          <select
            value={Store}
            onChange={(e) => {
              setStore(e.target.value);
              loaddataorder(status_pesanan, Query, e.target.value, date);
            }}
            className={`appearance-none border h-[45px] w-[100%] px-5  text-gray-700 focus:outline-none rounded-lg`}
          >
            {"HEAD-AREA" != Cookies.get("auth_role") ||
              "HEAD-WAREHOUSE" === Cookies.get("auth_role") ||
              "HEAD-STORE" === Cookies.get("auth_role") ||
              "CASHIER" === Cookies.get("auth_role") ? (
              <>
                <option value="all">All Store</option>
              </>
            ) : (
              <>
                <option value="all_area">All Area</option>
              </>
            )}
            {list_store}
          </select>
        </div>

        <div className="shadow rounded-lg ml-auto w-[290px] flex flex-row items-center justify-end bg-white relative">
          <Datepicker
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
            placeholder="Pilih Tanggal"
            inputClassName="text-gray-500 h-[45px] text-start py-2 px-4 w-full rounded-lg focus:outline-none z-50"
          />


        </div>

        <Link href="/cashier/add_order_reseller">
          <button
            type="button"
            className="shadow rounded-lg bg-blue-600 hover:bg-blue-800 h-[45px] text-white px-4 flex flex-wrap gap-2 content-center"
          >
            Tambah Order Toko
            <div className="my-auto">
              <fa.FaPlus size={13} className="text-white" />
            </div>
          </button>
        </Link>
      </div>

      <div className="my-4 mt-3 py-2 px-5 flex flex-warp items-center bg-white rounded-lg h-[50px]">
        {/* <button
          onClick={() => tabActive("SEDANG DIKIRIM")}
          disabled={isLoading}
          className={`${
            tabactive === "SEDANG DIKIRIM"
              ? "border-blue-500 text-blue-500 border-b-4 font-bold"
              : "text-black"
          } text-sm px-3 h-[50px]`}
        >
          Dikirim {count_dikirim}
        </button> */}

        <button
          onClick={() => tabActive("SELESAI")}
          disabled={isLoading}
          className={`${tabactive === "SELESAI"
            ? "border-blue-500 text-blue-500 border-b-4 font-bold"
            : "text-black"
            } text-sm px-3 h-[50px]`}
        >
          Order Reseller Pending {count_selesai}
        </button>

        {/* <button
          onClick={() => tabActive("CANCEL")}
          disabled={isLoading}
          className={`${
            tabactive === "CANCEL"
              ? "border-blue-500 text-blue-500 border-b-4 font-bold"
              : "text-black"
          } text-sm px-3 h-[50px]`}
        >
          Batal {count_cancel}
        </button> */}

        <div className="font-medium text-black text-sm grow text-end px-5">
          {list_order.length} order ditampilkan
        </div>
      </div>

      <div className="shadow hover:shadow-md w-full h-auto border bg-white">
        <div className="">
          <div className="flex flex-row h-[35px] items-center text-[10px]">
            <div className="basis-28 text-center font-bold h-full content-center">
              No.
            </div>
            <div className="basis-56 font-bold text-center h-full content-center">
              Date Time
            </div>
            <div className="basis-64 font-bold text-center h-full content-center">
              Detail
            </div>
            <div className="basis-1/12 font-bold text-center h-full content-center">
              Users
            </div>

            <div className="basis-full font-bold text-left h-full content-center flex flex-row">
              <div className="pl-2 grow content-center ">Product</div>
              <div className="pl-2 basis-28 content-center text-center">
                Size
              </div>
              <div className="pl-2 basis-16 content-center text-center">
                Qty
              </div>
              <div className="pl-2 basis-28 content-center text-center">
                Price
              </div>
              <div className="pl-2 basis-28 content-center text-center">
                Disc
              </div>
              <div className="pl-2 basis-1/12 content-center text-center">
                Subtotal
              </div>
              {/* <div className="pl-2 basis-1/12 content-center text-center">
                Payment
              </div> */}
              {"SUPER-ADMIN" === Cookies.get("auth_role") ? (
                <>
                  <div className="pl-2 basis-1/12 content-center text-center">
                    Cost
                  </div>
                  <div className="pl-2 basis-1/12 content-center text-center">
                    Profit
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* <table className="table table-fixed bg-transparent h-px mb-4 text-sm w-full">
                <thead className="bg-white text-gray-500">
                    <tr className="rounded-lg">
                        <th className="pl-2 py-3 rounded-l-lg w-[5%] text-start">
                            <span className="ml-3">No.</span>
                        </th>
                        <th className="py-3 text-start rounded-l-lg">
                            <span className="ml-5">Produk</span>
                        </th>
                        <th className="py-3 ">
                            Total Pembayaran
                        </th>
                        <th className="py-3 ">
                            Status
                        </th>
                        <th className="py-3 rounded-r-lg">
                            <span className="mr-7">Aksi</span>
                        </th>
                    </tr>
                </thead>
            </table> */}

      <div className="grid grid-cols-1 gap-4 w-full h-auto pb-10">
        {(function () {
          if (count_orders < 1) {
            return (
              <div className="w-[100%] py-3 text-center mt-10">
                Data Belum Tersedia, Silahkan Pilih Tanggal atau Store
              </div>
            );
          } else {
            return list_order;
          }
        })()}
      </div>

      {selesaiOrdermodal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl ">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col bg-white outline-none focus:outline-none w-[500px]">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <span className="text-sm font-semibold">
                    Update Pesanan {id_pesanan}
                  </span>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
                  <span className="text-sm font-semibold">
                    Ingin Merubah Status Pesanan Jadi Selesai?
                  </span>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-green-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => {
                      setselesaiOrdermodal(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-green-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => updatePesanan("SELESAI")}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}

      {cancelOrderModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl ">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col bg-white outline-none focus:outline-none w-[500px]">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <span className="text-sm font-semibold">
                    Update Pesanan {id_pesanan}
                  </span>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
                  <span className="text-sm font-semibold">
                    Ingin Merubah Status Pesanan Jadi Cancel?
                  </span>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => {
                      setcancelOrderModal(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-red-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => updatePesanan("CANCEL")}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}

      {returModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl ">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col bg-white outline-none focus:outline-none w-[500px]">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <span className="text-sm font-semibold">
                    Tukar Size -{" "}
                    {produkretur +
                      " | Size " +
                      sizeretur +
                      " | Qty " +
                      qtyoldretur}
                  </span>
                </div>
                {/*body*/}
                <div className="relative text-sm p-6 flex-auto">
                  <div className="text-sm">
                    <label>Warehouse:</label>
                    <div className="mt-1 flex flex-wrap items-center justify-end">
                      <select
                        onChange={(e) => getStock(e)}
                        className="appearance-none h-auto cursor-pointer rounded-lg w-full bg-white py-2 px-5 focus:outline-none border text-sm"
                        placeholder="Pilih Store"
                      >
                        <option value="">Pilih Warehouse</option>
                        {list_warehouse}
                      </select>
                      <i className="fi fi-rr-angle-small-down w-[1.12rem] h-[1.12rem] text-center text-gray-500 text-[1.12rem] leading-4 absolute mr-5"></i>
                    </div>
                  </div>

                  <div className="text-sm mt-3">
                    <label>Size:</label>
                    {(function () {
                      if (pilih_warehouse === "close") {
                        return (
                          <div className="w-[100%] py-3 text-center border rounded-lg mt-2">
                            Mohon Pilih Warehouse
                          </div>
                        );
                      } else if (pilih_warehouse === "loading") {
                        return (
                          <div className="w-[100%] py-3 text-center border rounded-lg mt-2 flex flex-auto items-center justify-center">
                            <svg
                              aria-hidden="true"
                              className="w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-400 fill-blue-600"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                              />
                            </svg>
                            Processing...
                          </div>
                        );
                      } else if (pilih_warehouse === "open") {
                        if (list_size.length > 0) {
                          return (
                            <div className="mt-1 grid grid-cols-5 gap-2 text-xs content-start">
                              {list_size}
                            </div>
                          );
                        } else {
                          return (
                            <div className="w-[100%] py-3 text-center border rounded-lg mt-2">
                              Stok Belum Tersedia
                            </div>
                          );
                        }
                      }
                    })()}
                  </div>

                  <div className="text-sm mt-3">
                    <div className="mb-2">Qty:</div>
                    <div className="text-sm flex flex-wrap items-center">
                      <button
                        onClick={() => {
                          setQty("min");
                        }}
                        disabled={returmodal_submit}
                        className={`${returmodal_submit === true
                          ? "bg-gray-500"
                          : "bg-blue-500"
                          } text-white w-10 py-2 border rounded font-bold`}
                      >
                        -
                      </button>
                      <div className="font-bold py-2 w-10 text-center border rounded mx-2">
                        {returmodal_qty}
                      </div>
                      <button
                        onClick={() => {
                          setQty("plus");
                        }}
                        disabled={returmodal_submit}
                        className={`${returmodal_submit === true
                          ? "bg-gray-500"
                          : "bg-blue-500"
                          } text-white w-10 py-2 border rounded font-bold`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-green-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => {
                      setreturModal(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={`${returmodal_submit ? "bg-gray-500" : "bg-green-500"
                      } text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1`}
                    type="button"
                    disabled={returmodal_submit}
                    onClick={() => sumbitRetur()}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}

      {refundModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl ">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col bg-white outline-none focus:outline-none w-[500px]">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <span className="text-sm font-semibold">
                    Refund Produk -{" "}
                    {"Size " + addproduk_size + " | Qty " + addproduk_qty}
                  </span>
                </div>
                {/*body*/}
                <div className="relative text-sm p-6 flex items-center flex-auto gap-4">
                  <div className="grow">
                    <div className="mb-2">Produk:</div>
                    <input
                      value={addproduk_produk}
                      className="h-auto rounded-lg w-full bg-white py-2 px-5 text-gray-700 focus:outline-none border"
                      type="text"
                      readOnly
                      placeholder="Masukan Size"
                    />
                  </div>

                  <div className="text-sm">
                    <div className="mb-2">Qty:</div>
                    <div className="text-sm flex flex-wrap items-center">
                      <button
                        onClick={() => {
                          setQtymanual("min");
                        }}
                        disabled={returmodal_submit}
                        className={`${returmodal_submit === true
                          ? "bg-gray-500"
                          : "bg-blue-500"
                          } text-white w-10 py-2 border rounded font-bold`}
                      >
                        -
                      </button>
                      <div className="font-bold py-2 w-10 text-center border rounded mx-2">
                        {addproduk_qty}
                      </div>
                      <button
                        onClick={() => {
                          setQtymanual("plus");
                        }}
                        disabled={returmodal_submit}
                        className={`${returmodal_submit === true
                          ? "bg-gray-500"
                          : "bg-blue-500"
                          } text-white w-10 py-2 border rounded font-bold`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className="relative text-sm p-6 -mt-5 flex items-center flex-auto gap-4">
                  <div className="grow">
                    <div className="mb-3">Biaya Refund</div>
                    <CurrencyInput
                      className={`${errors.biaya_refund ? "border-red-400" : ""
                        } border h-[45px]  w-[100%] pr-3 pl-5  text-gray-700 focus:outline-none rounded-lg`}
                      placeholder="Masukan Total Amount dari channel Olshop"
                      defaultValue={0}
                      decimalsLimit={2}
                      groupSeparator="."
                      decimalSeparator=","
                      prefix="Rp "
                      {...register("biaya_refund", {
                        required: true,
                      })}
                    />
                  </div>
                </div>

                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-green-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => setrefundModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`${btnrefund ? "bg-gray-500" : "bg-green-500"
                      } text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1`}
                    type="button"
                    disabled={btnrefund}
                    onClick={() => sumbitrefund()}
                  >
                    Refund
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}

      {returLuarModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl ">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col bg-white outline-none focus:outline-none w-[500px]">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <span className="text-sm font-semibold">
                    Tukar Size Barang Luar -{" "}
                    {LuarProduk +
                      " | Size " +
                      LuarSize +
                      " | Qty " +
                      LuarOldQty}
                  </span>
                </div>
                {/*body*/}
                <div className="relative text-sm p-6 flex-auto">
                  <div className="text-sm">
                    <label>Nama Produk</label>
                    <input
                      value={LuarProduk}
                      readOnly
                      className="h-auto rounded-lg w-full bg-white py-2 px-5 mt-2 text-gray-700 focus:outline-none border"
                      type="text"
                      placeholder="Masukan Nama Produk"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-sm mt-3">
                      <label>Size Baru</label>
                      <input
                        value={LuarSize}
                        onChange={(e) => {
                          setLuarSize(e.target.value);
                        }}
                        className="h-auto rounded-lg w-full bg-white py-2 px-5 mt-2 text-gray-700 focus:outline-none border"
                        type="text"
                        placeholder="Masukan Size"
                      />
                    </div>

                    <div className="text-sm mt-3">
                      <div className="mb-2">Qty:</div>
                      <div className="text-sm flex flex-wrap items-center">
                        <button
                          onClick={() => {
                            setQtymanualluar("min");
                          }}
                          className="w-10 py-2 border border-blue-300 rounded font-bold text-blue-500 hover:bg-blue-500 hover:text-white"
                        >
                          -
                        </button>
                        <div className="font-bold py-2 grow text-center border rounded mx-2">
                          {LuarQtyNew}
                        </div>
                        <button
                          onClick={() => {
                            setQtymanualluar("plus");
                          }}
                          className="w-10 py-2 border border-blue-300 rounded font-bold text-blue-500 hover:bg-blue-500 hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm mt-3">
                    <label>Supplier</label>
                    <div className="mt-2 flex flex-wrap items-center justify-end">
                      <select
                        onChange={(e) => {
                          setLuarSupplier(e.target.value);
                        }}
                        className="appearance-none h-auto cursor-pointer rounded-lg w-full bg-white py-2 px-5 focus:outline-none border text-sm"
                        placeholder="Pilih Store"
                      >
                        <option value="">Pilih Supplier</option>
                        {list_supplier}
                      </select>
                      <i className="fi fi-rr-angle-small-down w-[1.12rem] h-[1.12rem] text-center text-gray-500 text-[1.12rem] leading-4 absolute mr-5"></i>
                    </div>
                  </div>

                  <div className="text-sm mt-3">
                    <label>Harga Beli</label>
                    <input
                      onChange={(e) => {
                        setLuarHargaBeli(parseInt(e.target.value));
                      }}
                      value={LuarHargaBeli}
                      className="h-auto rounded-lg w-full bg-white py-2 px-5 mt-2 text-gray-700 focus:outline-none border"
                      type="number"
                      placeholder="Masukan Harga Beli"
                    />
                  </div>

                  <div className="text-sm my-3">
                    <label>Status Pembayaran</label>
                    <div className="mt-2 flex flex-wrap items-center justify-end">
                      <select
                        onChange={(e) => {
                          setLuarPayment(e.target.value);
                        }}
                        className="appearance-none h-auto cursor-pointer rounded-lg w-full bg-white py-2 px-5 focus:outline-none border text-sm"
                        placeholder="Pilih Store"
                      >
                        <option value="">Pilih Payment</option>
                        <option value="PAID">PAID</option>
                        <option value="PENDING">PENDING</option>
                      </select>
                      <i className="fi fi-rr-angle-small-down w-[1.12rem] h-[1.12rem] text-center text-gray-500 text-[1.12rem] leading-4 absolute mr-5"></i>
                    </div>
                  </div>
                  <div className="text-sm">
                    <label>Status Barang Retur</label>
                    <div className="mt-2 flex flex-wrap items-center justify-end">
                      <select
                        onChange={(e) => {
                          setLuarStatusBarangRetur(e.target.value);
                        }}
                        className="appearance-none h-auto cursor-pointer rounded-lg w-full bg-white py-2 px-5 focus:outline-none border text-sm"
                        placeholder="Pilih Store"
                      >
                        <option value="">Pilih Status Barang Retur</option>
                        <option value="STOKAN">STOKAN</option>
                        <option value="RETURN">DIKEMBALIKAN KE SUPPLIER</option>
                      </select>
                      <i className="fi fi-rr-angle-small-down w-[1.12rem] h-[1.12rem] text-center text-gray-500 text-[1.12rem] leading-4 absolute mr-5"></i>
                    </div>
                  </div>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-green-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => {
                      setreturLuarModal(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={` ${returLuarBTN ? "bg-gray-500" : "bg-green-500"
                      } text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1`}
                    type="button"
                    disabled={returLuarBTN}
                    onClick={() => sumbitReturLuar()}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}

      {hapuspesanan ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl ">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col bg-white outline-none focus:outline-none w-[500px]">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <span className="text-sm font-semibold">
                    Delete Pesanan {id_pesanan}
                  </span>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
                  <span className="text-sm font-semibold">
                    Mohon Konfirmasi untuk Penghapusan Data?
                  </span>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => {
                      sethapuspesanan(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-red-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => deletePesanan()}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}

      {paysatuan ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl ">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col bg-white outline-none focus:outline-none w-[500px]">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <span className="text-sm font-semibold">
                    Bayar Produk Satuan
                  </span>
                </div>
                {/*body*/}
                <div className="relative text-sm p-6 flex items-center flex-auto gap-4">
                  <div className="grow">
                    <div className="mb-2">Produk:</div>
                    <input
                      value={produkpaysatuan}
                      className="h-auto rounded-lg w-full bg-white py-2 px-5 text-gray-700 focus:outline-none border"
                      type="text"
                      readOnly
                      placeholder="Masukan Size"
                    />
                  </div>

                  <div className="text-sm">
                    <div className="mb-2">Qty:</div>
                    <div className="text-sm flex flex-wrap items-center">
                      <button
                        onClick={() => {
                          setQtypay("min");
                        }}
                        className={`bg-blue-500 text-white w-10 py-2 border rounded font-bold`}
                      >
                        -
                      </button>
                      <div className="font-bold py-2 w-10 text-center border rounded mx-2">
                        {qtyrpay}
                      </div>
                      <button
                        onClick={() => {
                          setQtypay("plus");
                        }}
                        className={`bg-blue-500 text-white w-10 py-2 border rounded font-bold`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-sm px-6 text-center mb-2 border-b pb-2">
                  History pembayaran
                </div>
                <div className=" text-sm p-6 -mt-5  items-center justify-center grid grid-cols-4 text-center">
                  <div>No.</div>
                  <div>Tanggal Bayar</div>
                  <div>Qty</div>
                  <div>Amount</div>
                </div>
                {datapaymentsatuan.result.map((data: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className=" text-sm p-6 -mt-10  items-center justify-center grid grid-cols-4 text-center"
                    >
                      <div>{index + 1}</div>
                      <div>{data.tanggal_pembayaran}</div>
                      <div>{data.qty}</div>
                      <div>{Rupiah.format(data.amount)}</div>
                    </div>
                  );
                })}

                <div className="relative text-sm p-6 -mt-5 flex items-center flex-auto gap-4">
                  <div className="grow">
                    <div className="mb-3">Sisa Total Pembayaran</div>
                    <CurrencyInput
                      className={`border h-[45px]  w-[100%] pr-3 pl-5  text-gray-700 focus:outline-none rounded-lg`}
                      placeholder="Masukan Total Amount dari channel Olshop"
                      defaultValue={0}
                      decimalsLimit={2}
                      groupSeparator="."
                      decimalSeparator=","
                      prefix="Rp "
                      value={(hargasatuanpay - diskonsatuanpay) * qtyrpay}
                      readOnly
                    />
                  </div>
                </div>

                <div className="flex flex-row">
                  <div className="basis-1/3 text-xl font-bold p-5 text-lime-500 ">
                    <div className="mt-1">
                      <Image
                        className="w-[40%] h-[25%] m-auto"
                        src={`https://api.401snkrs.com/public/images/cash1.png`}
                        alt="Picture of the author"
                        width={100}
                        height={100}
                        placeholder="blur"
                        blurDataURL={"/box.png"}
                      />
                    </div>
                  </div>
                  <div className="basis-full text-xl font-regular p-5">
                    <CurrencyInput
                      onChange={(e) => {
                        var values = e.target.value.replace(/\D/g, "");
                        if (values === "") {
                          setps_cash(0);
                        } else {
                          setps_cash(parseInt(values));
                        }
                      }}
                      defaultValue={0}
                      decimalsLimit={2}
                      groupSeparator="."
                      decimalSeparator=","
                      value={ps_cash}
                      prefix="Rp "
                      className="h-auto rounded-lg w-full bg-white pl-2 text-gray-700 focus:outline-none border"
                      type="text"
                    />
                  </div>
                </div>
                <div className="flex flex-row">
                  <div className="basis-1/3 text-xl font-bold p-5 text-blue-600">
                    <div className="mt-1">
                      <Image
                        className="w-[40%] h-[25%] m-auto"
                        src={`https://api.401snkrs.com/public/images/bca1.png`}
                        alt="Picture of the author"
                        width={100}
                        height={100}
                        placeholder="blur"
                        blurDataURL={"/box.png"}
                      />
                    </div>
                  </div>
                  <div className="basis-full text-xl font-regular p-5">
                    <CurrencyInput
                      onChange={(e) => {
                        var values = e.target.value.replace(/\D/g, "");
                        if (values === "") {
                          setps_bca(0);
                        } else {
                          setps_bca(parseInt(values));
                        }
                      }}
                      defaultValue={0}
                      decimalsLimit={2}
                      groupSeparator="."
                      decimalSeparator=","
                      prefix="Rp "
                      value={ps_bca}
                      className="h-auto rounded-lg w-full bg-white pl-2 text-gray-700 focus:outline-none border"
                      type="text"
                    />
                  </div>
                </div>
                <div className="flex flex-row">
                  <div className="basis-1/3 text-xl font-bold p-5 text-cyan-500">
                    <div className="mt-1">
                      <Image
                        className="w-[40%] h-[25%] m-auto"
                        src={`https://api.401snkrs.com/public/images/qris.jpeg`}
                        alt="Picture of the author"
                        width={100}
                        height={100}
                        placeholder="blur"
                        blurDataURL={"/box.png"}
                      />
                    </div>
                  </div>
                  <div className="basis-full text-xl font-regular p-5">
                    <CurrencyInput
                      onChange={(e) => {
                        var values = e.target.value.replace(/\D/g, "");
                        if (values === "") {
                          setps_qris(0);
                        } else {
                          setps_qris(parseInt(values));
                        }
                      }}
                      defaultValue={0}
                      decimalsLimit={2}
                      groupSeparator="."
                      decimalSeparator=","
                      prefix="Rp "
                      value={ps_qris}
                      className="h-auto rounded-lg w-full bg-white pl-2 text-gray-700 focus:outline-none border"
                      type="text"
                    />
                  </div>
                </div>

                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-green-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => setpaysatuan(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`${btnrefund ? "bg-gray-500" : "bg-green-500"
                      } text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1`}
                    type="button"
                    onClick={() => submitpaymentsatuan()}
                  >
                    Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}

      {payall ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl ">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col bg-white outline-none focus:outline-none w-[500px]">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <span className="text-sm font-semibold">
                    Bayar Nota Ini Keseluruhan : {id_invoicepayall}
                  </span>
                </div>
                {/*body*/}

                <div className="relative text-sm p-6 flex items-center flex-auto gap-4 mt-2">
                  <div className="grow">
                    <CurrencyInput
                      className={`border h-[45px]  w-[100%] pr-3 pl-5  text-gray-700 focus:outline-none rounded-lg`}
                      placeholder="Masukan Total Amount dari channel Olshop"
                      defaultValue={0}
                      decimalsLimit={2}
                      groupSeparator="."
                      decimalSeparator=","
                      prefix="Rp "
                      value={total_amountall}
                      readOnly
                    />
                  </div>
                </div>

                <div className="flex flex-row">
                  <div className="basis-1/3 text-xl font-bold p-5 text-lime-500 ">
                    <div className="mt-1">
                      <Image
                        className="w-[40%] h-[25%] m-auto"
                        src={`https://api.401snkrs.com/public/images/cash1.png`}
                        alt="Picture of the author"
                        width={100}
                        height={100}
                        placeholder="blur"
                        blurDataURL={"/box.png"}
                      />
                    </div>
                  </div>
                  <div className="basis-full text-xl font-regular p-5">
                    <CurrencyInput
                      onChange={(e) => {
                        var values = e.target.value.replace(/\D/g, "");
                        if (values === "") {
                          setpayall_cash(0);
                        } else {
                          setpayall_cash(parseInt(values));
                        }
                      }}
                      defaultValue={0}
                      decimalsLimit={2}
                      groupSeparator="."
                      decimalSeparator=","
                      value={payall_cash}
                      prefix="Rp "
                      className="h-auto rounded-lg w-full bg-white pl-2 text-gray-700 focus:outline-none border"
                      type="text"
                    />
                  </div>
                </div>
                <div className="flex flex-row">
                  <div className="basis-1/3 text-xl font-bold p-5 text-blue-600">
                    <div className="mt-1">
                      <Image
                        className="w-[40%] h-[25%] m-auto"
                        src={`https://api.401snkrs.com/public/images/bca1.png`}
                        alt="Picture of the author"
                        width={100}
                        height={100}
                        placeholder="blur"
                        blurDataURL={"/box.png"}
                      />
                    </div>
                  </div>
                  <div className="basis-full text-xl font-regular p-5">
                    <CurrencyInput
                      onChange={(e) => {
                        var values = e.target.value.replace(/\D/g, "");
                        if (values === "") {
                          setpayall_bca(0);
                        } else {
                          setpayall_bca(parseInt(values));
                        }
                      }}
                      defaultValue={0}
                      decimalsLimit={2}
                      groupSeparator="."
                      decimalSeparator=","
                      prefix="Rp "
                      value={payall_bca}
                      className="h-auto rounded-lg w-full bg-white pl-2 text-gray-700 focus:outline-none border"
                      type="text"
                    />
                  </div>
                </div>
                <div className="flex flex-row">
                  <div className="basis-1/3 text-xl font-bold p-5 text-cyan-500">
                    <div className="mt-1">
                      <Image
                        className="w-[40%] h-[25%] m-auto"
                        src={`https://api.401snkrs.com/public/images/qris.jpeg`}
                        alt="Picture of the author"
                        width={100}
                        height={100}
                        placeholder="blur"
                        blurDataURL={"/box.png"}
                      />
                    </div>
                  </div>
                  <div className="basis-full text-xl font-regular p-5">
                    <CurrencyInput
                      onChange={(e) => {
                        var values = e.target.value.replace(/\D/g, "");
                        if (values === "") {
                          setpayall_qris(0);
                        } else {
                          setpayall_qris(parseInt(values));
                        }
                      }}
                      defaultValue={0}
                      decimalsLimit={2}
                      groupSeparator="."
                      decimalSeparator=","
                      prefix="Rp "
                      value={payall_qris}
                      className="h-auto rounded-lg w-full bg-white pl-2 text-gray-700 focus:outline-none border"
                      type="text"
                    />
                  </div>
                </div>

                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-green-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => setpayall(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`${btnrefund ? "bg-gray-500" : "bg-green-500"
                      } text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1`}
                    type="button"
                    onClick={() => submitpaymentall()}
                  >
                    Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}

      {printpending ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl ">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col bg-white outline-none focus:outline-none w-[500px]">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <span className="text-sm font-semibold">
                    Print Nota Pending : {print_reseller}
                  </span>
                </div>
                {/*body*/}

                <div className="flex flex-row">
                  <div className="grow p-5">
                    <select
                      value={tipe_print}
                      onChange={handleChange}
                      className="appearance-none border h-[45px] w-[100%] pr-3 pl-5 text-gray-700 focus:outline-none rounded-lg"
                    >
                      <option value="">Select Tipe Print</option>
                      <option value="THIS_NOTA">THIS NOTA</option>
                      <option value="ALL_NOTA">ALL NOTA</option>
                    </select>
                  </div>
                </div>

                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-green-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => setprintpending(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`${btnrefund ? "bg-gray-500" : "bg-green-500"
                      } text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1`}
                    type="button"
                    onClick={() => blob_print_sales(print_id_invoice, print_reseller)}
                  >
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </div>
  );
}
