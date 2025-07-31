import * as fa from "react-icons/fa";
import "flatpickr/dist/themes/dark.css";
import React, { Component, useRef, useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import {
    format,
} from "date-fns";
import axios from "axios";
import Cookies from "js-cookie";
import {
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    AreaChart,
    Area,
} from 'recharts';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

let Rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

export default function Home() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [scanValue, setScanValue] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [Role, setRole] = useState(Cookies.get("auth_role"));
    const [Channel, setchannel] = useState(Cookies.get("auth_channel"));
    const [isLoading, setisLoading]: any = useState(true);
    const [data_store, setdatastore] = useState([]);
    const [data_listbelanja, setdatalistbelanja]: any = useState([]);
    const [totalqty, settotalqty]: any = useState([]);
    const [totaltoday, settotaltoday]: any = useState([]);
    const [totalyesterday, settotalyesterday]: any = useState([]);
    const [totalready, settotalready]: any = useState([]);
    const [Users, setUsers] = useState(Cookies.get("auth_name"));
    const [data_supplier, setdatasupplier] = useState([]);
    const [data_parameter, setdataparameter] = useState([]);
    const [addsupplier, setaddsupplier] = React.useState("");
    const [isAnyChecked, setIsAnyChecked] = useState(false);
    const [showEditPriceModal, setShowEditPriceModal] = useState(false);
    const [selectedPriceItem, setSelectedPriceItem] = useState<any>(null);
    const [editPrice, setEditPrice] = useState<number>(0);
    const [showEditAccModal, setShowEditAccModal] = useState(false);
    const [selectedAccItem, setSelectedAccItem] = useState<any>(null);
    const [editAcc, setEditAcc] = useState<number>(0);
    const [showParameterModal, setShowParameterModal] = useState(false);
    const [parameterList, setParameterList] = useState<string[]>([""]);
    const [addparameter, setaddparameter] = useState("");

    useEffect(() => {
        const handleChange = () => {
            const checkedBoxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"].checkbox-pesanan:checked');
            setIsAnyChecked(checkedBoxes.length > 0);
        };
        document.addEventListener("change", handleChange);
        return () => document.removeEventListener("change", handleChange);
    }, []);

    useEffect(() => {
        loadlistbelanja(Role);
        getsupplier();
        getparameter()
        return () => { };
    }, []);

    async function loadlistbelanja(role: any) {
        setisLoading(true);
        await axios.post(`https://api.401snkrs.com/v1/getlistbelanja`, { role })
            .then(function (response) {
                setdatalistbelanja(response.data.result.hasil);
                settotalqty(response.data.result.totalqty);
                settotaltoday(response.data.result.today);
                settotalyesterday(response.data.result.yesterday);
                settotalready(response.data.result.ready);
            })
            .catch(function (error) {
                console.log(error);
            })
            .finally(() => {
                setisLoading(false);
            });
    }

    async function getparameter() {
        try {
            const response = await axios.get(`https://api.401snkrs.com/v1/getparameter`);
            setdataparameter(response.data.result);
        } catch (error) {
            console.log(error);
        }
    }

    async function getsupplier() {
        try {
            const response = await axios.get(`https://api.401snkrs.com/v1/getsupplier`);
            setdatasupplier(response.data.data_supplier);
        } catch (error) {
            console.log(error);
        }
    }
    const list_supplier: any = [];
    if (!isLoading) {
        data_supplier.map((area: any, index: number) => {
            list_supplier.push(
                <option key={index} value={area.supplier}>
                    {area.supplier}
                </option>
            );
        });
    }

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const workbook = XLSX.read(bstr, { type: "binary" });
            const sheet = workbook.Sheets["Daftar Pesanan"];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            const cleanedData = jsonData.map((row: any) => {
                const rawDate = new Date(row["Tanggal Pesanan Dibuat"]);
                const formattedDate = rawDate.toISOString().split("T")[0];

                const sizeText = row["Varian Produk"]?.toString() || "";
                const sizeMatch = sizeText.match(/\b(3[5-9]|4[0-5])\b/);
                const keywordSizeMatch = sizeText.match(/\b(XS|S|M|L|XL|XXL|XXXL|xs|s|m|l|xl|xxl|xxxl)\b/);
                const parsedSize = sizeMatch?.[0] || keywordSizeMatch?.[0] || "DOUBLE BOX";

                return {
                    tanggal_pesanan: formattedDate,
                    nomor_paket: row["Nomor Paket"],
                    toko: row["URL Toko"],
                    produk: row["Nama Produk"],
                    varian: row["Varian Produk"],
                    kurir: row["Kurir"],
                    dikirim_sebelum: row["Dikirim Sebelum"],
                    laba_kotor: row["Laba Kotor"],
                    qty: row["Jumlah"],
                    cod: row["Metode Pembayaran"] === "Cash on Delivery" ? "COD" : "NON_COD",
                    size: parsedSize
                };
            });

            const groupedData = cleanedData.reduce((acc: any, item: any) => {
                const existing = acc.find((entry: any) => entry.id_pesanan === item.nomor_paket);
                const productData = {
                    produk: item.produk,
                    id_produk: "NOTA",
                    size: item.size,
                    m_price: 0,
                    selling_price: item.laba_kotor,
                    qty: item.qty,
                    img: "box.png",
                    source: "Barang Luar",
                    id_ware: "null",
                    acc: 0,
                };

                if (existing) {
                    existing.data.push(productData);
                } else {
                    acc.push({
                        data: [productData],
                        id_pesanan: item.nomor_paket,
                        tanggal_order: item.tanggal_pesanan,
                        id_store: item.toko,
                        amount: item.laba_kotor,
                        users: Users,
                        batas_kirim: item.dikirim_sebelum,
                        cod: item.cod,
                        jasa_kirim: item.kurir,
                    });
                }

                return acc;
            }, []);

            const transformedData = groupedData;

            console.log("transformedData", transformedData);


            axios
                .post(`https://api.401snkrs.com/v1/inputlistbelanja`, transformedData)
                .then(async function (response) {
                    const { success, message } = response.data.result;
                    if (success === true) {
                        toast.success("List Belanja Ditambahkan", {
                            position: toast.POSITION.TOP_RIGHT,
                            pauseOnHover: false,
                            autoClose: 1000,
                        });
                        await loadlistbelanja(Role);
                    } else {
                        toast.error(`Gagal Di Import: ${message}`, {
                            position: toast.POSITION.TOP_RIGHT,
                            pauseOnHover: false,
                            autoClose: 1000,
                        });
                    }
                });

        };
        reader.readAsBinaryString(file);
    };


    // Effect: Deteksi scanner input otomatis
    useEffect(() => {
        if (scanValue === "") return;
        setIsScanning(true);
        const timeout = setTimeout(() => {
            const matched = data_listbelanja.find((item: any) => item.id_pesanan === scanValue);

            if (matched) {
                axios.post("https://api.401snkrs.com/v1/updateresi", {
                    id_pesanan: matched.id_pesanan,
                    produk: matched.produk,
                    resi: "VALID"
                }).then(() => {
                    toast.success("Resi berhasil divalidasi", {
                        position: toast.POSITION.TOP_RIGHT,
                        pauseOnHover: false,
                        autoClose: 1000,
                    });
                    setdatalistbelanja((prev: any) =>
                        prev.map((item: any) =>
                            item.id_pesanan === matched.id_pesanan && item.produk === matched.produk
                                ? { ...item, resi: "VALID" }
                                : item
                        )
                    );
                }).catch(() => {
                    toast.error("Gagal update resi", {
                        position: toast.POSITION.TOP_RIGHT,
                        pauseOnHover: false,
                        autoClose: 1000,
                    });
                });
            } else {
                toast.warning("No Pesanan Tidak Valid", {
                    position: toast.POSITION.TOP_RIGHT,
                    pauseOnHover: false,
                    autoClose: 1000,
                });
            }

            setScanValue("");
            setIsScanning(false);
        }, 300);
        return () => clearTimeout(timeout);
    }, [scanValue, data_listbelanja]);

    return (
        <div className="p-5">
            <div className="flex flex-wrap gap-3 pb-4 items-center border-b border-[#2125291A] content-center mb-7">
                <div className="font-bold text-xl">List Belanja Harian</div>
                <>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                        className="shadow rounded-lg bg-lime-600 hover:bg-lime-800 h-[40px] font-semibold text-xs text-white px-4 flex flex-wrap gap-2 content-center justify-center">
                        Import Excel
                        <div className="my-auto">
                            <fa.FaBox size={13} className="text-white" />
                        </div>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx, .xls"
                        className="hidden"
                        onChange={handleExcelUpload}
                    />
                </>
            </div>

            <div className="-mt-2">
                <div className="flex flex-row gap-4">
                    <div className=" basis-1/6 mt-0 gap-3 text-black">
                        <div className="bg-white mb-4 border border-gray-300 h-[63px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                            <div className="flex flex-row text-left  mt-2">
                                <div className="basis-full text-sm font-semibold p-3 text-center">
                                    Total Qty : {totalqty}
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-200 mb-4 border border-gray-300 h-[63px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                            <div className="flex flex-row text-left  mt-2">
                                <div className="basis-full text-sm font-semibold p-3 text-center">
                                    Yesterday : {totalyesterday}

                                </div>
                            </div>
                        </div>
                        <div className="bg-white border mb-4 border-gray-300 h-[63px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                            <div className="flex flex-row text-left  mt-2">
                                <div className="basis-full text-sm font-semibold p-3 text-center">
                                    Today : {totaltoday}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-300 h-[63px] rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A]">
                            <div className="flex flex-row text-left  mt-2">
                                <div className="basis-full text-sm font-semibold p-3 text-center">
                                    Status Ready : {totalready}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grow flex flex-col mt-0 gap-3 text-black">
                        <div className="bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-[0px_10px_11px_1px_#2125291A] p-5 h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={Object.values(
                                        data_listbelanja.reduce((acc: any, item: any) => {
                                            const store = item.store || "Unknown Store";
                                            const qty = Number(item.qty) || 0;

                                            if ((item.size || "").toUpperCase().includes("DOUBLE BOX")) {
                                                return acc;
                                            }

                                            if (!acc[store]) {
                                                acc[store] = { name: store, qty: 0 };
                                            }

                                            acc[store].qty += qty;
                                            return acc;
                                        }, {})
                                    )}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" interval={0} angle={0} height={80} />
                                    <YAxis />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="qty"
                                        stroke="#22c55e"
                                        fillOpacity={1}
                                        fill="url(#colorQty)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="sticky top-0 z-40 bg-white border-b border-gray-300 rounded-b-lg">
                    <div className="flex flex-row mt-5 gap-2 p-5 rounded-lg text-black bg-white">
                        <div className="flex items-center grow w-full">
                            <input
                                type="text"
                                placeholder="Cari produk / store / no pesanan..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => {
                                    setSearchTerm(e.target.value.toLowerCase());
                                }}
                            />
                        </div>
                        <div className="flex items-center basis-1/6 w-full">
                            <input
                                type="text"
                                placeholder="Scan Resi..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={scanValue}
                                onChange={(e) => {
                                    const value = e.target.value.trim();
                                    setScanValue(value);
                                }}
                            />
                        </div>
                        <div className="basis-1/6">
                            <button
                                disabled={!isAnyChecked}
                                onClick={() => {
                                    const checkedBoxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"].checkbox-pesanan:checked');
                                    const itemList = Array.from(checkedBoxes).map(cb => {
                                        try {
                                            const parsed = JSON.parse(cb.getAttribute("data-item") || "[]");
                                            return parsed[0]; // Ambil objek pertama dari array
                                        } catch {
                                            return null;
                                        }
                                    }).filter((item: any) => item !== null);

                                    const mergedList: any = [];
                                    itemList.forEach((item: any) => {
                                        const existing = mergedList.find((entry: any) => entry.id_pesanan === item.id_pesanan);
                                        if (existing) {
                                            existing.produk.push(item.produk);
                                        } else {
                                            mergedList.push({
                                                id_pesanan: item.id_pesanan,
                                                produk: [item.produk],
                                            });
                                        }
                                    });

                                    axios.post("https://api.401snkrs.com/v1/insertmassal", mergedList)
                                        .then((res) => {
                                            console.log("Full response data:", res.data); // Debugging ✅
                                            if (res.data.result.result === "success") {
                                                toast.success(res.data.message || "Insert massal berhasil", {
                                                    position: toast.POSITION.TOP_RIGHT,
                                                    autoClose: 1000,
                                                });
                                                window.location.reload();
                                            } else {
                                                toast.error("Insert massal gagal: " + (res.data.message || "Unknown error"), {
                                                    position: toast.POSITION.TOP_RIGHT,
                                                    autoClose: 1000,
                                                });
                                                window.location.reload();
                                            }
                                        })
                                        .catch((err) => {
                                            toast.error("Insert massal gagal (server error)", {
                                                position: toast.POSITION.TOP_RIGHT,
                                                autoClose: 1000,
                                            });
                                            console.error("Insert error:", err); // Debugging ✅
                                        });
                                }}
                                type="button"
                                className={`shadow rounded-lg ${isAnyChecked ? 'bg-blue-600 hover:bg-blue-800' : 'bg-gray-400 cursor-not-allowed'} w-full h-[40px] text-white px-4 flex flex-wrap gap-2 content-center justify-center font-bold`}
                            >
                                <span className="text-xs">Insert Massal</span>
                                <div className="my-auto">
                                    <fa.FaCartPlus size={13} className="text-white" />
                                </div>
                            </button>
                        </div>
                        <div className="basis-1/6 ">
                            <button
                                disabled={!isAnyChecked}
                                onClick={() => {
                                    const checkedBoxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"].checkbox-pesanan:checked');
                                    const itemList = Array.from(checkedBoxes).map(cb => {
                                        try {
                                            const parsed = JSON.parse(cb.getAttribute("data-item") || "[]");
                                            return parsed[0]; // Ambil objek pertama dari array
                                        } catch {
                                            return null;
                                        }
                                    }).filter(item => item !== null);
                                    axios.post("https://api.401snkrs.com/v1/deletemassal_listbelanja", itemList)
                                        .then((res) => {
                                            toast.success("Delete massal berhasil", {
                                                position: toast.POSITION.TOP_RIGHT,
                                                autoClose: 1000,
                                            });
                                            window.location.reload();
                                        })
                                        .catch((err) => {
                                            toast.error("Delete massal gagal", {
                                                position: toast.POSITION.TOP_RIGHT,
                                                autoClose: 1000,
                                            });
                                            console.error("Delete error:", err);
                                            window.location.reload();
                                        });
                                }}
                                type="button"
                                className={`shadow rounded-lg ${isAnyChecked ? 'bg-red-500 hover:bg-red-800' : 'bg-gray-400 cursor-not-allowed'} w-full h-[40px] text-white px-4 flex flex-wrap gap-2 content-center justify-center font-bold`}
                            >
                                <span className="text-xs">Delete massal</span>
                                <div className="my-auto">
                                    <fa.FaCartPlus size={13} className="text-white" />
                                </div>
                            </button>
                        </div>
                        <div className="grow">
                            <button
                                type="button"
                                className="w-full h-[40px] text-white px-2 bg-black rounded-lg flex flex-wrap gap-2 content-center justify-center font-bold"
                                onClick={() => setShowParameterModal(true)}
                            >
                                <div className="my-auto">
                                    <fa.FaListAlt size={25} className="text-white" />
                                </div>
                            </button>
                        </div>
                        <div className="grow">
                            <button
                                className="w-full h-[40px] text-white px-2 bg-purple-600 rounded-lg flex flex-wrap gap-2 content-center justify-center font-bold"
                                onClick={() => {
                                    const checkedBoxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"].checkbox-pesanan:checked');
                                    const textsToCopy = Array.from(checkedBoxes).map(cb => {
                                        try {
                                            const parsed = JSON.parse(cb.getAttribute("data-copas") || "[]");
                                            const { produk, size } = parsed[0];
                                            return `${produk} ${size}`;
                                        } catch {
                                            return "";
                                        }
                                    }).filter(Boolean).join("\n");

                                    if (textsToCopy) {
                                        navigator.clipboard.writeText(textsToCopy);
                                        toast.success("Berhasil menyalin semua produk dan size yang dichecklist", {
                                            position: toast.POSITION.BOTTOM_CENTER,
                                            autoClose: 1000,
                                        });
                                    } else {
                                        toast.warning("Tidak ada item yang dichecklist untuk disalin", {
                                            position: toast.POSITION.BOTTOM_CENTER,
                                            autoClose: 1000,
                                        });
                                    }
                                }}
                            >
                                <fa.FaCopy size={25} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row mt-5 gap-3 p-5 rounded-lg text-black bg-white">
                    <div className="w-full overflow-x-auto">
                        <table className="min-w-full text-sm border border-gray-300 text-left">
                            <thead className="bg-gray-100 text-xs font-semibold text-[10px]">
                                <tr className="text-center">
                                    <th className="border px-3 py-2 w-[2%]">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                const checkboxes = document.querySelectorAll<HTMLInputElement>(
                                                    'input[type="checkbox"].checkbox-pesanan'
                                                );
                                                checkboxes.forEach((cb) => {
                                                    cb.checked = e.target.checked;
                                                    cb.dispatchEvent(new Event("change", { bubbles: true }));
                                                });
                                            }}
                                        />
                                    </th>
                                    <th className="border px-3 py-2 w-[1%]">No.</th>
                                    <th className="border px-3 py-2 w-[6%]">Tanggal</th>
                                    <th className="border px-3 py-2 w-[8%]">Batas Kirim</th>
                                    <th className="border px-3 py-2 w-[8%]">Store</th>
                                    <th className="border px-3 py-2 w-[5%]">No Pesanan</th>
                                    <th className="border px-3 py-2 w-[30%]">Produk
                                    </th>
                                    <th className="border px-3 py-2 w-[4%]">Size</th>
                                    <th className="border px-3 py-2 w-[7%]">Harga</th>
                                    <th className="border px-3 py-2 w-[7%]">Acc</th>
                                    <th className="border px-3 py-2 w-[8%]">Supplier</th>
                                    <th className="border px-3 py-2 w-[7%]">Expedisi</th>
                                    <th className="border px-3 py-2 w-[5%]">Status</th>
                                    <th className="border px-3 py-2 w-[10%]">Resi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    // Hitung duplikat id_pesanan sebelum map
                                    const duplicateIds = data_listbelanja.reduce((acc: any, curr: any) => {
                                        acc[curr.id_pesanan] = (acc[curr.id_pesanan] || 0) + 1;
                                        return acc;
                                    }, {});
                                    return data_listbelanja
                                        .filter((item: any) =>
                                            [item.store, item.id_pesanan, item.produk, item.supplier, item.id_ware, item.size]
                                                .some(field => field?.toLowerCase().includes(searchTerm))
                                        )
                                        .map((item: any, index: number) => {
                                            const isDuplicate = duplicateIds[item.id_pesanan] > 1;
                                            return (
                                                <tr key={index} className={`text-xs text-center ${isDuplicate ? 'bg-lime-50' : ''}`}>
                                                    <td className="border px-3 py-2 text-[8px]">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox-pesanan"
                                                            data-item={JSON.stringify([{ id_pesanan: item.id_pesanan, produk: item.produk }])}
                                                            data-copas={JSON.stringify([{ produk: item.produk, size: item.size }])}
                                                        />
                                                    </td>
                                                    <td className="border px-3 py-2 text-[8px] font-bold">{index + 1}</td>
                                                    <td className="border px-3 py-2 text-[8px]">
                                                        {format(new Date(item.tanggal_order), "dd-MM-yyyy")}
                                                    </td>
                                                    <td className="border px-3 py-2 text-[8px]">
                                                        {format(new Date(item.batas_kirim), "dd-MM-yyyy HH:mm:ss")}
                                                    </td>
                                                    <td className="border px-3 py-2 text-[8px] font-bold">{item.store}</td>
                                                    <td className="border px-3 py-2 text-[8px]">{item.id_pesanan} <br />
                                                        <span className={`${item.cod?.toLowerCase() === "cod" ? "text-red-500" : "text-lime-500"} italic`}>
                                                            {item.cod}
                                                        </span>
                                                    </td>
                                                    <td className="border px-3 py-2 text-[8px]">
                                                        {item.produk}
                                                        <button
                                                            className="pl-1 -pb-3"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(item.produk + " " + item.size);
                                                                toast.success("Berhasil disalin ke clipboard", {
                                                                    position: toast.POSITION.BOTTOM_CENTER,
                                                                    autoClose: 1000,
                                                                });
                                                            }}
                                                        >
                                                            <fa.FaRegCopy size={13} className="text-black" />
                                                        </button>
                                                    </td>
                                                    <td className="border px-3 py-2 text-[12px] font-bold">{item.size}</td>
                                                    <td
                                                        className="border px-3 py-2 text-[8px] cursor-pointer font-semibold"
                                                        onClick={() => {
                                                            setSelectedPriceItem(item);
                                                            setEditPrice(item.m_price);
                                                            setShowEditPriceModal(true);
                                                        }}
                                                    >
                                                        {Rupiah.format(item.m_price)}
                                                    </td>
                                                    <td className="border px-3 py-2 text-[8px]">
                                                        <span
                                                            className="cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedAccItem(item);
                                                                setEditAcc(item.acc || 0);
                                                                setShowEditAccModal(true);
                                                            }}
                                                        >
                                                            {item.acc ? "Rp " + parseInt(item.acc).toLocaleString("id-ID") : "-"}
                                                        </span>
                                                    </td>
                                                    <td className="border px-3 py-2 text-[8px]">
                                                        {item.id_ware !== null ? (
                                                            <select
                                                                defaultValue={item.id_ware}
                                                                onChange={(e) => {
                                                                    const selectedSupplier = e.target.value;
                                                                    if (selectedSupplier && selectedSupplier !== item.id_ware) {
                                                                        axios.post("https://api.401snkrs.com/v1/updatesupplier", {
                                                                            produk: item.produk,
                                                                            id_ware: selectedSupplier,
                                                                        })
                                                                            .then(() => {
                                                                                toast.success("Supplier berhasil diperbarui", {
                                                                                    position: toast.POSITION.TOP_RIGHT,
                                                                                    autoClose: 1000,
                                                                                });
                                                                                getsupplier()
                                                                            })
                                                                            .catch(() => {
                                                                                toast.error("Gagal update supplier", {
                                                                                    position: toast.POSITION.TOP_RIGHT,
                                                                                    autoClose: 1000,
                                                                                });
                                                                            });
                                                                    }
                                                                }}
                                                                className="appearance-none h-auto cursor-pointer font-semibold  w-full text-blue-600 py-1 px-0 focus:outline-none text-center text-[8px]"
                                                            >
                                                                <option value="" className="italic font-semibold">No Supplier</option>
                                                                {list_supplier}
                                                            </select>
                                                        ) : (
                                                            <select
                                                                onChange={(e) => {
                                                                    const selectedSupplier = e.target.value;
                                                                    // setaddsupplier(selectedSupplier);
                                                                    if (selectedSupplier && selectedSupplier !== "") {
                                                                        axios.post("https://api.401snkrs.com/v1/updatesupplier", {
                                                                            produk: item.produk,
                                                                            id_ware: selectedSupplier,
                                                                        })
                                                                            .then((res) => {
                                                                                toast.success("Supplier berhasil diperbarui", {
                                                                                    position: toast.POSITION.TOP_RIGHT,
                                                                                    autoClose: 1000,
                                                                                });
                                                                                getsupplier();
                                                                            })
                                                                            .catch((err) => {
                                                                                console.error(err);
                                                                                toast.error("Gagal update supplier", {
                                                                                    position: toast.POSITION.TOP_RIGHT,
                                                                                    autoClose: 1000,
                                                                                });
                                                                            });
                                                                    }
                                                                }}
                                                                className="appearance-none h-auto cursor-pointer font-semibold w-full text-red-500 py-1 px-0 focus:outline-none text-center text-[8px]"
                                                                placeholder="Pilih Supplier"
                                                            >
                                                                <option value="" className="italic font-semibold">No Supplier</option>
                                                                {list_supplier}
                                                            </select>
                                                        )}
                                                    </td>
                                                    <td className="border px-3 py-2 text-[8px]">{item.jasa_kirim}</td>
                                                    <td className="border text-[8px] font-bold">
                                                        {item.status !== null ? (
                                                            <select
                                                                defaultValue={item.status}
                                                                onChange={(e) => {
                                                                    const selectedStatus = e.target.value;
                                                                    if (selectedStatus && selectedStatus !== item.status) {
                                                                        axios.post("https://api.401snkrs.com/v1/updatestatus", {
                                                                            id_pesanan: item.id_pesanan,
                                                                            produk: item.produk,
                                                                            status: selectedStatus,
                                                                        })
                                                                            .then(() => {
                                                                                toast.success("Status berhasil diperbarui", {
                                                                                    position: toast.POSITION.TOP_RIGHT,
                                                                                    autoClose: 1000,
                                                                                });
                                                                                getsupplier();
                                                                            })
                                                                            .catch(() => {
                                                                                toast.error("Gagal update status", {
                                                                                    position: toast.POSITION.TOP_RIGHT,
                                                                                    autoClose: 1000,
                                                                                });
                                                                            });
                                                                    }
                                                                }}
                                                                className="appearance-none h-auto cursor-pointer rounded-lg text-black py-1 px-0 focus:outline-none text-center text-[8px]"
                                                            >
                                                                <option value="">{item.status}</option>
                                                                <option value="READY">READY</option>
                                                                <option value="KOSONG">KOSONG</option>
                                                                <option value="FU">FU</option>
                                                                <option value="SULAP">SULAP</option>
                                                            </select>
                                                        ) : (
                                                            <select
                                                                onChange={(e) => {
                                                                    const selectedStatus = e.target.value;
                                                                    if (selectedStatus && selectedStatus !== "") {
                                                                        axios.post("https://api.401snkrs.com/v1/updatestatus", {
                                                                            id_pesanan: item.id_pesanan,
                                                                            produk: item.produk,
                                                                            status: selectedStatus,
                                                                        })
                                                                            .then(() => {
                                                                                toast.success("Status berhasil diperbarui", {
                                                                                    position: toast.POSITION.TOP_RIGHT,
                                                                                    autoClose: 1000,
                                                                                });
                                                                                getsupplier();
                                                                            })
                                                                            .catch(() => {
                                                                                toast.error("Gagal update status", {
                                                                                    position: toast.POSITION.TOP_RIGHT,
                                                                                    autoClose: 1000,
                                                                                });
                                                                            });
                                                                    }
                                                                }}
                                                                className="appearance-none h-auto cursor-pointer rounded-lg text-red-500 bg-white py-1 px-0 text-center focus:outline-none text-[8px]"
                                                                placeholder="Pilih Status"
                                                            >
                                                                <option value="">No Status</option>
                                                                <option value="READY">READY</option>
                                                                <option value="KOSONG">KOSONG</option>
                                                                <option value="FU">FU</option>
                                                                <option value="SULAP">SULAP</option>
                                                            </select>
                                                        )}
                                                    </td>
                                                    <td className="border px-3 py-2 text-[8px] font-bold">
                                                        {item.resi ? item.resi : "-"}
                                                    </td>
                                                </tr>
                                            );
                                        });
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {showEditPriceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[300px]">
                        <h2 className="text-lg font-semibold mb-4">Edit Harga</h2>
                        <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="border border-gray-300 px-3 py-2 w-full mb-4 rounded"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowEditPriceModal(false)}
                                className="px-3 py-1 rounded bg-gray-400 text-white"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => {
                                    axios.post("https://api.401snkrs.com/v1/updatemprice_listbelanja", {
                                        id_pesanan: selectedPriceItem.id_pesanan,
                                        produk: selectedPriceItem.produk,
                                        m_price: editPrice,
                                    })
                                        .then(() => {
                                            toast.success("Harga berhasil diperbarui", {
                                                position: toast.POSITION.TOP_RIGHT,
                                                autoClose: 1000,
                                            });
                                            setdatalistbelanja((prev: any) =>
                                                prev.map((item: any) =>
                                                    item.id_pesanan === selectedPriceItem.id_pesanan && item.produk === selectedPriceItem.produk
                                                        ? { ...item, m_price: editPrice }
                                                        : item
                                                )
                                            );
                                            setShowEditPriceModal(false);
                                        })
                                        .catch(() => {
                                            toast.error("Gagal update harga", {
                                                position: toast.POSITION.TOP_RIGHT,
                                                autoClose: 1000,
                                            });
                                        });
                                    setShowEditPriceModal(false);
                                }}
                                className="px-3 py-1 rounded bg-blue-600 text-white"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditAccModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[300px]">
                        <h2 className="text-lg font-semibold mb-4">Edit ACC</h2>
                        <select
                            value={editAcc}
                            onChange={(e) => setEditAcc(Number(e.target.value))}
                            className="border border-gray-300 px-3 py-2 w-full mb-4 rounded"
                        >
                            <option value={0}>Rp 0</option>
                            <option value={11000}>Rp 11.000</option>
                            <option value={16000}>Rp 16.000</option>
                        </select>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowEditAccModal(false)}
                                className="px-3 py-1 rounded bg-gray-400 text-white"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => {
                                    axios.post("https://api.401snkrs.com/v1/updateacc_listbelanja", {
                                        id_pesanan: selectedAccItem.id_pesanan,
                                        produk: selectedAccItem.produk,
                                        acc: editAcc,
                                    })
                                        .then(() => {
                                            toast.success("ACC berhasil diperbarui", {
                                                position: toast.POSITION.TOP_RIGHT,
                                                autoClose: 1000,
                                            });
                                            setdatalistbelanja((prev: any) =>
                                                prev.map((item: any) =>
                                                    item.id_pesanan === selectedAccItem.id_pesanan &&
                                                        item.produk === selectedAccItem.produk
                                                        ? { ...item, acc: editAcc }
                                                        : item
                                                )
                                            );
                                            setShowEditAccModal(false);
                                        })
                                        .catch(() => {
                                            toast.error("Gagal update ACC", {
                                                position: toast.POSITION.TOP_RIGHT,
                                                autoClose: 1000,
                                            });
                                        });
                                }}
                                className="px-3 py-1 rounded bg-blue-600 text-white"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Parameter Modal */}
            {showParameterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
                        <h2 className="text-lg font-semibold mb-4">Parameter</h2>
                        <table className="w-full text-sm mb-4 border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-2 py-1">No</th>
                                    <th className="border px-2 py-1">Parameter</th>
                                    <th className="border px-2 py-1">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data_parameter.map((param: any, index: number) => (
                                    <tr key={param.id}>
                                        <td className="border px-2 py-1 text-center">{index + 1}</td>
                                        <td className="border px-2 py-1 text-center">{param.parameter}</td>
                                        <td className="border px-2 py-1 text-center">
                                            <button
                                                onClick={() => {
                                                    const newParam = prompt("Edit Parameter", param.parameter);
                                                    if (newParam && newParam !== param.parameter) {
                                                        axios.post("https://api.401snkrs.com/v1/editparameter", {
                                                            parameters: [{ id: param.id, parameter: newParam }],
                                                        }).then(() => {
                                                            toast.success("Parameter berhasil diubah", { autoClose: 1000 });
                                                            getparameter();
                                                        }).catch(() => {
                                                            toast.error("Gagal update parameter", { autoClose: 1000 });
                                                        });
                                                    }
                                                }}
                                                className="text-blue-600 hover:underline mr-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm("Yakin hapus parameter ini?")) {
                                                        axios.post("https://api.401snkrs.com/v1/deleteparameter", {
                                                            id: param.id,
                                                        }).then(() => {
                                                            toast.success("Parameter berhasil dihapus", { autoClose: 1000 });
                                                            getparameter();
                                                        }).catch(() => {
                                                            toast.error("Gagal hapus parameter", { autoClose: 1000 });
                                                        });
                                                    }
                                                }}
                                                className="text-red-600 hover:underline"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="border px-2 py-1 text-center">+</td>
                                    <td className="border px-2 py-1">
                                        <input
                                            type="text"
                                            className="w-full border px-2 py-1 rounded"
                                            value={addparameter}
                                            onChange={(e) => setaddparameter(e.target.value)}
                                        />
                                    </td>
                                    <td className="border px-2 py-1 text-center">
                                        <button
                                            onClick={() => {
                                                if (!addparameter) return;
                                                axios.post("https://api.401snkrs.com/v1/addparameter", {
                                                    parameters: [{ parameter: addparameter }],
                                                }).then(() => {
                                                    toast.success("Parameter berhasil ditambahkan", { autoClose: 1000 });
                                                    setaddparameter("");
                                                    getparameter();
                                                }).catch(() => {
                                                    toast.error("Gagal tambah parameter", { autoClose: 1000 });
                                                });
                                            }}
                                            className="text-green-600 hover:underline"
                                        >
                                            Simpan
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="flex justify-between">
                            <button
                                onClick={() => setShowParameterModal(false)}
                                className="px-3 py-1 rounded bg-gray-400 text-white"
                            >
                                Kembali
                            </button>
                            {/* <button
                                onClick={handleSubmitParameter}
                                className="px-3 py-1 rounded bg-blue-600 text-white"
                            >
                                Simpan
                            </button> */}
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}
