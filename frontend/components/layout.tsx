import * as fa from "react-icons/fa";
import Items from './menu';
import React, { PropsWithChildren, useEffect, useState } from "react";
import { Collapse } from "react-collapse";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from "next/router";
import Cookies from "js-cookie";

const Layout = (props: PropsWithChildren) => {
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    if (Cookies.get("auth_role") === "GUEST") {
        if (screenSize.width < 1200) {
            var [toggleViewMode, setToggleViewMode] = useState(false);
        } else {
            var [toggleViewMode, setToggleViewMode] = useState(false);
        }
    } else {
        if (screenSize.width < 1200) {
            var [toggleViewMode, setToggleViewMode] = useState(false);
        } else {
            var [toggleViewMode, setToggleViewMode] = useState(true);
        }
    }
    const router = useRouter();

    const [openBylink, setopenBylink] = useState(true);

    function toogleActiveStyles() {
        if (toggleViewMode === true) {
            setToggleViewMode(false);
        } else {
            setToggleViewMode(true);
        }
    }

    const [openMenumode, setopenMenumode] = useState(false);

    function openMenu() {
        if (openMenumode === true) {
            setopenMenumode(false);
        } else {
            setopenMenumode(true);
        }
    }

    const [toggleMenu, setToggleMenu] = useState({
        activeObject: null,
    });

    function toogleActive(index: any) {
        if (openBylink) {
            setopenBylink(false);
            if (index === toggleMenu.activeObject) {
                setToggleMenu({ ...toggleMenu, activeObject: null });
            } else {
                setToggleMenu({ ...toggleMenu, activeObject: index });
                // setToggleMenu({ ...toggleMenu, activeObject: index });
            }
        } else {
            if (index === toggleMenu.activeObject) {
                setToggleMenu({ ...toggleMenu, activeObject: null });
            } else {
                setToggleMenu({ ...toggleMenu, activeObject: index });
            }
        }
    }

    function toogleActiveCollapse(index: any) {
        if (index === toggleMenu.activeObject) {
            return true
        } else {
            return false
        }
    }

    function logout() {
        Cookies.remove('auth')
        Cookies.remove('auth_idusername')
        Cookies.remove('auth_username')
        Cookies.remove('auth_password')
        Cookies.remove('auth_role')
        Cookies.remove('auth_name')
        Cookies.remove('auth_store')
        Cookies.remove('auth_channel')
        router.reload();
    }

    const [Username, setUsername]: any = useState(null);

    //hook useEffect
    useEffect(() => {
        { Cookies.get('auth') ? setUsername(Cookies.get('auth_username')) : setUsername(false) }
        setTimeout(function () {
            Cookies.remove('auth')
            Cookies.remove('auth_idusername')
            Cookies.remove('auth_username')
            Cookies.remove('auth_password')
            Cookies.remove('auth_role')
            Cookies.remove('auth_name')
            Cookies.remove('auth_store')
            Cookies.remove('auth_channel')
            router.reload();
        }, 30 * 60 * 1000);
    }, []);

    return (
        <div className="grid min-h-screen grid-rows-[60px_1fr] text-sm max-w-screen-xxl">
            {/* header */}
            <div className="w-full h-[60px] fixed drop-shadow bg-white flex justify-start items-center z-20 max-w-screen-xxl">
                {Cookies.get("auth_role") === "GUEST" ? null : (
                    <>
                        {screenSize.width > 1200 ? (
                            <>
                                <div className="ml-4 flex cursor-pointer items-center h-10 w-auto px-2 " onClick={() => toogleActiveStyles()} >
                                    <i className="fi fi-sr-menu-burger w-[1.12rem] h-[1.12rem] text-center text-[1.12rem] leading-4"></i>
                                </div>
                            </>) : null}
                    </>)}

                <div className="h-[38px] w-[175px]">
                    <Image
                        className="h-full pl-5"
                        src="/401_landscape.png"
                        alt="Picture of the author"
                        width={500}
                        height={500}
                        placeholder="blur"
                        blurDataURL={'/401_landscape.png'}
                    />
                    {/* <span className='font-medium text-2xl text-black'>OFFICIAL KITA Apps</span> */}
                </div>
                <div className="grow">
                </div>

                <div className="flex gap-2 items-center mr-5 justify-center">
                    <span className="m-auto items-center">Hello <b>{String(Username)}</b>, <button onClick={() => logout()}>Logout</button></span>
                </div>
            </div>
            {/* end header */}

            <div className={`${toggleViewMode ? "left-0" : "left-[-300px]"} w-[15.3rem] fixed duration-200 grid grid-rows-[60px_1fr] h-screen group`}>
                <div></div>
                <ul className="bg-white h-auto mb-1 space-y-2 text-[0.9rem] font-medium overflow-y-auto pt-8 pb-4 px-2 scrollbar-thin scrollbar-thumb-zinc-200 group-hover:scrollbar-thumb-zinc-300 scrollbar-thumb-rounded scrollbar-track-rounded">
                    {Items.map((item: any, index) => {
                        if (
                            item.roles_SUPERADMIN === Cookies.get("auth_role") ||
                            item.roles_HEADAREA === Cookies.get("auth_role") ||
                            item.roles_HEADWAREHOUSE === Cookies.get("auth_role") ||
                            item.roles_HEADSTORE === Cookies.get("auth_role") ||
                            item.roles_CASHIER === Cookies.get("auth_role") ||
                            item.roles_GUEST === Cookies.get("auth_role") ||
                            item.roles_CHANNEL === Cookies.get("auth_channel") ||
                            item.roles_offline === "offline"
                        ) {
                            var pathUrl = router.asPath.split("/");
                            const validasiMenu =
                                toggleMenu.activeObject === index
                                    ? true
                                    : pathUrl[1] == item.path
                                        ? openBylink
                                        : false;
                            if (item.title === "Pesanan Online" || item.title === "Pesanan Toko") {
                                if (Cookies.get("auth_role") === "SUPER-ADMIN" || Cookies.get("auth_role") === "HEAD-AREA") {
                                    if (item.children) {
                                        return (
                                            <li key={index} className="h-auto rounded-lg cursor-pointer">
                                                <div
                                                    className="flex gap-3.5 items-center justify-start py-3 px-5"
                                                    onClick={() => toogleActive(index)}
                                                >
                                                    <i
                                                        className={`${item.icon_item} w-5 h-5 text-center text-[1.25rem] leading-5 items-center`}
                                                    ></i>
                                                    <span className="text-sm items-center font-normal grow">
                                                        {item.text}
                                                    </span>
                                                    <fa.FaChevronDown
                                                        id={String(index)}
                                                        className={`${validasiMenu ? "rotate-0" : "rotate-180"
                                                            } p-1 w-5 h-5 transition duration-500`}
                                                    />
                                                </div>

                                                <Collapse isOpened={validasiMenu}>
                                                    <ul className="bg-white text-[0.9rem] space-y-1.5 font-medium">
                                                        {item.children.map((child: any, index: any) => {
                                                            if (
                                                                child.roles_SUPERADMIN === Cookies.get("auth_role") || child.roles_HEADAREA === Cookies.get("auth_role") || child.roles_HEADWAREHOUSE === Cookies.get("auth_role") || child.roles_HEADSTORE === Cookies.get("auth_role") || child.roles_CASHIER === Cookies.get("auth_role") || child.roles_GUEST === Cookies.get("auth_role") || child.roles_CHANNEL === Cookies.get("auth_channel")
                                                            ) {
                                                                return (
                                                                    <li
                                                                        key={index}
                                                                        className={`${router.asPath == child.href
                                                                            ? "bg-gray-100 text-black font-bold"
                                                                            : "hover:bg-gray-100 font-normal"
                                                                            } h-auto rounded-lg cursor-pointer pl-3`}
                                                                    >
                                                                        <a
                                                                            href={child.href}
                                                                            className="flex gap-3.5 items-center text-start py-3 px-5"
                                                                        >
                                                                            <i
                                                                                className={`${child.icon_item} w-5 h-5 text-center text-[1.25rem] leading-5 items-center m-0 pt-[1.9px]`}
                                                                            ></i>
                                                                            <span className="text-sm items-center grow">
                                                                                {child.text}
                                                                            </span>
                                                                        </a>
                                                                    </li>
                                                                );
                                                            }
                                                        })}
                                                    </ul>
                                                </Collapse>
                                            </li>
                                        );
                                    } else {
                                        return (
                                            <li
                                                key={index}
                                                className={`${router.asPath == item.href
                                                    ? "bg-gray-200 text-gray-700 font-bold"
                                                    : "hover:bg-gray-100 font-normal"
                                                    } "h-auto rounded-lg cursor-pointer`}
                                            >
                                                <a
                                                    href={item.href}
                                                    className="flex gap-3.5 items-center text-center justify-start py-3 px-5"
                                                >
                                                    <i
                                                        className={`${item.icon_item} w-5 h-5 text-center text-[1.25rem] leading-5 items-center`}
                                                    ></i>
                                                    <span className="text-sm items-center">{item.text}</span>
                                                </a>
                                            </li>
                                        );
                                    }
                                } else {
                                    if (Cookies.get("auth_channel") === "OFFLINE STORE") {
                                        if (item.title === "Pesanan Toko") {
                                            if (item.children) {
                                                return (
                                                    <li key={index} className="h-auto rounded-lg cursor-pointer">
                                                        <div
                                                            className="flex gap-3.5 items-center justify-start py-3 px-5"
                                                            onClick={() => toogleActive(index)}
                                                        >
                                                            <i
                                                                className={`${item.icon_item} w-5 h-5 text-center text-[1.25rem] leading-5 items-center`}
                                                            ></i>
                                                            <span className="text-sm items-center font-normal grow">
                                                                {item.text}
                                                            </span>
                                                            <fa.FaChevronDown
                                                                id={String(index)}
                                                                className={`${validasiMenu ? "rotate-0" : "rotate-180"
                                                                    } p-1 w-5 h-5 transition duration-500`}
                                                            />
                                                        </div>

                                                        <Collapse isOpened={validasiMenu}>
                                                            <ul className="bg-white text-[0.9rem] space-y-1.5 font-medium">
                                                                {item.children.map((child: any, index: any) => {
                                                                    if (
                                                                        child.roles_SUPERADMIN === Cookies.get("auth_role") || child.roles_HEADAREA === Cookies.get("auth_role") || child.roles_HEADWAREHOUSE === Cookies.get("auth_role") || child.roles_HEADSTORE === Cookies.get("auth_role") || child.roles_CASHIER === Cookies.get("auth_role") || child.roles_GUEST === Cookies.get("auth_role") || child.roles_CHANNEL === Cookies.get("auth_channel")
                                                                    ) {
                                                                        return (
                                                                            <li
                                                                                key={index}
                                                                                className={`${router.asPath == child.href
                                                                                    ? "bg-gray-100 text-black font-bold"
                                                                                    : "hover:bg-gray-100 font-normal"
                                                                                    } h-auto rounded-lg cursor-pointer pl-3`}
                                                                            >
                                                                                <a
                                                                                    href={child.href}
                                                                                    className="flex gap-3.5 items-center text-start py-3 px-5"
                                                                                >
                                                                                    <i
                                                                                        className={`${child.icon_item} w-5 h-5 text-center text-[1.25rem] leading-5 items-center m-0 pt-[1.9px]`}
                                                                                    ></i>
                                                                                    <span className="text-sm items-center grow">
                                                                                        {child.text}
                                                                                    </span>
                                                                                </a>
                                                                            </li>
                                                                        );
                                                                    }
                                                                })}
                                                            </ul>
                                                        </Collapse>
                                                    </li>
                                                );
                                            } else {
                                                return (
                                                    <li
                                                        key={index}
                                                        className={`${router.asPath == item.href
                                                            ? "bg-gray-200 text-gray-700 font-bold"
                                                            : "hover:bg-gray-100 font-normal"
                                                            } "h-auto rounded-lg cursor-pointer`}
                                                    >
                                                        <a
                                                            href={item.href}
                                                            className="flex gap-3.5 items-center text-center justify-start py-3 px-5"
                                                        >
                                                            <i
                                                                className={`${item.icon_item} w-5 h-5 text-center text-[1.25rem] leading-5 items-center`}
                                                            ></i>
                                                            <span className="text-sm items-center">{item.text}</span>
                                                        </a>
                                                    </li>
                                                );
                                            }
                                        }
                                    } else {
                                        if (item.title === "Pesanan Online") {
                                            if (item.children) {
                                                return (
                                                    <li key={index} className="h-auto rounded-lg cursor-pointer">
                                                        <div
                                                            className="flex gap-3.5 items-center justify-start py-3 px-5"
                                                            onClick={() => toogleActive(index)}
                                                        >
                                                            <i
                                                                className={`${item.icon_item} w-5 h-5 text-center text-[1.25rem] leading-5 items-center`}
                                                            ></i>
                                                            <span className="text-sm items-center font-normal grow">
                                                                {item.text}
                                                            </span>
                                                            <fa.FaChevronDown
                                                                id={String(index)}
                                                                className={`${validasiMenu ? "rotate-0" : "rotate-180"
                                                                    } p-1 w-5 h-5 transition duration-500`}
                                                            />
                                                        </div>

                                                        <Collapse isOpened={validasiMenu}>
                                                            <ul className="bg-white text-[0.9rem] space-y-1.5 font-medium">
                                                                {item.children.map((child: any, index: any) => {
                                                                    if (
                                                                        child.roles_SUPERADMIN === Cookies.get("auth_role") || child.roles_HEADAREA === Cookies.get("auth_role") || child.roles_HEADWAREHOUSE === Cookies.get("auth_role") || child.roles_HEADSTORE === Cookies.get("auth_role") || child.roles_CASHIER === Cookies.get("auth_role") || child.roles_GUEST === Cookies.get("auth_role") || child.roles_CHANNEL === Cookies.get("auth_channel")
                                                                    ) {
                                                                        return (
                                                                            <li
                                                                                key={index}
                                                                                className={`${router.asPath == child.href
                                                                                    ? "bg-gray-100 text-black font-bold"
                                                                                    : "hover:bg-gray-100 font-normal"
                                                                                    } h-auto rounded-lg cursor-pointer pl-3`}
                                                                            >
                                                                                <a
                                                                                    href={child.href}
                                                                                    className="flex gap-3.5 items-center text-start py-3 px-5"
                                                                                >
                                                                                    <i
                                                                                        className={`${child.icon_item} w-5 h-5 text-center text-[1.25rem] leading-5 items-center m-0 pt-[1.9px]`}
                                                                                    ></i>
                                                                                    <span className="text-sm items-center grow">
                                                                                        {child.text}
                                                                                    </span>
                                                                                </a>
                                                                            </li>
                                                                        );
                                                                    }
                                                                })}
                                                            </ul>
                                                        </Collapse>
                                                    </li>
                                                );
                                            } else {
                                                return (
                                                    <li
                                                        key={index}
                                                        className={`${router.asPath == item.href
                                                            ? "bg-gray-200 text-gray-700 font-bold"
                                                            : "hover:bg-gray-100 font-normal"
                                                            } "h-auto rounded-lg cursor-pointer`}
                                                    >
                                                        <a
                                                            href={item.href}
                                                            className="flex gap-3.5 items-center text-center justify-start py-3 px-5"
                                                        >
                                                            <i
                                                                className={`${item.icon_item} w-5 h-5 text-center text-[1.25rem] leading-5 items-center`}
                                                            ></i>
                                                            <span className="text-sm items-center">{item.text}</span>
                                                        </a>
                                                    </li>
                                                );
                                            }
                                        }
                                    }
                                }

                            } else {
                                if (item.children) {
                                    return (
                                        <li key={index} className="h-auto rounded-lg cursor-pointer">
                                            <div
                                                className="flex gap-3.5 items-center justify-start py-3 px-5"
                                                onClick={() => toogleActive(index)}
                                            >
                                                <i
                                                    className={`${item.icon_item} w-5 h-5 text-center text-[1.25rem] leading-5 items-center`}
                                                ></i>
                                                <span className="text-sm items-center font-normal grow">
                                                    {item.text}
                                                </span>
                                                <fa.FaChevronDown
                                                    id={String(index)}
                                                    className={`${validasiMenu ? "rotate-0" : "rotate-180"
                                                        } p-1 w-5 h-5 transition duration-500`}
                                                />
                                            </div>

                                            <Collapse isOpened={validasiMenu}>
                                                <ul className="bg-white text-[0.9rem] space-y-1.5 font-medium">
                                                    {item.children.map((child: any, index: any) => {
                                                        if (
                                                            child.roles_SUPERADMIN === Cookies.get("auth_role") || child.roles_HEADAREA === Cookies.get("auth_role") || child.roles_HEADWAREHOUSE === Cookies.get("auth_role") || child.roles_HEADSTORE === Cookies.get("auth_role") || child.roles_CASHIER === Cookies.get("auth_role") || child.roles_GUEST === Cookies.get("auth_role") || child.roles_CHANNEL === Cookies.get("auth_channel")
                                                        ) {
                                                            return (
                                                                <li
                                                                    key={index}
                                                                    className={`${router.asPath == child.href
                                                                        ? "bg-gray-100 text-black font-bold"
                                                                        : "hover:bg-gray-100 font-normal"
                                                                        } h-auto rounded-lg cursor-pointer pl-3`}
                                                                >
                                                                    <a
                                                                        href={child.href}
                                                                        className="flex gap-3.5 items-center text-start py-3 px-5"
                                                                    >
                                                                        <i
                                                                            className={`${child.icon_item} w-5 h-5 text-center text-[1.25rem] leading-5 items-center m-0 pt-[1.9px]`}
                                                                        ></i>
                                                                        <span className="text-sm items-center grow">
                                                                            {child.text}
                                                                        </span>
                                                                    </a>
                                                                </li>
                                                            );
                                                        }
                                                    })}
                                                </ul>
                                            </Collapse>
                                        </li>
                                    );
                                } else {
                                    return (
                                        <li
                                            key={index}
                                            className={`${router.asPath == item.href
                                                ? "bg-gray-200 text-gray-700 font-bold"
                                                : "hover:bg-gray-100 font-normal"
                                                } "h-auto rounded-lg cursor-pointer`}
                                        >
                                            <a
                                                href={item.href}
                                                className="flex gap-3.5 items-center text-center justify-start py-3 px-5"
                                            >
                                                <i
                                                    className={`${item.icon_item} w-5 h-5 text-center text-[1.25rem] leading-5 items-center`}
                                                ></i>
                                                <span className="text-sm items-center">{item.text}</span>
                                            </a>
                                        </li>
                                    );
                                }
                            }

                        }
                    })}
                </ul>
            </div >

            {/* <div className="grid grid-cols-[16rem_1fr] h-full"> */}
            <div className="h-screen pt-[60px] " >
                <div className={`${toggleViewMode ? "grid-cols-[15.3rem_1fr]" : "grid-cols-[0rem_1fr]"} grid h-full duration-200`}>
                    <div className="h-full bg-[#F4F4F4] pt-5 px-4 ">
                    </div>

                    <main className={`${toggleViewMode ? "px-0" : "px-0"} h-full bg-[#F4F4F4] duration-200 overscroll-y-auto overflow-x-hidden scrollbar-none max-w-screen-xxl`}>
                        {props.children}
                    </main>
                </div>
            </div >
        </div >
    );
};

export default Layout;
