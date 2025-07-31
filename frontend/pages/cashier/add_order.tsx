import Head from "next/head";
import Image from "next/image";
import * as fa from "react-icons/fa";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import React, { Component, useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Select from "react-select";
import { table } from "console";
import TableRows from "../../components/tablerows";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { stringify } from "querystring";
import { compareAsc, format } from "date-fns";
import { redirect } from "next/dist/server/api-utils";
import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then((res) => res.json());
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import CurrencyInput from "react-currency-input-field";
import Cookies from "js-cookie";
import Warehouse from "../datamaster/supplier";
import Store from "../datamaster/store";
let Rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function AddOrder() {
  const [isLoading, setisLoading]: any = useState(true);
  const [data_store, setdatastore] = useState([]);
  const [data_ware, setdataware] = useState([]);
  const [data_product, setdataproductsales] = useState([]);
  const [data_supplier, setdatasupplier] = useState([]);
  // const [data_role, setdatarole] = useState([]);

  const {
    register,
    control,
    resetField,
    setValue,
    trigger,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm({});

  const router = useRouter();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [Date_bataskirim, setDate_bataskirim] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    // loaddataproductsales(Query);
    getstore(Role, idstore);
    getwarehouse(Role, area);
    getsupplier();
    return () => { };
  }, []);

  async function getstore(role: any, idstore: any) {
    await axios({
      method: "post",
      url: `https://api.401snkrs.com/v1/getstore_sales_online`,
      data: {
        role: role,
        store: idstore,
      },
    })
      .then(function (response) {
        setdatastore(response.data.result);
        if (
          "SUPER-ADMIN" === Cookies.get("auth_role") ||
          "HEAD-AREA" === Cookies.get("auth_role")
        ) {
        } else {
          setValue("store", response.data.result[0].id_store);
          loaddataproductsales(Query);
          getwaress(response.data.result[0].id_store);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const list_store: any = [];
  const fixed_store: any = [];
  data_store.map((store: any, index: number) => {
    list_store.push(
      <option key={index} value={store.id_store}>
        {store.store}
      </option>
    );
    fixed_store.push(
      <option key={index} value={store.id_store}>
        {store.store}
      </option>
    );
    if (
      "SUPER-ADMIN" === Cookies.get("auth_role") ||
      "HEAD-AREA" === Cookies.get("auth_role") ||
      "HEAD-STORE" === Cookies.get("auth_role")
    ) {
    }
  });

  async function getwarehouse(role: any, area: any) {
    await axios({
      method: "post",
      url: `https://api.401snkrs.com/v1/getwarehouse_sales`,
      data: {
        role: role,
        area: area,
      },
    })
      .then(function (response) {
        setdataware(response.data.result);
        // if (
        //   "SUPER-ADMIN" === Cookies.get("auth_role") ||
        //   "HEAD-AREA" === Cookies.get("auth_role")
        // ) {
        // } else {
        setValue("warehouse", response.data.result[0].id_ware);
        setdataidware(response.data.result[0].id_ware);
        // }
        // console.log(response.data.result);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const [barcode, setbarcode] = useState("");
  const [get_idware, setdataidware]: any = useState("");
  const list_warehouse: any = [];
  const fixed_ware: any = [];
  if (!isLoading) {
    data_ware.map((area: any, index: number) => {
      list_warehouse.push(
        <option key={index} value={area.id_ware}>
          {area.warehouse}
        </option>
      );
      fixed_ware.push(
        <option key={index} value={area.id_ware}>
          {area.warehouse}
        </option>
      );
      // if (
      //   "SUPER-ADMIN" === Cookies.get("auth_role") ||
      //   "HEAD-AREA" === Cookies.get("auth_role")
      // ) {
      // } else {
      //   setValue("warehouse", area.id_ware);
      //   setdataidware(area.id_ware)
      // }
    });
  }

  async function getsupplier() {
    await axios({
      method: "get",
      url: `https://api.401snkrs.com/v1/getsupplier`,
    })
      .then(function (response) {
        setdatasupplier(response.data.data_supplier);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
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

  const [Role, setRole] = useState(Cookies.get("auth_role"));
  const [idstore, setIdstore] = useState(Cookies.get("auth_store"));
  const [Users, setUsers] = useState(Cookies.get("auth_name"));
  const [Query, setQuery] = useState("all");
  const [QuerySearch, setQuerySearch] = useState("");
  const [cekbarcode, setcekbarcode] = useState("STOP");
  const [area, setarea] = useState(Cookies.get("auth_store"));
  const [cariwaress, setcariwares] = useState("");
  const [cariwaress_nama, setcariwares_nama] = useState("");

  function querySet(e: any) {
    if (e.target.value === "") {
      setQuery("all");
      loaddataproductsales("all");
    } else {
      setQuery(e.target.value);
      loaddataproductsales(e.target.value);
    }
  }

  async function keyDown(event: any) {
    if (event.key == 'Enter') {
      if (Query != "all") {
        loaddataproductsales(Query);
      }
    }
  }

  async function loaddataproductsales(query: any) {
    setisLoading(true);
    await axios({
      method: "post",
      url: `https://api.401snkrs.com/v1/products_sales`,
      data: {
        query: query,
      },
    })
      .then(function (response) {
        setdataproductsales(response.data.result);
        setisLoading(false);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const list_product: any = [];

  {
    if (!isLoading) {
      data_product.map((data_produk: any, index: any) => {
        list_product.push(
          <div key={index}>
            {(function () {
              if (data_produk.stok === "External") {
                return (
                  <>
                    <div
                      onDoubleClick={(e) =>
                        openaddmodalexternal(
                          data_produk.img,
                          data_produk.produk,
                          data_produk.id_produk,
                          data_produk.stok,
                          data_produk.variation_sales[0].size,
                          data_produk.variation_sales[0].qty
                        )
                      }
                      className=" bg-white h-fit shadow-lg cursor-pointer rounded-lg pb-1"
                    >
                      <div className="aspect-square flex items-center">
                        <Image
                          className="w-[100%] h-auto p-7 m-auto rounded-t-lg"
                          src={`https://api.401snkrs.com/public/images/${data_produk.img}`}
                          alt="Picture of the author"
                          width={300}
                          height={300}
                          placeholder="blur"
                          blurDataURL={"/box.png"}
                        />
                      </div>

                      <div className="text-xs px-2 my-2 pt-1 flex flex-col text-center gap-1">
                        <div className="font-medium line-clamp-1 h-5">
                          Size {data_produk.variation_sales[0].size} |{" "}
                          {data_produk.produk}
                        </div>
                      </div>
                    </div>
                  </>
                );
              } else {
                return (
                  <>
                    <div
                      onDoubleClick={() => {
                        // console.log(data_produk);
                        openaddmodal(
                          data_produk.img,
                          data_produk.produk,
                          data_produk.id_produk,
                          data_produk.stok
                        );
                      }}
                      className=" bg-white h-fit shadow-lg cursor-pointer rounded-lg pb-1"
                    >
                      <div className="aspect-square flex items-center">
                        <Image
                          className="w-[100%] h-[100%] m-auto rounded-t-lg"
                          src={`https://api.401snkrs.com/public/images/${data_produk.img}`}
                          alt="Picture of the author"
                          width={300}
                          height={300}
                          placeholder="blur"
                          blurDataURL={"/box.png"}
                        />
                      </div>

                      <div className="text-xs px-2 my-2 pt-1 flex flex-col text-center gap-1">
                        <div className="font-medium line-clamp-1 h-5">
                          {data_produk.produk}
                        </div>
                      </div>
                    </div>
                  </>
                );
              }
            })()}
          </div>
        );
      });
    }
  }

  const [pilih_warehouse, setpilih_warehouse] = React.useState("close");
  const [datasize, setdatasize] = React.useState([]);

  async function getwaress(e: any) {
    await axios
      .post(`https://api.401snkrs.com/v1/cariwares`, {
        id_store: e,
      })
      .then(function (response) {
        // console.log(response.data.result[0].cariwares)
        // console.log(response.data.result[0].nama_warehouses)
        setcariwares(response.data.result[0].cariwares);
        setcariwares_nama(response.data.result[0].nama_warehouses);
      });

  }
  async function getStock(e: any, idproduk: any) {
    setpilih_warehouse("loading");
    setsizeSelected(null);
    setstokReady(0);
    setaddmodal_submit(true);
    setaddmodal_qty(1);
    console.log(cariwaress)
    console.log(cariwaress_nama)
    console.log(get_displayed)

    setaddmodal_warehouse(e);
    await axios
      .post(`https://api.401snkrs.com/v1/getsizesales`, {
        idware: cariwaress,
        idproduct: idproduk,
      })
      .then(function (response) {
        setpilih_warehouse("open");
        setdatasize(response.data.result.datasize);
        setdatahargajual(parseInt(response.data.result.get_hargajual[0].g_price) - 100000);
        setdatagudangawal(response.data.result.gudang_awal[0].warehouse);
      });
    // }
  }

  const [get_displayed, setgetdisplayed] = React.useState("display_false");
  async function getdisplayed(e: any) {
    console.log(e.target.value)
    setgetdisplayed(e.target.value);
  }

  const [sizeSelected, setsizeSelected] = React.useState(null);
  const [stokReady, setstokReady] = React.useState(0);

  function setQty(type: any) {
    if (type === "plus") {
      if (addmodal_qty < stokReady) {
        setaddmodal_qty(addmodal_qty + 1);
      } else {
        toast.warning("Jumlah Melebihi Stok Yang Tersedia!", {
          position: toast.POSITION.TOP_RIGHT,
          pauseOnHover: false,
          autoClose: 2000,
        });
      }
    } else if (type === "min") {
      if (addmodal_qty > 1) {
        setaddmodal_qty(addmodal_qty - 1);
      }
    }
  }

  const list_size: any = [];

  {
    for (let index = 0; index < datasize.length; index++) {
      if (datasize[index].qty > 0) {
        list_size.push(
          <div
            onClick={() => {
              setsizeSelected(datasize[index].size);
              setstokReady(parseInt(datasize[index].qty));
              setaddmodal_submit(false);
              setaddmodal_qty(1);
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

  const [rowsData, setRowsData] = useState([]);
  const [totalQty, settotalQty] = useState(0);
  const [cod, setcod] = useState("");
  const [jasa_kirim, setjasa_kirim] = useState("");
  const EstimasiPembayaran = rowsData.reduce(
    (total, currentItem) =>
      (total = total + currentItem.harga_jual * currentItem.qty),
    0
  );

  async function scanBarcode(e: any) {
    if (e.target.value.length >= 13) {
      let text = e.target.value;
      const data = text.split(".");

      await axios
        .post(`https://api.401snkrs.com/v1/cekbarcode`, {
          idware: cariwaress,
          idproduct: data[0],
          size: data[1],
        })
        .then(function (response) {
          setcekbarcode(response.data.result.hasil_cekbarcode);
          if (response.data.result.hasil_cekbarcode === "GO") {
            axios
              .post(`https://api.401snkrs.com/v1/salesproductbarcode`, {
                idware: cariwaress,
                size: data[1],
                idproduct: data[0],
              })
              .then(function (response) {
                if (response.data.result === "sold_out") {
                  toast.error(
                    "The size you want is out of stock",
                    {
                      position: toast.POSITION.TOP_RIGHT,
                      pauseOnHover: false,
                      autoClose: 2000,
                    }
                  );
                } else {
                  if (
                    !rowsData.find(
                      (item) =>
                        item.idproduk === data[0] &&
                        item.size === data[1] &&
                        item.id_ware === cariwaress
                    )
                  ) {
                    const rowsInput = {
                      produk: response.data.result.produk,
                      idproduk: data[0],
                      size: data[1],
                      harga_beli: response.data.result.datas[0].harga_beli,
                      qty_ready: response.data.result.qty_ready,
                      qty: 1,
                      img: response.data.result.img,
                      source: cariwaress_nama,
                      id_ware: response.data.result.id_ware,
                      // start di tambahin jamed
                      harga_jual: parseInt(response.data.result.get_hargajual[0].g_price) - 100000,
                      // end baru di tambahin jamed
                      payment: "PAID",
                    };
                    setdatahargajual(parseInt(response.data.result.get_hargajual[0].g_price) - 100000);
                    setRowsData([...rowsData, rowsInput]);
                    settotalQty(totalQty + 1);

                    toast.success("Product Added Successfully", {
                      position: toast.POSITION.TOP_RIGHT,
                      pauseOnHover: false,
                      autoClose: 2000,
                    });
                    setaddmodal(false);
                    setbarcode("");
                  } else {
                    setbarcode("");
                    toast.info(
                      "Products of the same size have been added before",
                      {
                        position: toast.POSITION.TOP_RIGHT,
                        pauseOnHover: false,
                        autoClose: 2000,
                      }
                    );
                  }
                }

              });
            e.target.value = "";
          } else {
            toast.info(
              "This product is not in the warehouse..",
              {
                position: toast.POSITION.TOP_RIGHT,
                pauseOnHover: false,
                autoClose: 2000,
              }
            );
          }
        });

    }
  }

  function addProduk(
    produk: any,
    idproduk: any,
    size: any,
    harga_beli: any,
    img: any,
    qty: any,
    source: any,
    qty_ready: any,
    id_ware: any,
    harga_jual: any
  ) {
    // console.log(harga_jual)
    if (
      !rowsData.find(
        (item) =>
          item.idproduk === idproduk &&
          item.size === size &&
          item.id_ware === id_ware
      )
    ) {
      const rowsInput = {
        produk: produk,
        idproduk: idproduk,
        size: size,
        harga_beli: harga_beli,
        qty_ready: qty_ready,
        qty: qty,
        img: img,
        source: source,
        id_ware: cariwaress,
        harga_jual: harga_jual,
        payment: "PAID",
      };
      setRowsData([...rowsData, rowsInput]);
      settotalQty(totalQty + qty);

      toast.success("Produk Berhasil Ditambahkan", {
        position: toast.POSITION.TOP_RIGHT,
        pauseOnHover: false,
        autoClose: 2000,
      });
      setaddmodal(false);
      setaddmodalexternal(false);
    } else {
      toast.info("Produk dengan size yang sama telah ditambahkan sebelumnya", {
        position: toast.POSITION.TOP_RIGHT,
        pauseOnHover: false,
        autoClose: 2000,
      });
    }
  }

  function addProdukluar(
    payment: any,
    produk: any,
    idproduk: any,
    size: any,
    harga_beli: any,
    img: any,
    qty: any,
    source: any,
    qty_ready: any,
    id_ware: any,
    TotalBiayaPerlengkapan: any
  ) {

    if (
      produk === "" ||
      size === "" ||
      id_ware === "" ||
      payment === ""
    ) {
      toast.warning("Mohon Isi Data dengan Lengkap", {
        position: toast.POSITION.TOP_RIGHT,
        pauseOnHover: false,
        autoClose: 2000,
      });
    } else {
      const rowsInput = {
        produk: produk,
        idproduk: idproduk,
        size: size,
        harga_beli: harga_beli,
        harga_jual: harga_beli,
        qty_ready: qty_ready,
        qty: qty,
        img: img,
        source: source,
        id_ware: id_ware,
        payment: payment,
        acc: TotalBiayaPerlengkapan,
      };
      setRowsData([...rowsData, rowsInput]);
      settotalQty(totalQty + qty);

      toast.success("Produk Berhasil Ditambahkan", {
        position: toast.POSITION.TOP_RIGHT,
        pauseOnHover: false,
        autoClose: 2000,
      });

      setaddproduk(false);
      setaddproduk_produk("");
      setaddproduk_size("");
      setaddproduk_qty(1);
      setaddproduk_supplier("");
      setaddproduk_hargabeli("0");
      setTotalBiayaPerlengkapan("0");
    }
  }

  function addProdukEksternal(
    produk: any,
    idproduk: any,
    size: any,
    qty: any,
    source: any,
    qty_ready: any
  ) {
    if (
      !rowsData.find(
        (item) =>
          item.idproduk === idproduk &&
          item.size === size &&
          item.id_ware === "STOKAN"
      )
    ) {
      const rowsInput = {
        produk: produk,
        idproduk: idproduk,
        size: size,
        harga_beli: 0,
        qty_ready: qty_ready,
        qty: qty,
        img: "box.png",
        source: source,
        id_ware: "STOKAN",
        payment: "STOKAN",
      };
      setRowsData([...rowsData, rowsInput]);
      settotalQty(totalQty + qty);

      toast.success("Produk Berhasil Ditambahkan", {
        position: toast.POSITION.TOP_RIGHT,
        pauseOnHover: false,
        autoClose: 2000,
      });

      setaddmodalexternal(false);
    } else {
      toast.info("Produk dengan size yang sama telah ditambahkan sebelumnya", {
        position: toast.POSITION.TOP_RIGHT,
        pauseOnHover: false,
        autoClose: 2000,
      });
    }
  }

  const deleteTableRows = (index: number, qty: any) => {
    const rows = [...rowsData];
    rows.splice(index, 1);
    setRowsData(rows);
    settotalQty(totalQty - qty);
  };

  const table_product: any = [];

  function setQttable(type: any, index: any) {
    if (type === "plus") {
      if (rowsData[index].qty_ready != "nolimit") {
        if (rowsData[index].qty < rowsData[index].qty_ready) {
          const rowsInput = [...rowsData];
          rowsData[index].qty = rowsData[index].qty + 1;
          setRowsData(rowsInput);
          settotalQty(totalQty + 1);
        }
      } else {
        const rowsInput = [...rowsData];
        rowsData[index].qty = rowsData[index].qty + 1;
        setRowsData(rowsInput);
        settotalQty(totalQty + 1);
      }
    } else if (type === "min") {
      if (rowsData[index].qty > 1) {
        const rowsInput = [...rowsData];
        rowsData[index].qty = rowsData[index].qty - 1;
        setRowsData(rowsInput);
        settotalQty(totalQty - 1);
      }
    }
  }

  {
    for (let index = 0; index < rowsData.length; index++) {
      table_product.push(
        <div key={index} className="flex flex-row gap-3 p-3 border-b">
          {(function () {
            if (rowsData[index].source === "Barang Luar") {
              return (
                <div className="w-[15%] rounded-lg hidden">
                  <div className="aspect-square flex items-center">
                    <Image
                      className="w-[100%] h-[100%] m-auto rounded-lg"
                      src={`/open-box.png`}
                      alt="Picture of the author"
                      width={200}
                      height={200}
                      placeholder="blur"
                      blurDataURL={"/open-box.png"}
                    />
                  </div>
                </div>
              );
            } else {
              return (
                <div className="w-[12%] rounded-lg  bg-cyan-100 self-center hidden">
                  <div className="aspect-square flex items-center">
                    <Image
                      className="w-[100%] h-[100%] m-auto rounded-lg"
                      src={`https://api.401snkrs.com/public/images/${rowsData[index].img}`}
                      alt="Picture of the author"
                      width={200}
                      height={200}
                      placeholder="blur"
                      blurDataURL={"/open-box.png"}
                    />
                  </div>
                </div>
              );
            }
          })()}
          <div className="grow flex flex-col items-start gap-1 justify-center ml-2">
            <span className="text-xs font-bold">{rowsData[index].produk}</span>
            <span className="text-xs font-regular">
              {/* <span className="font-bold">Price Item</span>&nbsp;{" : "} */}
              {Rupiah.format(rowsData[index].harga_jual)} x <span className="font-bold">{rowsData[index].qty}</span>  =  <span className="font-bold">{Rupiah.format(
                rowsData[index].harga_jual *
                rowsData[index].qty
              )}</span>
              <span className="font-medium pl-2">{rowsData[index].source}</span>
            </span>

          </div>
          <div className=" basis-1/8 place-self-center flex flex-row bg-cyan-100">
            <div className="text-xs flex flex-wrap grow items-center">
              <button
                onClick={() => {
                  setQttable("min", index);
                }}
                className="w-7 py-1 border border-blue-300 rounded font-bold text-blue-500 hover:bg-blue-500 hover:text-white"
              >
                -
              </button>
              <div className="font-bold py-1 w-7 text-center border rounded mx-2">
                {rowsData[index].qty}
              </div>
              <button
                onClick={() => {
                  setQttable("plus", index);
                }}
                className="w-7 py-1 border border-blue-300 rounded font-bold text-blue-500 hover:bg-blue-500 hover:text-white"
              >
                +
              </button>
            </div>
          </div>

          <div className=" basis-1/8 place-self-center">
            <span className="w-24 py-0 px-1 border border-orange-500 rounded font-bold text-orange-700 hover:bg-orange-700 hover:text-white text-3xl">
              {rowsData[index].size}
            </span>
          </div>

          <div className="basis-1/8 place-self-center">
            <button
              onClick={() => {
                deleteTableRows(index, rowsData[index].qty);
              }}
              className="text-red-500"
            >
              <i className="fi fi-rr-trash text-center text-lg"></i>
            </button>
          </div>
        </div>
      );
    }
  }

  const [addmodal, setaddmodal] = React.useState(false);
  const [addmodal_img, setaddmodal_img] = React.useState("");
  const [addmodal_produk, setaddmodal_produk] = React.useState("");
  const [addmodal_idproduk, setaddmodal_idproduk] = React.useState("");
  const [addmodal_submit, setaddmodal_submit] = React.useState(true);
  const [addmodal_qty, setaddmodal_qty] = React.useState(1);
  const [addmodal_warehouse, setaddmodal_warehouse] = React.useState(1);

  const [addproduk, setaddproduk] = React.useState(false);

  const [addproduk_produk, setaddproduk_produk] = React.useState("");
  const [addproduk_size, setaddproduk_size] = React.useState("");
  const [addproduk_qty, setaddproduk_qty] = React.useState(1);
  const [addproduk_supplier, setaddproduk_supplier] = React.useState("");
  const [addproduk_hargabeli, setaddproduk_hargabeli] = React.useState("0");
  const [addproduk_payment, setaddproduk_payment] = React.useState("");
  const [addprodukharga_jual, setdatahargajual]: any = React.useState(0);
  const [addproduk_gudangawal, setdatagudangawal]: any = React.useState(0);

  const [addmodalexternal, setaddmodalexternal] = React.useState(false);
  const [sizeext, setsizeext] = React.useState("");
  const [sizeextqty, setsizeextqty] = React.useState("0");

  function setQtymanual(type: any) {
    if (type === "plus") {
      setaddproduk_qty(addproduk_qty + 1);
    } else if (type === "min") {
      if (addproduk_qty > 1) {
        setaddproduk_qty(addproduk_qty - 1);
      }
    }
  }

  function openaddmodal(img: any, produk: any, idproduk: any, source: any) {
    setaddmodal_img(img);
    setaddmodal_produk(produk);
    setaddmodal_idproduk(idproduk);
    setaddmodal_qty(1);
    setaddmodal_submit(true);
    setpilih_warehouse("close");
    setaddmodal(true);
    // if (
    //   "SUPER-ADMIN" === Cookies.get("auth_role") ||
    //   "HEAD-AREA" === Cookies.get("auth_role")
    // ) {
    // } else {
    getStock(get_idware, idproduk);
    // }
    // console.log(idproduk)
  }

  function openaddmodalexternal(
    img: any,
    produk: any,
    idproduk: any,
    source: any,
    sizeexternal: any,
    sizeexternalqty: any
  ) {
    setaddmodal_img(img);
    setaddmodal_produk(produk);
    setaddmodal_idproduk(idproduk);
    setsizeext(sizeexternal);
    setsizeextqty(sizeexternalqty);
    setsizeSelected(null);

    setaddmodal_qty(1);
    setaddmodal_submit(true);

    setaddmodalexternal(true);
  }

  const [TotalPembayaran, setTotalPembayaran] = React.useState(0);
  const [TotalBiayaPerlengkapan, setTotalBiayaPerlengkapan] = React.useState("0");
  // const [supplierorder, setsupplier] = React.useState("");
  const [TombolTambahOrder, setTombolTambahOrder] = React.useState(false);

  const onSavesales = async (data: any) => {
    if (rowsData.length < 1) {
      toast.warning("Produk Belum Ditambahkan", {
        position: toast.POSITION.TOP_RIGHT,
        pauseOnHover: false,
        autoClose: 1000,
      });
    } else if (TotalPembayaran < 1) {
      toast.warning("Mohon isi Nominal Pembayaran", {
        position: toast.POSITION.TOP_RIGHT,
        pauseOnHover: false,
        autoClose: 1000,
      });
    } else if (cod === "") {
      toast.warning("Mohon pilih tipe payment", {
        position: toast.POSITION.TOP_RIGHT,
        pauseOnHover: false,
        autoClose: 1000,
      });
    } else if (jasa_kirim === "") {
      toast.warning("Mohon pilih jasa kirim", {
        position: toast.POSITION.TOP_RIGHT,
        pauseOnHover: false,
        autoClose: 1000,
      });
    }
    else {
      setTombolTambahOrder(true);
      await axios
        .post(`https://api.401snkrs.com/v1/inputsales`, {
          data: rowsData,
          id_pesanan: data.id_pesanan,
          tanggal: date,
          id_store: data.store,
          total_amount: TotalPembayaran,
          users: Users,
          status_display: get_displayed,
          Date_bataskirim: Date_bataskirim,
          cod: cod,
          jasa_kirim: jasa_kirim,
        })
        .then(function (response) {
          console.log(response.data.result)
          if (response.data.result === "undermodal") {
            toast.warning("Harga Jual Terlalu Rendah", {
              position: toast.POSITION.TOP_RIGHT,
              pauseOnHover: false,
              autoClose: 1000,
            });
            setTombolTambahOrder(false);
          } else if (response.data.result === "already_used") {
            toast.error("No Order Already Used", {
              position: toast.POSITION.TOP_RIGHT,
              pauseOnHover: false,
              autoClose: 1000,
            });
            setTombolTambahOrder(false);
          } else {
            toast.success("Order Ditambahkan", {
              position: toast.POSITION.TOP_RIGHT,
              pauseOnHover: false,
              autoClose: 1000,
              onClose: () => router.replace("/report/shipping"),
            });
          }
        });
    }
  };

  return (
    <>
      <ToastContainer className="mt-[50px]" />
      {/* <span className="text-xs">{JSON.stringify(rowsData)}</span> */}
      <div className="grid grid-cols-[1fr_33%] h-full w-full">
        <div className="h-full flex flex-col">

          {addmodal ? (
            <div className="w-full bg-[#7c7c7c46] h-full z-10 fixed grid grid-cols-[1fr_43%]">
              <div className="mt-[10%] mx-auto w-[70%] h-fit bg-white rounded-lg">
                <div className="text-sm border-b p-3 px-4">
                  <div className="font-medium">{addmodal_produk}</div>
                </div>

                <div className="grid grid-cols-[40%_1fr]">
                  <div className="p-5 flex items-center">
                    <div>
                      <Image
                        className="w-[100%] h-auto m-auto rounded-lg"
                        src={`https://api.401snkrs.com/public/images/${addmodal_img}`}
                        alt="Picture of the author"
                        width={300}
                        height={300}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-l p-5 ">
                    <div className="text-sm">
                      <label>Warehouse:</label>

                      <div className="mt-1 flex flex-wrap items-center justify-end">
                        <select
                          className="appearance-none h-auto cursor-pointer rounded-lg w-full bg-white py-2 px-5 focus:outline-none border text-sm"
                          placeholder="Pilih Warehouse"
                          disabled={true}
                        >
                          <option value="">{cariwaress_nama}</option>
                        </select>
                        <i className="fi fi-rr-angle-small-down w-[1.12rem] h-[1.12rem] text-center text-gray-500 text-[1.12rem] leading-4 absolute mr-5"></i>
                      </div>
                    </div>

                    <div className="text-sm mt-2">
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

                    <div className="text-sm mt-2">
                      <div className="mb-2">Qty:</div>
                      <div className="text-sm flex flex-wrap items-center">
                        <button
                          onClick={() => {
                            setQty("min");
                          }}
                          disabled={addmodal_submit}
                          className={`${addmodal_submit === true
                            ? "bg-gray-500"
                            : "bg-blue-500"
                            } text-white w-10 py-2 border rounded font-bold`}
                        >
                          -
                        </button>
                        <div className="font-bold py-2 w-10 text-center border rounded mx-2">
                          {addmodal_qty}
                        </div>
                        <button
                          onClick={() => {
                            setQty("plus");
                          }}
                          disabled={addmodal_submit}
                          className={`${addmodal_submit === true
                            ? "bg-gray-500"
                            : "bg-blue-500"
                            } text-white w-10 py-2 border rounded font-bold`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-sm border-t py-3 mt-5 flex flex-1 gap-3">
                      <button
                        type="button"
                        onClick={() => setaddmodal(false)}
                        className="rounded-lg bg-white hover:bg-gray-300 border-2 h-[45px] w-[100%] text-black "
                      >
                        Close
                      </button>

                      <button
                        onClick={() => {
                          if (addmodal_warehouse === null) {
                            addProduk(
                              addmodal_produk,
                              addmodal_idproduk,
                              sizeSelected,
                              200000,
                              addmodal_img,
                              addmodal_qty,
                              "Gudang : " + addproduk_gudangawal,
                              stokReady,
                              get_idware,
                              addprodukharga_jual
                            );
                          } else {
                            addProduk(
                              addmodal_produk,
                              addmodal_idproduk,
                              sizeSelected,
                              200000,
                              addmodal_img,
                              addmodal_qty,
                              "Gudang : " + addproduk_gudangawal,
                              stokReady,
                              addmodal_warehouse,
                              addprodukharga_jual
                            );
                          }
                        }}
                        type="button"
                        disabled={addmodal_submit}
                        className={`${addmodal_submit === true
                          ? "bg-gray-500"
                          : "bg-blue-600 hover:bg-blue-800"
                          } rounded-lg  h-[45px] w-[100%] text-white`}
                      >
                        Tambah Ke Keranjang
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {addmodalexternal ? (
            <div className="w-full bg-[#7c7c7c46] h-full z-10 fixed grid grid-cols-[1fr_43%]">
              <div className="mt-[10%] mx-auto w-[70%] h-fit bg-white rounded-lg">
                <div className="text-sm border-b p-3 px-4">
                  <div className="font-medium">
                    {addmodal_produk} | Size {sizeext}
                  </div>
                </div>

                <div className="grid grid-cols-[40%_1fr]">
                  <div className="p-5 flex items-center">
                    <div>
                      <Image
                        className="w-[100%] h-auto m-auto rounded-lg"
                        src={`https://api.401snkrs.com/public/images/${addmodal_img}`}
                        alt="Picture of the author"
                        width={300}
                        height={300}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-l p-5 ">
                    <div className="text-sm">
                      <label>Size:</label>
                      <div className="mt-1 grid grid-cols-5 gap-2 text-xs content-start">
                        <div
                          onClick={() => {
                            setsizeSelected(sizeext);
                            setstokReady(parseInt(sizeextqty));
                            setaddmodal_submit(false);
                            setaddmodal_qty(1);
                          }}
                          className={`${sizeSelected === sizeext
                            ? "bg-blue-500 text-white"
                            : "text-blue-500"
                            } font-medium py-2 text-center rounded-lg border border-blue-500 cursor-pointer`}
                        >
                          {sizeext} = {sizeextqty}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm mt-2">
                      <div className="mb-2">Qty:</div>
                      <div className="text-sm flex flex-wrap items-center">
                        <button
                          onClick={() => {
                            setQty("min");
                          }}
                          disabled={addmodal_submit}
                          className={`${addmodal_submit === true
                            ? "bg-gray-500"
                            : "bg-blue-500"
                            } text-white w-10 py-2 border rounded font-bold`}
                        >
                          -
                        </button>
                        <div className="font-bold py-2 w-10 text-center border rounded mx-2">
                          {addmodal_qty}
                        </div>
                        <button
                          onClick={() => {
                            setQty("plus");
                          }}
                          disabled={addmodal_submit}
                          className={`${addmodal_submit === true
                            ? "bg-gray-500"
                            : "bg-blue-500"
                            } text-white w-10 py-2 border rounded font-bold`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-sm border-t py-3 mt-5 flex flex-1 gap-3">
                      <button
                        type="button"
                        onClick={() => setaddmodalexternal(false)}
                        className="rounded-lg bg-white hover:bg-gray-300 border-2 h-[45px] w-[100%] text-black "
                      >
                        Close
                      </button>

                      <button
                        onClick={() => {
                          addProdukEksternal(
                            addmodal_produk,
                            addmodal_idproduk,
                            sizeext,
                            addmodal_qty,
                            "BARANG EXTERNAL",
                            sizeextqty
                          );
                        }}
                        type="button"
                        disabled={addmodal_submit}
                        className={`${addmodal_submit === true
                          ? "bg-gray-500"
                          : "bg-blue-600 hover:bg-blue-800"
                          } rounded-lg  h-[45px] w-[100%] text-white`}
                      >
                        Tambah Ke Keranjang
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {addproduk ? (
            <div className="w-full bg-[#7c7c7c46] h-full z-10 fixed grid grid-cols-[1fr_43%]">
              <div className="mt-[10%] mx-auto w-[70%] h-fit bg-white rounded-lg">
                <div className="flex flex-col gap-2 border-l p-5 mt-2">
                  <div className="text-sm">
                    <label>Nama Produk</label>
                    <input
                      onChange={(e) => {
                        setaddproduk_produk(e.target.value);
                      }}
                      value={addproduk_produk}
                      className="h-auto rounded-lg w-full bg-white py-2 px-5 mt-2 text-gray-700 focus:outline-none border"
                      type="text"
                      placeholder="Masukan Nama Produk"
                    />
                  </div>

                  <div className="flex flex-row gap-4 mt-1 content-start">
                    <div className="basis-1/6">
                      <label>Size</label>
                      <input
                        onChange={(e) => {
                          setaddproduk_size(e.target.value);
                        }}
                        value={addproduk_size}
                        className="h-auto rounded-lg w-full bg-white py-2 px-5 mt-2 text-gray-700 focus:outline-none border"
                        type="text"
                        placeholder="Size"
                      />
                    </div>

                    <div className="text-sm basis-1/4">
                      <div className="mb-2">Qty</div>
                      <div className="text-sm flex flex-wrap items-center">
                        <button
                          onClick={() => {
                            setQtymanual("min");
                          }}
                          className="w-10 py-2 border border-blue-300 rounded font-bold text-blue-500 hover:bg-blue-500 hover:text-white"
                        >
                          -
                        </button>
                        <div className="font-bold py-2 grow text-center border rounded mx-2">
                          {addproduk_qty}
                        </div>
                        <button
                          onClick={() => {
                            setQtymanual("plus");
                          }}
                          className="w-10 py-2 border border-blue-300 rounded font-bold text-blue-500 hover:bg-blue-500 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                    </div>

                    <div className="text-sm grow">
                      <div className="mb-2">Supplier:</div>
                      <select
                        onChange={(e) => {
                          setaddproduk_supplier(e.target.value);
                        }}
                        className="appearance-none h-auto cursor-pointer rounded-lg w-full bg-white py-2 px-5 focus:outline-none border text-sm"
                        placeholder="Pilih Supplier"
                      >
                        <option value="">Pilih Supplier</option>
                        {list_supplier}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-1 content-start">
                    <div className="text-sm">
                      <label>Harga Beli</label>
                      <CurrencyInput
                        onChange={(e) => {
                          var values = e.target.value.replace(/\D/g, "");
                          setaddproduk_hargabeli(values);
                        }}
                        defaultValue={0}
                        decimalsLimit={2}
                        groupSeparator="."
                        decimalSeparator=","
                        prefix="Rp "
                        // value={addproduk_hargabeli}
                        className="h-auto rounded-lg w-full bg-white py-2 px-5 mt-2 text-gray-700 focus:outline-none border"
                        type="text"
                        placeholder="Masukan Harga Beli"
                      />
                    </div>

                    <div className="text-sm">
                      <label>Harga Perlengkapan</label>
                      <select
                        defaultValue={TotalBiayaPerlengkapan}
                        onChange={(e) => {
                          setTotalBiayaPerlengkapan(e.target.value);
                        }}
                        className="auto rounded-lg w-full bg-white py-2 px-5 mt-2 text-gray-700 focus:outline-none border"
                        placeholder="Pilih Supplier"
                      >
                        <option value="0">Rp 0</option>
                        <option value="11000">Rp 11.000</option>
                        <option value="16000">Rp 16.000</option>
                      </select>
                    </div>

                    <div className="text-sm">
                      <label>Status Pembayaran</label>
                      <div className="mt-2 flex flex-wrap items-center justify-end">
                        <select
                          onChange={(e) => {
                            setaddproduk_payment(e.target.value);
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
                  </div>

                  <div className="text-sm border-t pt-5 mt-10 flex flex-1 gap-3">
                    <button
                      type="button"
                      onClick={() => setaddproduk(false)}
                      className="rounded-lg bg-white hover:bg-gray-300 border-2 h-[45px] w-[100%] text-black "
                    >
                      Close
                    </button>

                    <button
                      onClick={() => {
                        addProdukluar(
                          addproduk_payment,
                          addproduk_produk,
                          "NOTA",
                          addproduk_size,
                          addproduk_hargabeli,
                          "default",
                          addproduk_qty,
                          "Barang Luar",
                          "nolimit",
                          addproduk_supplier,
                          TotalBiayaPerlengkapan
                        );
                      }}
                      type="button"
                      className="rounded-lg bg-blue-600 hover:bg-blue-800 h-[45px] w-[100%] text-white "
                    >
                      Tambah Ke Keranjang
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="h-[5%] p-5 mb-2  border-b">
            <span className="text-xl font-bold">
              Add Sales Online Shop
            </span>
          </div>

          <div className="px-4 grid grid-cols-3 gap-3 mb-3 pt-0">
            <div>
              <h1 className="pl-2">Tanggal Pesanan</h1>
              <div className="rounded-lg ml-auto w-full mt-2 flex flex-row items-center justify-end h-[42px]">
                <Flatpickr
                  className="text-start h-full rounded-lg w-full bg-white py-2.5 px-5 text-gray-700 focus:outline-none border"
                  value={date}
                  disabled={false}
                  placeholder="Pilih Tanggal Order"
                  options={{
                    mode: "single",
                    dateFormat: "Y-m-d",
                    enableTime: false,
                    onClose: function (selectedDates, dateStr, instance) {
                      setDate(dateStr);
                    },
                  }}
                />
                <i className="fi fi-rr-calendar w-[1.12rem] h-[1.12rem] text-center text-gray-500 text-[1.12rem] leading-4 absolute mr-5"></i>
              </div>
            </div>
            <div>
              <h1 className="pl-2 text-center">Toko Online</h1>
              <div className="flex flex-wrap items-center mt-2 justify-end">

                <div hidden>{watch("store")}</div>
                <select
                  {...register("store", {
                    required: true,
                    onChange(e) {
                      if (e.target.value === "") {
                        setdataproductsales([]);
                      } else {
                        loaddataproductsales("all");
                      }
                      setbarcode("");
                      getwaress(e.target.value);
                      setValue("id_pesanan", "");
                    },
                  })}
                  className={`${errors.store ? "border-red-400" : ""
                    } appearance-none h-auto cursor-pointer text-center rounded-lg w-full bg-white py-2 px-5 focus:outline-none border text-base`}
                  placeholder="Pilih Store"
                >
                  <option value="">Pilih Toko</option>
                  {list_store}
                </select>

                <i className="fi fi-rr-angle-small-down w-[1.12rem] h-[1.12rem] text-center text-gray-500 text-[1.12rem] leading-4 absolute mr-5"></i>
              </div>
              {errors.store && (
                <div className="text-sm italic">This field is required</div>
              )}
            </div>
            <div>
              <h1 className="pr-2 text-right">No Pesanan</h1>
              <input
                className={`${errors.id_pesanan ? "border-red-400" : ""
                  } h-auto rounded-lg w-full bg-white py-2 px-5 text-right mt-2 text-gray-700 focus:outline-none border text-base`}
                type="text"
                placeholder="Masukan No Pesanan"
                autoComplete="off"
                {...register("id_pesanan", { required: true })}
              />
              {errors.id_pesanan && (
                <div className="text-sm italic">This field is required</div>
              )}
            </div>


          </div>

          <div className="px-4 grid grid-cols-3 gap-3 pt-0 mb-4">
            <div>
              <h1 className="pl-2 -mb-1">Batas Kirim</h1>
              <div className="rounded-lg ml-auto w-full mt-2 flex flex-row items-center justify-end h-[42px]">
                <Flatpickr
                  className="text-start h-full rounded-lg w-full bg-white py-2.5 px-5 text-gray-700 focus:outline-none border"
                  value={Date_bataskirim}
                  disabled={false}
                  placeholder="Pilih Tanggal & Jam"
                  options={{
                    enableTime: false,            // Aktifkan jam & menit
                    time_24hr: true,             // Format 24 jam (optional)
                    dateFormat: "Y-m-d",     // Format Tanggal + Jam:Menit
                    // noCalendar: false,        // Default, biarkan tampil kalender
                    onClose: function (selectedDates, dateStr, instance) {
                      setDate_bataskirim(dateStr);
                    },
                  }}
                />

                <i className="fi fi-rr-calendar w-[1.12rem] h-[1.12rem] text-center text-gray-500 text-[1.12rem] leading-4 absolute mr-5"></i>
              </div>
            </div>
            <div className="">
              <h1 className="pl-2 mb-1 text-center">Pembayaran</h1>
              <select
                defaultValue={cod}
                onChange={(e) => {
                  setcod(e.target.value);
                }}
                className={`${errors.cod ? "border-red-400" : ""
                  } appearance-none h-auto cursor-pointer mt-0 text-center rounded-lg w-full bg-white py-2 px-5 focus:outline-none border text-base`}
                placeholder="Pilih Type Payment"
              >
                <option value="">Pilih Tipe Pembayaran</option>
                <option value="NON_COD">NON COD</option>
                <option value="COD">COD</option>
              </select>
            </div>

            <div >
              <h1 className="pr-2 mb-1 text-right">Jasa Kirim</h1>
              <select
                onChange={(e) => {
                  setjasa_kirim(e.target.value);
                }}
                className={`${errors.jasa_kirim ? "border-red-400" : ""
                  } appearance-none h-auto cursor-pointer text-right rounded-lg w-full bg-white py-2 px-5 focus:outline-none border text-base`}
                placeholder="Pilih Jasa Kirim"
              >
                <option value="">Pilih Jasa Kirim</option>
                <option value="SPX">SPX</option>
                <option value="JNE YES">JNE YES</option>
                <option value="JNE REG">JNE REG</option>
                <option value="SICEPAT REG">SICEPAT REG</option>
                <option value="SICEPAT BEST">SICEPAT BEST</option>
                <option value="ANTERAJA">ANTERAJA</option>
                <option value="INSTANT">INSTANT</option>
              </select>
            </div>
          </div>

          <div className="px-4 flex flex-row gap-3 mb-5 items-center">
            <div className="shadow grow rounded-lg  flex flex-row text-center content-center">
              <input
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value === "") {
                    setQuery("all");
                    loaddataproductsales("all");
                  }
                }}
                onKeyDown={keyDown}
                disabled={isLoading}
                className="h-[45px] border-0 grow py-2 pl-5 pr-3 text-gray-700 focus:outline-none rounded-l-lg"
                type="text"
                placeholder="Search..."
              />

              <button
                type="button"
                disabled={isLoading}
                className={`rounded-r-lg bg-white basis-1/8 hover:bg-gray-200 h-[45px] text-gray-700 font-medium px-5`}
                onClick={() => {
                  if (Query != "all") {
                    loaddataproductsales(Query);
                  }
                }}
              >
                <div className="my-auto">
                  {isLoading === true ? (
                    <>
                      <fa.FaArrowsAlt size={17} className={`${isLoading ? "animate-spin" : ""}  text-gray-700`} />
                    </>
                  ) : (
                    <>
                      <fa.FaSearch size={17} className={`${isLoading ? "animate-spin" : ""}  text-gray-700`} />
                    </>
                  )}
                </div>
              </button>
            </div>



            <button
              onClick={() => setaddproduk(true)}
              type="button" className="shadow rounded-lg bg-blue-600 hover:bg-blue-800 h-[40px] text-white px-4 flex flex-wrap gap-2 content-center justify-center">
              Tambah Produk
              <div className="my-auto">
                <fa.FaPlus size={13} className="text-white" />
              </div>
            </button>
          </div>

          {(function () {
            if (list_product.length > 0) {
              return (
                <div className="px-4 h-[500px] grow grid grid-cols-6 content-start gap-3 overscroll-y-auto overflow-x-hidden scrollbar-none pb-20">
                  {list_product}
                </div>
              );
            } else {
              return (
                <div className="mx-4 h-[500px] grow pb-20 flex items-center justify-center">
                  <div className="grid grid-flow-row auto-rows-max items-center justify-center text-center gap-1 m-auto">
                    <Image
                      className="w-[70px] h-auto m-auto"
                      src="/open-box.png"
                      alt="Picture of the author"
                      width={100}
                      height={100}
                      placeholder="blur"
                      blurDataURL={"/open-box.png"}
                    />
                    <span className="text-gray-400">Silahkan Pilih Toko Online</span>
                  </div>
                </div>
              );
            }
          })()}
          {/* {JSON.stringify(rowsData)} */}
        </div>

        <div className="bg-white h-full py-3 px-2 flex flex-col gap-2 z-5">
          <div className="h-[5vh] pb-10 border-b flex flex-wrap items-center gap-3">
            <div className="font-medium text-base">Detail Items</div>
            <div className="grow">
              <div className="col-span-4 flex flex-wrap items-center justify-end">
                <input
                  value={barcode}
                  disabled={getValues("store") === "" ? true : false}
                  onChange={(e) => {
                    scanBarcode(e);
                    setbarcode(e.target.value);
                  }}
                  className="h-auto bg-white rounded-lg w-full py-2 px-5 pr-12 text-gray-700 focus:outline-none border text-base"
                  type="text"
                  placeholder="Scan Barcode"
                />
                <i className="fi fi-rr-barcode-read w-[1.12rem] h-[1.12rem] text-center text-gray-500 text-[1.12rem] leading-4 absolute mr-5"></i>
              </div>
            </div>
          </div>

          <div className="h-[100px] grow overscroll-y-auto overflow-x-hidden scrollbar-none border-b">
            {(function () {
              if (rowsData.length > 0) {
                return <>{table_product}</>;
              } else {
                return (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="grid grid-flow-row auto-rows-max items-center justify-center text-center gap-1">
                      <Image
                        className="w-[70px] h-auto m-auto"
                        src="/open-box.png"
                        alt="Picture of the author"
                        width={100}
                        height={100}
                        placeholder="blur"
                        blurDataURL={"/open-box.png"}
                      />
                      <span className="text-gray-400">
                        No products added yet
                      </span>
                    </div>
                  </div>
                );
              }
            })()}
          </div>

          <div className="h-[auto] flex flex-col gap-3 justify-end">
            <div className="grid grid-cols-2 border-b pb-1">
              <div className="my-auto">
                <span className="text-xs font-medium text-gray-500">Items</span>
              </div>

              <div className="text-end">
                <span className="text-xs font-bold">
                  {rowsData.length} (Items)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b pb-1">
              <div className="my-auto">
                <span className="text-xs font-medium text-gray-500">
                  Quantity
                </span>
              </div>

              <div className="text-end">
                <span className="text-xs font-bold">{totalQty} (Pcs)</span>
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="my-auto">
                <span className="text-xs font-medium text-red-600">
                  Estimated Payment
                </span>
              </div>

              <div className="text-end">
                <label className="text-xs font-bold text-red-600">Rp</label>
                <CurrencyInput
                  onChange={(e) => {
                    var values = e.target.value.replace(/\D/g, "");
                    if (values === "") {
                      setTotalPembayaran(0);
                    } else {
                      setTotalPembayaran(parseInt(values));
                    }
                  }}
                  value={EstimasiPembayaran}
                  defaultValue={0}
                  decimalsLimit={2}
                  groupSeparator="."
                  decimalSeparator=","
                  // value={TotalPembayaran}
                  className="text-xs font-bold h-auto bg-white text-red-600 w-[65%] py-2 px-5 focus:outline-none border-b border-gray-300"
                  type="text"
                />
              </div>
            </div>


            <div className="grid grid-cols-2">
              <div className="my-auto">
                <span className="text-xs font-medium text-gray-500">
                  Total Payment
                </span>
              </div>

              <div className="text-end">
                <label className="text-xs font-bold">Rp</label>
                <CurrencyInput
                  onChange={(e) => {
                    var values = e.target.value.replace(/\D/g, "");
                    if (values === "") {
                      setTotalPembayaran(0);
                    } else {
                      setTotalPembayaran(parseInt(values));
                    }
                  }}
                  value={TotalPembayaran}
                  defaultValue={0}
                  decimalsLimit={2}
                  groupSeparator="."
                  decimalSeparator=","
                  // value={TotalPembayaran}
                  className="text-xs font-bold h-auto bg-white w-[65%] py-2 px-5 text-black focus:outline-none border-b border-gray-300"
                  type="text"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit(onSavesales)}
              disabled={TombolTambahOrder}
              type="button"
              className={`${TombolTambahOrder
                ? "bg-gray-600"
                : "bg-lime-600 hover:bg-lime-800"
                } rounded-lg  h-[50px] w-[100%] text-white gap-2 content-center`}
            >
              Checkout
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              disabled={TombolTambahOrder}
              className={`${TombolTambahOrder ? "bg-gray-200" : "bg-white hover:bg-gray-300"
                } rounded-lg  border-2 h-[50px] w-[100%] text-black gap-2 content-center`}
            >
              Cancel
            </button>
          </div>
        </div>

      </div >
    </>
  );
}
