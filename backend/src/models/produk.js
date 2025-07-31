const { log } = require("console");
const dbPool = require("../config/database");

const date = require("date-and-time");
const { stringify } = require("querystring");
const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
const tanggal2 = date.format(new Date(), "YYYY-MM-DD");
const tanggalinput = date.format(new Date(), "YYYYMMDD");
const tahun = date.format(new Date(), "YY");
const { generateFromEmail } = require("unique-username-generator");

const getProduk = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();
        if (body.role === "SUPER-ADMIN" || body.role === "HEAD-AREA") {
            var areas = body.area;
        } else if (body.role === "HEAD-WAREHOUSE") {
            var [cek_area] = await connection.query(
                `SELECT id_area FROM tb_warehouse WHERE id_ware='${body.area}' GROUP BY id_area`
            );
            var areas = cek_area[0].id_area;
        } else {
            var [cek_area] = await connection.query(
                `SELECT id_area FROM tb_store`
            );
            var areas = cek_area[0].id_area;
        }

        if (body.id_ware === "all") {
            var [countproduk] = await connection.query(
                `SELECT * FROM tb_produk`
            );
        } else {
            var [countproduk] = await connection.query(
                `SELECT * FROM tb_produk WHERE id_ware='${body.id_ware}'`
            );
        }

        if (body.loadmorelimit === 1) {
            var limitss = 20;
        } else if (body.loadmorelimit === 0) {
            var limitss = 0;
        } else {
            var limitss = body.loadmorelimit * 20;
        }
        const total_pages = countproduk.length / 20;
        const total_pages_ware = countproduk.length / 20;

        const datas = [];

        if (body.query === "all") {
            if (body.id_ware === "all") {
                if (countproduk.length < 20) {
                    var [data_produk] = await connection.query(
                        // `SELECT * FROM tb_produk ORDER BY id DESC LIMIT 20`
                        `SELECT tb_produk.*,tb_warehouse.warehouse FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware ORDER BY tb_produk.id DESC LIMIT 20`
                    );
                } else {
                    var [data_produk] = await connection.query(
                        // `SELECT * FROM tb_produk ORDER BY id DESC LIMIT 20 OFFSET ${limitss}`
                        `SELECT tb_produk.*,tb_warehouse.warehouse FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware ORDER BY tb_produk.id DESC LIMIT 20 OFFSET ${limitss}`
                    );
                }

                var [total_artikel] = await connection.query(`SELECT COUNT(id_produk) as totals FROM tb_produk GROUP BY id_produk`);
                var [sum_artikel] = await connection.query(`SELECT SUM(qty) as sumqty FROM tb_variation`);
                for (let index = 0; index < data_produk.length; index++) {
                    var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware`);
                    for (let bx = 0; bx < details.length; bx++) {
                        var countqty = details[bx].qty;
                    }

                    var [detail_variation] = await connection.query(
                        `SELECT tb_variation.*,SUM(tb_variation.qty) as qty,displays.size as sizes,displays.qty as qtyss,displays.id_ware as id_waress FROM tb_variation LEFT JOIN displays ON tb_variation.id_produk = displays.id_produk WHERE tb_variation.id_produk='${data_produk[index].id_produk}' AND tb_variation.id_ware='${data_produk[index].id_ware}' GROUP BY tb_variation.id_ware,tb_variation.size ORDER BY tb_variation.id ASC`
                    );
                    for (let xyx = 0; xyx < detail_variation.length; xyx++) {
                        var sizes = detail_variation[xyx].sizes;
                        var qtyss = detail_variation[xyx].qtyss;
                        var id_waress = detail_variation[xyx].id_waress;
                    }
                    var [data_category] = await connection.query(`SELECT category FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                    var [data_warehouse] = await connection.query(`SELECT id_ware,warehouse FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                    var [data_brand] = await connection.query(`SELECT brand FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                    var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);

                    datas.push({
                        id: data_produk[index].id,
                        id_produk: data_produk[index].id_produk,
                        id_ware: data_produk[index].id_ware,
                        id_brand: data_produk[index].id_brand,
                        id_category: data_produk[index].id_category,
                        tanggal_upload: data_produk[index].tanggal_upload,
                        produk: data_produk[index].produk,
                        deskripsi: data_produk[index].deskripsi,
                        quality: data_produk[index].quality,
                        n_price: data_produk[index].n_price,
                        r_price: data_produk[index].r_price,
                        g_price: data_produk[index].g_price,
                        img: data_produk[index].img,
                        users: data_produk[index].users,
                        created_at: data_produk[index].created_at,
                        updated_at: data_produk[index].updated_at,
                        countqty: countqty,
                        detail_variation: detail_variation,
                        category: data_category,
                        warehouse: data_warehouse,
                        brand: data_brand,
                        sizes: sizes,
                        qtyss: qtyss,
                        id_waress: id_waress,
                        upprice_n_price: data_area[0].n_price,
                        upprice_r_price: data_area[0].r_price,
                        upprice_g_price: data_area[0].g_price,
                        no_urut: countproduk.length,
                    });
                }

            } else if (body.id_ware === "all_area") {
                if (countproduk.length < 20) {
                    var [data_produk] = await connection.query(
                        `SELECT tb_produk.*,tb_warehouse.id_area,tb_warehouse.id_ware,tb_brand.brand FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware LEFT JOIN tb_brand ON tb_produk.id_ware = tb_brand.id_brand WHERE tb_warehouse.id_area='${areas}' ORDER BY tb_produk.id DESC LIMIT 20`
                    );
                } else {
                    var [data_produk] = await connection.query(
                        `SELECT tb_produk.*,tb_warehouse.id_area,tb_warehouse.id_ware,tb_brand.brand FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware LEFT JOIN tb_brand ON tb_produk.id_ware = tb_brand.id_brand WHERE tb_warehouse.id_area='${areas}' ORDER BY tb_produk.id DESC LIMIT 20 OFFSET ${limitss}`
                    );
                }

                var [total_artikel] = await connection.query(
                    `SELECT tb_produk.*,COUNT(id_produk) as totals,tb_warehouse.id_area FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware WHERE tb_warehouse.id_area='${areas}' GROUP BY tb_produk.id_produk`
                );
                var [sum_artikel] = await connection.query(
                    `SELECT SUM(qty) as sumqty FROM tb_variation WHERE id_area='${areas}'`
                );
                for (let index = 0; index < data_produk.length; index++) {
                    var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware`);
                    for (let bx = 0; bx < details.length; bx++) {
                        var countqty = details[bx].qty;
                    }
                    var [detail_variation] = await connection.query(
                        `SELECT tb_variation.*,SUM(tb_variation.qty) as qty,displays.size as sizes,displays.qty as qtyss,displays.id_ware as id_waress FROM tb_variation LEFT JOIN displays ON tb_variation.id_produk = displays.id_produk WHERE tb_variation.id_produk='${data_produk[index].id_produk}' AND tb_variation.id_ware='${data_produk[index].id_ware}' GROUP BY tb_variation.id_ware,tb_variation.size ORDER BY tb_variation.id ASC`
                    );
                    for (let xyx = 0; xyx < detail_variation.length; xyx++) {
                        var sizes = detail_variation[xyx].sizes;
                        var qtyss = detail_variation[xyx].qtyss;
                        var id_waress = detail_variation[xyx].id_waress;
                    }
                    var [data_category] = await connection.query(`SELECT category FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                    var [data_warehouse] = await connection.query(`SELECT id_ware,warehouse FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                    var [data_brand] = await connection.query(`SELECT brand FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                    var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);

                    datas.push({
                        id: data_produk[index].id,
                        id_produk: data_produk[index].id_produk,
                        id_ware: data_produk[index].id_ware,
                        id_brand: data_produk[index].id_brand,
                        id_category: data_produk[index].id_category,
                        tanggal_upload: data_produk[index].tanggal_upload,
                        produk: data_produk[index].produk,
                        deskripsi: data_produk[index].deskripsi,
                        quality: data_produk[index].quality,
                        n_price: data_produk[index].n_price,
                        r_price: data_produk[index].r_price,
                        g_price: data_produk[index].g_price,
                        img: data_produk[index].img,
                        users: data_produk[index].users,
                        created_at: data_produk[index].created_at,
                        updated_at: data_produk[index].updated_at,
                        countqty: countqty,
                        detail_variation: detail_variation,
                        category: data_category,
                        warehouse: data_warehouse,
                        brand: data_brand,
                        sizes: sizes,
                        qtyss: qtyss,
                        id_waress: id_waress,
                        upprice_n_price: data_area[0].n_price,
                        upprice_r_price: data_area[0].r_price,
                        upprice_g_price: data_area[0].g_price,
                    });
                }
            } else {
                if (countproduk.length < 20) {
                    var [data_produk] = await connection.query(
                        `SELECT tb_produk.*,tb_warehouse.warehouse FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware  WHERE tb_produk.id_ware='${body.id_ware}' ORDER BY tb_produk.id DESC LIMIT 20`
                    );
                } else {
                    var [data_produk] = await connection.query(
                        `SELECT tb_produk.*,tb_warehouse.warehouse FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware  WHERE tb_produk.id_ware='${body.id_ware}' ORDER BY tb_produk.id DESC LIMIT 20 OFFSET ${limitss}`
                    );
                }

                var [total_artikel] = await connection.query(`SELECT COUNT(id_produk) as totals FROM tb_produk WHERE id_ware='${body.id_ware}' GROUP BY id_produk`);
                var [sum_artikel] = await connection.query(`SELECT SUM(qty) as sumqty FROM tb_variation WHERE id_ware='${body.id_ware}'`);
                for (let index = 0; index < data_produk.length; index++) {
                    var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware`);
                    for (let bx = 0; bx < details.length; bx++) {
                        var countqty = details[bx].qty;
                    }
                    var [detail_variation] = await connection.query(
                        `SELECT tb_variation.*,SUM(tb_variation.qty) as qty,displays.size as sizes,displays.qty as qtyss,displays.id_ware as id_waress FROM tb_variation LEFT JOIN displays ON tb_variation.id_produk = displays.id_produk WHERE tb_variation.id_produk='${data_produk[index].id_produk}' AND tb_variation.id_ware='${data_produk[index].id_ware}' GROUP BY tb_variation.id_ware,tb_variation.size ORDER BY tb_variation.id ASC`
                    );
                    for (let xyx = 0; xyx < detail_variation.length; xyx++) {
                        var sizes = detail_variation[xyx].sizes;
                        var qtyss = detail_variation[xyx].qtyss;
                        var id_waress = detail_variation[xyx].id_waress;
                    }
                    var [data_category] = await connection.query(`SELECT category FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                    var [data_warehouse] = await connection.query(`SELECT id_ware,warehouse FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                    var [data_brand] = await connection.query(`SELECT brand FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                    var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);

                    datas.push({
                        id: data_produk[index].id,
                        id_produk: data_produk[index].id_produk,
                        id_ware: data_produk[index].id_ware,
                        id_brand: data_produk[index].id_brand,
                        id_category: data_produk[index].id_category,
                        tanggal_upload: data_produk[index].tanggal_upload,
                        produk: data_produk[index].produk,
                        deskripsi: data_produk[index].deskripsi,
                        quality: data_produk[index].quality,
                        n_price: data_produk[index].n_price,
                        r_price: data_produk[index].r_price,
                        g_price: data_produk[index].g_price,
                        img: data_produk[index].img,
                        users: data_produk[index].users,
                        created_at: data_produk[index].created_at,
                        updated_at: data_produk[index].updated_at,
                        countqty: countqty,
                        detail_variation: detail_variation,
                        category: data_category,
                        warehouse: data_warehouse,
                        brand: data_brand,
                        sizes: sizes,
                        qtyss: qtyss,
                        id_waress: id_waress,
                        upprice_n_price: data_area[0].n_price,
                        upprice_r_price: data_area[0].r_price,
                        upprice_g_price: data_area[0].g_price,
                    });
                }
            }
        } else {
            if (body.id_ware === "all") {
                var [data_produk] = await connection.query(
                    `SELECT tb_produk.*,tb_brand.brand FROM tb_produk LEFT JOIN tb_brand ON tb_produk.id_brand = tb_brand.id_brand WHERE (tb_produk.produk LIKE '%${body.query}%' OR tb_produk.id_produk LIKE '%${body.query}%')  ORDER BY tb_produk.id DESC`
                );
                var [total_artikel] = await connection.query(`SELECT COUNT(id_produk) as totals FROM tb_produk GROUP BY id_produk`);
                var [sum_artikel] = await connection.query(`SELECT SUM(qty) as sumqty FROM tb_variation`);

                for (let index = 0; index < data_produk.length; index++) {
                    var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware`);
                    for (let bx = 0; bx < details.length; bx++) {
                        var countqty = details[bx].qty;
                    }

                    var [detail_variation] = await connection.query(
                        `SELECT tb_variation.*,SUM(tb_variation.qty) as qty,displays.size as sizes,displays.qty as qtyss,displays.id_ware as id_waress FROM tb_variation LEFT JOIN displays ON tb_variation.id_produk = displays.id_produk WHERE tb_variation.id_produk='${data_produk[index].id_produk}' AND tb_variation.id_ware='${data_produk[index].id_ware}' GROUP BY tb_variation.id_ware,tb_variation.size ORDER BY tb_variation.id ASC`
                    );
                    for (let xyx = 0; xyx < detail_variation.length; xyx++) {
                        var sizes = detail_variation[xyx].sizes;
                        var qtyss = detail_variation[xyx].qtyss;
                        var id_waress = detail_variation[xyx].id_waress;
                    }
                    var [data_category] = await connection.query(`SELECT category FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                    var [data_warehouse] = await connection.query(`SELECT id_ware,warehouse FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                    var [data_brand] = await connection.query(`SELECT brand FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                    var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);

                    datas.push({
                        id: data_produk[index].id,
                        id_produk: data_produk[index].id_produk,
                        id_ware: data_produk[index].id_ware,
                        id_brand: data_produk[index].id_brand,
                        id_category: data_produk[index].id_category,
                        tanggal_upload: data_produk[index].tanggal_upload,
                        produk: data_produk[index].produk,
                        deskripsi: data_produk[index].deskripsi,
                        quality: data_produk[index].quality,
                        n_price: data_produk[index].n_price,
                        r_price: data_produk[index].r_price,
                        g_price: data_produk[index].g_price,
                        img: data_produk[index].img,
                        users: data_produk[index].users,
                        created_at: data_produk[index].created_at,
                        updated_at: data_produk[index].updated_at,
                        countqty: countqty,
                        detail_variation: detail_variation,
                        category: data_category,
                        warehouse: data_warehouse,
                        brand: data_brand,
                        sizes: sizes,
                        qtyss: qtyss,
                        id_waress: id_waress,
                        upprice_n_price: data_area[0].n_price,
                        upprice_r_price: data_area[0].r_price,
                        upprice_g_price: data_area[0].g_price,
                    });
                }
            } else if (body.id_ware === "all_area") {
                var [data_produk] = await connection.query(
                    `SELECT tb_produk.*,tb_warehouse.id_area,tb_brand.brand FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware LEFT JOIN tb_brand ON tb_produk.id_ware = tb_brand.id_brand WHERE (tb_produk.produk LIKE '%${body.query}%' OR tb_produk.id_produk LIKE '%${body.query}%') AND tb_warehouse.id_area='${areas}' ORDER BY tb_produk.id DESC`
                );
                var [total_artikel] = await connection.query(
                    `SELECT tb_produk.*,COUNT(id_produk) as totals,tb_warehouse.id_area FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware WHERE tb_warehouse.id_area='${areas}' GROUP BY tb_produk.id_produk`
                );
                var [sum_artikel] = await connection.query(
                    `SELECT SUM(qty) as sumqty FROM tb_variation WHERE id_area='${areas}'`
                );
                for (let index = 0; index < data_produk.length; index++) {
                    var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware`);
                    for (let bx = 0; bx < details.length; bx++) {
                        var countqty = details[bx].qty;
                    }
                    var [detail_variation] = await connection.query(
                        `SELECT tb_variation.*,SUM(tb_variation.qty) as qty,displays.size as sizes,displays.qty as qtyss,displays.id_ware as id_waress FROM tb_variation LEFT JOIN displays ON tb_variation.id_produk = displays.id_produk WHERE tb_variation.id_produk='${data_produk[index].id_produk}' AND tb_variation.id_ware='${data_produk[index].id_ware}' GROUP BY tb_variation.id_ware,tb_variation.size ORDER BY tb_variation.id ASC`
                    );
                    for (let xyx = 0; xyx < detail_variation.length; xyx++) {
                        var sizes = detail_variation[xyx].sizes;
                        var qtyss = detail_variation[xyx].qtyss;
                        var id_waress = detail_variation[xyx].id_waress;
                    }
                    var [data_category] = await connection.query(`SELECT category FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                    var [data_warehouse] = await connection.query(`SELECT id_ware,warehouse FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                    var [data_brand] = await connection.query(`SELECT brand FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                    var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);

                    datas.push({
                        id: data_produk[index].id,
                        id_produk: data_produk[index].id_produk,
                        id_ware: data_produk[index].id_ware,
                        id_brand: data_produk[index].id_brand,
                        id_category: data_produk[index].id_category,
                        tanggal_upload: data_produk[index].tanggal_upload,
                        produk: data_produk[index].produk,
                        deskripsi: data_produk[index].deskripsi,
                        quality: data_produk[index].quality,
                        n_price: data_produk[index].n_price,
                        r_price: data_produk[index].r_price,
                        g_price: data_produk[index].g_price,
                        img: data_produk[index].img,
                        users: data_produk[index].users,
                        created_at: data_produk[index].created_at,
                        updated_at: data_produk[index].updated_at,
                        countqty: countqty,
                        detail_variation: detail_variation,
                        category: data_category,
                        warehouse: data_warehouse,
                        brand: data_brand,
                        sizes: sizes,
                        qtyss: qtyss,
                        id_waress: id_waress,
                        upprice_n_price: data_area[0].n_price,
                        upprice_r_price: data_area[0].r_price,
                        upprice_g_price: data_area[0].g_price,
                    });
                }
            } else {
                var [data_produk] = await connection.query(
                    `SELECT tb_produk.*,tb_brand.brand FROM tb_produk LEFT JOIN tb_brand ON tb_produk.id_brand = tb_brand.id_brand WHERE (tb_produk.produk LIKE '%${body.query}%' OR tb_produk.id_produk LIKE '%${body.query}%') AND tb_produk.id_ware='${body.id_ware}'  ORDER BY tb_produk.id DESC`
                );
                var [total_artikel] = await connection.query(`SELECT COUNT(id_produk) as totals FROM tb_produk WHERE id_ware='${body.id_ware}' GROUP BY id_produk`);
                var [sum_artikel] = await connection.query(`SELECT SUM(qty) as sumqty FROM tb_variation WHERE id_ware='${body.id_ware}'`);
                for (let index = 0; index < data_produk.length; index++) {
                    var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware`);
                    for (let bx = 0; bx < details.length; bx++) {
                        var countqty = details[bx].qty;
                    }
                    var [detail_variation] = await connection.query(
                        `SELECT tb_variation.*,SUM(tb_variation.qty) as qty,displays.size as sizes,displays.qty as qtyss,displays.id_ware as id_waress FROM tb_variation LEFT JOIN displays ON tb_variation.id_produk = displays.id_produk WHERE tb_variation.id_produk='${data_produk[index].id_produk}' AND tb_variation.id_ware='${data_produk[index].id_ware}' GROUP BY tb_variation.id_ware,tb_variation.size ORDER BY tb_variation.id ASC`
                    );
                    for (let xyx = 0; xyx < detail_variation.length; xyx++) {
                        var sizes = detail_variation[xyx].sizes;
                        var qtyss = detail_variation[xyx].qtyss;
                        var id_waress = detail_variation[xyx].id_waress;
                    }
                    var [data_category] = await connection.query(`SELECT category FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                    var [data_warehouse] = await connection.query(`SELECT id_ware,warehouse FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                    var [data_brand] = await connection.query(`SELECT brand FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                    var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);

                    datas.push({
                        id: data_produk[index].id,
                        id_produk: data_produk[index].id_produk,
                        id_ware: data_produk[index].id_ware,
                        id_brand: data_produk[index].id_brand,
                        id_category: data_produk[index].id_category,
                        tanggal_upload: data_produk[index].tanggal_upload,
                        produk: data_produk[index].produk,
                        deskripsi: data_produk[index].deskripsi,
                        quality: data_produk[index].quality,
                        n_price: data_produk[index].n_price,
                        r_price: data_produk[index].r_price,
                        g_price: data_produk[index].g_price,
                        img: data_produk[index].img,
                        users: data_produk[index].users,
                        created_at: data_produk[index].created_at,
                        updated_at: data_produk[index].updated_at,
                        countqty: countqty,
                        detail_variation: detail_variation,
                        category: data_category,
                        warehouse: data_warehouse,
                        brand: data_brand,
                        sizes: sizes,
                        qtyss: qtyss,
                        id_waress: id_waress,
                        upprice_n_price: data_area[0].n_price,
                        upprice_r_price: data_area[0].r_price,
                        upprice_g_price: data_area[0].g_price,
                    });
                }
            }
        }

        await connection.commit();
        await connection.release();
        return {
            datas,
            total_artikel: total_artikel.length,
            sum_artikel: sum_artikel[0].sumqty,
            total_pages: Math.round(total_pages),
            show_page: limitss,
        };

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getProdukdisplay = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();
        if (body.role === "SUPER-ADMIN" || body.role === "HEAD-AREA") {
            var areas = body.area;
        } else if (body.role === "HEAD-WAREHOUSE") {
            var [cek_area] = await connection.query(
                `SELECT id_area FROM tb_warehouse WHERE id_ware='${body.area}' GROUP BY id_area ORDER BY id DESC`
            );
            var areas = cek_area[0].id_area;
        } else {
            var [cek_area] = await connection.query(
                `SELECT id_area FROM tb_store`
            );
            var areas = cek_area[0].id_area;
        }
        const datas = [];

        if (body.store != "all") {
            var [cek_store] = await connection.query(
                `SELECT * FROM tb_store WHERE id_store='${body.store}'`
            );

            for (let mm = 0; mm < cek_store.length; mm++) {
                var [cek_id_ware] = await connection.query(
                    `SELECT * FROM tb_warehouse WHERE id_ware='${cek_store[mm].id_ware}' ORDER BY id DESC`
                );

                var getidware = cek_id_ware[0].id_ware;
            }
        } else {
            var [cek_id_ware] = await connection.query(
                `SELECT * FROM tb_warehouse ORDER BY id DESC`
            );

            var getidware = cek_id_ware[0].id_ware;
        }

        var [countproduk] = await connection.query(
            `SELECT * FROM tb_produk`
        );

        if (body.loadmorelimit === 1) {
            var limitss = 20;
        } else if (body.loadmorelimit === 0) {
            var limitss = 0;
        } else {
            var limitss = body.loadmorelimit * 20;
        }
        const total_pages = countproduk.length / 20;

        if (body.role === "SUPER-ADMIN") {
            if (body.store === "all") {
                if (body.query === "all") {
                    if (countproduk.length < 20) {
                        var [data_produk] = await connection.query(
                            `SELECT * FROM tb_produk ORDER BY id DESC LIMIT 20`
                        );
                    } else {
                        var [data_produk] = await connection.query(
                            `SELECT * FROM tb_produk ORDER BY id DESC LIMIT 20 OFFSET ${limitss}`
                        );
                    }
                    for (let index = 0; index < data_produk.length; index++) {
                        var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware`);
                        var [detail_variation] = await connection.query(`SELECT *,SUM(qty) as qty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware,size`);
                        var [data_category] = await connection.query(`SELECT * FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                        var [data_warehouse] = await connection.query(`SELECT * FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                        var [data_brand] = await connection.query(`SELECT * FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                        var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);
                        var [display] = await connection.query(`SELECT * FROM displays WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}'`);

                        datas.push({
                            id: data_produk[index].id,
                            id_produk: data_produk[index].id_produk,
                            id_ware: data_produk[index].id_ware,
                            id_brand: data_produk[index].id_brand,
                            id_category: data_produk[index].id_category,
                            tanggal_upload: data_produk[index].tanggal_upload,
                            produk: data_produk[index].produk,
                            deskripsi: data_produk[index].deskripsi,
                            quality: data_produk[index].quality,
                            n_price: parseInt(data_produk[index].n_price) + parseInt(data_area[0].n_price),
                            r_price: parseInt(data_produk[index].r_price) + parseInt(data_area[0].r_price),
                            g_price: parseInt(data_produk[index].g_price) + parseInt(data_area[0].g_price),
                            img: data_produk[index].img,
                            users: data_produk[index].users,
                            created_at: data_produk[index].created_at,
                            updated_at: data_produk[index].updated_at,
                            detail: details,
                            detail_variation: detail_variation,
                            category: data_category,
                            warehouse: data_warehouse,
                            brand: data_brand,
                            display: display,
                        });
                    }
                } else {
                    var [data_produk] = await connection.query(
                        `SELECT tb_produk.*,tb_brand.brand FROM tb_produk LEFT JOIN tb_brand ON tb_produk.id_brand = tb_brand.id_brand WHERE (tb_produk.produk LIKE '%${body.query}%' OR tb_produk.id_produk LIKE '%${body.query}%') ORDER BY tb_produk.id DESC`
                    );

                    for (let index = 0; index < data_produk.length; index++) {
                        // var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk} AND id_ware='${data_produk[index].id_ware}'`);
                        var [detail_variation] = await connection.query(`SELECT *,SUM(qty) as qty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware,size`);
                        var [data_category] = await connection.query(`SELECT * FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                        var [data_warehouse] = await connection.query(`SELECT * FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                        var [data_brand] = await connection.query(`SELECT * FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                        var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);
                        var [display] = await connection.query(`SELECT * FROM displays WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}'`);

                        datas.push({
                            id: data_produk[index].id,
                            id_produk: data_produk[index].id_produk,
                            id_ware: data_produk[index].id_ware,
                            id_brand: data_produk[index].id_brand,
                            id_category: data_produk[index].id_category,
                            tanggal_upload: data_produk[index].tanggal_upload,
                            produk: data_produk[index].produk,
                            deskripsi: data_produk[index].deskripsi,
                            quality: data_produk[index].quality,
                            n_price: parseInt(data_produk[index].n_price) + parseInt(data_area[0].n_price),
                            r_price: parseInt(data_produk[index].r_price) + parseInt(data_area[0].r_price),
                            g_price: parseInt(data_produk[index].g_price) + parseInt(data_area[0].g_price),
                            img: data_produk[index].img,
                            users: data_produk[index].users,
                            created_at: data_produk[index].created_at,
                            updated_at: data_produk[index].updated_at,
                            detail: "",
                            detail_variation: detail_variation,
                            category: data_category,
                            warehouse: data_warehouse,
                            brand: data_brand,
                            display: display,
                        });
                    }
                }
            } else {
                if (body.query === "all") {
                    if (countproduk.length < 20) {
                        var [data_produk] = await connection.query(
                            `SELECT * FROM tb_produk LEFT JOIN tb_store ON tb_produk.id_ware = tb_store.id_ware WHERE tb_store.id_store='${body.store}' ORDER BY tb_produk.id DESC LIMIT 20`
                        );
                    } else {
                        var [data_produk] = await connection.query(
                            `SELECT * FROM tb_produk LEFT JOIN tb_store ON tb_produk.id_ware = tb_store.id_ware WHERE tb_store.id_store='${body.store}' ORDER BY tb_produk.id DESC LIMIT 20 OFFSET ${limitss}`
                        );
                    }
                    for (let index = 0; index < data_produk.length; index++) {
                        var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware`);
                        var [detail_variation] = await connection.query(`SELECT *,SUM(qty) as qty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware,size`);
                        var [data_category] = await connection.query(`SELECT * FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                        var [data_warehouse] = await connection.query(`SELECT * FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                        var [data_brand] = await connection.query(`SELECT * FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                        var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);
                        var [display] = await connection.query(`SELECT * FROM displays WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}'`);

                        datas.push({
                            id: data_produk[index].id,
                            id_produk: data_produk[index].id_produk,
                            id_ware: data_produk[index].id_ware,
                            id_brand: data_produk[index].id_brand,
                            id_category: data_produk[index].id_category,
                            tanggal_upload: data_produk[index].tanggal_upload,
                            produk: data_produk[index].produk,
                            deskripsi: data_produk[index].deskripsi,
                            quality: data_produk[index].quality,
                            n_price: parseInt(data_produk[index].n_price) + parseInt(data_area[0].n_price),
                            r_price: parseInt(data_produk[index].r_price) + parseInt(data_area[0].r_price),
                            g_price: parseInt(data_produk[index].g_price) + parseInt(data_area[0].g_price),
                            img: data_produk[index].img,
                            users: data_produk[index].users,
                            created_at: data_produk[index].created_at,
                            updated_at: data_produk[index].updated_at,
                            detail: details,
                            detail_variation: detail_variation,
                            category: data_category,
                            warehouse: data_warehouse,
                            brand: data_brand,
                            display: display,
                        });
                    }
                } else {
                    var [data_produk] = await connection.query(
                        `SELECT tb_produk.*,tb_brand.brand FROM tb_produk LEFT JOIN tb_brand ON tb_produk.id_brand = tb_brand.id_brand LEFT JOIN tb_store ON tb_produk.id_ware = tb_store.id_ware WHERE (tb_produk.produk LIKE '%${body.query}%' OR tb_produk.id_produk LIKE '%${body.query}%') AND tb_store.id_store='${body.store}' ORDER BY tb_produk.id DESC`
                    );

                    for (let index = 0; index < data_produk.length; index++) {
                        // var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk} AND id_ware='${data_produk[index].id_ware}'`);
                        var [detail_variation] = await connection.query(`SELECT *,SUM(qty) as qty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware,size`);
                        var [data_category] = await connection.query(`SELECT * FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                        var [data_warehouse] = await connection.query(`SELECT * FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                        var [data_brand] = await connection.query(`SELECT * FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                        var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);
                        var [display] = await connection.query(`SELECT * FROM displays WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}'`);

                        datas.push({
                            id: data_produk[index].id,
                            id_produk: data_produk[index].id_produk,
                            id_ware: data_produk[index].id_ware,
                            id_brand: data_produk[index].id_brand,
                            id_category: data_produk[index].id_category,
                            tanggal_upload: data_produk[index].tanggal_upload,
                            produk: data_produk[index].produk,
                            deskripsi: data_produk[index].deskripsi,
                            quality: data_produk[index].quality,
                            n_price: parseInt(data_produk[index].n_price) + parseInt(data_area[0].n_price),
                            r_price: parseInt(data_produk[index].r_price) + parseInt(data_area[0].r_price),
                            g_price: parseInt(data_produk[index].g_price) + parseInt(data_area[0].g_price),
                            img: data_produk[index].img,
                            users: data_produk[index].users,
                            created_at: data_produk[index].created_at,
                            updated_at: data_produk[index].updated_at,
                            detail: "",
                            detail_variation: detail_variation,
                            category: data_category,
                            warehouse: data_warehouse,
                            brand: data_brand,
                            display: display,
                        });
                    }
                }
            }
        } else if (body.role === "HEAD-AREA") {
            if (body.store === "all_area") {
                if (body.query === "all") {
                    if (countproduk.length < 20) {
                        var [data_produk] = await connection.query(
                            `SELECT * FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware WHERE tb_produk.id_ware='${body.area}' ORDER BY tb_produk.id DESC LIMIT 20`
                        );
                    } else {
                        var [data_produk] = await connection.query(
                            `SELECT * FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware WHERE tb_warehouse.id_area='${body.area}' ORDER BY tb_produk.id DESC LIMIT 20 OFFSET ${limitss}`
                        );
                    }
                    for (let index = 0; index < data_produk.length; index++) {
                        var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware`);
                        var [detail_variation] = await connection.query(`SELECT *,SUM(qty) as qty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware,size`);
                        var [data_category] = await connection.query(`SELECT * FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                        var [data_warehouse] = await connection.query(`SELECT * FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                        var [data_brand] = await connection.query(`SELECT * FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                        var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);
                        var [display] = await connection.query(`SELECT * FROM displays WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}'`);

                        datas.push({
                            id: data_produk[index].id,
                            id_produk: data_produk[index].id_produk,
                            id_ware: data_produk[index].id_ware,
                            id_brand: data_produk[index].id_brand,
                            id_category: data_produk[index].id_category,
                            tanggal_upload: data_produk[index].tanggal_upload,
                            produk: data_produk[index].produk,
                            deskripsi: data_produk[index].deskripsi,
                            quality: data_produk[index].quality,
                            n_price: parseInt(data_produk[index].n_price) + parseInt(data_area[0].n_price),
                            r_price: parseInt(data_produk[index].r_price) + parseInt(data_area[0].r_price),
                            g_price: parseInt(data_produk[index].g_price) + parseInt(data_area[0].g_price),
                            img: data_produk[index].img,
                            users: data_produk[index].users,
                            created_at: data_produk[index].created_at,
                            updated_at: data_produk[index].updated_at,
                            detail: details,
                            detail_variation: detail_variation,
                            category: data_category,
                            warehouse: data_warehouse,
                            brand: data_brand,
                            display: display,
                        });
                    }
                } else {
                    var [data_produk] = await connection.query(
                        `SELECT tb_produk.*,tb_brand.brand FROM tb_produk LEFT JOIN tb_brand ON tb_produk.id_brand = tb_brand.id_brand LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware WHERE (tb_produk.produk LIKE '%${body.query}%' OR tb_produk.id_produk LIKE '%${body.query}%') AND tb_warehouse.id_area='${body.area}' AND tb_produk.id_ware != 'EXTERNAL'  ORDER BY tb_produk.id DESC`
                    );

                    for (let index = 0; index < data_produk.length; index++) {
                        // var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk} AND id_ware='${data_produk[index].id_ware}'`);
                        var [detail_variation] = await connection.query(`SELECT *,SUM(qty) as qty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware,size`);
                        var [data_category] = await connection.query(`SELECT * FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                        var [data_warehouse] = await connection.query(`SELECT * FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                        var [data_brand] = await connection.query(`SELECT * FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                        var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);
                        var [display] = await connection.query(`SELECT * FROM displays WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}'`);

                        datas.push({
                            id: data_produk[index].id,
                            id_produk: data_produk[index].id_produk,
                            id_ware: data_produk[index].id_ware,
                            id_brand: data_produk[index].id_brand,
                            id_category: data_produk[index].id_category,
                            tanggal_upload: data_produk[index].tanggal_upload,
                            produk: data_produk[index].produk,
                            deskripsi: data_produk[index].deskripsi,
                            quality: data_produk[index].quality,
                            n_price: parseInt(data_produk[index].n_price) + parseInt(data_area[0].n_price),
                            r_price: parseInt(data_produk[index].r_price) + parseInt(data_area[0].r_price),
                            g_price: parseInt(data_produk[index].g_price) + parseInt(data_area[0].g_price),
                            img: data_produk[index].img,
                            users: data_produk[index].users,
                            created_at: data_produk[index].created_at,
                            updated_at: data_produk[index].updated_at,
                            detail: "",
                            detail_variation: detail_variation,
                            category: data_category,
                            warehouse: data_warehouse,
                            brand: data_brand,
                            display: display,
                        });
                    }
                }
            } else {
                if (body.query === "all") {
                    if (countproduk.length < 20) {
                        var [data_produk] = await connection.query(
                            `SELECT * FROM tb_produk LEFT JOIN tb_store ON tb_produk.id_ware = tb_store.id_ware WHERE tb_store.id_store='${body.store}' ORDER BY tb_produk.id DESC LIMIT 20`
                        );
                    } else {
                        var [data_produk] = await connection.query(
                            `SELECT * FROM tb_produk LEFT JOIN tb_store ON tb_produk.id_ware = tb_store.id_ware WHERE tb_store.id_store='${body.store}' ORDER BY tb_produk.id DESC LIMIT 20 OFFSET ${limitss}`
                        );
                    }
                    for (let index = 0; index < data_produk.length; index++) {
                        var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware`);
                        var [detail_variation] = await connection.query(`SELECT *,SUM(qty) as qty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware,size`);
                        var [data_category] = await connection.query(`SELECT * FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                        var [data_warehouse] = await connection.query(`SELECT * FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                        var [data_brand] = await connection.query(`SELECT * FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                        var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);
                        var [display] = await connection.query(`SELECT * FROM displays WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}'`);

                        datas.push({
                            id: data_produk[index].id,
                            id_produk: data_produk[index].id_produk,
                            id_ware: data_produk[index].id_ware,
                            id_brand: data_produk[index].id_brand,
                            id_category: data_produk[index].id_category,
                            tanggal_upload: data_produk[index].tanggal_upload,
                            produk: data_produk[index].produk,
                            deskripsi: data_produk[index].deskripsi,
                            quality: data_produk[index].quality,
                            n_price: parseInt(data_produk[index].n_price) + parseInt(data_area[0].n_price),
                            r_price: parseInt(data_produk[index].r_price) + parseInt(data_area[0].r_price),
                            g_price: parseInt(data_produk[index].g_price) + parseInt(data_area[0].g_price),
                            img: data_produk[index].img,
                            users: data_produk[index].users,
                            created_at: data_produk[index].created_at,
                            updated_at: data_produk[index].updated_at,
                            detail: details,
                            detail_variation: detail_variation,
                            category: data_category,
                            warehouse: data_warehouse,
                            brand: data_brand,
                            display: display,
                        });
                    }
                } else {
                    var [data_produk] = await connection.query(
                        `SELECT tb_produk.*,tb_brand.brand FROM tb_produk LEFT JOIN tb_brand ON tb_produk.id_brand = tb_brand.id_brand LEFT JOIN tb_store ON tb_produk.id_ware = tb_store.id_ware WHERE (tb_produk.produk LIKE '%${body.query}%' OR tb_produk.id_produk LIKE '%${body.query}%') AND tb_store.id_store='${body.store}' ORDER BY tb_produk.id DESC`
                    );

                    for (let index = 0; index < data_produk.length; index++) {
                        // var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk} AND id_ware='${data_produk[index].id_ware}'`);
                        var [detail_variation] = await connection.query(`SELECT *,SUM(qty) as qty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware,size`);
                        var [data_category] = await connection.query(`SELECT * FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                        var [data_warehouse] = await connection.query(`SELECT * FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                        var [data_brand] = await connection.query(`SELECT * FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                        var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);
                        var [display] = await connection.query(`SELECT * FROM displays WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}'`);

                        datas.push({
                            id: data_produk[index].id,
                            id_produk: data_produk[index].id_produk,
                            id_ware: data_produk[index].id_ware,
                            id_brand: data_produk[index].id_brand,
                            id_category: data_produk[index].id_category,
                            tanggal_upload: data_produk[index].tanggal_upload,
                            produk: data_produk[index].produk,
                            deskripsi: data_produk[index].deskripsi,
                            quality: data_produk[index].quality,
                            n_price: parseInt(data_produk[index].n_price) + parseInt(data_area[0].n_price),
                            r_price: parseInt(data_produk[index].r_price) + parseInt(data_area[0].r_price),
                            g_price: parseInt(data_produk[index].g_price) + parseInt(data_area[0].g_price),
                            img: data_produk[index].img,
                            users: data_produk[index].users,
                            created_at: data_produk[index].created_at,
                            updated_at: data_produk[index].updated_at,
                            detail: "",
                            detail_variation: detail_variation,
                            category: data_category,
                            warehouse: data_warehouse,
                            brand: data_brand,
                            display: display,
                        });
                    }
                }
            }
        } else {
            if (body.query === "all") {
                if (countproduk.length < 20) {
                    var [data_produk] = await connection.query(
                        `SELECT * FROM tb_produk LEFT JOIN tb_store ON tb_produk.id_ware = tb_store.id_ware WHERE tb_store.id_store='${body.store}' ORDER BY tb_produk.id DESC LIMIT 20`
                    );
                } else {
                    var [data_produk] = await connection.query(
                        `SELECT * FROM tb_produk LEFT JOIN tb_store ON tb_produk.id_ware = tb_store.id_ware WHERE tb_store.id_store='${body.store}' ORDER BY tb_produk.id DESC LIMIT 20 OFFSET ${limitss}`
                    );
                }
                for (let index = 0; index < data_produk.length; index++) {
                    var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware`);
                    var [detail_variation] = await connection.query(`SELECT *,SUM(qty) as qty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware,size`);
                    var [data_category] = await connection.query(`SELECT * FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                    var [data_warehouse] = await connection.query(`SELECT * FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                    var [data_brand] = await connection.query(`SELECT * FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                    var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);
                    var [display] = await connection.query(`SELECT * FROM displays WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}'`);

                    datas.push({
                        id: data_produk[index].id,
                        id_produk: data_produk[index].id_produk,
                        id_ware: data_produk[index].id_ware,
                        id_brand: data_produk[index].id_brand,
                        id_category: data_produk[index].id_category,
                        tanggal_upload: data_produk[index].tanggal_upload,
                        produk: data_produk[index].produk,
                        deskripsi: data_produk[index].deskripsi,
                        quality: data_produk[index].quality,
                        n_price: parseInt(data_produk[index].n_price) + parseInt(data_area[0].n_price),
                        r_price: parseInt(data_produk[index].r_price) + parseInt(data_area[0].r_price),
                        g_price: parseInt(data_produk[index].g_price) + parseInt(data_area[0].g_price),
                        img: data_produk[index].img,
                        users: data_produk[index].users,
                        created_at: data_produk[index].created_at,
                        updated_at: data_produk[index].updated_at,
                        detail: details,
                        detail_variation: detail_variation,
                        category: data_category,
                        warehouse: data_warehouse,
                        brand: data_brand,
                        display: display,
                    });
                }
            } else {
                var [data_produk] = await connection.query(
                    `SELECT tb_produk.*,tb_brand.brand FROM tb_produk LEFT JOIN tb_brand ON tb_produk.id_brand = tb_brand.id_brand LEFT JOIN tb_store ON tb_produk.id_ware = tb_store.id_ware WHERE (tb_produk.produk LIKE '%${body.query}%' OR tb_produk.id_produk LIKE '%${body.query}%') AND tb_store.id_store='${body.store}' ORDER BY tb_produk.id DESC`
                );

                for (let index = 0; index < data_produk.length; index++) {
                    // var [details] = await connection.query(`SELECT *,SUM(qty) as qty,COUNT(size) as totalqty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk} AND id_ware='${data_produk[index].id_ware}'`);
                    var [detail_variation] = await connection.query(`SELECT *,SUM(qty) as qty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}' GROUP BY id_ware,size`);
                    var [data_category] = await connection.query(`SELECT * FROM tb_category WHERE id_category='${data_produk[index].id_category}'`);
                    var [data_warehouse] = await connection.query(`SELECT * FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`);
                    var [data_brand] = await connection.query(`SELECT * FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`);
                    var [data_area] = await connection.query(`SELECT tb_area.*,tb_warehouse.id_area,id_ware FROM tb_area LEFT JOIN tb_warehouse ON tb_area.id_area = tb_warehouse.id_area WHERE tb_warehouse.id_ware='${data_produk[index].id_ware}'`);
                    var [display] = await connection.query(`SELECT * FROM displays WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${data_produk[index].id_ware}'`);

                    datas.push({
                        id: data_produk[index].id,
                        id_produk: data_produk[index].id_produk,
                        id_ware: data_produk[index].id_ware,
                        id_brand: data_produk[index].id_brand,
                        id_category: data_produk[index].id_category,
                        tanggal_upload: data_produk[index].tanggal_upload,
                        produk: data_produk[index].produk,
                        deskripsi: data_produk[index].deskripsi,
                        quality: data_produk[index].quality,
                        n_price: parseInt(data_produk[index].n_price) + parseInt(data_area[0].n_price),
                        r_price: parseInt(data_produk[index].r_price) + parseInt(data_area[0].r_price),
                        g_price: parseInt(data_produk[index].g_price) + parseInt(data_area[0].g_price),
                        img: data_produk[index].img,
                        users: data_produk[index].users,
                        created_at: data_produk[index].created_at,
                        updated_at: data_produk[index].updated_at,
                        detail: "",
                        detail_variation: detail_variation,
                        category: data_category,
                        warehouse: data_warehouse,
                        brand: data_brand,
                        display: display,
                    });
                }
            }
        }

        await connection.commit();
        await connection.release();
        return {
            datas,
            total_pages: Math.round(total_pages),
            show_page: limitss,
        };

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const addProduk = async (data, img) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    var rubahnama = data.produk.split(" ");
    for (let xxx = 0; xxx < rubahnama.length; xxx++) {
        rubahnama[xxx] = rubahnama[xxx][0].toUpperCase() + rubahnama[xxx].substring(1);
    }
    var namaproduk = rubahnama.join(" ")
    try {
        await connection.beginTransaction();

        const [cek_produk] = await connection.query(
            `SELECT MAX(id_produk) as id_produk FROM tb_produk`
        );
        if (cek_produk[0].id_produk === null) {
            var id_produk = "10" + tahun + "000001";
        } else {
            const get_last2 = cek_produk[0].id_produk;
            const data_2 = get_last2.toString().slice(-6);
            const hasil = parseInt(data_2) + 1;
            var id_produk = "10" + tahun + String(hasil).padStart(6, "0");
        }

        const [data_wares] = await connection.query(
            `SELECT * FROM tb_warehouse WHERE id_ware != 'EXTERNAL'`
        );

        const [data_sup] = await connection.query(
            `SELECT supplier FROM tb_supplier WHERE id_sup='${data.supplier}'`
        );

        if (data.file === 'null') {
            for (let xx = 0; xx < data_wares.length; xx++) {
                await connection.query(
                    `INSERT INTO tb_produk
                (id_produk, id_ware, id_brand, id_category, tanggal_upload, produk, deskripsi, quality, n_price, r_price, g_price, img, users, created_at, updated_at)
                VALUES ('${id_produk}','${data_wares[xx].id_ware}','${data.brand}','${data.kategori}','${tanggal_skrg}','${namaproduk}','-','${data.quality}','${data.n_price}','${data.r_price}','${data.g_price}','defaultimg.png','${data.users}','${tanggal}','${tanggal}')`
                );
            }
        } else {
            for (let xx = 0; xx < data_wares.length; xx++) {
                await connection.query(
                    `INSERT INTO tb_produk
            (id_produk, id_ware, id_brand, id_category, tanggal_upload, produk, deskripsi, quality, n_price, r_price, g_price, img, users, created_at, updated_at)
            VALUES ('${id_produk}','${data_wares[xx].id_ware}','${data.brand}','${data.kategori}','${tanggal_skrg}','${namaproduk}','-','${data.quality}','${data.n_price}','${data.r_price}','${data.g_price}','${img}','${data.users}','${tanggal}','${tanggal}')`
                );
            }
        }

        const [cek_mutasi] = await connection.query(
            `SELECT MAX(id_mutasi) as id_mutasi FROM tb_mutasistock`
        );
        if (cek_mutasi[0].id_mutasi === null) {
            var id_mutasi = "MT-" + "00000001";
        } else {
            const get_last2 = cek_mutasi[0].id_mutasi;
            const data_2 = get_last2.toString().slice(-8);
            const hasil = parseInt(data_2) + 1;
            var id_mutasi = "MT-" + String(hasil).padStart(8, "0");
        }

        const [cek_act] = await connection.query(
            `SELECT MAX(id_act) as id_act FROM tb_purchaseorder`
        );
        if (cek_act[0].id_act === null) {
            var id_act = "0001";
        } else {
            const get_last2 = cek_act[0].id_act;
            const data_2 = get_last2.toString().slice(-4);
            const hasil = parseInt(data_2) + 1;
            var id_act = String(hasil).padStart(4, "0");
        }

        const [cek_po] = await connection.query(
            `SELECT MAX(idpo) as idpo FROM tb_purchaseorder`
        );
        if (cek_po[0].idpo === null) {
            var idpo = tahun + "0001";
        } else {
            const get_last2 = cek_po[0].idpo;
            const data_2 = get_last2.toString().slice(-4);
            const hasil = parseInt(data_2) + 1;
            var idpo = tahun + String(hasil).padStart(4, "0");
        }

        const [data_ware] = await connection.query(
            `SELECT * FROM tb_warehouse WHERE id_ware='${data.warehouse}'`
        );

        const variasi = JSON.parse(data.variasi)
        const id_area = data_ware[0].id_area

        const [data_wares_variasi] = await connection.query(
            `SELECT * FROM tb_warehouse WHERE id_ware != '${data.warehouse}'`
        );
        for (let indexz = 0; indexz < data_wares_variasi.length; indexz++) {
            for (let bb = 0; bb < variasi.length; bb++) {

                // var rubahsize = variasi[bb].size.split(" ");
                // for (let xxx = 0; xxx < rubahsize.length; xxx++) {
                //     rubahsize[xxx] = rubahsize[xxx][0].toUpperCase() + rubahsize[xxx].substring(1);
                // }
                // var namaproduk = rubahsize.join(" ")

                await connection.query(
                    `INSERT INTO tb_variation
                (tanggal, id_produk, idpo, id_area, id_ware, size, qty, id_act, users, created_at, updated_at)
                VALUES ('${tanggal_skrg}','${id_produk}','${idpo}','${id_area}','${data_wares_variasi[indexz].id_ware}','${variasi[bb].size.toUpperCase()}','0','${id_act}','${data.users}','${tanggal}','${tanggal}')`
                );

            }
        }

        for (let index = 0; index < variasi.length; index++) {
            await connection.query(
                `INSERT INTO tb_variation
            (tanggal, id_produk, idpo, id_area, id_ware, size, qty, id_act, users, created_at, updated_at)
            VALUES ('${tanggal_skrg}','${id_produk}','${idpo}','${id_area}','${data.warehouse}','${variasi[index].size.toUpperCase()}','${variasi[index].stok}','${id_act}','${data.users}','${tanggal}','${tanggal}')`
            );

            await connection.query(
                `INSERT INTO tb_variationorder
            (tanggal, id_produk, idpo, id_sup, id_area, id_ware, size, qty, id_act, tipe_order, users, created_at, updated_at)
            VALUES ('${tanggal_skrg}','${id_produk}','${idpo}','${data.supplier}','${id_area}','${data.warehouse}','${variasi[index].size.toUpperCase()}','${variasi[index].stok}','${id_act}','RELEASE','${data.users}','${tanggal}','${tanggal}')`
            );

            if (variasi[index].stok > 0) {
                await connection.query(
                    `INSERT INTO tb_mutasistock
                (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
                VALUES ('${id_mutasi}','${tanggal_skrg}','BARANG BARU','${data.warehouse}','-','${id_produk}','${namaproduk}','${idpo}','${variasi[index].size.toUpperCase()}','${variasi[index].stok}','Barang Gudang','${data_sup[0].supplier}','ADD_PRODUK','${data.users}','${tanggal}','${tanggal}')`
                );
            }
        }

        // if (data.tipe_po === "PO_BARU") {
        await connection.query(
            `INSERT INTO tb_purchaseorder
                (idpo, tanggal_receive, id_sup, id_produk, id_ware, qty, m_price, total_amount, tipe_order, id_act, users, created_at, updated_at)
                VALUES ('${idpo}','${tanggal_skrg}','${data.supplier}','${id_produk}','${data.warehouse}','${data.qty_all}','${data.hargabeli}','${data.total_amount}','RELEASE','${id_act}','${data.users}','${tanggal}','${tanggal}')`
        );
        // } else {
        //     await connection.query(
        //         `INSERT INTO tb_purchaseorder
        //         (idpo, tanggal_receive, id_sup, id_produk, id_ware, qty, m_price, total_amount, tipe_order, id_act, users, created_at, updated_at)
        //         VALUES ('${data.history_po}','${tanggal_skrg}','${data.supplier}','${id_produk}','${data.warehouse}','${data.qty_all}','${data.hargabeli}','${data.total_amount}','RELEASE','${id_act}','ADMIN','${tanggal}','${tanggal}')`
        //     );
        // }


        await connection.commit();
        await connection.release();
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const editProduk = async (data, img) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    var edit_produk = data.edit_produk[0].toUpperCase() + data.edit_produk.substring(1);
    try {
        await connection.beginTransaction();
        console.log(img)
        console.log(data.edit_produk)
        var edit_g_price = data.edit_g_price.replace(/\D/g, "");
        var edit_r_price = data.edit_r_price.replace(/\D/g, "");
        var edit_n_price = data.edit_n_price.replace(/\D/g, "");
        const [get_id_produk] = await connection.query(
            `SELECT id_produk FROM tb_produk WHERE id='${data.id}'`
        );

        await connection.query(
            `UPDATE tb_produk SET produk='${edit_produk}',id_brand='${data.edit_brand}',id_category='${data.edit_kategori}',quality='${data.edit_quality}',g_price='${edit_g_price}',r_price='${edit_r_price}',n_price='${edit_n_price}',updated_at='${tanggal}' WHERE id_produk='${get_id_produk[0].id_produk}'`
        );

        if (img === null || img === undefined || img === 'undefined') {

        } else {
            await connection.query(
                `UPDATE tb_produk SET img='${img}' WHERE id_produk='${get_id_produk[0].id_produk}'`
            );
        }

        await connection.commit();
        await connection.release();

        return 'oke';
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const deleteProduk = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        await connection.query(
            `DELETE FROM tb_produk WHERE id_produk='${body.id}' AND id_ware='${body.idware}'`
        );

        await connection.query(
            `DELETE FROM tb_variation WHERE id_produk='${body.id}' AND id_ware='${body.idware}'`
        );

        await connection.query(
            `DELETE FROM tb_variationorder WHERE id_produk='${body.id}' AND id_ware='${body.idware}'`
        );

        await connection.query(
            `DELETE FROM tb_purchaseorder WHERE id_produk='${body.id}' AND id_ware='${body.idware}'`
        );

        await connection.commit();
        await connection.release();
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getSizesales = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [datasize] = await connection.query(
            `SELECT *,SUM(qty)as qty FROM tb_variation WHERE id_produk='${body.idproduct}' AND id_ware='${body.idware}' GROUP BY size`
        );
        const [stokready] = await connection.query(
            `SELECT qty,SUM(qty)as qty FROM tb_variation WHERE id_produk='${body.idproduct}' AND id_ware='${body.idware}' AND size='${body.size}' GROUP BY size`
        );
        for (let xox = 0; xox < stokready.length; xox++) {
            var get_stokready = stokready[xox].qty;
        }
        for (let index = 0; index < datasize.length; index++) {
            var [display] = await connection.query(
                `SELECT * FROM displays WHERE id_produk='${datasize[index].id_produk}' AND id_ware='${datasize[index].id_ware}' AND size='${datasize[index].size}'`
            );
            for (let xxx = 0; xxx < display.length; xxx++) {
                var display_id_produk = display[xxx].id_produk;
                var display_id_ware = display[xxx].id_ware;
                var display_size = display[xxx].size;
            }
        }

        const [getwares] = await connection.query(
            `SELECT id_area FROM tb_warehouse WHERE id_ware='${body.idware}'`
        );

        const [gudang_awal] = await connection.query(
            `SELECT warehouse FROM tb_warehouse WHERE id_ware='${body.idware}'`
        );

        const [get_hargajual] = await connection.query(
            `SELECT g_price FROM tb_produk WHERE id_produk='${body.idproduct}' AND id_ware='${body.idware}'`
        );
        // console.log(get_hargajual)
        await connection.commit();
        await connection.release();

        return {
            gudang_awal,
            datasize,
            get_hargajual,
            display_id_produk,
            display_id_ware,
            display_size,
            get_stokready,
        };
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getHistoriposelected = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const datas = [];

        const [data_po] = await connection.query(
            `SELECT tb_purchaseorder.*,SUM(qty) as qty,tb_supplier.supplier FROM tb_purchaseorder LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup WHERE tb_purchaseorder.id_ware='${body.idware}' AND tb_purchaseorder.id_produk='${body.idproduct}' AND tb_purchaseorder.tipe_order != 'TRANSFER IN' AND tb_purchaseorder.tipe_order != 'TRANSFER OUT' AND tb_purchaseorder.tipe_order != 'SO_GUDANG' GROUP BY tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
        );

        for (let index = 0; index < data_po.length; index++) {
            const [data_variationorder] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_variationorder WHERE idpo='${data_po[index].idpo}' AND id_ware='${body.idware}' AND id_produk='${body.idproduct}' GROUP BY size ORDER BY size DESC`
            );

            if (data_po[index].tipe_order === "TRANSFER") {
                const [get_ware] = await connection.query(
                    `SELECT warehouse FROM tb_warehouse WHERE id_ware='${data_po[index].id_sup}'`
                );
                datas.push({
                    id: data_po[index].id,
                    idpo: data_po[index].idpo,
                    tanggal_receive: data_po[index].tanggal_receive,
                    id_sup: data_po[index].id_sup,
                    id_produk: data_po[index].id_produk,
                    id_ware: data_po[index].id_ware,
                    qty: data_po[index].qty,
                    m_price: data_po[index].m_price,
                    total_amount: data_po[index].total_amount,
                    tipe_order: data_po[index].tipe_order,
                    id_act: data_po[index].id_act,
                    users: data_po[index].users,
                    supplier: get_ware[0].warehouse,
                    variation: data_variationorder,
                });
            } else {
                datas.push({
                    id: data_po[index].id,
                    idpo: data_po[index].idpo,
                    tanggal_receive: data_po[index].tanggal_receive,
                    id_sup: data_po[index].id_sup,
                    id_produk: data_po[index].id_produk,
                    id_ware: data_po[index].id_ware,
                    qty: data_po[index].qty,
                    m_price: data_po[index].m_price,
                    total_amount: data_po[index].total_amount,
                    tipe_order: data_po[index].tipe_order,
                    id_act: data_po[index].id_act,
                    users: data_po[index].users,
                    supplier: data_po[index].supplier,
                    variation: data_variationorder,
                });
            }

        }
        console.log(data_po)
        await connection.commit();
        await connection.release();

        return datas;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const repeatStok = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();
        const data = body.data;
        const hargabeli = data.harga_beli_repeat.replace(/\D/g, "")

        var qty_all = 0;
        for (let index = 0; index < data.variasirestock.length; index++) {
            qty_all = qty_all + parseInt(data.variasirestock[index].stok_baru);
        }
        var total_amount = qty_all * parseInt(hargabeli);

        const [cek_mutasi] = await connection.query(
            `SELECT MAX(id_mutasi) as id_mutasi FROM tb_mutasistock`
        );
        if (cek_mutasi[0].id_mutasi === null) {
            var id_mutasi = "MT-" + "00000001";
        } else {
            const get_last2 = cek_mutasi[0].id_mutasi;
            const data_2 = get_last2.toString().slice(-8);
            const hasil = parseInt(data_2) + 1;
            var id_mutasi = "MT-" + String(hasil).padStart(8, "0");
        }

        const [id_ware] = await connection.query(
            `SELECT * FROM tb_warehouse WHERE id_ware='${data.id_gudang_pengirim}'`
        );

        // if (data.tipe_po != "PO_BARU") {
        //     idpo = data.history_po;
        // } else {
        const [cek_po] = await connection.query(
            `SELECT MAX(idpo) as idpo FROM tb_purchaseorder`
        );
        if (cek_po[0].idpo === null) {
            var idpo = tahun + "0001";
        } else {
            const get_last2 = cek_po[0].idpo;
            const data_2 = get_last2.toString().slice(-4);
            const hasil = parseInt(data_2) + 1;
            var idpo = tahun + String(hasil).padStart(4, "0");
        }
        // }
        // var idpo = tanggal_skrg;


        const [cek_act] = await connection.query(
            `SELECT MAX(id_act) as id_act FROM tb_purchaseorder`
        );
        if (cek_act[0].id_act === null) {
            var id_act = "0001";
        } else {
            const get_last2 = cek_act[0].id_act;
            const data_2 = get_last2.toString().slice(-4);
            const hasil = parseInt(data_2) + 1;
            var id_act = String(hasil).padStart(4, "0");
        }

        const [get_product] = await connection.query(
            `SELECT * FROM tb_produk WHERE id_produk='${data.id_produk}'`
        );

        const [get_sup] = await connection.query(
            `SELECT * FROM tb_supplier WHERE id_sup='${data.supplier_pobaru}'`
        );

        const id_area = id_ware[0].id_area
        const variasi = data.variasirestock
        for (let index = 0; index < variasi.length; index++) {
            if (variasi[index] === null) {
            } else {

                await connection.query(
                    `INSERT INTO tb_variation (tanggal, id_produk, idpo, id_area, id_ware, size, qty, id_act, users, created_at, updated_at)
            VALUES ('${tanggal_skrg}','${data.id_produk}','${idpo}','${id_area}','${data.id_gudang_pengirim}','${variasi[index].size}','${variasi[index].stok_baru}','${id_act}','${body.users}','${tanggal}','${tanggal}')`
                );

                await connection.query(
                    `INSERT INTO tb_variationorder (tanggal, id_produk, idpo, id_sup, id_area, id_ware, size, qty, id_act, tipe_order, users, created_at, updated_at)
                VALUES ('${tanggal_skrg}','${data.id_produk}','${idpo}','${data.supplier_pobaru}','${id_area}','${data.id_gudang_pengirim}','${variasi[index].size}','${variasi[index].stok_baru}','${id_act}','RESTOCK','${body.users}','${tanggal}','${tanggal}')`
                );

                if (variasi[index].stok_baru > 0) {
                    await connection.query(
                        `INSERT INTO tb_mutasistock (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
                VALUES ('${id_mutasi}','${tanggal_skrg}','REPEAT STOCK','${data.id_gudang_pengirim}','-','${data.id_produk}','${get_product[0].produk}','${idpo}','${variasi[index].size}','${variasi[index].stok_baru}','Barang Gudang','${get_sup[0].supplier}','RESTOCK','${body.users}','${tanggal}','${tanggal}')`
                    );
                }
            }


        }

        await connection.query(
            `INSERT INTO tb_purchaseorder
            (idpo, tanggal_receive, id_sup, id_produk, id_ware, qty, m_price, total_amount, tipe_order, id_act, users, created_at, updated_at)
            VALUES ('${idpo}','${tanggal_skrg}','${data.supplier_pobaru}','${data.id_produk}','${data.id_gudang_pengirim}','${qty_all}','${hargabeli}','${total_amount}','RESTOCK','${id_act}','${body.users}','${tanggal}','${tanggal}')`
        );

        await connection.commit();
        await connection.release();
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getHargabeliso = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const datas = [];

        const [data_po] = await connection.query(
            `SELECT tb_purchaseorder.*,SUM(qty) as qty,tb_supplier.supplier FROM tb_purchaseorder LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup WHERE tb_purchaseorder.id_ware='${body.idware}' AND tb_purchaseorder.id_produk='${body.idproduct}' AND tb_purchaseorder.tipe_order != "SO_GUDANG" GROUP BY tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
        );

        for (let index = 0; index < data_po.length; index++) {
            const [data_variationorder] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_variationorder WHERE idpo='${data_po[index].idpo}' AND id_ware='${body.idware}' AND id_produk='${body.idproduct}' GROUP BY size ORDER BY size ASC`
            );

            if (data_po[index].tipe_order === "TRANSFER") {
                const [get_ware] = await connection.query(
                    `SELECT warehouse FROM tb_warehouse WHERE id_ware='${data_po[index].id_sup}'`
                );
                datas.push({
                    id: data_po[index].id,
                    idpo: data_po[index].idpo,
                    tanggal_receive: data_po[index].tanggal_receive,
                    id_sup: data_po[index].id_sup,
                    id_produk: data_po[index].id_produk,
                    id_ware: data_po[index].id_ware,
                    qty: data_po[index].qty,
                    m_price: data_po[index].m_price,
                    total_amount: data_po[index].total_amount,
                    tipe_order: data_po[index].tipe_order,
                    id_act: data_po[index].id_act,
                    users: data_po[index].users,
                    supplier: get_ware,
                    variation: data_variationorder,
                });
            } else {
                datas.push({
                    id: data_po[index].id,
                    idpo: data_po[index].idpo,
                    tanggal_receive: data_po[index].tanggal_receive,
                    id_sup: data_po[index].id_sup,
                    id_produk: data_po[index].id_produk,
                    id_ware: data_po[index].id_ware,
                    qty: data_po[index].qty,
                    m_price: data_po[index].m_price,
                    total_amount: data_po[index].total_amount,
                    tipe_order: data_po[index].tipe_order,
                    id_act: data_po[index].id_act,
                    users: data_po[index].users,
                    supplier: data_po[index].supplier,
                    variation: data_variationorder,
                });
            }

        }

        await connection.commit();
        await connection.release();
        return datas;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getHistorisoselected = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const datas = [];

        const [data_po] = await connection.query(
            `SELECT tb_purchaseorder.*,SUM(qty) as qty,tb_supplier.supplier FROM tb_purchaseorder LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup WHERE tb_purchaseorder.id_ware='${body.idware}' AND tb_purchaseorder.id_produk='${body.idproduct}' AND tipe_order="SO_GUDANG" GROUP BY tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
        );

        for (let index = 0; index < data_po.length; index++) {
            const [data_variationorder] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_variationorder WHERE idpo='${data_po[index].idpo}' AND id_ware='${body.idware}' AND id_produk='${body.idproduct}' AND tipe_order="SO_GUDANG" GROUP BY size ORDER BY size DESC`
            );

            if (data_po[index].tipe_order === "TRANSFER") {
                const [get_ware] = await connection.query(
                    `SELECT warehouse FROM tb_warehouse WHERE id_ware='${data_po[index].id_sup}'`
                );
                datas.push({
                    id: data_po[index].id,
                    idpo: data_po[index].idpo,
                    tanggal_receive: data_po[index].tanggal_receive,
                    id_sup: data_po[index].id_sup,
                    id_produk: data_po[index].id_produk,
                    id_ware: data_po[index].id_ware,
                    qty: data_po[index].qty,
                    m_price: data_po[index].m_price,
                    total_amount: data_po[index].total_amount,
                    tipe_order: data_po[index].tipe_order,
                    id_act: data_po[index].id_act,
                    users: data_po[index].users,
                    supplier: get_ware,
                    variation: data_variationorder,
                });
            } else {
                datas.push({
                    id: data_po[index].id,
                    idpo: data_po[index].idpo,
                    tanggal_receive: data_po[index].tanggal_receive,
                    id_sup: data_po[index].id_sup,
                    id_produk: data_po[index].id_produk,
                    id_ware: data_po[index].id_ware,
                    qty: data_po[index].qty,
                    m_price: data_po[index].m_price,
                    total_amount: data_po[index].total_amount,
                    tipe_order: data_po[index].tipe_order,
                    id_act: data_po[index].id_act,
                    users: data_po[index].users,
                    supplier: data_po[index].supplier,
                    variation: data_variationorder,
                });
            }

        }

        await connection.commit();
        await connection.release();
        return datas;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const stockOpname = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();
        const data = body.data;

        var total_qty = 0;
        var qty_all = 0;
        for (let index = 0; index < data.variasirestock.length; index++) {
            qty_all = qty_all + parseInt(data.variasirestock[index].stok_baru);
        }

        const [id_ware] = await connection.query(
            `SELECT * FROM tb_warehouse WHERE id_ware='${data.id_gudang_pengirim}'`
        );

        const [cek_po] = await connection.query(
            `SELECT MAX(idpo) as idpo FROM tb_purchaseorder`
        );
        if (cek_po[0].idpo === null) {
            var idpo = tahun + "0001";
        } else {
            const get_last2 = cek_po[0].idpo;
            const data_2 = get_last2.toString().slice(-4);
            const hasil = parseInt(data_2) + 1;
            var idpo = tahun + String(hasil).padStart(4, "0");
        }

        const [cek_act] = await connection.query(
            `SELECT MAX(id_act) as id_act FROM tb_purchaseorder`
        );
        if (cek_act[0].id_act === null) {
            var id_act = "0001";
        } else {
            const get_last2 = cek_act[0].id_act;
            const data_2 = get_last2.toString().slice(-4);
            const hasil = parseInt(data_2) + 1;
            var id_act = String(hasil).padStart(4, "0");
        }

        const [cek_mutasi] = await connection.query(
            `SELECT MAX(id_mutasi) as id_mutasi FROM tb_mutasistock`
        );
        if (cek_mutasi[0].id_mutasi === null) {
            var id_mutasi = "MT-" + "00000001";
        } else {
            const get_last2 = cek_mutasi[0].id_mutasi;
            const data_2 = get_last2.toString().slice(-8);
            const hasil = parseInt(data_2) + 1;
            var id_mutasi = "MT-" + String(hasil).padStart(8, "0");
        }

        const [get_product] = await connection.query(
            `SELECT produk FROM tb_produk WHERE id_produk='${data.id_produk}'`
        );

        const [get_sup] = await connection.query(
            `SELECT * FROM tb_supplier WHERE id_sup='${data.supplier_pobaru}'`
        );

        const [getwarehouse] = await connection.query(
            `SELECT warehouse FROM tb_warehouse WHERE id_ware='${data.id_gudang_pengirim}'`
        );

        const id_area = id_ware[0].id_area
        const variasi = data.variasirestock
        for (let index = 0; index < variasi.length; index++) {
            if (variasi[index].stok_baru != 0) {
                var [getdatavariation_total] = await connection.query(
                    `SELECT SUM(qty) AS totalqty FROM tb_variation WHERE id_produk='${data.id_produk}' AND id_ware='${data.id_gudang_pengirim}' AND size='${variasi[index].size}' ORDER BY id ASC`
                );

                var [get_modal_last] = await connection.query(
                    `SELECT m_price FROM tb_purchaseorder WHERE id_produk='${data.id_produk}' AND id_ware="${data.id_gudang_pengirim}" ORDER BY id DESC LIMIT 1`
                );

                var [getdatavariation] = await connection.query(
                    `SELECT id_produk,id_ware,idpo,size,qty,id_area FROM tb_variation WHERE id_produk='${data.id_produk}' AND id_ware='${data.id_gudang_pengirim}' AND size='${variasi[index].size}' ORDER BY id ASC`
                );

                for (let x = 0; x < getdatavariation.length; x++) {

                    if (x === (getdatavariation.length - 1)) {
                        await connection.query(
                            `UPDATE tb_variation SET qty='${parseInt(getdatavariation_total[0].totalqty) + parseInt(variasi[index].stok_baru)}',idpo='${idpo}',id_act='${id_act}',updated_at='${tanggal}' WHERE id_produk='${getdatavariation[x].id_produk}' AND id_ware='${getdatavariation[x].id_ware}' AND size='${getdatavariation[x].size}' AND idpo='${getdatavariation[x].idpo}'`
                        );
                    } else {
                        await connection.query(
                            `UPDATE tb_variation SET qty='0',updated_at='${tanggal}' WHERE id_produk='${getdatavariation[x].id_produk}' AND id_ware='${getdatavariation[x].id_ware}' AND size='${getdatavariation[x].size}' AND idpo='${getdatavariation[x].idpo}'`
                        );
                    }

                    if (x === 0) {
                        // Add Variasi Order
                        await connection.query(
                            `INSERT INTO tb_variationorder (tanggal, id_produk, idpo, id_sup, id_area, id_ware, size, qty, id_act, tipe_order, users, created_at, updated_at)
                            VALUES ('${tanggal_skrg}','${getdatavariation[x].id_produk}','${idpo}','${getdatavariation[x].id_ware}','${getdatavariation[x].id_area}','${getdatavariation[x].id_ware}','${variasi[index].size}','${variasi[index].stok_baru}','${id_act}','SO_GUDANG','${body.users}','${tanggal}','${tanggal}')`
                        );

                        // Update Variation Old QTY
                        await connection.query(
                            `INSERT INTO tb_mutasistock
                            (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
                            VALUES ('${id_mutasi}','${tanggal_skrg}','STOCK OPNAME','${getdatavariation[x].id_ware}','-','${getdatavariation[x].id_produk}','${get_product[0].produk}','${idpo}','${variasi[index].size}','${variasi[index].stok_baru}','Barang Gudang','${getwarehouse[0].warehouse}','STOCK OPNAME','${body.users}','${tanggal}','${tanggal}')`
                        );
                        total_qty = total_qty + parseInt(variasi[index].stok_baru);
                    }
                }
            }
        }
        var total_amount = total_qty * parseInt(get_modal_last[0].m_price);

        await connection.query(
            `INSERT INTO tb_purchaseorder
            (idpo, tanggal_receive, id_sup, id_produk, id_ware, qty, m_price, total_amount, tipe_order, id_act, users, created_at, updated_at)
            VALUES ('${idpo}','${tanggal_skrg}','SO_GUDANG','${data.id_produk}','${data.id_gudang_pengirim}','${total_qty}','${get_modal_last[0].m_price}','${total_amount}','SO_GUDANG','${id_act}','${body.users}','${tanggal}','${tanggal}')`
        );

        await connection.commit();
        await connection.release();
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const transferStok = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();
        const data = body;
        // console.log(body.user)
        var qty_all = 0;
        for (let index = 0; index < data.variasitransfer.length; index++) {
            qty_all = qty_all + parseInt(data.variasitransfer[index].stok_baru);
        }
        // console.log(data.variasitransfer);

        const [produk_cek] = await connection.query(
            `SELECT * FROM tb_produk WHERE id_produk='${data.idproduk}' AND id_ware='${data.gudang_pengirim}'`
        );

        // if (produk_cek > 0) {
        // } else {
        //     var [get_produk] = await connection.query(
        //         `SELECT * FROM tb_produk WHERE id_produk='${data.idproduk}' AND id_ware='${data.gudang_pengirim}'`
        //     );

        //     await connection.query(
        //         `INSERT INTO tb_produk
        //         (id_produk, id_ware, id_brand, id_category, tanggal_upload, produk, deskripsi, quality, n_price, r_price, g_price, img, users, created_at, updated_at)
        //         VALUES ('${data.idproduk}','${data.gudang_tujuan}','${get_produk[0].id_brand}','${get_produk[0].id_category}','${tanggal_skrg}','${get_produk[0].produk}','-','${get_produk[0].quality}','${get_produk[0].n_price}','${get_produk[0].r_price}','${get_produk[0].g_price}','${get_produk[0].img}','ADMIN','${tanggal}','${tanggal}')`
        //     );
        // }
        var total_qty = 0;
        var total_modal = 0;

        const [id_ware] = await connection.query(
            `SELECT * FROM tb_warehouse WHERE id_ware='${data.gudang_tujuan}'`
        );

        const [cek_mutasi] = await connection.query(
            `SELECT MAX(id_mutasi) as id_mutasi FROM tb_mutasistock`
        );
        if (cek_mutasi[0].id_mutasi === null) {
            var id_mutasi = "MT-" + "00000001";
        } else {
            const get_last2 = cek_mutasi[0].id_mutasi;
            const data_2 = get_last2.toString().slice(-8);
            const hasil = parseInt(data_2) + 1;
            var id_mutasi = "MT-" + String(hasil).padStart(8, "0");
        }

        const [cek_po] = await connection.query(
            `SELECT MAX(idpo) as idpo FROM tb_purchaseorder`
        );
        if (cek_po[0].idpo === null) {
            var idpo = tahun + "0001";
        } else {
            const get_last2 = cek_po[0].idpo;
            const data_2 = get_last2.toString().slice(-4);
            const hasil = parseInt(data_2) + 1;
            var idpo = tahun + String(hasil).padStart(4, "0");
        }

        const [cek_act] = await connection.query(
            `SELECT MAX(id_act) as id_act FROM tb_purchaseorder`
        );
        if (cek_act[0].id_act === null) {
            var id_act = "0001";
        } else {
            const get_last2 = cek_act[0].id_act;
            const data_2 = get_last2.toString().slice(-4);
            const hasil = parseInt(data_2) + 1;
            var id_act = String(hasil).padStart(4, "0");
        }

        const id_area = id_ware[0].id_area
        const variasi = data.variasitransfer
        var idponext = parseInt(idpo) + parseInt(1);
        console.log(data);

        const [get_products] = await connection.query(
            `SELECT produk FROM tb_produk WHERE id_produk='${data.idproduk}'`
        );

        for (let index = 0; index < variasi.length; index++) {

            if (variasi[index].stok_baru != 0) {
                var qty_transfer = variasi[index].stok_baru;

                // cek stock Variasi
                var [get_var] = await connection.query(
                    `SELECT id_produk,idpo,id_ware,size,qty,id_act,users FROM tb_variation WHERE id_produk='${data.idproduk}' AND id_ware='${data.gudang_pengirim}' AND size='${variasi[index].size}' AND qty > '0' ORDER BY idpo ASC`
                );
                var [get_var_sum] = await connection.query(
                    `SELECT SUM(qty) as totalqty FROM tb_variation WHERE id_produk='${data.idproduk}' AND id_ware='${data.gudang_pengirim}' AND size='${variasi[index].size}' AND qty > '0' ORDER BY idpo ASC`
                );

                var totalqty = get_var_sum[0].totalqty;
                var qty_baru = parseInt(totalqty) - parseInt(qty_transfer);

                var [get_warehouse] = await connection.query(
                    `SELECT warehouse FROM tb_warehouse WHERE id_ware='${data.gudang_pengirim}'`
                );

                for (let i = 0; i < get_var.length; i++) {
                    var get_qty = get_var[i].qty;
                    var qty_baru_single = parseInt(get_qty) - parseInt(qty_transfer);


                    var [get_modal] = await connection.query(
                        `SELECT m_price FROM tb_purchaseorder WHERE id_produk='${data.idproduk}' AND id_ware="${data.gudang_pengirim}" ORDER BY id DESC LIMIT 1`
                    );

                    var [cek_size] = await connection.query(
                        `SELECT * FROM tb_variation WHERE idpo='${idpo}' AND id_ware='${data.gudang_tujuan}' AND id_produk='${data.idproduk}' AND size='${variasi[index].size}' `
                    );

                    if (i === (get_var.length - 1)) {
                        await connection.query(
                            `UPDATE tb_variation SET qty='${qty_baru}',updated_at='${tanggal}' WHERE id_produk='${data.idproduk}' AND id_ware='${data.gudang_pengirim}' AND size='${variasi[index].size}' AND idpo='${get_var[i].idpo}'`
                        );
                    } else {
                        await connection.query(
                            `UPDATE tb_variation SET qty='0',updated_at='${tanggal}' WHERE id_produk='${data.idproduk}' AND id_ware='${data.gudang_pengirim}' AND size='${variasi[index].size}' AND idpo='${get_var[i].idpo}'`
                        );
                    }

                    if (i === 0) {
                        if (cek_size.length > 0) {
                            // Update Variation QTY
                            var cekqty = parseInt(cek_size[0].qty) + parseInt(qty_transfer);
                            await connection.query(
                                `UPDATE tb_variation SET qty='${cekqty}',updated_at='${tanggal}' WHERE idpo='${idpo}' AND id_ware='${data.gudang_tujuan}' AND size='${variasi[index].size}' AND id_produk='${data.idproduk}'`
                            );

                            // Add Variasi Order
                            await connection.query(
                                `INSERT INTO tb_variationorder (tanggal, id_produk, idpo, id_sup, id_area, id_ware, size, qty, id_act, tipe_order, users, created_at, updated_at)
                            VALUES ('${tanggal_skrg}','${data.idproduk}','${idpo}','${data.gudang_pengirim}','${id_area}','${data.gudang_tujuan}','${variasi[index].size}','${qty_transfer}','${id_act}','TRANSFER IN','${data.user}','${tanggal}','${tanggal}')`
                            );

                            // Update Variation Old QTY
                            await connection.query(
                                `INSERT INTO tb_mutasistock
                            (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
                            VALUES ('${id_mutasi}','${tanggal_skrg}','TRANSFER PRODUCT','${data.gudang_tujuan}','-','${data.idproduk}','${get_products[0].produk}','${idpo}','${variasi[index].size}','${qty_transfer}','Barang Gudang','${get_warehouse[0].warehouse}','TRANSFER IN','${data.user}','${tanggal}','${tanggal}')`
                            );
                        } else {
                            // Add Variasi
                            await connection.query(
                                `INSERT INTO tb_variation (tanggal, id_produk, idpo, id_area, id_ware, size, qty, id_act, users, created_at, updated_at)
                            VALUES ('${tanggal_skrg}','${data.idproduk}','${idpo}','${id_area}','${data.gudang_tujuan}','${variasi[index].size}','${qty_transfer}','${id_act}','${data.user}','${tanggal}','${tanggal}')`
                            );

                            // Add Variasi Order
                            await connection.query(
                                `INSERT INTO tb_variationorder (tanggal, id_produk, idpo, id_sup, id_area, id_ware, size, qty, id_act, tipe_order, users, created_at, updated_at)
                            VALUES ('${tanggal_skrg}','${data.idproduk}','${idpo}','${data.gudang_pengirim}','${id_area}','${data.gudang_tujuan}','${variasi[index].size}','${qty_transfer}','${id_act}','TRANSFER IN','${data.user}','${tanggal}','${tanggal}')`
                            );

                            // Update Variation Old QTY
                            await connection.query(
                                `INSERT INTO tb_mutasistock
                            (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
                            VALUES ('${id_mutasi}','${tanggal_skrg}','TRANSFER PRODUCT','${data.gudang_tujuan}','-','${data.idproduk}','${get_products[0].produk}','${idpo}','${variasi[index].size}','${qty_transfer}','Barang Gudang','${get_warehouse[0].warehouse}','TRANSFER IN','${data.user}','${tanggal}','${tanggal}')`
                            );
                        }
                        total_qty = parseInt(total_qty) + parseInt(qty_transfer);
                    }
                    total_modal = parseInt(total_modal) + (parseInt(get_modal[0].m_price) * parseInt(qty_transfer));
                }
            }
        }

        var hasil_total_amount = parseInt(total_qty) * (parseInt(get_modal[0].m_price));
        // Add PO Transfer Gudang Pengiriim
        var hasil_qty = 0 - parseInt(total_qty);
        await connection.query(
            `INSERT INTO tb_purchaseorder
            (idpo, tanggal_receive, id_sup, id_produk, id_ware, qty, m_price, total_amount, tipe_order, id_act, users, created_at, updated_at)
            VALUES ('${idpo}','${tanggal_skrg}','${data.gudang_pengirim}','${data.idproduk}','${data.gudang_tujuan}','${total_qty}','${get_modal[0].m_price}','${hasil_total_amount}','TRANSFER IN','${id_act}','${data.user}','${tanggal}','${tanggal}')`
        );
        // 

        await connection.commit();
        await connection.release();
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

// const print_Stockopname = async (body) => {
//     const connection = await dbPool.getConnection();
//     const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
//     const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
//     const tahun = date.format(new Date(), "YY");
//     try {
//         await connection.beginTransaction();
//         const datas = [];

//         const [data_produk] = await connection.query(
//             `SELECT tb_produk.* FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware WHERE tb_produk.id_ware='${body.id_ware}' ORDER BY tb_produk.id_brand ASC LIMIT 800`
//         );
//         console.log(data_produk.length);

//         for (let index = 0; index < data_produk.length; index++) {


//             const [variasi_validasi] = await connection.query(
//                 `SELECT qty,size,SUM(qty) as qty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${body.id_ware}' GROUP BY size`
//             );
//             var [hitung_total] = await connection.query(
//                 `SELECT qty,SUM(qty) as qty FROM tb_variation WHERE id_produk='${data_produk[index].id_produk}' AND id_ware='${body.id_ware}'`
//             );
//             var [cek_brand] = await connection.query(
//                 `SELECT brand FROM tb_brand WHERE id_brand='${data_produk[index].id_brand}'`
//             );
//             var [get_ware] = await connection.query(
//                 `SELECT warehouse FROM tb_warehouse WHERE id_ware='${data_produk[index].id_ware}'`
//             );

//             datas.push({
//                 id: data_produk[index].id,
//                 id_produk: data_produk[index].id_produk,
//                 id_ware: data_produk[index].id_ware,
//                 warehouse: get_ware[0].warehouse,
//                 produk: data_produk[index].produk,
//                 variation: variasi_validasi,
//                 brand: cek_brand,
//                 hitung_total: hitung_total[0].qty,
//             });
//         }

//         await connection.commit();
//         await connection.release();

//         return datas;
//     } catch (error) {
//         console.log(error);
//         await connection.release();
//     }
// };

const print_Stockopname = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();
        const datas = [];

        const [data_produk] = await connection.query(
            `SELECT 
                tb_produk.id,
                tb_produk.id_produk,
                tb_produk.id_ware,
                tb_produk.produk,
                tb_brand.brand,
                tb_warehouse.warehouse,
                SUM(sub_variation.total_qty) AS total_qty,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'size', sub_variation.size,
                        'qty', sub_variation.total_qty
                    )
                ) AS variation
            FROM tb_produk
            LEFT JOIN (
                SELECT 
                    id_produk, 
                    id_ware, 
                    size, 
                    SUM(qty) AS total_qty
                FROM tb_variation
                GROUP BY id_produk, id_ware, size
            ) AS sub_variation
            ON tb_produk.id_produk = sub_variation.id_produk 
            AND tb_produk.id_ware = sub_variation.id_ware
            LEFT JOIN tb_brand ON tb_brand.id_brand = tb_produk.id_brand
            LEFT JOIN tb_warehouse ON tb_warehouse.id_ware = tb_produk.id_ware
            WHERE tb_produk.id_ware = '${body.id_ware}'
            GROUP BY 
                tb_produk.id_produk, 
                tb_produk.produk, 
                tb_produk.id_ware, 
                tb_brand.brand, 
                tb_warehouse.warehouse
            ORDER BY tb_produk.id_brand ASC`
        );
        for (let index = 0; index < data_produk.length; index++) {
            datas.push({
                id: data_produk[index].id,
                id_produk: data_produk[index].id_produk,
                id_ware: data_produk[index].id_ware,
                warehouse: data_produk[index].warehouse,
                produk: data_produk[index].produk,
                variation: JSON.parse(data_produk[index].variation),
                brand: data_produk[index].brand,
                total_qty: data_produk[index].total_qty,
                total: data_produk.length,
            });
        }
        console.log(datas);

        await connection.commit();
        await connection.release();

        return datas;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getPo = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    const tanggal = body.date;
    const myArray = tanggal.split(" to ");
    const tipepo = body.Filter_Tipe_po;
    const supplier = body.Filter_Supplier;
    const users = body.Filter_Tipe_user;

    if (tanggal.length > 10) {
        var tanggal_start = myArray[0];
        var tanggal_end = myArray[1];
    } else {
        var tanggal_start = tanggal;
        var tanggal_end = tanggal;
    }

    var [get_wares] = await connection.query(
        `SELECT * FROM tb_warehouse GROUP BY id_ware`
    );

    if (body.query === "all") {
        if (supplier === "all") {
            if (users === "all") {
                if (tipepo === "all") {
                    var [get_po] = await connection.query(
                        `SELECT DISTINCT *,users,tanggal_receive FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND qty > 0 AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,users`
                    );
                    var [total_qty] = await connection.query(
                        `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,users`
                    );

                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_qty.length; po++) {
                        if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_qty[po].totalqtys);
                        }
                    }

                    var hasil_amount = 0;
                    var [capital_amount] = await connection.query(
                        `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
                    );
                    for (let x = 0; x < capital_amount.length; x++) {
                        if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                            var hasil_amount = "0";
                        } else {
                            var hasil_amount = parseInt(capital_amount[x].amount);
                        }
                    }
                } else {
                    var [get_po] = await connection.query(
                        `SELECT DISTINCT *,users,tanggal_receive FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND qty > 0 AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tipe_order='${tipepo}' GROUP BY tanggal_receive,users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tipe_order='${tipepo}' GROUP BY tanggal_receive,users`
                    );
                    var [total_qty] = await connection.query(
                        `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tipe_order='${tipepo}' GROUP BY tanggal_receive,users`
                    );

                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_qty.length; po++) {
                        if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_qty[po].totalqtys);
                        }
                    }

                    var hasil_amount = 0;
                    var [capital_amount] = await connection.query(
                        `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tipe_order='${tipepo}'`
                    );
                    for (let x = 0; x < capital_amount.length; x++) {
                        if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                            var hasil_amount = "0";
                        } else {
                            var hasil_amount = parseInt(capital_amount[x].amount);
                        }
                    }
                }
            } else {
                if (tipepo === "all") {
                    var [get_po] = await connection.query(
                        `SELECT DISTINCT *,users,tanggal_receive FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND qty > 0 AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.users='${users}' GROUP BY tanggal_receive,users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.users='${users}' GROUP BY tanggal_receive,users`
                    );
                    var [total_qty] = await connection.query(
                        `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.users='${users}' GROUP BY tanggal_receive,users`
                    );

                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_qty.length; po++) {
                        if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_qty[po].totalqtys);
                        }
                    }

                    var hasil_amount = 0;
                    var [capital_amount] = await connection.query(
                        `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.users='${users}'`
                    );
                    for (let x = 0; x < capital_amount.length; x++) {
                        if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                            var hasil_amount = "0";
                        } else {
                            var hasil_amount = parseInt(capital_amount[x].amount);
                        }
                    }
                } else {
                    var [get_po] = await connection.query(
                        `SELECT DISTINCT *,users,tanggal_receive FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND qty > 0 AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.users='${users}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tanggal_receive,users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.users='${users}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tanggal_receive,users`
                    );
                    var [total_qty] = await connection.query(
                        `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.users='${users}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tanggal_receive,users`
                    );

                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_qty.length; po++) {
                        if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_qty[po].totalqtys);
                        }
                    }

                    var hasil_amount = 0;
                    var [capital_amount] = await connection.query(
                        `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.users='${users}' AND tb_purchaseorder.tipe_order='${tipepo}'`
                    );
                    for (let x = 0; x < capital_amount.length; x++) {
                        if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                            var hasil_amount = "0";
                        } else {
                            var hasil_amount = parseInt(capital_amount[x].amount);
                        }
                    }
                }
            }
        } else {
            if (users === "all") {
                if (tipepo === "all") {
                    var [get_po] = await connection.query(
                        `SELECT DISTINCT *,users,tanggal_receive FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND qty > 0 AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' GROUP BY tanggal_receive,users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' GROUP BY tanggal_receive,users`
                    );
                    var [total_qty] = await connection.query(
                        `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' GROUP BY tanggal_receive,users`
                    );

                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_qty.length; po++) {
                        if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_qty[po].totalqtys);
                        }
                    }

                    var hasil_amount = 0;
                    var [capital_amount] = await connection.query(
                        `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}'`
                    );
                    for (let x = 0; x < capital_amount.length; x++) {
                        if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                            var hasil_amount = "0";
                        } else {
                            var hasil_amount = parseInt(capital_amount[x].amount);
                        }
                    }
                } else {
                    var [get_po] = await connection.query(
                        `SELECT DISTINCT *,users,tanggal_receive FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND qty > 0 AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tanggal_receive,users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tanggal_receive,users`
                    );
                    var [total_qty] = await connection.query(
                        `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tanggal_receive,users`
                    );

                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_qty.length; po++) {
                        if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_qty[po].totalqtys);
                        }
                    }

                    var hasil_amount = 0;
                    var [capital_amount] = await connection.query(
                        `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.tipe_order='${tipepo}'`
                    );
                    for (let x = 0; x < capital_amount.length; x++) {
                        if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                            var hasil_amount = "0";
                        } else {
                            var hasil_amount = parseInt(capital_amount[x].amount);
                        }
                    }
                }
            } else {
                if (tipepo === "all") {
                    var [get_po] = await connection.query(
                        `SELECT DISTINCT *,users,tanggal_receive FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND qty > 0 AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.users='${users}' GROUP BY tanggal_receive,users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.users='${users}' GROUP BY tanggal_receive,users`
                    );
                    var [total_qty] = await connection.query(
                        `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.users='${users}' GROUP BY tanggal_receive,users`
                    );

                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_qty.length; po++) {
                        if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_qty[po].totalqtys);
                        }
                    }

                    var hasil_amount = 0;
                    var [capital_amount] = await connection.query(
                        `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.users='${users}'`
                    );
                    for (let x = 0; x < capital_amount.length; x++) {
                        if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                            var hasil_amount = "0";
                        } else {
                            var hasil_amount = parseInt(capital_amount[x].amount);
                        }
                    }
                } else {
                    var [get_po] = await connection.query(
                        `SELECT DISTINCT *,users,tanggal_receive FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND qty > 0 AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.users='${users}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tanggal_receive,users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.users='${users}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tanggal_receive,users`
                    );
                    var [total_qty] = await connection.query(
                        `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.users='${users}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tanggal_receive,users`
                    );

                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_qty.length; po++) {
                        if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_qty[po].totalqtys);
                        }
                    }

                    var hasil_amount = 0;
                    var [capital_amount] = await connection.query(
                        `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE (tipe_order='RELEASE' OR tipe_order='RESTOCK') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.users='${users}' AND tb_purchaseorder.tipe_order='${tipepo}'`
                    );
                    for (let x = 0; x < capital_amount.length; x++) {
                        if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                            var hasil_amount = "0";
                        } else {
                            var hasil_amount = parseInt(capital_amount[x].amount);
                        }
                    }
                }
            }
        }
    } else {
        if (supplier === "all") {
            if (users === "all") {
                if (tipepo === "all") {
                    var [get_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(tb_purchaseorder.idpo) as totalpo,SUM(tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.qty > 0 AND (tb_produk.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') GROUP BY tb_purchaseorder.tanggal_receive,tb_produk.users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );

                    var [total_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(DISTINCT tb_purchaseorder.idpo) as totalpo,SUM(DISTINCT tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND (tb_produk.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                    );
                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_po.length; po++) {
                        if (total_po[po].totalqtys === null || total_po[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_po[po].totalqtys);
                        }
                    }
                    var hasil_amount = 0;
                    for (let zxc = 0; zxc < total_po.length; zxc++) {
                        var [capital_amount] = await connection.query(
                            `SELECT tb_purchaseorder.*,IFNULL(SUM(DISTINCT tb_purchaseorder.total_amount), 0) AS amount,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive='${get_po[zxc].tanggal_receive}' AND (tb_produk.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                        );
                        for (let x = 0; x < capital_amount.length; x++) {
                            if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                                var hasil_amount = "0";
                            } else {
                                var hasil_amount = parseInt(hasil_amount) + parseInt(capital_amount[0].amount);
                            }
                        }
                    }
                } else {
                    var [get_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(tb_purchaseorder.idpo) as totalpo,SUM(tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.qty > 0 AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tb_purchaseorder.tanggal_receive,tb_produk.users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(DISTINCT tb_purchaseorder.idpo) as totalpo,SUM(DISTINCT tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                    );
                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_po.length; po++) {
                        if (total_po[po].totalqtys === null || total_po[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_po[po].totalqtys);
                        }
                    }
                    var hasil_amount = 0;
                    for (let zxc = 0; zxc < total_po.length; zxc++) {
                        var [capital_amount] = await connection.query(
                            `SELECT tb_purchaseorder.*,IFNULL(SUM(DISTINCT tb_purchaseorder.total_amount), 0) AS amount,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.tanggal_receive='${get_po[zxc].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                        );
                        for (let x = 0; x < capital_amount.length; x++) {
                            if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                                var hasil_amount = "0";
                            } else {
                                var hasil_amount = parseInt(hasil_amount) + parseInt(capital_amount[0].amount);
                            }
                        }
                    }
                }
            } else {
                if (tipepo === "all") {
                    var [get_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(tb_purchaseorder.idpo) as totalpo,SUM(tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.qty > 0 AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.users='${users}' GROUP BY tb_purchaseorder.tanggal_receive,tb_produk.users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(DISTINCT tb_purchaseorder.idpo) as totalpo,SUM(DISTINCT tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.users='${users}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                    );
                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_po.length; po++) {
                        if (total_po[po].totalqtys === null || total_po[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_po[po].totalqtys);
                        }
                    }
                    var hasil_amount = 0;
                    for (let zxc = 0; zxc < total_po.length; zxc++) {
                        var [capital_amount] = await connection.query(
                            `SELECT tb_purchaseorder.*,IFNULL(SUM(DISTINCT tb_purchaseorder.total_amount), 0) AS amount,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.tanggal_receive='${get_po[zxc].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.users='${users}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                        );
                        for (let x = 0; x < capital_amount.length; x++) {
                            if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                                var hasil_amount = "0";
                            } else {
                                var hasil_amount = parseInt(hasil_amount) + parseInt(capital_amount[0].amount);
                            }
                        }
                    }
                } else {
                    var [get_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(tb_purchaseorder.idpo) as totalpo,SUM(tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.qty > 0 AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.users='${users}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tb_purchaseorder.tanggal_receive,tb_produk.users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(DISTINCT tb_purchaseorder.idpo) as totalpo,SUM(DISTINCT tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.users='${users}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                    );
                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_po.length; po++) {
                        if (total_po[po].totalqtys === null || total_po[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_po[po].totalqtys);
                        }
                    }
                    var hasil_amount = 0;
                    for (let zxc = 0; zxc < total_po.length; zxc++) {
                        var [capital_amount] = await connection.query(
                            `SELECT tb_purchaseorder.*,IFNULL(SUM(DISTINCT tb_purchaseorder.total_amount), 0) AS amount,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.tanggal_receive='${get_po[zxc].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.users='${users}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                        );
                        for (let x = 0; x < capital_amount.length; x++) {
                            if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                                var hasil_amount = "0";
                            } else {
                                var hasil_amount = parseInt(hasil_amount) + parseInt(capital_amount[0].amount);
                            }
                        }
                    }
                }
            }
        } else {
            if (users === "all") {
                if (tipepo === "all") {
                    var [get_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(tb_purchaseorder.idpo) as totalpo,SUM(tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.qty > 0 AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${supplier}' GROUP BY tb_purchaseorder.tanggal_receive,tb_produk.users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(DISTINCT tb_purchaseorder.idpo) as totalpo,SUM(DISTINCT tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${supplier}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                    );
                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_po.length; po++) {
                        if (total_po[po].totalqtys === null || total_po[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_po[po].totalqtys);
                        }
                    }
                    var hasil_amount = 0;
                    for (let zxc = 0; zxc < total_po.length; zxc++) {
                        var [capital_amount] = await connection.query(
                            `SELECT tb_purchaseorder.*,IFNULL(SUM(DISTINCT tb_purchaseorder.total_amount), 0) AS amount,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.tanggal_receive='${get_po[zxc].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${supplier}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                        );
                        for (let x = 0; x < capital_amount.length; x++) {
                            if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                                var hasil_amount = "0";
                            } else {
                                var hasil_amount = parseInt(hasil_amount) + parseInt(capital_amount[0].amount);
                            }
                        }
                    }
                } else {
                    var [get_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(tb_purchaseorder.idpo) as totalpo,SUM(tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.qty > 0 AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tb_purchaseorder.tanggal_receive,tb_produk.users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(DISTINCT tb_purchaseorder.idpo) as totalpo,SUM(DISTINCT tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                    );
                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_po.length; po++) {
                        if (total_po[po].totalqtys === null || total_po[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_po[po].totalqtys);
                        }
                    }
                    var hasil_amount = 0;
                    for (let zxc = 0; zxc < total_po.length; zxc++) {
                        var [capital_amount] = await connection.query(
                            `SELECT tb_purchaseorder.*,IFNULL(SUM(DISTINCT tb_purchaseorder.total_amount), 0) AS amount,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.tanggal_receive='${get_po[zxc].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                        );
                        for (let x = 0; x < capital_amount.length; x++) {
                            if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                                var hasil_amount = "0";
                            } else {
                                var hasil_amount = parseInt(hasil_amount) + parseInt(capital_amount[0].amount);
                            }
                        }
                    }
                }
            } else {
                if (tipepo === "all") {
                    var [get_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(tb_purchaseorder.idpo) as totalpo,SUM(tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.qty > 0 AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.users='${users}' GROUP BY tb_purchaseorder.tanggal_receive,tb_produk.users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(DISTINCT tb_purchaseorder.idpo) as totalpo,SUM(DISTINCT tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.users='${users}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                    );
                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_po.length; po++) {
                        if (total_po[po].totalqtys === null || total_po[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_po[po].totalqtys);
                        }
                    }
                    var hasil_amount = 0;
                    for (let zxc = 0; zxc < total_po.length; zxc++) {
                        var [capital_amount] = await connection.query(
                            `SELECT tb_purchaseorder.*,IFNULL(SUM(DISTINCT tb_purchaseorder.total_amount), 0) AS amount,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.tanggal_receive='${get_po[zxc].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.users='${users}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                        );
                        for (let x = 0; x < capital_amount.length; x++) {
                            if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                                var hasil_amount = "0";
                            } else {
                                var hasil_amount = parseInt(hasil_amount) + parseInt(capital_amount[0].amount);
                            }
                        }
                    }
                } else {
                    var [get_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(tb_purchaseorder.idpo) as totalpo,SUM(tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.qty > 0 AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.users='${users}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tb_purchaseorder.tanggal_receive,tb_produk.users ORDER BY tb_purchaseorder.tanggal_receive DESC`
                    );
                    var [total_po] = await connection.query(
                        `SELECT tb_purchaseorder.*,COUNT(DISTINCT tb_purchaseorder.idpo) as totalpo,SUM(DISTINCT tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.users='${users}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                    );
                    var hasil_totalqty = 0;
                    for (let po = 0; po < total_po.length; po++) {
                        if (total_po[po].totalqtys === null || total_po[po].totalqtys === "") {
                            var hasil_totalqty = "0";
                        } else {
                            var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_po[po].totalqtys);
                        }
                    }
                    var hasil_amount = 0;
                    for (let zxc = 0; zxc < total_po.length; zxc++) {
                        var [capital_amount] = await connection.query(
                            `SELECT tb_purchaseorder.*,IFNULL(SUM(DISTINCT tb_purchaseorder.total_amount), 0) AS amount,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.tanggal_receive='${get_po[zxc].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${supplier}' AND tb_purchaseorder.users='${users}' AND tb_purchaseorder.tipe_order='${tipepo}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                        );
                        for (let x = 0; x < capital_amount.length; x++) {
                            if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                                var hasil_amount = "0";
                            } else {
                                var hasil_amount = parseInt(hasil_amount) + parseInt(capital_amount[0].amount);
                            }
                        }
                    }
                }
            }
        }
    }

    const datas = [];

    try {
        await connection.beginTransaction();
        var total_qty = 0;
        var total_cost = 0;
        for (let index = 0; index < get_po.length; index++) {

            if (body.query === "all") {
                if (supplier === "all") {
                    if (users === "all") {
                        if (tipepo === "all") {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND tb_purchaseorder.users='${get_po[index].users}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        } else {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND tb_purchaseorder.users='${get_po[index].users}' AND tb_purchaseorder.tipe_order='${get_po[index].tipe_order}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        }
                    } else {
                        if (tipepo === "all") {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND tb_purchaseorder.users='${get_po[index].users}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        } else {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND tb_purchaseorder.users='${get_po[index].users}' AND tb_purchaseorder.tipe_order='${get_po[index].tipe_order}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        }
                    }
                } else {
                    if (users === "all") {
                        if (tipepo === "all") {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND tb_purchaseorder.id_sup='${get_po[index].id_sup}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        } else {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND tb_purchaseorder.id_sup='${get_po[index].id_sup}' AND tb_purchaseorder.tipe_order='${get_po[index].tipe_order}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        }
                    } else {
                        if (tipepo === "all") {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND tb_purchaseorder.id_sup='${get_po[index].id_sup}' AND tb_purchaseorder.users='${get_po[index].users}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        } else {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND tb_purchaseorder.id_sup='${get_po[index].id_sup}' AND tb_purchaseorder.users='${get_po[index].users}' AND tb_purchaseorder.tipe_order='${get_po[index].tipe_order}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        }
                    }
                }
            } else {
                if (supplier === "all") {
                    if (users === "all") {
                        if (tipepo === "all") {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.users='${get_po[index].users}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        } else {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.users='${get_po[index].users}' AND tb_purchaseorder.tipe_order='${get_po[index].tipe_order}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        }
                    } else {
                        if (tipepo === "all") {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.users='${get_po[index].users}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        } else {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.users='${get_po[index].users}' AND tb_purchaseorder.tipe_order='${get_po[index].tipe_order}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        }
                    }
                } else {
                    if (users === "all") {
                        if (tipepo === "all") {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${get_po[index].id_sup}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        } else {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${get_po[index].id_sup}' AND tb_purchaseorder.tipe_order='${get_po[index].tipe_order}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        }
                    } else {
                        if (tipepo === "all") {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${get_po[index].id_sup}' AND tb_purchaseorder.users='${get_po[index].users}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        } else {
                            var [get_detail] = await connection.query(
                                `SELECT tb_purchaseorder.*,tb_produk.produk,tb_supplier.supplier,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.id_sup='${get_po[index].id_sup}' AND tb_purchaseorder.users='${get_po[index].users}' AND tb_purchaseorder.tipe_order='${get_po[index].tipe_order}' AND tb_purchaseorder.qty > '0' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                            );
                        }
                    }
                }
            }

            const datas2 = [];

            for (let i = 0; i < get_detail.length; i++) {

                if (body.query === "all") {
                    if (supplier === "all") {
                        if (tipepo === "all") {
                            var [get_total] = await connection.query(
                                `SELECT SUM(tb_purchaseorder.total_amount) as hasil_amount,SUM(tb_purchaseorder.qty) as hasil_qty FROM tb_purchaseorder WHERE tb_purchaseorder.tanggal_receive='${get_detail[i].tanggal_receive}' AND tb_purchaseorder.users='${get_detail[i].users}' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tipe_order != 'DEFECT OUT' AND tb_purchaseorder.qty > '0' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                            );
                        } else {
                            var [get_total] = await connection.query(
                                `SELECT SUM(tb_purchaseorder.total_amount) as hasil_amount,SUM(tb_purchaseorder.qty) as hasil_qty FROM tb_purchaseorder WHERE tb_purchaseorder.tanggal_receive='${get_detail[i].tanggal_receive}' AND tb_purchaseorder.users='${get_detail[i].users}' AND tb_purchaseorder.tipe_order='${get_detail[i].tipe_order}' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tipe_order != 'DEFECT OUT' AND tb_purchaseorder.qty > '0' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                            );
                        }
                    } else {
                        if (tipepo === "all") {
                            var [get_total] = await connection.query(
                                `SELECT SUM(tb_purchaseorder.total_amount) as hasil_amount,SUM(tb_purchaseorder.qty) as hasil_qty FROM tb_purchaseorder WHERE tb_purchaseorder.tanggal_receive='${get_detail[i].tanggal_receive}' AND tb_purchaseorder.users='${get_detail[i].users}' AND tb_purchaseorder.id_sup='${get_detail[i].id_sup}' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tipe_order != 'DEFECT OUT' AND tb_purchaseorder.qty > '0' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                            );
                        } else {
                            var [get_total] = await connection.query(
                                `SELECT SUM(tb_purchaseorder.total_amount) as hasil_amount,SUM(tb_purchaseorder.qty) as hasil_qty FROM tb_purchaseorder WHERE tb_purchaseorder.tanggal_receive='${get_detail[i].tanggal_receive}' AND tb_purchaseorder.users='${get_detail[i].users}' AND tb_purchaseorder.id_sup='${get_detail[i].id_sup}' AND tb_purchaseorder.tipe_order='${get_detail[i].tipe_order}' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tipe_order != 'DEFECT OUT' AND tb_purchaseorder.qty > '0' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                            );
                        }
                    }
                } else {
                    if (supplier === "all") {
                        if (tipepo === "all") {
                            var [get_total] = await connection.query(
                                `SELECT SUM(tb_purchaseorder.total_amount) as hasil_amount,SUM(tb_purchaseorder.qty) as hasil_qty FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tanggal_receive='${get_detail[i].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.users='${get_detail[i].users}' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tipe_order != 'DEFECT OUT' AND tb_purchaseorder.qty > '0' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                            );
                        } else {
                            var [get_total] = await connection.query(
                                `SELECT SUM(tb_purchaseorder.total_amount) as hasil_amount,SUM(tb_purchaseorder.qty) as hasil_qty FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tanggal_receive='${get_detail[i].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.users='${get_detail[i].users}' AND tb_purchaseorder.tipe_order='${get_detail[i].tipe_order}' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tipe_order != 'DEFECT OUT' AND tb_purchaseorder.qty > '0' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                            );
                        }
                    } else {
                        if (tipepo === "all") {
                            var [get_total] = await connection.query(
                                `SELECT SUM(tb_purchaseorder.total_amount) as hasil_amount,SUM(tb_purchaseorder.qty) as hasil_qty FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tanggal_receive='${get_detail[i].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.users='${get_detail[i].users}' AND tb_purchaseorder.id_sup='${get_detail[i].id_sup}' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tipe_order != 'DEFECT OUT' AND tb_purchaseorder.qty > '0' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                            );
                        } else {
                            var [get_total] = await connection.query(
                                `SELECT SUM(tb_purchaseorder.total_amount) as hasil_amount,SUM(tb_purchaseorder.qty) as hasil_qty FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tanggal_receive='${get_detail[i].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tb_purchaseorder.users='${get_detail[i].users}' AND tb_purchaseorder.id_sup='${get_detail[i].id_sup}' AND tb_purchaseorder.tipe_order='${get_detail[i].tipe_order}' AND (tb_purchaseorder.tipe_order='RELEASE' OR tb_purchaseorder.tipe_order='RESTOCK') AND tb_purchaseorder.tipe_order != 'DEFECT OUT' AND tb_purchaseorder.qty > '0' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
                            );
                        }
                    }
                }

                datas2.push({
                    id: get_po[index].id,
                    idpo: get_detail[i].idpo,
                    tanggal_receive: get_detail[i].tanggal_receive,
                    id_sup: get_detail[i].id_sup,
                    id_produk: get_detail[i].id_produk,
                    id_ware: get_detail[i].id_ware,
                    qty: get_detail[i].qty,
                    m_price: get_detail[i].m_price,
                    total_amount: get_detail[i].total_amount,
                    tipe_order: get_detail[i].tipe_order,
                    id_act: get_detail[i].id_act,
                    produk: get_detail[i].produk,
                    gudang: get_detail[i].warehouse,
                    supplier: get_detail[i].supplier,
                });

                total_qty = (0 + parseInt(get_total[0].hasil_qty));
                total_cost = (0 + parseInt(get_total[0].hasil_amount));
            }

            datas.push({
                tanggal: get_po[index].tanggal_receive,
                id_so: get_po[index].idpo,
                users: get_po[index].users,
                total_qty: total_qty,
                total_cost: total_cost,
                detail: datas2,
            });

            var created_at = get_po[index].tanggal_receive;
        }

        await connection.commit();
        await connection.release();
        return {
            datas,
            total_po: get_po.length ? get_po.length : 0,
            total_qty: hasil_totalqty,
            capital_amount: hasil_amount ? hasil_amount : 0,
            created_at: created_at,
        };

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getHistoripo = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [data_historypo] = await connection.query(
            `SELECT * FROM tb_purchaseorder WHERE tipe_order != "TRANSFER" AND tipe_order != "SO_GUDANG" GROUP BY idpo ORDER BY id DESC LIMIT 1`
        );

        await connection.commit();
        await connection.release();

        return data_historypo;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const get_Sizepo = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [data_getsize] = await connection.query(
            `SELECT *,SUM(qty)as qty FROM tb_variationorder WHERE id_act='${body.id_act}' GROUP BY size`
        );

        await connection.commit();
        await connection.release();
        return data_getsize;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const editPo = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    const [cek_mutasi] = await connection.query(
        `SELECT MAX(id_mutasi) as id_mutasi FROM tb_mutasistock`
    );
    const id_mutasi = cek_mutasi[0].id_mutasi === null
        ? "MT-00000001"
        : "MT-" + String(parseInt(cek_mutasi[0].id_mutasi.slice(-8)) + 1).padStart(8, "0");

    try {
        await connection.beginTransaction();
        const variasi = body.data.variasirestock;
        let total_qty = 0;

        const [produk_baru] = await connection.query(
            `SELECT produk FROM tb_produk WHERE id_produk='${body.idproduk}' AND id_ware='${body.id_ware}'`
        );

        const [getpo] = await connection.query(
            `SELECT m_price, id_sup, idpo FROM tb_purchaseorder WHERE id_act='${body.id_act}'`
        );

        const [getsupplier] = await connection.query(
            `SELECT supplier FROM tb_supplier WHERE id_sup='${getpo[0].id_sup}'`
        );

        for (let index = 0; index < variasi.length; index++) {
            const size = variasi[index].size;
            const stokLama = parseInt(variasi[index].stok_lama);
            const stokBaru = parseInt(variasi[index].stok_baru);
            const selisih = stokBaru - stokLama;

            if (stokLama !== stokBaru) {
                const [getdatavariation_all] = await connection.query(
                    `SELECT id, qty FROM tb_variation WHERE id_produk='${body.idproduk}' AND id_ware='${body.id_ware}' AND size='${size}' AND qty != 0 ORDER BY id ASC`
                );

                let remainingSelisih = Math.abs(selisih);
                for (let x = 0; x < getdatavariation_all.length; x++) {
                    const { id, qty } = getdatavariation_all[x];

                    if (selisih > 0) { // Penambahan stok
                        const addQty = Math.min(remainingSelisih, stokBaru - stokLama);
                        await connection.query(
                            `UPDATE tb_variation SET qty=qty + ${addQty}, updated_at='${tanggal}' WHERE id=${id}`
                        );
                        remainingSelisih -= addQty;
                    } else if (selisih < 0) { // Pengurangan stok
                        const subtractQty = Math.min(remainingSelisih, qty);
                        await connection.query(
                            `UPDATE tb_variation SET qty=qty - ${subtractQty}, updated_at='${tanggal}' WHERE id=${id}`
                        );
                        remainingSelisih -= subtractQty;
                    }

                    if (remainingSelisih <= 0) break;
                }

                if (selisih > 0 && remainingSelisih > 0) {
                    // Jika stok baru lebih besar dan data tidak cukup, tambahkan baris baru
                    await connection.query(
                        `INSERT INTO tb_variation (id_produk, id_ware, idpo, size, qty, id_area, id_act, created_at, updated_at) \
                        VALUES ('${body.idproduk}', '${body.id_ware}', '${getpo[0].idpo}', '${size}', '${remainingSelisih}', '${body.id_area}', '${body.id_act}', '${tanggal}', '${tanggal}')`
                    );
                }

                await connection.query(
                    `UPDATE tb_variationorder SET qty='${stokBaru}', updated_at='${tanggal}' \
                    WHERE id_produk='${body.idproduk}' AND id_ware='${body.id_ware}' AND size='${size}' AND id_act='${body.id_act}'`
                );

                await connection.query(
                    `INSERT INTO tb_mutasistock (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at) \
                    VALUES ('${id_mutasi}', '${tanggal_skrg}', 'EDIT DATA PO', '${body.id_ware}', '-', '${body.idproduk}', '${produk_baru[0].produk}', '${getpo[0].idpo}', '${size}', '${stokBaru}', 'Barang Gudang', '${getsupplier[0].supplier}', 'EDIT DATA PO', '${body.users}', '${tanggal}', '${tanggal}')`
                );
            }

            total_qty += stokBaru;
        }

        const [getpovariationorder] = await connection.query(
            `SELECT SUM(qty) AS totals FROM tb_variationorder WHERE id_act='${body.id_act}'`
        );

        await connection.query(
            `UPDATE tb_purchaseorder SET total_amount='${parseInt(body.m_price) * parseInt(getpovariationorder[0].totals)}', qty='${getpovariationorder[0].totals}', m_price='${body.m_price}', updated_at='${tanggal}' WHERE id_act='${body.id_act}'`
        );

        const [gettborder] = await connection.query(
            `SELECT m_price FROM tb_order WHERE id_produk='${body.idproduk}' AND id_ware='${body.id_ware}' AND m_price='0'`
        );

        for (let zzz = 0; zzz < gettborder.length; zzz++) {
            await connection.query(
                `UPDATE tb_order SET m_price='${body.m_price}' WHERE id_produk='${body.idproduk}' AND id_ware='${body.id_ware}' AND m_price='0'`
            );
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error(error);
    } finally {
        await connection.release();
    }
};

const deleteItem = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");


    const [cek_po] = await connection.query(
        `SELECT MAX(idpo) as idpo FROM tb_purchaseorder`
    );
    if (cek_po[0].idpo === null) {
        var idpo = tahun + "0001";
    } else {
        const get_last2 = cek_po[0].idpo;
        const data_2 = get_last2.toString().slice(-4);
        const hasil = parseInt(data_2) + 1;
        var idpo = tahun + String(hasil).padStart(4, "0");
    }

    const [cek_act] = await connection.query(
        `SELECT MAX(id_act) as id_act FROM tb_purchaseorder`
    );
    if (cek_act[0].id_act === null) {
        var id_act = "0001";
    } else {
        const get_last2 = cek_act[0].id_act;
        const data_2 = get_last2.toString().slice(-4);
        const hasil = parseInt(data_2) + 1;
        var id_act = String(hasil).padStart(4, "0");
    }

    const [cek_mutasi] = await connection.query(
        `SELECT MAX(id_mutasi) as id_mutasi FROM tb_mutasistock`
    );
    if (cek_mutasi[0].id_mutasi === null) {
        var id_mutasi = "MT-" + "00000001";
    } else {
        const get_last2 = cek_mutasi[0].id_mutasi;
        const data_2 = get_last2.toString().slice(-8);
        const hasil = parseInt(data_2) + 1;
        var id_mutasi = "MT-" + String(hasil).padStart(8, "0");
    }

    try {
        await connection.beginTransaction();

        var [getpo] = await connection.query(
            `SELECT tb_variationorder.*,tb_purchaseorder.id_sup,tb_purchaseorder.qty AS totalqty,tb_purchaseorder.m_price FROM tb_variationorder LEFT JOIN tb_purchaseorder ON tb_variationorder.id_act = tb_purchaseorder.id_act WHERE tb_variationorder.id_act='${body.id_act}'  ORDER BY tb_variationorder.id ASC`
        );

        var [getpo_order] = await connection.query(
            `SELECT tb_variationorder.qty,tb_variationorder.id_sup,tb_variationorder.idpo FROM tb_variationorder LEFT JOIN tb_purchaseorder ON tb_variationorder.id_act = tb_purchaseorder.id_act WHERE tb_variationorder.id_act='${body.id_act}' ORDER BY tb_variationorder.id ASC`
        );

        var [get_var_sum] = await connection.query(
            `SELECT SUM(qty) AS totalqty FROM tb_variation WHERE id_produk='${getpo[0].id_produk}' AND id_ware='${getpo[0].id_ware}' AND size='${getpo[0].size}' AND qty > '0' ORDER BY idpo ASC`
        );

        const [getproducts] = await connection.query(
            `SELECT produk FROM tb_produk WHERE id_produk='${getpo[0].id_produk}'`
        );

        const [getwarehouse] = await connection.query(
            `SELECT warehouse FROM tb_warehouse WHERE id_ware='${getpo[0].id_ware}'`
        );

        var totalqty = 0;
        for (let index = 0; index < getpo.length; index++) {
            totalqty = parseInt(totalqty) + parseInt(getpo_order[index].qty);
            if (getpo[index].qty < 0) {

                await connection.query(
                    `UPDATE tb_variation SET qty='${getpo_order[index].qty}',id_ware='${getpo_order[index].id_sup}',idpo='${getpo_order[index].idpo}',updated_at='${tanggal}' WHERE id_act='${body.id_act}' AND size='${getpo[index].size}'`
                );

                await connection.query(
                    `UPDATE tb_variationorder SET qty='0',tipe_order='CANCEL TRANSFER',updated_at='${tanggal}' WHERE id_act='${body.id_act}'`
                );
            } else {

                await connection.query(
                    `UPDATE tb_variation SET qty='${getpo_order[index].qty}',id_ware='${getpo_order[index].id_sup}',idpo='${getpo_order[index].idpo}',updated_at='${tanggal}' WHERE id_act='${body.id_act}' AND size='${getpo[index].size}'`
                );

                await connection.query(
                    `UPDATE tb_variationorder SET qty='0',tipe_order='CANCEL TRANSFER',updated_at='${tanggal}' WHERE id_act='${body.id_act}'`
                );
            }

            // // Update Variation Old QTY
            await connection.query(
                `INSERT INTO tb_mutasistock
            (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
            VALUES ('${id_mutasi}','${tanggal_skrg}','CANCEL TRANSFER','${getpo[index].id_sup}','-','${getpo[index].id_produk}','${getproducts[0].produk}','${getpo[index].idpo}','${getpo[index].size}','${getpo[index].qty}','Barang Gudang','${getwarehouse[0].warehouse}','CANCEL TRANSFER','${body.users}','${tanggal}','${tanggal}')`
            );
        }
        await connection.query(
            `UPDATE tb_purchaseorder SET qty='${totalqty}',m_price='${getpo[0].m_price}',total_amount='0',tipe_order='CANCEL TRANSFER',updated_at='${tanggal}' WHERE id_act='${body.id_act}'`
        );

        await connection.commit();
        await connection.release();
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const deletePo = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();



        await connection.query(
            `DELETE FROM tb_variation WHERE idpo='${body.id_po}'`
        );

        await connection.query(
            `DELETE FROM tb_variationorder WHERE idpo='${body.id_po}'`
        );

        await connection.query(
            `DELETE FROM tb_purchaseorder WHERE idpo='${body.id_po}'`
        );

        await connection.commit();
        await connection.release();
        // console.log(body);
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getHistoriso = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [data_historyso] = await connection.query(
            `SELECT * FROM tb_purchaseorder WHERE tipe_order = "SO_GUDANG" GROUP BY idpo ORDER BY id DESC LIMIT 5`
        );

        await connection.commit();
        await connection.release();

        return data_historyso;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getSo = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    const tanggal = body.date;
    const myArray = tanggal.split(" to ");

    if (tanggal.length > 10) {
        var tanggal_start = myArray[0];
        var tanggal_end = myArray[1];
    } else {
        var tanggal_start = tanggal;
        var tanggal_end = tanggal;
    }

    const datas = [];

    if (body.query != "all") {
        var [get_po] = await connection.query(
            `SELECT * FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_produk.id_produk = tb_purchaseorder.id_produk WHERE tipe_order='SO_GUDANG' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,tb_purchaseorder.users`
        );

        var [total_po] = await connection.query(
            `SELECT tb_purchaseorder.*,COUNT(DISTINCT tb_purchaseorder.idpo) as totalpo,SUM(DISTINCT tb_purchaseorder.qty) as totalqtys,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tipe_order='SO_GUDANG' AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
        );
        var hasil_totalqty = 0;
        for (let po = 0; po < total_po.length; po++) {
            if (total_po[po].totalqtys === null || total_po[po].totalqtys === "") {
                var hasil_totalqty = "0";
            } else {
                var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_po[po].totalqtys);
            }
        }
        var hasil_amount = 0;
        for (let zxc = 0; zxc < total_po.length; zxc++) {
            var [capital_amount] = await connection.query(
                `SELECT tb_purchaseorder.*,IFNULL(SUM(DISTINCT tb_purchaseorder.total_amount), 0) AS amount,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tipe_order='SO_GUDANG' AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tb_purchaseorder.tanggal_receive='${get_po[zxc].tanggal_receive}' AND (tb_purchaseorder.id_produk LIKE '%${body.query}%' OR tb_produk.produk LIKE '%${body.query}%') GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = parseInt(hasil_amount) + parseInt(capital_amount[0].amount);
                }
            }
        }
    } else {
        var [get_po] = await connection.query(
            `SELECT * FROM tb_purchaseorder  WHERE tipe_order='SO_GUDANG' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,users`
        );

        var [total_po] = await connection.query(
            `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='SO_GUDANG' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,users`
        );
        var [total_qty] = await connection.query(
            `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='SO_GUDANG' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,users`
        );

        var hasil_totalqty = 0;
        for (let po = 0; po < total_qty.length; po++) {
            if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                var hasil_totalqty = "0";
            } else {
                var hasil_totalqty = parseInt(hasil_totalqty) + parseInt(total_qty[po].totalqtys);
            }
        }

        var hasil_amount = 0;
        var [capital_amount] = await connection.query(
            `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order='SO_GUDANG' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );
        for (let x = 0; x < capital_amount.length; x++) {
            if (capital_amount[x].amount === null || capital_amount[x].amount === "") {
                var hasil_amount = "0";
            } else {
                var hasil_amount = parseInt(capital_amount[x].amount);
            }
        }
    }

    try {
        await connection.beginTransaction();
        var total_qty = 0;
        var total_cost = 0;

        for (let index = 0; index < get_po.length; index++) {
            var [get_detail] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE tanggal_receive='${get_po[index].tanggal_receive}' AND tipe_order='SO_GUDANG' GROUP BY id_act ORDER BY id DESC`
            );
            const datas2 = [];

            for (let i = 0; i < get_detail.length; i++) {
                var [get_produk] = await connection.query(
                    `SELECT * FROM tb_produk WHERE id_produk='${get_detail[i].id_produk}' `
                );

                var [get_ware] = await connection.query(
                    `SELECT * FROM tb_warehouse WHERE id_ware='${get_detail[i].id_ware}'`
                );

                var [get_supplier] = await connection.query(
                    `SELECT supplier FROM tb_supplier WHERE id_sup='${get_detail[i].id_sup}'`
                );

                if (get_detail[i].tipe_order === "TRANSFER") {
                    datas2.push({
                        id: get_po[index].id,
                        idpo: get_detail[i].idpo,
                        tanggal_receive: get_detail[i].tanggal_receive,
                        id_sup: get_detail[i].id_sup,
                        id_produk: get_detail[i].id_produk,
                        id_ware: get_detail[i].id_ware,
                        qty: get_detail[i].qty,
                        m_price: get_detail[i].m_price,
                        total_amount: get_detail[i].total_amount,
                        tipe_order: get_detail[i].tipe_order,
                        id_act: get_detail[i].id_act,
                        produk: get_produk[0].produk,
                        gudang: get_ware[0].warehouse,
                        supplier: get_detail[i].id_sup,
                    });
                } else {
                    datas2.push({
                        id: get_po[index].id,
                        idpo: get_detail[i].idpo,
                        tanggal_receive: get_detail[i].tanggal_receive,
                        id_sup: get_detail[i].id_sup,
                        id_produk: get_detail[i].id_produk,
                        id_ware: get_detail[i].id_ware,
                        qty: get_detail[i].qty,
                        m_price: get_detail[i].m_price,
                        total_amount: get_detail[i].total_amount,
                        tipe_order: get_detail[i].tipe_order,
                        id_act: get_detail[i].id_act,
                        produk: get_produk[0].produk,
                        gudang: get_ware[0].warehouse,
                        supplier: get_detail[i].id_sup,
                    });
                }

                total_qty = total_qty + parseInt(get_detail[i].qty);
                total_cost = total_cost + parseInt(get_detail[i].total_amount);
            }

            datas.push({
                tanggal: get_po[index].tanggal_receive,
                users: get_po[index].users,
                id_so: get_po[index].idpo,
                total_qty: total_qty,
                total_cost: total_cost,
                detail: datas2,
            });
        }

        await connection.commit();
        await connection.release();

        return {
            datas,
            total_po: get_po.length ? get_po.length : 0,
            total_qty: hasil_totalqty,
            capital_amount: hasil_amount ? hasil_amount : 0,
        };

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getProdukbarcode = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        if (body.role === "SUPER-ADMIN" || body.role === "HEAD-AREA") {
            var areas = body.area;
        } else if (body.role === "HEAD-WAREHOUSE") {
            var [cek_area] = await connection.query(
                `SELECT id_ware FROM tb_warehouse WHERE id_ware='${body.area}' GROUP BY id_ware`
            );
            var areas = cek_area[0].id_ware;
        } else {
            var [cek_store] = await connection.query(
                `SELECT id_ware FROM tb_store WHERE id_store='${body.area}' GROUP BY id_store`
            );
            var areas = cek_store[0].id_ware;
        }

        if (body.warehouse == "all") {
            var [get_produk] = await connection.query(
                `SELECT tb_produk.*,tb_warehouse.* FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware ORDER BY tb_produk.id DESC`
            );
        } else if (body.warehouse === "all_area") {
            var [get_produk] = await connection.query(
                `SELECT tb_produk.*,tb_warehouse.* FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware WHERE tb_warehouse.id_area='${areas}' ORDER BY tb_produk.id DESC`
            );
        } else if (body.warehouse === "wares") {
            var [get_produk] = await connection.query(
                `SELECT tb_produk.*,tb_warehouse.* FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware WHERE tb_warehouse.id_ware='${areas}' ORDER BY tb_produk.id DESC`
            );
        } else {
            var [get_produk] = await connection.query(
                `SELECT tb_produk.*,tb_warehouse.* FROM tb_produk LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware WHERE tb_produk.id_ware='${body.warehouse}' ORDER BY tb_produk.id DESC`
            );
        }

        await connection.commit();
        await connection.release();

        return get_produk;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getWarehousebarcode = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [data_role] = await connection.query(
            `SELECT * FROM tb_karyawan WHERE role='${body.role}'`
        );

        if (body.role === 'SUPER-ADMIN') {
            var [data_warehouse] = await connection.query(
                `SELECT * FROM tb_warehouse`
            );
        } else if (body.role === 'HEAD-AREA') {
            var [data_warehouse] = await connection.query(
                `SELECT * FROM tb_warehouse WHERE id_area='${data_role[0].id_store} '`
            );
        } else if (body.role === 'HEAD-WAREHOUSE') {
            var [data_warehouse] = await connection.query(
                `SELECT * FROM tb_warehouse WHERE id_ware='${body.area}'`
            );
        } else {
            var [data_store] = await connection.query(
                `SELECT id_ware FROM tb_store WHERE id_store='${body.area}'`
            );
            var [data_warehouse] = await connection.query(
                `SELECT * FROM tb_warehouse WHERE id_ware='${data_store[0].id_ware}'`
            );
        }

        await connection.commit();
        await connection.release();

        return data_warehouse;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getIdpo = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [get_idpo] = await connection.query(
            `SELECT * FROM tb_purchaseorder WHERE id_produk='${body.idproduct}' AND id_ware='${body.idware}' AND qty >= 0 ORDER BY id DESC`
        );


        // console.log(body)
        await connection.commit();
        await connection.release();

        return get_idpo;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getSizebarcode = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [data_getsize] = await connection.query(
            `SELECT *,SUM(qty)as qty FROM tb_variationorder WHERE id_produk='${body.idproduct}' AND id_ware='${body.idware}' AND idpo='${body.idpo}' AND qty >= 0 GROUP BY size`
        );

        await connection.commit();
        await connection.release();
        return data_getsize;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getStore_sales = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();
        const [data_role] = await connection.query(
            `SELECT * FROM tb_karyawan WHERE role='${body.role}'`
        );

        if (body.role === 'SUPER-ADMIN') {
            var [data_store] = await connection.query(
                `SELECT * FROM tb_store`
            );
        } else if (body.role === 'HEAD-AREA') {
            var [data_store] = await connection.query(
                `SELECT * FROM tb_store WHERE id_area='${data_role[0].id_store} '`
            );
        } else {
            var [data_store] = await connection.query(
                `SELECT * FROM tb_store WHERE id_store='${data_role[0].id_store}'`
            );
        }
        // console.log(data_role)
        await connection.commit();
        await connection.release();
        return data_store;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getStore_sales_online = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [data_role] = await connection.query(
            `SELECT * FROM tb_karyawan WHERE role='${body.role}'`
        );

        if (body.role === 'SUPER-ADMIN') {
            var [data_store] = await connection.query(
                `SELECT * FROM tb_store WHERE channel != 'OFFLINE STORE'`
            );
        } else if (body.role === 'HEAD-AREA') {
            var [data_store] = await connection.query(
                `SELECT * FROM tb_store WHERE id_area='${data_role[0].id_store}' AND channel != 'OFFLINE STORE'`
            );
        } else {
            var [list_data_role] = await connection.query(
                `SELECT * FROM tb_karyawan WHERE role='${body.role}' AND id_store='${body.store}'`
            );
            for (let x = 0; x < list_data_role.length; x++) {
                var [data_store] = await connection.query(
                    `SELECT * FROM tb_store WHERE channel != 'OFFLINE STORE' GROUP BY id_store`
                );
            }
        }
        // console.log(body)
        await connection.commit();
        await connection.release();
        return data_store;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getStore_dashboard = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [data_role] = await connection.query(
            `SELECT * FROM tb_karyawan WHERE role='${body.role}'`
        );

        if (body.role === 'SUPER-ADMIN') {
            var [data_store] = await connection.query(
                `SELECT * FROM tb_store`
            );
        } else if (body.role === 'HEAD-AREA') {
            var [data_store] = await connection.query(
                `SELECT * FROM tb_store WHERE id_area='${data_role[0].id_store}'`
            );
        } else {
            var [list_data_role] = await connection.query(
                `SELECT * FROM tb_karyawan WHERE role='${body.role}' AND id_store='${body.store}'`
            );
            for (let x = 0; x < list_data_role.length; x++) {
                var [data_store] = await connection.query(
                    `SELECT * FROM tb_store GROUP BY id_store`
                );
            }
        }
        // console.log(body)

        await connection.commit();
        await connection.release();
        return data_store;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getWarehouse_sales = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    // console.log(body)
    try {
        await connection.beginTransaction();
        const [data_role] = await connection.query(
            `SELECT * FROM tb_karyawan WHERE role='${body.role}'`
        );

        if (body.role === 'SUPER-ADMIN') {
            var [data_ware] = await connection.query(
                `SELECT * FROM tb_warehouse`
            );
        } else if (body.role === 'HEAD-AREA') {
            var [data_ware] = await connection.query(
                `SELECT * FROM tb_warehouse WHERE id_area='${body.area}'`
            );
        } else {
            var [list_data_role] = await connection.query(
                `SELECT * FROM tb_karyawan WHERE role='${body.role}' AND id_store='${body.area}'`
            );
            var [data_ware] = await connection.query(
                `SELECT tb_store.*,tb_warehouse.* FROM tb_store LEFT JOIN tb_warehouse ON tb_store.id_ware = tb_warehouse.id_ware WHERE tb_store.id_store='${list_data_role[0].id_store}'`
            );
        }
        // console.log(data_ware)
        await connection.commit();
        await connection.release();
        return data_ware;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getWarehouse_sales_online = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();
        const [data_role] = await connection.query(
            `SELECT * FROM tb_karyawan WHERE role='${body.role}'`
        );

        if (body.role === 'SUPER-ADMIN') {
            var [data_ware] = await connection.query(
                `SELECT * FROM tb_warehouse`
            );
        } else {
            var [data_ware] = await connection.query(
                `SELECT tb_store.*,tb_warehouse.* FROM tb_store LEFT JOIN tb_warehouse ON tb_store.id_ware = tb_warehouse.id_ware WHERE tb_store.id_store='${data_role[0].id_store}'`
            );
        }
        // console.log(data_ware)
        await connection.commit();
        await connection.release();
        return data_ware;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getMutation = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    const tanggal = body.date;
    const myArray = tanggal.split(" to ");

    if (tanggal.length > 10) {
        var tanggal_start = myArray[0];
        var tanggal_end = myArray[1];
    } else {
        var tanggal_start = tanggal;
        var tanggal_end = tanggal;
    }


    try {
        await connection.beginTransaction();
        const datas = [];

        if (body.user_role === "SUPER-ADMIN" || body.user_role === "HEAD-AREA") {
            var [query] = await connection.query(
                `SELECT tb_mutasistock.*,tb_store.store,tb_warehouse.warehouse FROM tb_mutasistock LEFT JOIN tb_warehouse ON tb_mutasistock.id_ware = tb_warehouse.id_ware 
                        LEFT JOIN tb_store ON tb_mutasistock.id_store = tb_store.id_store 
                        WHERE tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_mutasistock.id DESC`
            );

            var [getstockawal] = await connection.query(
                `SELECT * FROM tb_settlement WHERE tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY id DESC`
            );

            var [query_transaksi] = await connection.query(
                `SELECT * FROM tb_mutasistock WHERE tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY id_mutasi`
            );

            var [total_barangmasuk] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE source='Barang Gudang' AND mutasi='ADD_PRODUK' OR mutasi='REPEAT' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_in_refund] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE source='Barang Gudang' AND mutasi='REFUND' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_in_cancel] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE source='Barang Gudang' AND mutasi='CANCEL_ORDER' OR mutasi='DELETE_ORDER' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_in_retur] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE source='Barang Gudang' AND mutasi='RETUR_IN' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_out_retur] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE source='Barang Gudang' AND mutasi='RETUR_OUT' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_out_sales_online] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE source='Barang Gudang' AND mutasi='SALES ONLINE' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_out_sales_toko] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE source='Barang Gudang' AND mutasi='SALES RETAIL' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [get_stok_all] = await connection.query(
                `SELECT SUM(qty) as qty FROM tb_variation`
            );

        } else if (body.user_role === "HEAD-WAREHOUSE") {
            var [query] = await connection.query(
                `SELECT tb_mutasistock.*,tb_store.store,tb_warehouse.warehouse FROM tb_mutasistock LEFT JOIN tb_warehouse ON tb_mutasistock.id_ware = tb_warehouse.id_ware 
                        LEFT JOIN tb_store ON tb_mutasistock.id_store = tb_store.id_store 
                        WHERE tb_mutasistock.users='${body.user_login}' AND tb_mutasistock.id_ware='${body.user_store}' AND tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_mutasistock.id DESC`
            );

            var [getstockawal] = await connection.query(
                `SELECT * FROM tb_settlement WHERE tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY id DESC`
            );

            var [query_transaksi] = await connection.query(
                `SELECT * FROM tb_mutasistock WHERE  users='${body.user_login}' AND id_ware='${body.user_store}' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY id_mutasi`
            );

            var [total_barangmasuk] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE users='${body.user_login}' AND id_ware='${body.user_store}' AND source='Barang Gudang' AND mutasi='ADD_PRODUK' OR mutasi='REPEAT' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_in_refund] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE users='${body.user_login}' AND id_ware='${body.user_store}' AND source='Barang Gudang' AND mutasi='REFUND' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_in_cancel] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE users='${body.user_login}' AND id_ware='${body.user_store}' AND source='Barang Gudang' AND mutasi='CANCEL_ORDER' OR mutasi='DELETE_ORDER' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_in_retur] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE users='${body.user_login}' AND id_ware='${body.user_store}' AND source='Barang Gudang' AND mutasi='RETUR_IN' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_out_retur] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE users='${body.user_login}' AND id_ware='${body.user_store}' AND source='Barang Gudang' AND mutasi='RETUR_OUT' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_out_sales_online] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE users='${body.user_login}' AND id_ware='${body.user_store}' AND source='Barang Gudang' AND mutasi='SALES ONLINE' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_out_sales_toko] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE users='${body.user_login}' AND id_ware='${body.user_store}' AND source='Barang Gudang' AND mutasi='SALES RETAIL' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [get_stok_all] = await connection.query(
                `SELECT SUM(qty) as qty FROM tb_variation`
            );
        } else {
            var [query] = await connection.query(
                `SELECT tb_mutasistock.*,tb_store.store,tb_warehouse.warehouse FROM tb_mutasistock LEFT JOIN tb_warehouse ON tb_mutasistock.id_ware = tb_warehouse.id_ware 
                        LEFT JOIN tb_store ON tb_mutasistock.id_store = tb_store.id_store 
                        WHERE tb_mutasistock.users='${body.user_login}' AND tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_mutasistock.id DESC`
            );

            var [getstockawal] = await connection.query(
                `SELECT * FROM tb_settlement WHERE tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY id DESC`
            );

            var [query_transaksi] = await connection.query(
                `SELECT * FROM tb_mutasistock WHERE  users='${body.user_login}' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY id_mutasi`
            );

            var [total_barangmasuk] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE users='${body.user_login}' AND source='Barang Gudang' AND mutasi='ADD_PRODUK' OR mutasi='REPEAT' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_in_refund] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE users='${body.user_login}' AND source='Barang Gudang' AND mutasi='REFUND' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_in_cancel] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE users='${body.user_login}' AND source='Barang Gudang' AND mutasi='CANCEL_ORDER' OR mutasi='DELETE_ORDER' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_in_retur] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE users='${body.user_login}' AND source='Barang Gudang' AND mutasi='RETUR_IN' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_out_retur] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE users='${body.user_login}' AND source='Barang Gudang' AND mutasi='RETUR_OUT' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_out_sales_online] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE users='${body.user_login}' AND source='Barang Gudang' AND mutasi='SALES ONLINE' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [total_out_sales_toko] = await connection.query(
                `SELECT *,SUM(qty) as qty FROM tb_mutasistock WHERE users='${body.user_login}' AND source='Barang Gudang' AND mutasi='SALES RETAIL' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );

            var [get_stok_all] = await connection.query(
                `SELECT SUM(qty) as qty FROM tb_variation`
            );
        }


        datas.push({
            data_expense: query,
            total_transaksi: query_transaksi.length,
            stock_awal: getstockawal ? getstockawal : 0,
            total_barangmasuk: total_barangmasuk[0].qty,
            total_in_retur: total_in_retur[0].qty,
            total_in_refund: total_in_refund[0].qty,
            total_out_sales_online: total_out_sales_online[0].qty,
            total_out_sales_toko: total_out_sales_toko[0].qty,
            total_out_retur: total_out_retur[0].qty,
            total_in_cancel: total_in_cancel[0].qty,
            live_stok: get_stok_all[0].qty,
            // warehouse: get_ware,
        });
        console.log(body)
        await connection.commit();
        await connection.release();

        return datas;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const get_Asset = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    var id_ware = body.id_ware;
    var query = body.query;
    const datas = [];

    try {
        const datas2 = [];
        await connection.beginTransaction();

        if (id_ware === "all") {
            var [countproduk] = await connection.query(
                `SELECT * FROM tb_produk GROUP BY id_produk`
            );
        } else {
            var [countproduk] = await connection.query(
                `SELECT * FROM tb_produk WHERE id_ware='${id_ware}' GROUP BY id_produk`
            );
        }

        if (body.loadmorelimit === 1) {
            var limitss = 20;
        } else if (body.loadmorelimit === 0) {
            var limitss = 0;
        } else {
            var limitss = body.loadmorelimit * 20;
        }
        const total_pages = countproduk.length / 20;

        var [get_wares] = await connection.query(
            `SELECT * FROM tb_warehouse GROUP BY id_ware`
        );

        if (query === "all") {
            if (id_ware === "all") {

                if (body.urutan === "all") {
                    if (countproduk.length < 20) {
                        var [get_produk] = await connection.query(
                            `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware GROUP BY tb_produk.id_produk ORDER BY tb_produk.id_produk DESC LIMIT 20`
                        );
                    } else {
                        var [get_produk] = await connection.query(
                            `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware GROUP BY tb_produk.id_produk ORDER BY tb_produk.id_produk DESC LIMIT 20 OFFSET ${limitss}`
                        );
                    }
                } else if (body.urutan === "desc") {
                    if (countproduk.length < 20) {
                        var [get_produk] = await connection.query(
                            `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware GROUP BY tb_produk.id_produk ORDER BY SUM(tb_variation.qty) DESC LIMIT 20`
                        );
                    } else {
                        var [get_produk] = await connection.query(
                            `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware GROUP BY tb_produk.id_produk ORDER BY SUM(tb_variation.qty) DESC LIMIT 20 OFFSET ${limitss}`
                        );
                    }
                } else {
                    if (countproduk.length < 20) {
                        var [get_produk] = await connection.query(
                            `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware GROUP BY tb_produk.id_produk ORDER BY SUM(tb_variation.qty) ASC LIMIT 20`
                        );
                    } else {
                        var [get_produk] = await connection.query(
                            `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware GROUP BY tb_produk.id_produk ORDER BY SUM(tb_variation.qty) ASC LIMIT 20 OFFSET ${limitss}`
                        );
                    }
                }

                var [get_po_release_all] = await connection.query(
                    `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='RELEASE'`
                );

                var [get_po_restock_all] = await connection.query(
                    `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='RESTOCK'`
                );

                var [get_po_tfin_all] = await connection.query(
                    `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND qty > '0'`
                );

                var [get_po_tfout_all] = await connection.query(
                    `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='TRANSFER OUT' AND qty < '0'`
                );

                var [get_sold_all] = await connection.query(
                    `SELECT SUM(qty) as total FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.status_pesanan != 'CANCEL'`
                );

                var [get_stok_all] = await connection.query(
                    `SELECT SUM(tb_variation.qty) as qty FROM tb_variation LEFT JOIN tb_produk ON tb_variation.id_produk = tb_produk.id_produk`
                );

                var [get_assets_amount] = await connection.query(
                    `SELECT SUM(tb_purchaseorder.total_amount) as total_amount,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tipe_order != 'TRANSFER IN' AND tb_purchaseorder.tipe_order != 'TRANSFER OUT' AND tb_purchaseorder.tipe_order != 'SO_GUDANG'`
                );

                var [get_sold_amount] = await connection.query(
                    `SELECT SUM(tb_order.m_price*tb_order.qty) as totalterjual FROM tb_invoice LEFT JOIN tb_order ON tb_invoice.id_pesanan = tb_order.id_pesanan WHERE tb_invoice.status_pesanan != 'CANCEL'`
                );

                var [get_po_stock_opname] = await connection.query(
                    `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='SO_GUDANG'`
                );

                var [get_amount_dasar] = await connection.query(
                    `SELECT m_price,idpo,id_produk FROM tb_purchaseorder ORDER BY id DESC`
                );
                var hitungtotalss_dasar = 0;
                for (let amounty = 0; amounty < get_amount_dasar.length; amounty++) {
                    var [findrealstok_dasar] = await connection.query(
                        `SELECT SUM(qty) as totalqty,idpo FROM tb_variation WHERE id_produk='${get_amount_dasar[amounty].id_produk}' AND idpo='${get_amount_dasar[amounty].idpo}'`
                    );
                    hitungtotalss_dasar = parseInt(hitungtotalss_dasar) + parseInt(get_amount_dasar[amounty].m_price) * parseInt(findrealstok_dasar[0].totalqty ? findrealstok_dasar[0].totalqty : 0)
                }

                for (let x = 0; x < get_produk.length; x++) {

                    var [get_po_release] = await connection.query(
                        `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='RELEASE' AND id_produk='${get_produk[x].id_produk}'`
                    );

                    var [get_po_restock] = await connection.query(
                        `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='RESTOCK' AND id_produk='${get_produk[x].id_produk}'`
                    );

                    var [get_po_tfin] = await connection.query(
                        `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND qty > '0' AND id_produk='${get_produk[x].id_produk}'`
                    );

                    var [get_po_tfout] = await connection.query(
                        `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='TRANSFER OUT' AND qty < '0' AND id_produk='${get_produk[x].id_produk}'`
                    );

                    var [get_sold] = await connection.query(
                        `SELECT SUM(qty) as total FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.status_pesanan != 'CANCEL' AND tb_order.id_produk='${get_produk[x].id_produk}'`
                    );

                    var [get_amount] = await connection.query(
                        `SELECT m_price,idpo FROM tb_purchaseorder WHERE id_produk='${get_produk[x].id_produk}' ORDER BY id DESC`
                    );
                    var hitungtotalss = 0;
                    for (let amountx = 0; amountx < get_amount.length; amountx++) {
                        var [findrealstok] = await connection.query(
                            `SELECT SUM(qty) as totalqty,idpo FROM tb_variation WHERE id_produk='${get_produk[x].id_produk}' AND idpo='${get_amount[amountx].idpo}'`
                        );
                        hitungtotalss = parseInt(hitungtotalss) + parseInt(get_amount[amountx].m_price) * parseInt(findrealstok[0].totalqty ? findrealstok[0].totalqty : 0)
                    }

                    var [getstokdetail] = await connection.query(
                        `SELECT SUM(qty) as totalqty,idpo FROM tb_variation WHERE id_produk='${get_produk[x].id_produk}' GROUP BY id_produk`
                    );
                    for (let sss = 0; sss < getstokdetail.length; sss++) {
                        if (getstokdetail[0].totalqty === null || getstokdetail[0].totalqty === "") {
                            var stokrealtime = 0;
                        } else {
                            var stokrealtime = getstokdetail[0].totalqty;
                        }
                    }

                    datas2.push({
                        produk: get_produk[x].produk,
                        warehouse: "ALL",
                        id_ware: "ALL",
                        id_produk: get_produk[x].id_produk,
                        release: get_po_release[0].qty,
                        restock: get_po_restock[0].qty,
                        transfer_in: get_po_tfin[0].qty,
                        transfer_out: get_po_tfout[0].qty,
                        sold: get_sold[0].total,
                        stock: stokrealtime,
                        assets: hitungtotalss ? hitungtotalss : 0,
                    });
                }
                datas.push({
                    data_asset: datas2,
                    release: get_po_release_all[0].qty,
                    restock: get_po_restock_all[0].qty,
                    tf_in: get_po_tfin_all[0].qty ? get_po_tfin_all[0].qty : 0,
                    tf_out: get_po_tfout_all[0].qty ? get_po_tfout_all[0].qty : 0,
                    qty_assets: get_stok_all[0].qty / parseInt(get_wares.length),
                    getsoldall: get_sold_all[0].total,
                    nominal_assets: get_assets_amount[0].total_amount / parseInt(get_wares.length),
                    asset_bersih: hitungtotalss_dasar ? hitungtotalss_dasar : 0,
                    total: get_produk.length,
                    totalterjual: get_sold_amount[0].totalterjual,
                    stock_opname: get_po_stock_opname[0].qty,
                });
            } else {

                if (body.urutan === "all") {
                    if (countproduk.length < 20) {
                        var [get_produk] = await connection.query(
                            `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware WHERE tb_produk.id_ware='${id_ware}' GROUP BY tb_produk.id_produk ORDER BY tb_produk.id_produk DESC LIMIT 20`
                        );
                    } else {
                        var [get_produk] = await connection.query(
                            `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware WHERE tb_produk.id_ware='${id_ware}' GROUP BY tb_produk.id_produk ORDER BY tb_produk.id_produk DESC LIMIT 20 OFFSET ${limitss}`
                        );
                    }
                } else if (body.urutan === "desc") {
                    if (countproduk.length < 20) {
                        var [get_produk] = await connection.query(
                            `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware WHERE tb_produk.id_ware='${id_ware}' GROUP BY tb_produk.id_produk ORDER BY SUM(tb_variation.qty) DESC LIMIT 20`
                        );
                    } else {
                        var [get_produk] = await connection.query(
                            `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware WHERE tb_produk.id_ware='${id_ware}' GROUP BY tb_produk.id_produk ORDER BY SUM(tb_variation.qty) DESC LIMIT 20 OFFSET ${limitss}`
                        );
                    }
                } else {
                    if (countproduk.length < 20) {
                        var [get_produk] = await connection.query(
                            `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware WHERE tb_produk.id_ware='${id_ware}' GROUP BY tb_produk.id_produk ORDER BY SUM(tb_variation.qty) ASC LIMIT 20`
                        );
                    } else {
                        var [get_produk] = await connection.query(
                            `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware WHERE tb_produk.id_ware='${id_ware}' GROUP BY tb_produk.id_produk ORDER BY SUM(tb_variation.qty) ASC LIMIT 20 OFFSET ${limitss}`
                        );
                    }
                }

                var [get_po_release_all] = await connection.query(
                    `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='RELEASE' AND id_ware='${id_ware}'`
                );

                var [get_po_restock_all] = await connection.query(
                    `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='RESTOCK' AND id_ware='${id_ware}'`
                );

                var [get_po_tfin_all] = await connection.query(
                    `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND qty > '0' AND id_ware='${id_ware}'`
                );

                var [get_po_tfout_all] = await connection.query(
                    `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='TRANSFER OUT' AND qty < '0' AND id_ware='${id_ware}'`
                );

                var [get_sold_all] = await connection.query(
                    `SELECT SUM(qty) as total FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.status_pesanan != 'CANCEL' AND tb_order.id_ware='${id_ware}'`
                );

                var [get_stok_all] = await connection.query(
                    `SELECT SUM(tb_variation.qty) as qty FROM tb_variation LEFT JOIN tb_produk ON tb_variation.id_produk = tb_produk.id_produk WHERE tb_variation.id_ware='${id_ware}'`
                );

                var [get_assets_amount] = await connection.query(
                    `SELECT SUM(tb_purchaseorder.total_amount) as total_amount,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tipe_order != 'TRANSFER IN' AND tb_purchaseorder.tipe_order != 'TRANSFER OUT' AND tb_purchaseorder.tipe_order != 'SO_GUDANG' AND tb_purchaseorder.id_ware='${id_ware}'`
                );

                var [get_sold_amount] = await connection.query(
                    `SELECT SUM(tb_order.m_price*tb_order.qty) as totalterjual FROM tb_invoice LEFT JOIN tb_order ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.status_pesanan != 'CANCEL' AND tb_order.id_ware='${id_ware}'`
                );

                var [get_po_stock_opname] = await connection.query(
                    `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='SO_GUDANG' AND id_ware='${id_ware}'`
                );

                var [get_amount_dasar] = await connection.query(
                    `SELECT m_price,idpo,id_produk FROM tb_purchaseorder ORDER BY id DESC`
                );
                var hitungtotalss_dasar = 0;
                for (let amounty = 0; amounty < get_amount_dasar.length; amounty++) {
                    var [findrealstok_dasar] = await connection.query(
                        `SELECT SUM(qty) as totalqty,idpo FROM tb_variation WHERE id_produk='${get_amount_dasar[amounty].id_produk}' AND idpo='${get_amount_dasar[amounty].idpo}'`
                    );
                    hitungtotalss_dasar = parseInt(hitungtotalss_dasar) + parseInt(get_amount_dasar[amounty].m_price) * parseInt(findrealstok_dasar[0].totalqty ? findrealstok_dasar[0].totalqty : 0)
                }

                for (let x = 0; x < get_produk.length; x++) {

                    var [get_po_release] = await connection.query(
                        `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='RELEASE' AND id_produk='${get_produk[x].id_produk}' AND id_ware='${id_ware}'`
                    );

                    var [get_po_restock] = await connection.query(
                        `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='RESTOCK' AND id_produk='${get_produk[x].id_produk}' AND id_ware='${id_ware}'`
                    );

                    var [get_po_tfin] = await connection.query(
                        `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND qty > '0' AND id_produk='${get_produk[x].id_produk}' AND id_ware='${id_ware}'`
                    );

                    var [get_po_tfout] = await connection.query(
                        `SELECT SUM(qty) as qty FROM tb_purchaseorder WHERE tipe_order='TRANSFER OUT' AND qty < '0' AND id_produk='${get_produk[x].id_produk}' AND id_ware='${id_ware}'`
                    );

                    var [get_sold] = await connection.query(
                        `SELECT SUM(qty) as total FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.status_pesanan != 'CANCEL' AND tb_order.id_produk='${get_produk[x].id_produk}' AND tb_order.id_ware='${id_ware}'`
                    );

                    var [get_amount] = await connection.query(
                        `SELECT m_price,idpo FROM tb_purchaseorder WHERE id_produk='${get_produk[x].id_produk}' AND tb_purchaseorder.id_ware='${id_ware}' ORDER BY id DESC`
                    );
                    var hitungtotalss = 0;
                    for (let amountx = 0; amountx < get_amount.length; amountx++) {
                        var [findrealstok] = await connection.query(
                            `SELECT SUM(qty) as totalqty,idpo FROM tb_variation WHERE id_produk='${get_produk[x].id_produk}' AND idpo='${get_amount[amountx].idpo}'`
                        );
                        hitungtotalss = parseInt(hitungtotalss) + parseInt(get_amount[amountx].m_price) * parseInt(findrealstok[0].totalqty ? findrealstok[0].totalqty : 0)
                    }

                    var [getstokdetail] = await connection.query(
                        `SELECT SUM(qty) as totalqty FROM tb_variation WHERE id_produk='${get_produk[x].id_produk}' AND id_ware='${id_ware}' GROUP BY id_produk`
                    );

                    for (let sss = 0; sss < getstokdetail.length; sss++) {
                        if (getstokdetail[0].totalqty === null || getstokdetail[0].totalqty === "") {
                            var stokrealtime = 0;
                        } else {
                            var stokrealtime = getstokdetail[0].totalqty;
                        }
                    }

                    datas2.push({
                        produk: get_produk[x].produk,
                        warehouse: get_produk[x].warehouse,
                        id_ware: id_ware,
                        id_produk: get_produk[x].id_produk,
                        release: get_po_release[0].qty,
                        restock: get_po_restock[0].qty,
                        transfer_in: get_po_tfin[0].qty,
                        transfer_out: get_po_tfout[0].qty,
                        sold: get_sold[0].total,
                        stock: stokrealtime,
                        assets: hitungtotalss ? hitungtotalss : 0,
                    });
                }
                datas.push({
                    data_asset: datas2,
                    release: get_po_release_all[0].qty,
                    restock: get_po_restock_all[0].qty,
                    tf_in: get_po_tfin_all[0].qty ? get_po_tfin_all[0].qty : 0,
                    tf_out: get_po_tfout_all[0].qty ? get_po_tfout_all[0].qty : 0,
                    qty_assets: get_stok_all[0].qty / parseInt(get_wares.length),
                    getsoldall: get_sold_all[0].total,
                    nominal_assets: get_assets_amount[0].total_amount / parseInt(get_wares.length),
                    asset_bersih: hitungtotalss_dasar ? hitungtotalss_dasar : 0,
                    total: get_produk.length,
                    totalterjual: get_sold_amount[0].totalterjual,
                    stock_opname: get_po_stock_opname[0].qty,
                });
            }
        } else {
            if (id_ware === "all") {

                if (body.urutan === "all") {
                    var [get_produk] = await connection.query(
                        `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') GROUP BY tb_produk.id_produk ORDER BY tb_produk.id_produk DESC`
                    );
                } else if (body.urutan === "desc") {
                    var [get_produk] = await connection.query(
                        `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') GROUP BY tb_produk.id_produk ORDER BY SUM(tb_variation.qty) DESC`
                    );
                } else {
                    var [get_produk] = await connection.query(
                        `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') GROUP BY tb_produk.id_produk ORDER BY SUM(tb_variation.qty) ASC`
                    );
                }

                var [get_po_release_all] = await connection.query(
                    `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.tipe_order='RELEASE'`
                );

                var [get_po_restock_all] = await connection.query(
                    `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.tipe_order='RESTOCK'`
                );

                var [get_po_tfin_all] = await connection.query(
                    `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.tipe_order='TRANSFER IN' AND tb_purchaseorder.qty > '0'`
                );

                var [get_po_tfout_all] = await connection.query(
                    `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.tipe_order='TRANSFER OUT' AND tb_purchaseorder.qty < '0'`
                );

                var [get_sold_all] = await connection.query(
                    `SELECT SUM(qty) as total FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE (tb_order.produk LIKE '%${query}%' OR tb_order.id_produk LIKE '%${query}%') AND tb_invoice.status_pesanan != 'CANCEL'`
                );

                var [get_stok_all] = await connection.query(
                    `SELECT SUM(tb_variation.qty) as qty FROM tb_variation LEFT JOIN tb_produk ON tb_variation.id_produk = tb_produk.id_produk WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%')`
                );

                var [get_assets_amount] = await connection.query(
                    `SELECT SUM(tb_purchaseorder.total_amount) as total_amount,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tipe_order != 'TRANSFER IN' AND tb_purchaseorder.tipe_order != 'TRANSFER OUT' AND tb_purchaseorder.tipe_order != 'SO_GUDANG' AND (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%')`
                );

                var [get_sold_amount] = await connection.query(
                    `SELECT SUM(tb_order.m_price*tb_order.qty) as totalterjual FROM tb_invoice LEFT JOIN tb_order ON tb_invoice.id_pesanan = tb_order.id_pesanan WHERE tb_invoice.status_pesanan != 'CANCEL' AND (tb_order.produk LIKE '%${query}%' OR tb_order.id_produk LIKE '%${query}%')`
                );

                var [get_po_stock_opname] = await connection.query(
                    `SELECT SUM(qty) as qty FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk AND tb_purchaseorder.id_ware = tb_produk.id_ware WHERE tb_purchaseorder.tipe_order='SO_GUDANG' AND (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%')`
                );


                for (let x = 0; x < get_produk.length; x++) {

                    var [get_po_release] = await connection.query(
                        `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_produk.id_produk='${get_produk[x].id_produk}' AND (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.tipe_order='RELEASE'`
                    );

                    var [get_po_restock] = await connection.query(
                        `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_produk.id_produk='${get_produk[x].id_produk}' AND (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.tipe_order='RESTOCK'`
                    );

                    var [get_po_tfin] = await connection.query(
                        `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tipe_order='TRANSFER IN' AND qty > '0' AND tb_purchaseorder.id_produk='${get_produk[x].id_produk}' AND (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%')`
                    );

                    var [get_po_tfout] = await connection.query(
                        `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tipe_order='TRANSFER OUT' AND qty < '0' AND tb_purchaseorder.id_produk='${get_produk[x].id_produk}' AND (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%')`
                    );

                    var [get_sold] = await connection.query(
                        `SELECT SUM(qty) as total FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.status_pesanan != 'CANCEL' AND tb_order.id_produk='${get_produk[x].id_produk}'  AND (tb_order.produk LIKE '%${query}%' OR tb_order.id_produk LIKE '%${query}%')`
                    );

                    var [get_stok] = await connection.query(
                        `SELECT tb_variation.id_produk,SUM(tb_variation.qty) as qty,SUM(tb_purchaseorder.total_amount) as total_amount,tb_produk.produk FROM tb_variation LEFT JOIN tb_purchaseorder ON tb_variation.id_produk = tb_purchaseorder.id_produk LEFT JOIN tb_produk ON tb_variation.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.id_produk='${get_produk[x].id_produk}' AND (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.tipe_order != 'TRANSFER IN' AND tb_purchaseorder.tipe_order != 'TRANSFER OUT' AND tb_purchaseorder.tipe_order != 'SO_GUDANG'`
                    );

                    var [get_amount] = await connection.query(
                        `SELECT tb_purchaseorder.m_price,idpo FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.id_produk='${get_produk[x].id_produk}' AND (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') ORDER BY tb_purchaseorder.id DESC`
                    );
                    var hitungtotalss = 0;
                    for (let amountx = 0; amountx < get_amount.length; amountx++) {
                        var [findrealstok] = await connection.query(
                            `SELECT SUM(tb_variation.qty) as totalqty FROM tb_variation LEFT JOIN tb_produk ON tb_variation.id_produk = tb_produk.id_produk AND tb_variation.id_ware = tb_produk.id_ware WHERE tb_variation.id_produk='${get_produk[x].id_produk}' AND tb_variation.idpo='${get_amount[amountx].idpo}' AND (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%')`
                        );
                        hitungtotalss = parseInt(hitungtotalss) + parseInt(get_amount[amountx].m_price) * parseInt(findrealstok[0].totalqty ? findrealstok[0].totalqty : 0)
                    }

                    var [getstokdetail] = await connection.query(
                        `SELECT SUM(tb_variation.qty) as totalqty FROM tb_variation LEFT JOIN tb_produk ON tb_variation.id_produk = tb_produk.id_produk AND tb_variation.id_ware = tb_produk.id_ware WHERE tb_variation.id_produk='${get_produk[x].id_produk}' AND (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') GROUP BY tb_variation.id_produk`
                    );
                    for (let sss = 0; sss < getstokdetail.length; sss++) {
                        if (getstokdetail[0].totalqty === null || getstokdetail[0].totalqty === "") {
                            var stokrealtime = 0;
                        } else {
                            var stokrealtime = getstokdetail[0].totalqty;
                        }
                    }

                    datas2.push({
                        produk: get_produk[x].produk,
                        warehouse: "ALL",
                        id_ware: "ALL",
                        id_produk: get_produk[x].id_produk,
                        release: get_po_release[0].qty / parseInt(get_wares.length),
                        restock: get_po_restock[0].qty / parseInt(get_wares.length),
                        transfer_in: get_po_tfin[0].qty / parseInt(get_wares.length),
                        transfer_out: get_po_tfout[0].qty / parseInt(get_wares.length),
                        sold: get_sold[0].total,
                        stock: stokrealtime,
                        assets: hitungtotalss ? hitungtotalss : 0,
                    });
                }
                datas.push({
                    data_asset: datas2,
                    release: get_po_release_all[0].qty / parseInt(get_wares.length),
                    restock: get_po_restock_all[0].qty / parseInt(get_wares.length),
                    tf_in: get_po_tfin_all[0].qty ? get_po_tfin_all[0].qty : 0 / parseInt(get_wares.length),
                    tf_out: get_po_tfout_all[0].qty ? get_po_tfout_all[0].qty : 0 / parseInt(get_wares.length),
                    qty_assets: get_stok_all[0].qty / parseInt(get_wares.length),
                    getsoldall: get_sold_all[0].total,
                    nominal_assets: get_assets_amount[0].total_amount / parseInt(get_wares.length),
                    asset_bersih: hitungtotalss ? hitungtotalss : 0,
                    total: get_produk.length,
                    totalterjual: get_sold_amount[0].totalterjual ? get_sold_amount[0].totalterjual : 0,
                    stock_opname: get_po_stock_opname[0].qty ? get_po_stock_opname[0].qty : 0 / parseInt(get_wares.length),
                });
            } else {

                if (body.urutan === "all") {
                    var [get_produk] = await connection.query(
                        `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty,tb_warehouse.warehouse FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_produk.id_ware='${id_ware}' GROUP BY tb_produk.id_produk ORDER BY tb_produk.id_produk DESC`
                    );
                } else if (body.urutan === "desc") {
                    var [get_produk] = await connection.query(
                        `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty,tb_warehouse.warehouse FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_produk.id_ware='${id_ware}' GROUP BY tb_produk.id_produk ORDER BY SUM(tb_variation.qty) DESC`
                    );
                } else {
                    var [get_produk] = await connection.query(
                        `SELECT tb_produk.*,SUM(tb_variation.qty) as sortbyqty,tb_warehouse.warehouse FROM tb_produk LEFT JOIN tb_variation ON tb_produk.id_produk = tb_variation.id_produk AND tb_produk.id_ware = tb_variation.id_ware LEFT JOIN tb_warehouse ON tb_produk.id_ware = tb_warehouse.id_ware WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_produk.id_ware='${id_ware}' GROUP BY tb_produk.id_produk ORDER BY SUM(tb_variation.qty) ASC`
                    );
                }

                var [get_po_release_all] = await connection.query(
                    `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.id_ware='${id_ware}' AND tb_purchaseorder.tipe_order='RELEASE'`
                );

                var [get_po_restock_all] = await connection.query(
                    `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.id_ware='${id_ware}' AND tb_purchaseorder.tipe_order='RESTOCK'`
                );

                var [get_po_tfin_all] = await connection.query(
                    `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.id_ware='${id_ware}' AND tb_purchaseorder.tipe_order='TRANSFER IN' AND tb_purchaseorder.qty > '0'`
                );

                var [get_po_tfout_all] = await connection.query(
                    `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.id_ware='${id_ware}' AND tb_purchaseorder.tipe_order='TRANSFER OUT' AND tb_purchaseorder.qty < '0'`
                );

                var [get_sold_all] = await connection.query(
                    `SELECT SUM(qty) as total FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE (tb_order.produk LIKE '%${query}%' OR tb_order.id_produk LIKE '%${query}%') AND tb_order.id_ware='${id_ware}' AND tb_invoice.status_pesanan != 'CANCEL'`
                );

                var [get_stok_all] = await connection.query(
                    `SELECT SUM(tb_variation.qty) as qty FROM tb_variation LEFT JOIN tb_produk ON tb_variation.id_produk = tb_produk.id_produk WHERE (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_variation.id_ware='${id_ware}'`
                );

                var [get_assets_amount] = await connection.query(
                    `SELECT SUM(tb_purchaseorder.total_amount) as total_amount,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tipe_order != 'TRANSFER IN' AND tb_purchaseorder.tipe_order != 'TRANSFER OUT' AND tb_purchaseorder.tipe_order != 'SO_GUDANG' AND (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.id_ware='${id_ware}'`
                );

                var [get_sold_amount] = await connection.query(
                    `SELECT SUM(tb_order.m_price*tb_order.qty) as totalterjual FROM tb_invoice LEFT JOIN tb_order ON tb_invoice.id_pesanan = tb_order.id_pesanan WHERE status_pesanan != 'CANCEL' AND (tb_order.produk LIKE '%${query}%' OR tb_order.id_produk LIKE '%${query}%') AND tb_order.id_ware='${id_ware}'`
                );

                var [get_po_stock_opname] = await connection.query(
                    `SELECT SUM(qty) as qty FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tipe_order='SO_GUDANG' AND (tb_produk.produk LIKE '%${query}%' OR tb_purchaseorder.id_produk LIKE '%${query}%') AND tb_purchaseorder.id_ware='${id_ware}'`
                );

                for (let x = 0; x < get_produk.length; x++) {

                    var [get_po_release] = await connection.query(
                        `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_produk.id_produk='${get_produk[x].id_produk}' AND  (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.id_ware='${id_ware}' AND tb_purchaseorder.tipe_order='RELEASE'`
                    );

                    var [get_po_restock] = await connection.query(
                        `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_produk.id_produk='${get_produk[x].id_produk}' AND  (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.id_ware='${id_ware}' AND tb_purchaseorder.tipe_order='RESTOCK'`
                    );

                    var [get_po_tfin] = await connection.query(
                        `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tipe_order='TRANSFER IN' AND qty > '0' AND tb_purchaseorder.id_produk='${get_produk[x].id_produk}' AND  (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.id_ware='${id_ware}'`
                    );

                    var [get_po_tfout] = await connection.query(
                        `SELECT SUM(tb_purchaseorder.qty) as qty,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tipe_order='TRANSFER OUT' AND qty < '0' AND tb_purchaseorder.id_produk='${get_produk[x].id_produk}' AND  (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_purchaseorder.id_ware='${id_ware}'`
                    );

                    var [get_sold] = await connection.query(
                        `SELECT SUM(qty) as total FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.status_pesanan != 'CANCEL' AND tb_order.id_produk='${get_produk[x].id_produk}'  AND (tb_order.produk LIKE '%${query}%' OR tb_order.id_produk LIKE '%${query}%') AND tb_order.id_ware='${id_ware}'`
                    );

                    var [get_amount] = await connection.query(
                        `SELECT tb_purchaseorder.m_price,idpo FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.id_produk='${get_produk[x].id_produk}' AND tb_purchaseorder.id_ware='${id_ware}' AND (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') ORDER BY tb_purchaseorder.id DESC`
                    );
                    var hitungtotalss = 0;
                    for (let amountx = 0; amountx < get_amount.length; amountx++) {
                        var [findrealstok] = await connection.query(
                            `SELECT SUM(tb_variation.qty) as totalqty FROM tb_variation LEFT JOIN tb_produk ON tb_variation.id_produk = tb_produk.id_produk AND tb_variation.id_ware = tb_produk.id_ware WHERE tb_variation.id_produk='${get_produk[x].id_produk}' AND tb_variation.idpo='${get_amount[amountx].idpo}' AND tb_variation.id_ware='${id_ware}' AND (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%')`
                        );
                        hitungtotalss = parseInt(hitungtotalss) + parseInt(get_amount[amountx].m_price) * parseInt(findrealstok[0].totalqty ? findrealstok[0].totalqty : 0)
                    }

                    var [getstokdetail] = await connection.query(
                        `SELECT SUM(tb_variation.qty) as totalqty FROM tb_variation LEFT JOIN tb_produk ON tb_variation.id_produk = tb_produk.id_produk AND tb_variation.id_ware = tb_produk.id_ware WHERE tb_variation.id_produk='${get_produk[x].id_produk}' AND (tb_produk.produk LIKE '%${query}%' OR tb_produk.id_produk LIKE '%${query}%') AND tb_variation.id_ware='${id_ware}' GROUP BY tb_variation.id_produk`
                    );
                    for (let sss = 0; sss < getstokdetail.length; sss++) {
                        if (getstokdetail[0].totalqty === null || getstokdetail[0].totalqty === "") {
                            var stokrealtime = 0;
                        } else {
                            var stokrealtime = getstokdetail[0].totalqty;
                        }
                    }

                    datas2.push({
                        produk: get_produk[x].produk,
                        warehouse: get_produk[x].warehouse,
                        id_ware: id_ware,
                        id_produk: get_produk[x].id_produk,
                        release: get_po_release[0].qty / parseInt(get_wares.length),
                        restock: get_po_restock[0].qty / parseInt(get_wares.length),
                        transfer_in: get_po_tfin[0].qty / parseInt(get_wares.length),
                        transfer_out: get_po_tfout[0].qty / parseInt(get_wares.length),
                        sold: get_sold[0].total,
                        stock: stokrealtime,
                        assets: hitungtotalss ? hitungtotalss : 0,
                    });
                }
                datas.push({
                    data_asset: datas2,
                    release: get_po_release_all[0].qty / parseInt(get_wares.length),
                    restock: get_po_restock_all[0].qty / parseInt(get_wares.length),
                    tf_in: get_po_tfin_all[0].qty ? get_po_tfin_all[0].qty : 0 / parseInt(get_wares.length),
                    tf_out: get_po_tfout_all[0].qty ? get_po_tfout_all[0].qty : 0 / parseInt(get_wares.length),
                    qty_assets: get_stok_all[0].qty / parseInt(get_wares.length),
                    getsoldall: get_sold_all[0].total,
                    nominal_assets: get_assets_amount[0].total_amount / parseInt(get_wares.length),
                    asset_bersih: hitungtotalss ? hitungtotalss : 0,
                    total: get_produk.length,
                    totalterjual: get_sold_amount[0].totalterjual ? get_sold_amount[0].totalterjual : 0,
                    stock_opname: parseInt(get_po_stock_opname[0].qty ? get_po_stock_opname[0].qty : 0) / parseInt(get_wares.length),
                });
            }
        }


        await connection.commit();
        await connection.release();
        return {
            datas,
            total_pages: Math.round(total_pages),
            show_page: limitss,
        };

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};
const getHistoripoasset = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY-MM-DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    const datas = [];

    const id_ware = body.idware;
    const id_produk = body.idproduct;

    try {
        await connection.beginTransaction();

        if (id_ware === "ALL") {
            var [get_po] = await connection.query(
                `SELECT tb_purchaseorder.*,SUM(qty) as qty,tb_supplier.* FROM tb_purchaseorder LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup WHERE tb_purchaseorder.id_produk='${id_produk}' GROUP BY tb_purchaseorder.id_produk ORDER BY tb_purchaseorder.id DESC`
            );

            // var [get_size_histori] = await connection.query(
            //     `SELECT *,SUM(qty) as qty FROM tb_variationorder WHERE id_produk='${id_produk}' GROUP BY size ORDER BY size ASC`
            // );
        } else {
            var [get_po] = await connection.query(
                `SELECT tb_purchaseorder.*,SUM(qty) as qty,tb_supplier.* FROM tb_purchaseorder LEFT JOIN tb_supplier ON tb_purchaseorder.id_sup = tb_supplier.id_sup WHERE tb_purchaseorder.id_produk='${id_produk}' AND tb_purchaseorder.id_ware='${id_ware}' GROUP BY tb_purchaseorder.id_produk ORDER BY tb_purchaseorder.id DESC`
            );

            // var [get_size_histori] = await connection.query(
            //     `SELECT *,SUM(qty) as qty FROM tb_variationorder WHERE id_produk='${id_produk}' AND id_ware='${id_ware}' GROUP BY size ORDER BY size ASC`
            // );
        }

        for (let i = 0; i < get_po.length; i++) {
            if (id_ware === "ALL") {
                // var [get_size] = await connection.query(
                //     `SELECT *,SUM(qty) as qty FROM tb_variationorder WHERE id_produk='${id_produk}' GROUP BY size ORDER BY size ASC`
                // );

                var [get_size_ready] = await connection.query(
                    `SELECT *,SUM(qty) as qty FROM tb_variation WHERE id_produk='${id_produk}' GROUP BY size ORDER BY size ASC`
                );
            } else {
                // var [get_size] = await connection.query(
                //     `SELECT *,SUM(qty) as qty FROM tb_variationorder WHERE id_produk='${id_produk}' id_ware='${id_ware}' GROUP BY size ORDER BY size ASC`
                // );

                var [get_size_ready] = await connection.query(
                    `SELECT *,SUM(qty) as qty FROM tb_variation WHERE id_produk='${id_produk}' AND id_ware='${id_ware}' GROUP BY size ORDER BY size ASC`
                );
            }

            var [get_ware] = await connection.query(
                `SELECT * FROM tb_warehouse WHERE id_ware='${get_po[i].id_ware}'`
            );

            if (get_po[i].tipe_order === "TRANSFER") {
                var [get_ware] = await connection.query(
                    `SELECT * FROM tb_warehouse WHERE id_ware='${get_po[i].id_sup}'`
                );

                datas.push({
                    id: get_po[i].id,
                    idpo: get_po[i].idpo,
                    tanggal_receive: get_po[i].tanggal_receive,
                    id_sup: get_po[i].id_sup,
                    id_produk: get_po[i].id_produk,
                    id_ware: get_ware[0].warehouse,
                    qty: get_po[i].qty,
                    m_price: get_po[i].m_price,
                    total_amount: get_po[i].total_amount,
                    tipe_order: get_po[i].tipe_order,
                    id_act: get_po[i].id_act,
                    users: get_po[i].users,
                    supplier: get_ware[0].warehouse,
                    // variation: get_size,
                    variation_ready: get_size_ready,
                });
            } else {
                datas.push({
                    id: get_po[i].id,
                    idpo: get_po[i].idpo,
                    tanggal_receive: get_po[i].tanggal_receive,
                    id_sup: get_po[i].id_sup,
                    id_produk: get_po[i].id_produk,
                    id_ware: get_ware[0].warehouse,
                    qty: get_po[i].qty,
                    m_price: get_po[i].m_price,
                    total_amount: get_po[i].total_amount,
                    tipe_order: get_po[i].tipe_order,
                    id_act: get_po[i].id_act,
                    users: get_po[i].users,
                    supplier: get_po[i].supplier,
                    // variation: get_size,
                    variation_ready: get_size_ready,
                });
            }

        }


        await connection.commit();
        await connection.release();

        return {
            data_po: datas,
            // count_data_po: get_size_histori,
            total: get_po.length
        };

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const settlementStock = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [getmutation] = await connection.query(
            `SELECT * FROM tb_mutasistock WHERE tanggal='${tanggal_skrg}'`
        );
        // console.log(body.live_stok)
        // console.log(getmutation)

        if (getmutation > 0) {
            var hasil = 'SETTLE_ADA'
        } else {
            await connection.query(
                `INSERT INTO tb_settlement (tanggal, stok_akhir, created_at, updated_at)
            VALUES ('${tanggal_skrg}','${body.live_stok}','${tanggal}','${tanggal}')`
            );

            var hasil = 'SETTLE_SUKSES'
        }

        await connection.commit();
        await connection.release();
        return hasil;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getRetur = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    const tanggal = body.tanggal;
    const myArray = tanggal.split(" to ");

    if (tanggal.length > 10) {
        var tanggal_start = myArray[0];
        var tanggal_end = myArray[1];
    } else {
        var tanggal_start = tanggal;
        var tanggal_end = tanggal;
    }

    try {
        await connection.beginTransaction();

        if (body.datechange === "dateinput") {
            if (body.query === "all") {
                if (body.store === "all") {
                    var [getretur] = await connection.query(
                        `SELECT tb_retur.*,tb_store.*,tb_mutasistock.tanggal as tanggal_input FROM tb_retur LEFT JOIN tb_store ON tb_retur.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_retur.id DESC`
                    );
                } else if (body.store === "all_area") {
                    var [getretur] = await connection.query(
                        `SELECT tb_retur.*,tb_store.*,tb_mutasistock.tanggal as tanggal_input FROM tb_retur LEFT JOIN tb_store ON tb_retur.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur.id_pesanan = tb_mutasistock.id_pesanan WHERE tb_store.id_area='${body.area}' AND (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_retur.id DESC`
                    );
                } else {
                    var [getretur] = await connection.query(
                        `SELECT tb_retur.*,tb_store.*,tb_mutasistock.tanggal as tanggal_input FROM tb_retur LEFT JOIN tb_store ON tb_retur.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur.id_pesanan = tb_mutasistock.id_pesanan WHERE tb_retur.id_store='${body.store}' AND (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_retur.id DESC`
                    );
                }
            } else {
                if (body.store === "all") {
                    var [getretur] = await connection.query(
                        `SELECT tb_retur.*,tb_store.*,tb_mutasistock.tanggal as tanggal_input FROM tb_retur LEFT JOIN tb_store ON tb_retur.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_retur.id_pesanan LIKE '%${body.query}%' OR tb_retur.id_produk LIKE '%${body.query}%' OR tb_retur.produk LIKE '%${body.query}%') ORDER BY tb_retur.id DESC`
                    );
                } else if (body.store === "all_area") {
                    var [getretur] = await connection.query(
                        `SELECT tb_retur.*,tb_store.*,tb_mutasistock.tanggal as tanggal_input FROM tb_retur LEFT JOIN tb_store ON tb_retur.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_retur.id_pesanan LIKE '%${body.query}%' OR tb_retur.id_produk LIKE '%${body.query}%' OR tb_retur.produk LIKE '%${body.query}%') AND tb_store.id_area='${body.area}' ORDER BY tb_retur.id DESC`
                    );
                } else {
                    var [getretur] = await connection.query(
                        `SELECT tb_retur.*,tb_store.*,tb_mutasistock.tanggal as tanggal_input FROM tb_retur LEFT JOIN tb_store ON tb_retur.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_retur.id_pesanan LIKE '%${body.query}%' OR tb_retur.id_produk LIKE '%${body.query}%' OR tb_retur.produk LIKE '%${body.query}%') AND tb_retur.id_store='${body.store}' ORDER BY tb_retur.id DESC`
                    );
                }
            }
        } else {
            if (body.query === "all") {
                if (body.store === "all") {
                    var [getretur] = await connection.query(
                        `SELECT tb_retur.*,tb_store.*,tb_mutasistock.tanggal as tanggal_input FROM tb_retur LEFT JOIN tb_store ON tb_retur.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_retur.tanggal_retur BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_retur.id DESC`
                    );
                } else if (body.store === "all_area") {
                    var [getretur] = await connection.query(
                        `SELECT tb_retur.*,tb_store.*,tb_mutasistock.tanggal as tanggal_input FROM tb_retur LEFT JOIN tb_store ON tb_retur.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur.id_pesanan = tb_mutasistock.id_pesanan WHERE tb_store.id_area='${body.area}' AND (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_retur.tanggal_retur BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_retur.id DESC`
                    );
                } else {
                    var [getretur] = await connection.query(
                        `SELECT tb_retur.*,tb_store.*,tb_mutasistock.tanggal as tanggal_input FROM tb_retur LEFT JOIN tb_store ON tb_retur.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur.id_pesanan = tb_mutasistock.id_pesanan WHERE tb_retur.id_store='${body.store}' AND (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_retur.tanggal_retur BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_retur.id DESC`
                    );
                }
            } else {
                if (body.store === "all") {
                    var [getretur] = await connection.query(
                        `SELECT tb_retur.*,tb_store.*,tb_mutasistock.tanggal as tanggal_input FROM tb_retur LEFT JOIN tb_store ON tb_retur.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_retur.id_pesanan LIKE '%${body.query}%' OR tb_retur.id_produk LIKE '%${body.query}%' OR tb_retur.produk LIKE '%${body.query}%') ORDER BY tb_retur.id DESC`
                    );
                } else if (body.store === "all_area") {
                    var [getretur] = await connection.query(
                        `SELECT tb_retur.*,tb_store.*,tb_mutasistock.tanggal as tanggal_input FROM tb_retur LEFT JOIN tb_store ON tb_retur.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_retur.id_pesanan LIKE '%${body.query}%' OR tb_retur.id_produk LIKE '%${body.query}%' OR tb_retur.produk LIKE '%${body.query}%') AND tb_store.id_area='${body.area}' ORDER BY tb_retur.id DESC`
                    );
                } else {
                    var [getretur] = await connection.query(
                        `SELECT tb_retur.*,tb_store.*,tb_mutasistock.tanggal as tanggal_input FROM tb_retur LEFT JOIN tb_store ON tb_retur.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_retur.id_store='${body.store}' AND (tb_retur.id_pesanan LIKE '%${body.query}%' OR tb_retur.id_produk LIKE '%${body.query}%' OR tb_retur.produk LIKE '%${body.query}%') ORDER BY tb_retur.id DESC`
                    );
                }
            }
        }
        console.log(getretur.length);


        await connection.commit();
        await connection.release();

        return getretur;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getRefund = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    const tanggal = body.tanggal;
    const myArray = tanggal.split(" to ");
    if (tanggal.length > 10) {
        var tanggal_start = myArray[0];
        var tanggal_end = myArray[1];
    } else {
        var tanggal_start = tanggal;
        var tanggal_end = tanggal;
    }
    try {
        await connection.beginTransaction();

        if (body.datechange === "dateinput") {
            if (body.query === "all") {
                if (body.store === "all") {
                    var [getretur] = await connection.query(
                        `SELECT tb_refund.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_refund LEFT JOIN tb_store ON tb_refund.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_refund.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_refund.id DESC`
                    );
                } else if (body.store === "all_area") {
                    var [getretur] = await connection.query(
                        `SELECT tb_refund.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_refund LEFT JOIN tb_store ON tb_refund.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_refund.id_pesanan = tb_mutasistock.id_pesanan WHERE tb_store.id_area='${body.area}' AND (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_refund.id DESC`
                    );
                } else {
                    var [getretur] = await connection.query(
                        `SELECT tb_refund.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_refund LEFT JOIN tb_store ON tb_refund.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_refund.id_pesanan = tb_mutasistock.id_pesanan WHERE tb_refund.id_store='${body.store}' AND (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_refund.id DESC`
                    );
                }
            } else {
                if (body.store === "all") {
                    var [getretur] = await connection.query(
                        `SELECT tb_refund.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_refund LEFT JOIN tb_store ON tb_refund.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_refund.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_refund.id_pesanan LIKE '%${body.query}%' OR tb_refund.id_produk LIKE '%${body.query}%' OR tb_refund.produk LIKE '%${body.query}%') ORDER BY tb_refund.id DESC`
                    );
                } else if (body.store === "all_area") {
                    var [getretur] = await connection.query(
                        `SELECT tb_refund.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_refund LEFT JOIN tb_store ON tb_refund.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_refund.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_refund.id_pesanan LIKE '%${body.query}%' OR tb_refund.id_produk LIKE '%${body.query}%' OR tb_refund.produk LIKE '%${body.query}%') AND tb_store.id_area='${body.area}' ORDER BY tb_refund.id DESC`
                    );
                } else {
                    var [getretur] = await connection.query(
                        `SELECT tb_refund.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_refund LEFT JOIN tb_store ON tb_refund.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_refund.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_refund.id_pesanan LIKE '%${body.query}%' OR tb_refund.id_produk LIKE '%${body.query}%' OR tb_refund.produk LIKE '%${body.query}%') AND tb_refund.id_store='${body.store}' ORDER BY tb_refund.id DESC`
                    );
                }
            }
        } else {
            if (body.query === "all") {
                if (body.store === "all") {
                    var [getretur] = await connection.query(
                        `SELECT tb_refund.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_refund LEFT JOIN tb_store ON tb_refund.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_refund.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_refund.tanggal_refund BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_refund.id DESC`
                    );
                } else if (body.store === "all_area") {
                    var [getretur] = await connection.query(
                        `SELECT tb_refund.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_refund LEFT JOIN tb_store ON tb_refund.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_refund.id_pesanan = tb_mutasistock.id_pesanan WHERE tb_store.id_area='${body.area}' AND (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_refund.tanggal_refund BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_refund.id DESC`
                    );
                } else {
                    var [getretur] = await connection.query(
                        `SELECT tb_refund.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_refund LEFT JOIN tb_store ON tb_refund.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_refund.id_pesanan = tb_mutasistock.id_pesanan WHERE tb_refund.id_store='${body.store}' AND (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_refund.tanggal_refund BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_refund.id DESC`
                    );
                }
            } else {
                if (body.store === "all") {
                    var [getretur] = await connection.query(
                        `SELECT tb_refund.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_refund LEFT JOIN tb_store ON tb_refund.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_refund.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_refund.id_pesanan LIKE '%${body.query}%' OR tb_refund.id_produk LIKE '%${body.query}%' OR tb_refund.produk LIKE '%${body.query}%') ORDER BY tb_refund.id DESC`
                    );
                } else if (body.store === "all_area") {
                    var [getretur] = await connection.query(
                        `SELECT tb_refund.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_refund LEFT JOIN tb_store ON tb_refund.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_refund.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_refund.id_pesanan LIKE '%${body.query}%' OR tb_refund.id_produk LIKE '%${body.query}%' OR tb_refund.produk LIKE '%${body.query}%') AND tb_store.id_area='${body.area}' ORDER BY tb_refund.id DESC`
                    );
                } else {
                    var [getretur] = await connection.query(
                        `SELECT tb_refund.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_refund LEFT JOIN tb_store ON tb_refund.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_refund.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_refund.id_pesanan LIKE '%${body.query}%' OR tb_refund.id_produk LIKE '%${body.query}%' OR tb_refund.produk LIKE '%${body.query}%') AND tb_refund.id_store='${body.store}' ORDER BY tb_refund.id DESC`
                    );
                }
            }
        }

        await connection.commit();
        await connection.release();

        return getretur;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getNamaware = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [data_warehouse] = await connection.query(
            `SELECT tb_warehouse.warehouse,tb_area.kota FROM tb_warehouse LEFT JOIN tb_area ON tb_warehouse.id_area = tb_area.id_area WHERE tb_warehouse.id_area='${body.area}' GROUP BY tb_warehouse.id_area`
        );
        await connection.commit();
        await connection.release();
        return data_warehouse;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const get_upprice = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        if (body.role === "SUPER-ADMIN" && body.role === "HEAD-AREA") {
            var [getstores] = await connection.query(
                `SELECT id_area FROM tb_store WHERE id_store='${body.id_store}'`
            );
            for (let x = 0; x < getstores.length; x++) {
                var [data_upprice] = await connection.query(
                    `SELECT m_price,g_price,r_price,n_price,id_area FROM tb_area WHERE id_area='${getstores[x].id_area}'`
                );
                var m_price = data_upprice[0].m_price;
                var g_price = data_upprice[0].g_price;
                var r_price = data_upprice[0].r_price;
                var n_price = data_upprice[0].n_price;
            }
        } else {
            var [getstores] = await connection.query(
                `SELECT id_area FROM tb_store WHERE id_store='${body.area}'`
            );
            for (let x = 0; x < getstores.length; x++) {
                var [data_upprice] = await connection.query(
                    `SELECT m_price,g_price,r_price,n_price,id_area FROM tb_area WHERE id_area='${getstores[x].id_area}'`
                );
                var m_price = data_upprice[0].m_price;
                var g_price = data_upprice[0].g_price;
                var r_price = data_upprice[0].r_price;
                var n_price = data_upprice[0].n_price;
            }
        }


        await connection.commit();
        await connection.release();

        return {
            m_price,
            g_price,
            r_price,
            n_price,
        };
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getHistoripotransfer = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [data_historypo] = await connection.query(
            `SELECT * FROM tb_purchaseorder WHERE tipe_order="TRANSFER" AND tipe_order != "SO_GUDANG" GROUP BY idpo ORDER BY id DESC LIMIT 1`
        );

        await connection.commit();
        await connection.release();

        return data_historypo;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getPotransfer = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    const tanggal = body.date;
    const myArray = tanggal.split(" to ");
    const tipepo = body.Filter_Tipe_po;
    const supplier = body.Filter_Supplier;
    const users = body.Filter_Tipe_user;
    const warehouse = body.Filter_Tipe_warehouse;

    if (tanggal.length > 10) {
        var tanggal_start = myArray[0];
        var tanggal_end = myArray[1];
    } else {
        var tanggal_start = tanggal;
        var tanggal_end = tanggal;
    }
    if (warehouse === "all") {

        if (body.query === "all" && users === "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tipe_order='TRANSFER IN' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN'  AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND qty > '0' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }
        if (body.query != "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}'  AND tipe_order='TRANSFER IN' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY idpo`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }
        if (users != "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tipe_order='TRANSFER IN' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN'  AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order != 'SO_GUDANG' AND tipe_order='TRANSFER IN' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }
        if (body.query != "all" && users != "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tipe_order='TRANSFER IN' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY idpo`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }

    } else {
        if (body.query === "all" && users === "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' AND tipe_order='TRANSFER IN' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN'  AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND qty > '0' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}'`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }
        if (body.query != "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}'  AND tipe_order='TRANSFER IN' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY idpo`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }
        if (users != "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' AND tipe_order='TRANSFER IN' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN'  AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}'`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }
        if (body.query != "all" && users != "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' AND tipe_order='TRANSFER IN' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order='TRANSFER IN' AND tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY idpo`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }
    }

    const datas = [];

    try {
        await connection.beginTransaction();
        var total_qty = 0;
        var total_cost = 0;

        for (let index = 0; index < get_po.length; index++) {

            if (warehouse === "all") {
                var [get_detail] = await connection.query(
                    `SELECT tb_purchaseorder.*,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND tb_purchaseorder.users='${get_po[index].users}'  AND tb_purchaseorder.tipe_order != 'RELEASE' AND tb_purchaseorder.tipe_order='TRANSFER IN' AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                );
            } else {
                var [get_detail] = await connection.query(
                    `SELECT tb_purchaseorder.*,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND tb_purchaseorder.users='${get_po[index].users}' AND tb_purchaseorder.id_ware='${warehouse}'  AND tb_purchaseorder.tipe_order='TRANSFER IN' AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                );
            }


            const datas2 = [];

            for (let i = 0; i < get_detail.length; i++) {


                var [get_produk] = await connection.query(
                    `SELECT * FROM tb_produk WHERE id_produk='${get_detail[i].id_produk}'`
                );

                var [get_ware] = await connection.query(
                    `SELECT * FROM tb_warehouse WHERE id_ware='${get_detail[i].id_ware}'`
                );
                for (let qq = 0; qq < get_ware.length; qq++) {
                    var getsware = get_ware[qq].warehouse;
                }

                var [get_supplier_transfer] = await connection.query(
                    `SELECT tb_warehouse.warehouse,tb_purchaseorder.id_sup FROM tb_warehouse LEFT JOIN tb_purchaseorder ON tb_warehouse.id_ware = tb_purchaseorder.id_sup WHERE tb_purchaseorder.tipe_order='TRANSFER IN' AND tb_purchaseorder.id_sup='${get_detail[i].id_sup}'`
                );

                for (let zz = 0; zz < get_supplier_transfer.length; zz++) {
                    var supplier_transfer = get_supplier_transfer[zz].warehouse;
                }

                if (warehouse === "all") {

                    var [get_total] = await connection.query(
                        `SELECT SUM(total_amount) as hasil_amount,SUM(qty) as hasil_qty FROM tb_purchaseorder WHERE tanggal_receive='${get_detail[i].tanggal_receive}' AND users='${get_detail[i].users}' AND tipe_order='TRANSFER IN' GROUP BY tanggal_receive,users`
                    );
                } else {

                    var [get_total] = await connection.query(
                        `SELECT SUM(total_amount) as hasil_amount,SUM(qty) as hasil_qty FROM tb_purchaseorder WHERE tanggal_receive='${get_detail[i].tanggal_receive}' AND users='${get_detail[i].users}' AND id_ware='${warehouse}' AND tipe_order='TRANSFER IN' GROUP BY tanggal_receive,users`
                    );
                }

                if (get_detail[i].tipe_order === "TRANSFER IN") {

                    datas2.push({
                        id: get_detail[i].id,
                        idpo: get_detail[i].idpo,
                        tanggal_receive: get_detail[i].tanggal_receive,
                        id_sup: get_detail[i].id_sup,
                        id_produk: get_detail[i].id_produk,
                        id_ware: get_detail[i].id_ware,
                        qty: get_detail[i].qty,
                        m_price: get_detail[i].m_price,
                        total_amount: get_detail[i].total_amount,
                        tipe_order: get_detail[i].tipe_order,
                        id_act: get_detail[i].id_act,
                        produk: get_produk[0].produk,
                        gudang: getsware,
                        supplier: supplier_transfer,
                    });
                }
                total_qty = 0 + parseInt(get_total[0].hasil_qty);
                total_cost = 0 + parseInt(get_total[0].hasil_amount);
            }



            datas.push({
                tanggal: get_po[index].tanggal_receive,
                id_so: get_po[index].idpo,
                users: get_po[index].users,
                total_qty: total_qty,
                total_cost: total_cost,
                detail: datas2,
            });
            var created_at = get_po[index].tanggal_receive;
        }
        console.log(datas)
        await connection.commit();
        await connection.release();
        return {
            datas,
            total_po: total_po.length ? total_po.length : 0,
            total_qty: hasil_totalqty ? hasil_totalqty : 0,
            capital_amount: hasil_amount ? hasil_amount : 0,
            created_at: created_at,
        };

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getuserpo = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [get_user] = await connection.query(
            `SELECT users FROM tb_purchaseorder GROUP BY users ORDER BY users ASC`
        );



        await connection.commit();
        await connection.release();

        return get_user;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getusertransfer = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        if (body.user_role === "SUPER-ADMIN") {
            var [get_user] = await connection.query(
                `SELECT users FROM tb_purchaseorder GROUP BY users ORDER BY users ASC`
            );
        } else {
            var [get_user] = await connection.query(
                `SELECT users FROM tb_purchaseorder WHERE users='${body.user_login}' GROUP BY users ORDER BY users ASC`
            );
        }

        await connection.commit();
        await connection.release();

        return get_user;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getstoredisplay = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        if (body.role === "SUPER-ADMIN") {
            var [get_store] = await connection.query(
                `SELECT * FROM tb_store ORDER BY id ASC`
            );
        } else if (body.role === "HEAD-AREA") {
            var [get_store] = await connection.query(
                `SELECT * FROM tb_store WHERE id_area='${body.store}' ORDER BY id ASC `
            );
        } else {
            var [get_store] = await connection.query(
                `SELECT * FROM tb_store WHERE id_store='${body.store}' ORDER BY id ASC`
            );
        }

        await connection.commit();
        await connection.release();

        return get_store;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const addDisplay = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        if (body.store === "all") {
            var [cek_id_store] = await connection.query(
                `SELECT * FROM tb_store ORDER BY id ASC`
            );

            var getidstore = cek_id_store[0].id_store;
        } else {
            var getidstore = body.store;
        }

        const [get_produk] = await connection.query(
            `SELECT * FROM tb_produk WHERE id_produk='${body.select_id_produk}' AND id_ware='${body.select_warehouse}'`
        );

        for (let x = 0; x < get_produk.length; x++) {
            await connection.query(
                `INSERT INTO displays (tanggal, id_produk, id_ware, id_store, brand, produk, size, qty, users, created_at, updated_at) VALUES 
                ('${tanggal_skrg}','${get_produk[x].id_produk}','${get_produk[x].id_ware}','${getidstore}','${get_produk[x].id_brand}','${get_produk[x].produk}','${body.select_size}','1','${body.user}','${tanggal}','${tanggal}')`
            );
        }

        await connection.commit();
        await connection.release();

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const deleteDisplay = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        await connection.query(
            `DELETE FROM displays WHERE id_produk='${body.id}' AND id_ware='${body.idware}'`
        );

        await connection.commit();
        await connection.release();
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const cariwares = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    const datas = [];
    try {
        await connection.beginTransaction();

        const [cariwares] = await connection.query(
            `SELECT id_ware FROM tb_store WHERE id_store='${body.id_store}'`
        );
        for (let index = 0; index < cariwares.length; index++) {
            var [cariwares_nama] = await connection.query(
                `SELECT id_ware,warehouse,address FROM tb_warehouse WHERE id_ware='${cariwares[index].id_ware}'`
            );

            var cariwares2 = cariwares_nama[index].id_ware;
            var nama_warehouses = cariwares_nama[index].warehouse;
            var address = cariwares_nama[index].address;
        }

        datas.push({
            cariwares: cariwares2,
            nama_warehouses: nama_warehouses,
            address: address,
        });

        await connection.commit();
        await connection.release();
        return datas
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getwarehousetransfer = async (body) => {
    const connection = await dbPool.getConnection();

    const tanggal = body.date;
    const users = body.user_login;
    const myArray = tanggal.split(" to ");

    if (tanggal.length > 10) {
        var tanggal_start = myArray[0];
        var tanggal_end = myArray[1];
    } else {
        var tanggal_start = tanggal;
        var tanggal_end = tanggal;
    }
    try {
        await connection.beginTransaction();

        if (body.Filter_Tipe_user === 'all') {
            var [cariwares] = await connection.query(
                `SELECT tb_purchaseorder.id_ware,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.id_ware`
            );
        } else {
            var [cariwares] = await connection.query(
                `SELECT tb_purchaseorder.id_ware,tb_warehouse.warehouse FROM tb_purchaseorder LEFT JOIN tb_warehouse ON tb_purchaseorder.id_ware = tb_warehouse.id_ware WHERE tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND users='${users}' GROUP BY tb_purchaseorder.id_ware`
            );
        }

        await connection.commit();
        await connection.release();

        return cariwares
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const cariwaresretur = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    const datas = [];
    try {
        await connection.beginTransaction();

        const [cariwares] = await connection.query(
            `SELECT id_ware,warehouse FROM tb_warehouse WHERE id_ware='${body.id_ware}'`
        );

        await connection.commit();
        await connection.release();
        return cariwares
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getusersales = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        if (body.user_role === "SUPER-ADMIN" || body.user_role === "HEAD-AREA") {
            var [get_user] = await connection.query(
                `SELECT name as users FROM tb_karyawan GROUP BY name ORDER BY name ASC`
            );
        } else {
            var [get_user] = await connection.query(
                `SELECT name as users FROM tb_karyawan WHERE name='${body.user_login}' GROUP BY name ORDER BY name ASC`
            );
        }

        await connection.commit();
        await connection.release();

        return get_user;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};



const getdeleteorder = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    const tanggal = body.tanggal;
    const myArray = tanggal.split(" to ");

    if (tanggal.length > 10) {
        var tanggal_start = myArray[0];
        var tanggal_end = myArray[1];
    } else {
        var tanggal_start = tanggal;
        var tanggal_end = tanggal;
    }

    try {
        await connection.beginTransaction();

        if (body.query === "all") {
            if (body.store === "all") {
                var [getdeleteorder] = await connection.query(
                    `SELECT tb_mutasistock.*,tb_store.store,tb_warehouse.warehouse FROM tb_mutasistock LEFT JOIN tb_store ON tb_mutasistock.id_store = tb_store.id_store LEFT JOIN tb_warehouse ON tb_mutasistock.id_ware = tb_warehouse.id_ware WHERE tb_mutasistock.mutasi='DELETE_ORDER' AND tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_mutasistock.id DESC`
                );
            } else if (body.store === "all_area") {
                var [getdeleteorder] = await connection.query(
                    `SELECT tb_mutasistock.*,tb_store.store,tb_warehouse.warehouse FROM tb_mutasistock LEFT JOIN tb_store ON tb_mutasistock.id_store = tb_store.id_store LEFT JOIN tb_warehouse ON tb_mutasistock.id_ware = tb_warehouse.id_ware WHERE tb_store.id_area='${body.area}' AND tb_mutasistock.mutasi='DELETE_ORDER' AND tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_mutasistock.id DESC`
                );
            } else {
                var [getdeleteorder] = await connection.query(
                    `SELECT tb_mutasistock.*,tb_store.store,tb_warehouse.warehouse FROM tb_mutasistock LEFT JOIN tb_store ON tb_mutasistock.id_store = tb_store.id_store LEFT JOIN tb_warehouse ON tb_mutasistock.id_ware = tb_warehouse.id_ware WHERE tb_mutasistock.mutasi='DELETE_ORDER' AND tb_store.id_store='${body.store}' AND tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_mutasistock.id DESC`
                );
            }
        } else {
            if (body.store === "all") {
                var [getdeleteorder] = await connection.query(
                    `SELECT tb_mutasistock.*,tb_store.store,tb_warehouse.warehouse FROM tb_mutasistock LEFT JOIN tb_store ON tb_mutasistock.id_store = tb_store.id_store LEFT JOIN tb_warehouse ON tb_mutasistock.id_ware = tb_warehouse.id_ware WHERE (tb_mutasistock.id_pesanan LIKE '%${body.query}%' OR tb_mutasistock.id_produk LIKE '%${body.query}%' OR tb_mutasistock.produk LIKE '%${body.query}%') AND tb_mutasistock.mutasi='DELETE_ORDER' ORDER BY tb_mutasistock.id DESC`
                );
            } else if (body.store === "all_area") {
                var [getdeleteorder] = await connection.query(
                    `SELECT tb_mutasistock.*,tb_store.store,tb_warehouse.warehouse FROM tb_mutasistock LEFT JOIN tb_store ON tb_mutasistock.id_store = tb_store.id_store LEFT JOIN tb_warehouse ON tb_mutasistock.id_ware = tb_warehouse.id_ware WHERE (tb_mutasistock.id_pesanan LIKE '%${body.query}%' OR tb_mutasistock.id_produk LIKE '%${body.query}%' OR tb_mutasistock.produk LIKE '%${body.query}%') AND tb_store.id_area='${body.area}' AND tb_mutasistock.mutasi='DELETE_ORDER' ORDER BY tb_mutasistock.id DESC`
                );
            } else {
                var [getdeleteorder] = await connection.query(
                    `SELECT tb_mutasistock.*,tb_store.store,tb_warehouse.warehouse FROM tb_mutasistock LEFT JOIN tb_store ON tb_mutasistock.id_store = tb_store.id_store LEFT JOIN tb_warehouse ON tb_mutasistock.id_ware = tb_warehouse.id_ware WHERE (tb_mutasistock.id_pesanan LIKE '%${body.query}%' OR tb_mutasistock.id_produk LIKE '%${body.query}%' OR tb_mutasistock.produk LIKE '%${body.query}%') AND tb_mutasistock.mutasi='DELETE_ORDER' AND tb_store.id_store='${body.store}' ORDER BY tb_mutasistock.id DESC`
                );
            }
        }

        await connection.commit();
        await connection.release();

        return getdeleteorder;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const editstockopname = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    const [cek_mutasi] = await connection.query(
        `SELECT MAX(id_mutasi) as id_mutasi FROM tb_mutasistock`
    );
    if (cek_mutasi[0].id_mutasi === null) {
        var id_mutasi = "MT-" + "00000001";
    } else {
        const get_last2 = cek_mutasi[0].id_mutasi;
        const data_2 = get_last2.toString().slice(-8);
        const hasil = parseInt(data_2) + 1;
        var id_mutasi = "MT-" + String(hasil).padStart(8, "0");
    }

    try {
        await connection.beginTransaction();
        var variasi = body.data.variasirestock;
        var total_qty = 0;

        const [produk_baru] = await connection.query(
            `SELECT produk FROM tb_produk WHERE id_produk='${body.idproduk}' AND id_ware='${body.id_ware}'`
        );

        const [getwarehouse] = await connection.query(
            `SELECT warehouse FROM tb_warehouse WHERE id_ware='${body.id_ware}'`
        );

        const [getpo] = await connection.query(
            `SELECT m_price FROM tb_purchaseorder WHERE id_act='${body.id_act}'`
        );

        for (let index = 0; index < variasi.length; index++) {
            var [getdatavariation_total] = await connection.query(
                `SELECT SUM(qty) AS totalqty FROM tb_variation WHERE id_produk='${body.idproduk}' AND id_ware='${body.id_ware}' AND size='${variasi[index].size}' AND qty != 0 ORDER BY id ASC`
            );

            var [getdatavariation] = await connection.query(
                `SELECT id_produk,id_ware,idpo,size,qty,id_area FROM tb_variation WHERE id_produk='${body.idproduk}' AND id_ware='${body.id_ware}' AND size='${variasi[index].size}' AND qty != 0 ORDER BY id ASC`
            );

            var selisih = parseInt(variasi[index].stok_baru) - parseInt(variasi[index].stok_lama);
            if (variasi[index].stok_baru != variasi[index].stok_lama) {
                for (let x = 0; x < getdatavariation.length; x++) {
                    console.log("selisih=", selisih);

                    if (x === (getdatavariation.length - 1)) {
                        if (selisih < 0) {
                            await connection.query(
                                `UPDATE tb_variation SET qty='${parseInt(getdatavariation_total[0].totalqty) + parseInt(selisih)}',updated_at='${tanggal}' WHERE id_produk='${getdatavariation[x].id_produk}' AND id_ware='${getdatavariation[x].id_ware}' AND size='${getdatavariation[x].size}' AND idpo='${getdatavariation[x].idpo}'`
                            );
                        } else {
                            await connection.query(
                                `UPDATE tb_variation SET qty='${parseInt(getdatavariation_total[0].totalqty) + parseInt(selisih)}',updated_at='${tanggal}' WHERE id_produk='${getdatavariation[x].id_produk}' AND id_ware='${getdatavariation[x].id_ware}' AND size='${getdatavariation[x].size}' AND idpo='${getdatavariation[x].idpo}'`
                            );
                        }
                    } else {
                        await connection.query(
                            `UPDATE tb_variation SET qty='0',updated_at='${tanggal}' WHERE id_produk='${getdatavariation[x].id_produk}' AND id_ware='${getdatavariation[x].id_ware}' AND size='${getdatavariation[x].size}' AND idpo='${getdatavariation[x].idpo}'`
                        );
                    }

                    if (x === 0) {
                        await connection.query(
                            `UPDATE tb_variationorder SET qty='${variasi[index].stok_baru}',updated_at='${tanggal}' WHERE id_act='${body.id_act}' AND size='${variasi[index].size}' AND id_ware='${getdatavariation[x].id_ware}'`
                        );

                        // Update Variation Old QTY
                        await connection.query(
                            `INSERT INTO tb_mutasistock
                            (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
                            VALUES ('${id_mutasi}','${tanggal_skrg}','EDIT STOCK OPNAME','${getdatavariation[x].id_ware}','-','${getdatavariation[x].id_produk}','${produk_baru[0].produk}','${body.idpo}','${variasi[index].size}','${variasi[index].stok_baru}','Barang Gudang','${getwarehouse[0].warehouse}','EDIT STOCK OPNAME','${body.users}','${tanggal}','${tanggal}')`
                        );
                        total_qty = total_qty + parseInt(variasi[index].stok_baru);
                    }
                }
            }
        }

        await connection.query(
            `UPDATE tb_purchaseorder SET total_amount='${parseInt(getpo[0].m_price) * parseInt(total_qty)}',qty='${total_qty}',m_price='${getpo[0].m_price}',updated_at='${tanggal}' WHERE id_produk='${body.idproduk}' AND id_act='${body.id_act}' AND id_ware='${body.id_ware}'`
        );

        await connection.commit();
        await connection.release();
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const deleteitemso = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");


    const [cek_po] = await connection.query(
        `SELECT MAX(idpo) as idpo FROM tb_purchaseorder`
    );
    if (cek_po[0].idpo === null) {
        var idpo = tahun + "0001";
    } else {
        const get_last2 = cek_po[0].idpo;
        const data_2 = get_last2.toString().slice(-4);
        const hasil = parseInt(data_2) + 1;
        var idpo = tahun + String(hasil).padStart(4, "0");
    }

    const [cek_act] = await connection.query(
        `SELECT MAX(id_act) as id_act FROM tb_purchaseorder`
    );
    if (cek_act[0].id_act === null) {
        var id_act = "0001";
    } else {
        const get_last2 = cek_act[0].id_act;
        const data_2 = get_last2.toString().slice(-4);
        const hasil = parseInt(data_2) + 1;
        var id_act = String(hasil).padStart(4, "0");
    }

    const [cek_mutasi] = await connection.query(
        `SELECT MAX(id_mutasi) as id_mutasi FROM tb_mutasistock`
    );
    if (cek_mutasi[0].id_mutasi === null) {
        var id_mutasi = "MT-" + "00000001";
    } else {
        const get_last2 = cek_mutasi[0].id_mutasi;
        const data_2 = get_last2.toString().slice(-8);
        const hasil = parseInt(data_2) + 1;
        var id_mutasi = "MT-" + String(hasil).padStart(8, "0");
    }

    try {
        await connection.beginTransaction();

        var [getpo] = await connection.query(
            `SELECT tb_variationorder.*,tb_purchaseorder.id_sup,tb_purchaseorder.qty AS totalqty,tb_purchaseorder.m_price FROM tb_variationorder LEFT JOIN tb_purchaseorder ON tb_variationorder.id_act = tb_purchaseorder.id_act WHERE tb_variationorder.id_act='${body.id_act}'  ORDER BY tb_variationorder.id ASC`
        );

        var [getpo_order] = await connection.query(
            `SELECT tb_variationorder.qty,tb_variationorder.id_sup,tb_variationorder.idpo FROM tb_variationorder LEFT JOIN tb_purchaseorder ON tb_variationorder.id_act = tb_purchaseorder.id_act WHERE tb_variationorder.id_act='${body.id_act}' ORDER BY tb_variationorder.id ASC`
        );

        var [get_var_sum] = await connection.query(
            `SELECT SUM(qty) AS totalqty FROM tb_variation WHERE id_produk='${getpo[0].id_produk}' AND id_ware='${getpo[0].id_ware}' AND size='${getpo[0].size}' AND qty > '0' ORDER BY idpo ASC`
        );

        const [getproducts] = await connection.query(
            `SELECT produk FROM tb_produk WHERE id_produk='${getpo[0].id_produk}'`
        );

        const [getwarehouse] = await connection.query(
            `SELECT warehouse FROM tb_warehouse WHERE id_ware='${getpo[0].id_ware}'`
        );

        var totalqty = 0;
        for (let index = 0; index < getpo.length; index++) {
            totalqty = parseInt(totalqty) + parseInt(getpo_order[index].qty);

            if (getpo[index].qty < 0) {

                await connection.query(
                    `UPDATE tb_variation SET qty='${parseInt(get_var_sum[0].totalqty ? get_var_sum[0].totalqty : 0) - parseInt(getpo_order[index].qty)}',id_ware='${getpo_order[index].id_sup}',idpo='${getpo_order[index].idpo}',updated_at='${tanggal}' WHERE id_act='${body.id_act}' AND size='${getpo[index].size}'`
                );

                await connection.query(
                    `UPDATE tb_variationorder SET qty='0',tipe_order='CANCEL SO',updated_at='${tanggal}' WHERE id_act='${body.id_act}'`
                );
            } else {

                await connection.query(
                    `UPDATE tb_variation SET qty='${parseInt(get_var_sum[0].totalqty ? get_var_sum[0].totalqty : 0) - parseInt(getpo_order[index].qty)}',idpo='${getpo_order[index].idpo}',updated_at='${tanggal}' WHERE id_act='${body.id_act}' AND size='${getpo[index].size}'`
                );

                await connection.query(
                    `UPDATE tb_variationorder SET qty='0',tipe_order='CANCEL SO',updated_at='${tanggal}' WHERE id_act='${body.id_act}'`
                );
            }
            // // Update Variation Old QTY
            await connection.query(
                `INSERT INTO tb_mutasistock
            (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
            VALUES ('${id_mutasi}','${tanggal_skrg}','CANCEL SO','${getpo[index].id_sup}','-','${getpo[index].id_produk}','${getproducts[0].produk}','${getpo[index].idpo}','${getpo[index].size}','${getpo[index].qty}','Barang Gudang','${getwarehouse[0].warehouse}','CANCEL SO','${body.users}','${tanggal}','${tanggal}')`
            );
        }
        await connection.query(
            `UPDATE tb_purchaseorder SET qty='${totalqty}',m_price='${getpo[0].m_price}',total_amount='0',tipe_order='CANCEL SO',updated_at='${tanggal}' WHERE id_act='${body.id_act}'`
        );

        await connection.commit();
        await connection.release();
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const edittransfer = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    const [cek_mutasi] = await connection.query(
        `SELECT MAX(id_mutasi) as id_mutasi FROM tb_mutasistock`
    );
    if (cek_mutasi[0].id_mutasi === null) {
        var id_mutasi = "MT-" + "00000001";
    } else {
        const get_last2 = cek_mutasi[0].id_mutasi;
        const data_2 = get_last2.toString().slice(-8);
        const hasil = parseInt(data_2) + 1;
        var id_mutasi = "MT-" + String(hasil).padStart(8, "0");
    }

    try {
        await connection.beginTransaction();
        var variasi = body.data.variasirestock;
        var total_qty = 0;

        const [produk_baru] = await connection.query(
            `SELECT produk FROM tb_produk WHERE id_produk='${body.idproduk}' AND id_ware='${body.id_ware}'`
        );

        const [getwarehouse] = await connection.query(
            `SELECT warehouse FROM tb_warehouse WHERE id_ware='${body.id_sup}'`
        );

        const [getpo] = await connection.query(
            `SELECT m_price FROM tb_purchaseorder WHERE id_act='${body.id_act}'`
        );

        for (let index = 0; index < variasi.length; index++) {
            var [getdatavariation_total] = await connection.query(
                `SELECT SUM(qty) AS totalqty FROM tb_variation WHERE id_produk='${body.idproduk}' AND id_ware='${body.id_sup}' AND size='${variasi[index].size}' AND qty != 0 ORDER BY id ASC`
            );

            var [getdatavariation] = await connection.query(
                `SELECT id_produk,id_ware,idpo,size,qty,id_area FROM tb_variation WHERE id_produk='${body.idproduk}' AND id_ware='${body.id_sup}' AND size='${variasi[index].size}' AND qty != 0 ORDER BY id ASC`
            );

            var selisih = parseInt(variasi[index].stok_lama) - parseInt(variasi[index].stok_baru);

            if (variasi[index].stok_baru != variasi[index].stok_lama) {

                for (let x = 0; x < getdatavariation.length; x++) {
                    if (x === (getdatavariation.length - 1)) {
                        if (selisih < 0) {
                            await connection.query(
                                `UPDATE tb_variation SET qty='${parseInt(getdatavariation_total[0].totalqty) + parseInt(selisih)}',updated_at='${tanggal}' WHERE id_produk='${getdatavariation[x].id_produk}' AND id_ware='${getdatavariation[x].id_ware}' AND size='${getdatavariation[x].size}' AND idpo='${getdatavariation[x].idpo}'`
                            );
                        } else {
                            await connection.query(
                                `UPDATE tb_variation SET qty='${parseInt(getdatavariation_total[0].totalqty) + parseInt(selisih)}',updated_at='${tanggal}' WHERE id_produk='${getdatavariation[x].id_produk}' AND id_ware='${getdatavariation[x].id_ware}' AND size='${getdatavariation[x].size}' AND idpo='${getdatavariation[x].idpo}'`
                            );
                        }
                    } else {
                        await connection.query(
                            `UPDATE tb_variation SET qty='0',updated_at='${tanggal}' WHERE id_produk='${getdatavariation[x].id_produk}' AND id_ware='${getdatavariation[x].id_ware}' AND size='${getdatavariation[x].size}'`
                        );
                    }
                    await connection.query(
                        `UPDATE tb_variation SET qty='${variasi[index].stok_baru}',updated_at='${tanggal}' WHERE id_act='${body.id_act}' AND id_ware='${body.id_ware}' AND size='${getdatavariation[x].size}'`
                    );

                    if (x === 0) {
                        await connection.query(
                            `UPDATE tb_variationorder SET qty='${variasi[index].stok_baru}',updated_at='${tanggal}' WHERE id_act='${body.id_act}' AND size='${variasi[index].size}' AND id_ware='${body.id_ware}'`
                        );
                        // Update Variation Old QTY
                        await connection.query(
                            `INSERT INTO tb_mutasistock
                            (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
                            VALUES ('${id_mutasi}','${tanggal_skrg}','EDIT TRANSFER','${body.id_ware}','-','${getdatavariation[x].id_produk}','${produk_baru[0].produk}','${getdatavariation[x].idpo}','${variasi[index].size}','${variasi[index].stok_baru}','Barang Gudang','${getwarehouse[0].warehouse}','EDIT TRANSFER','${body.users}','${tanggal}','${tanggal}')`
                        );
                        total_qty = parseInt(total_qty) + parseInt(variasi[index].stok_baru);
                    }
                }
            }
        }

        await connection.query(
            `UPDATE tb_purchaseorder SET total_amount='${parseInt(body.m_price) * parseInt(total_qty)}',qty='${total_qty}',m_price='${body.m_price}',updated_at='${tanggal}' WHERE id_act='${body.id_act}'`
        );

        await connection.commit();
        await connection.release();
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const deleteitempo = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    const [cek_mutasi] = await connection.query(
        `SELECT MAX(id_mutasi) as id_mutasi FROM tb_mutasistock`
    );
    if (cek_mutasi[0].id_mutasi === null) {
        var id_mutasi = "MT-" + "00000001";
    } else {
        const get_last2 = cek_mutasi[0].id_mutasi;
        const data_2 = get_last2.toString().slice(-8);
        const hasil = parseInt(data_2) + 1;
        var id_mutasi = "MT-" + String(hasil).padStart(8, "0");
    }

    try {
        await connection.beginTransaction();

        const [getpo] = await connection.query(
            `SELECT * FROM tb_variationorder WHERE id_act='${body.id_act}' AND qty != 0`
        );

        const [produk_baru] = await connection.query(
            `SELECT produk FROM tb_produk WHERE id_produk='${getpo[0].id_produk}' AND id_ware='${getpo[0].id_ware}'`
        );

        const [datapo] = await connection.query(
            `SELECT m_price,id_sup,idpo FROM tb_purchaseorder WHERE id_act='${body.id_act}'`
        );

        const [getsupplier] = await connection.query(
            `SELECT supplier FROM tb_supplier WHERE id_sup='${getpo[0].id_sup}'`
        );

        for (let index = 0; index < getpo.length; index++) {
            var stokawal = getpo[index].qty;
            var [getdatavariation_total] = await connection.query(
                `SELECT SUM(qty) AS totalqty FROM tb_variation WHERE id_produk='${getpo[index].id_produk}' AND id_ware='${getpo[index].id_ware}' AND size='${getpo[index].size}' AND qty != 0 ORDER BY id ASC`
            );
            var stokakhir = parseInt(getdatavariation_total[0].totalqty) - parseInt(stokawal)

            var [data_variasi] = await connection.query(
                `SELECT id_act,size,id_produk,id_ware FROM tb_variation WHERE id_produk='${getpo[index].id_produk}' AND id_ware='${getpo[index].id_ware}' AND size='${getpo[index].size}' AND qty != 0  ORDER BY id ASC`
            );

            var [cekidact] = await connection.query(
                `SELECT id_act FROM tb_variationorder WHERE id_produk='${getpo[index].id_produk}' AND id_ware='${getpo[index].id_ware}' AND size='${getpo[index].size}' AND qty != 0 AND id_act != '${body.id_act}' AND (tipe_order='RELEASE' OR tipe_order='RESTOCK') GROUP BY id_act ORDER BY id DESC`
            );

            for (let xx = 0; xx < data_variasi.length; xx++) {
                if (xx === (data_variasi.length - 1)) {
                    await connection.query(
                        `UPDATE tb_variation SET qty='${stokakhir}',updated_at='${tanggal}' WHERE size='${data_variasi[xx].size}' AND id_act='${cekidact[0].id_act}'`
                    );
                } else {
                    await connection.query(
                        `UPDATE tb_variation SET qty='0',updated_at='${tanggal}' WHERE id_produk='${data_variasi[xx].id_produk}' AND id_ware='${data_variasi[xx].id_ware}' AND size='${data_variasi[xx].size}'`
                    );
                }

                await connection.query(
                    `UPDATE tb_variationorder SET qty='0',tipe_order='DELETE PO',updated_at='${tanggal}' WHERE id_produk='${data_variasi[xx].id_produk}' AND id_ware='${data_variasi[xx].id_ware}' AND size='${data_variasi[xx].size}' AND id_act='${body.id_act}'`
                );

                if (xx === 0) {
                    // Update Variation Old QTY
                    await connection.query(
                        `INSERT INTO tb_mutasistock
                            (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
                            VALUES ('${id_mutasi}','${tanggal_skrg}','DELETE PO','${data_variasi[xx].id_ware}','-','${data_variasi[xx].id_produk}','${produk_baru[0].produk}','${getpo[0].idpo}','${data_variasi[xx].size}','${getpo[index].qty}','Barang Gudang','${getsupplier[0].supplier}','DELETE PO','${body.users}','${tanggal}','${tanggal}')`
                    );
                }
            }
        }
        await connection.query(
            `UPDATE tb_purchaseorder SET total_amount='0',qty='0',tipe_order='DELETE PO',updated_at='${tanggal}' WHERE id_act='${body.id_act}'`
        );

        await connection.commit();
        await connection.release();
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getpodefect = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    const tanggal = body.date;
    const myArray = tanggal.split(" to ");
    const tipepo = body.Filter_Tipe_po;
    const supplier = body.Filter_Supplier;
    const users = body.Filter_Tipe_user;
    const warehouse = body.Filter_Tipe_warehouse;

    if (tanggal.length > 10) {
        var tanggal_start = myArray[0];
        var tanggal_end = myArray[1];
    } else {
        var tanggal_start = tanggal;
        var tanggal_end = tanggal;
    }
    if (warehouse === "all") {

        if (body.query === "all" && users === "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tipe_order != 'RELEASE' AND tipe_order != 'RESTOCK' AND tipe_order != 'SO_GUDANG' AND tipe_order != 'TRANSFER OUT' AND tipe_order != 'DEFECT OUT' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='DEFECT IN'  AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' OR tipe_order='DEFECT OUT' AND qty > '0' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }
        if (body.query != "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}'  AND tipe_order != 'RELEASE' AND tipe_order != 'RESTOCK' AND tipe_order != 'SO_GUDANG' AND tipe_order != 'TRANSFER OUT' AND tipe_order != 'DEFECT OUT' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' AND tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' AND tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' OR tipe_order='DEFECT OUT' AND tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY idpo`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }
        if (users != "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tipe_order != 'RELEASE' AND tipe_order != 'RESTOCK' AND tipe_order != 'SO_GUDANG' AND tipe_order != 'TRANSFER OUT' AND tipe_order != 'DEFECT OUT' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='DEFECT IN'  AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order != 'SO_GUDANG' AND tipe_order='DEFECT IN' OR tipe_order='DEFECT OUT' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }
        if (body.query != "all" && users != "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND tipe_order != 'RELEASE' AND tipe_order != 'RESTOCK' AND tipe_order != 'SO_GUDANG' AND tipe_order != 'TRANSFER OUT' AND tipe_order != 'DEFECT OUT' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' AND tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' AND tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' AND tipe_order='DEFECT OUT' AND tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY idpo`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }

    } else {
        if (body.query === "all" && users === "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' AND tipe_order != 'RELEASE' AND tipe_order != 'RESTOCK' AND tipe_order != 'SO_GUDANG' AND tipe_order != 'TRANSFER OUT' AND tipe_order != 'DEFECT OUT' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='DEFECT IN'  AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' OR tipe_order='DEFECT OUT' AND qty > '0' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}'`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }
        if (body.query != "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}'  AND tipe_order != 'RELEASE' AND tipe_order != 'RESTOCK' AND tipe_order != 'SO_GUDANG' AND tipe_order != 'TRANSFER OUT' AND tipe_order != 'DEFECT OUT' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' AND tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' AND tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' OR tipe_order='DEFECT OUT' AND tanggal_receive='${body.query}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY idpo`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }
        if (users != "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' AND tipe_order != 'RELEASE' AND tipe_order != 'RESTOCK' AND tipe_order != 'SO_GUDANG' AND tipe_order != 'TRANSFER OUT' AND tipe_order != 'DEFECT OUT' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='DEFECT IN'  AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order != 'SO_GUDANG' AND tipe_order='DEFECT IN' OR tipe_order='DEFECT OUT' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}'`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }
        if (body.query != "all" && users != "all") {
            var [get_po] = await connection.query(
                `SELECT * FROM tb_purchaseorder WHERE tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' AND tipe_order != 'RELEASE' AND tipe_order != 'RESTOCK' AND tipe_order != 'SO_GUDANG' AND tipe_order != 'TRANSFER OUT' AND tipe_order != 'DEFECT OUT' GROUP BY tanggal_receive,users ORDER BY id DESC`
            );
            var [total_po] = await connection.query(
                `SELECT COUNT(idpo) as totalpo FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' AND tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive,users`
            );
            var [total_qty] = await connection.query(
                `SELECT SUM(qty) as totalqtys FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' AND tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY tanggal_receive`
            );
            for (let po = 0; po < total_qty.length; po++) {
                if (total_qty[po].totalqtys === null || total_qty[po].totalqtys === "") {
                    var hasil_totalqty = "0";
                } else {
                    var hasil_totalqty = total_qty[po].totalqtys;
                }
            }
            var [capital_amount] = await connection.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS amount FROM tb_purchaseorder WHERE tipe_order='DEFECT IN' AND tipe_order='DEFECT OUT' AND tanggal_receive='${body.query}' AND users='${users}' AND tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' AND id_ware='${warehouse}' GROUP BY idpo`
            );
            for (let x = 0; x < capital_amount.length; x++) {
                if (capital_amount[0].amount === null || capital_amount[0].amount === "") {
                    var hasil_amount = "0";
                } else {
                    var hasil_amount = capital_amount[0].amount;
                }
            }
        }
    }

    const datas = [];

    try {
        await connection.beginTransaction();
        var total_qty = 0;
        var total_cost = 0;

        for (let index = 0; index < get_po.length; index++) {

            if (warehouse === "all") {
                var [get_detail] = await connection.query(
                    `SELECT tb_purchaseorder.*,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND tb_purchaseorder.users='${get_po[index].users}'  AND tb_purchaseorder.tipe_order != 'RELEASE' AND tb_purchaseorder.tipe_order != 'RESTOCK' AND tb_purchaseorder.tipe_order != 'SO_GUDANG' AND tb_purchaseorder.tipe_order != 'TRANSFER OUT' AND tb_purchaseorder.tipe_order != 'DEFECT OUT' AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                );
            } else {
                var [get_detail] = await connection.query(
                    `SELECT tb_purchaseorder.*,tb_produk.produk FROM tb_purchaseorder LEFT JOIN tb_produk ON tb_purchaseorder.id_produk = tb_produk.id_produk WHERE tb_purchaseorder.tanggal_receive='${get_po[index].tanggal_receive}' AND tb_purchaseorder.users='${get_po[index].users}' AND tb_purchaseorder.id_ware='${warehouse}'  AND tb_purchaseorder.tipe_order != 'RELEASE' AND tb_purchaseorder.tipe_order != 'RESTOCK' AND tb_purchaseorder.tipe_order != 'SO_GUDANG' AND tb_purchaseorder.tipe_order != 'TRANSFER OUT' AND tb_purchaseorder.tipe_order != 'DEFECT OUT' AND tb_purchaseorder.tanggal_receive BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_purchaseorder.tanggal_receive,tb_purchaseorder.users,tb_purchaseorder.tipe_order,tb_purchaseorder.idpo ORDER BY tb_purchaseorder.id DESC`
                );
            }

            const datas2 = [];

            for (let i = 0; i < get_detail.length; i++) {


                var [get_produk] = await connection.query(
                    `SELECT * FROM tb_produk WHERE id_produk='${get_detail[i].id_produk}'`
                );

                var [get_ware] = await connection.query(
                    `SELECT * FROM tb_warehouse WHERE id_ware='${get_detail[i].id_ware}'`
                );
                for (let qq = 0; qq < get_ware.length; qq++) {
                    var getsware = get_ware[qq].warehouse;
                }

                var [get_supplier_transfer] = await connection.query(
                    `SELECT tb_warehouse.warehouse,tb_purchaseorder.id_sup FROM tb_warehouse LEFT JOIN tb_purchaseorder ON tb_warehouse.id_ware = tb_purchaseorder.id_sup WHERE tb_purchaseorder.tipe_order != 'SO_GUDANG' AND tb_purchaseorder.tipe_order != 'RELEASE' AND tb_purchaseorder.tipe_order != 'RESTOCK' AND tb_purchaseorder.tipe_order != 'TRANSFER OUT' AND tb_purchaseorder.tipe_order != 'DEFECT OUT' AND tb_purchaseorder.id_sup='${get_detail[i].id_sup}'`
                );

                for (let zz = 0; zz < get_supplier_transfer.length; zz++) {
                    var supplier_transfer = get_supplier_transfer[zz].warehouse;
                }

                if (warehouse === "all") {

                    var [get_total] = await connection.query(
                        `SELECT SUM(total_amount) as hasil_amount,SUM(qty) as hasil_qty FROM tb_purchaseorder WHERE tanggal_receive='${get_detail[i].tanggal_receive}' AND users='${get_detail[i].users}' AND tipe_order != 'SO_GUDANG' AND tipe_order != 'RELEASE' AND tipe_order != 'RESTOCK' AND tipe_order != 'TRANSFER OUT' AND tipe_order != 'DEFECT OUT' GROUP BY tanggal_receive,users`
                    );
                } else {

                    var [get_total] = await connection.query(
                        `SELECT SUM(total_amount) as hasil_amount,SUM(qty) as hasil_qty FROM tb_purchaseorder WHERE tanggal_receive='${get_detail[i].tanggal_receive}' AND users='${get_detail[i].users}' AND id_ware='${warehouse}' AND tipe_order != 'SO_GUDANG' AND tipe_order != 'RELEASE' AND tipe_order != 'RESTOCK' AND tipe_order != 'TRANSFER OUT' AND tipe_order != 'DEFECT OUT' GROUP BY tanggal_receive,users`
                    );
                }

                if (get_detail[i].tipe_order === "DEFECT IN") {

                    datas2.push({
                        id: get_detail[i].id,
                        idpo: get_detail[i].idpo,
                        tanggal_receive: get_detail[i].tanggal_receive,
                        id_sup: get_detail[i].id_sup,
                        id_produk: get_detail[i].id_produk,
                        id_ware: get_detail[i].id_ware,
                        qty: get_detail[i].qty,
                        m_price: get_detail[i].m_price,
                        total_amount: get_detail[i].total_amount,
                        tipe_order: get_detail[i].tipe_order,
                        id_act: get_detail[i].id_act,
                        produk: get_produk[0].produk,
                        gudang: getsware,
                        supplier: supplier_transfer,
                    });
                }
                total_qty = 0 + parseInt(get_total[0].hasil_qty);
                total_cost = 0 + parseInt(get_total[0].hasil_amount);
            }



            datas.push({
                tanggal: get_po[index].tanggal_receive,
                id_so: get_po[index].idpo,
                users: get_po[index].users,
                total_qty: total_qty,
                total_cost: total_cost,
                detail: datas2,
            });

        }
        console.log(datas)
        await connection.commit();
        await connection.release();
        return {
            datas,
            total_po: total_po.length ? total_po.length : 0,
            total_qty: hasil_totalqty ? hasil_totalqty : 0,
            capital_amount: hasil_amount ? hasil_amount : 0,
        };

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const transferStokdefect = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();
        const data = body;
        var qty_all = 0;
        for (let index = 0; index < data.variasitransfer.length; index++) {
            qty_all = qty_all + parseInt(data.variasitransfer[index].stok_baru);
        }

        const [produk_cek] = await connection.query(
            `SELECT * FROM tb_produk WHERE id_produk='${data.idproduk}' AND id_ware='${data.gudang_pengirim}'`
        );

        var total_qty = 0;
        var total_modal = 0;

        const [id_ware] = await connection.query(
            `SELECT * FROM tb_warehouse WHERE id_ware='${data.gudang_tujuan}'`
        );

        const [cek_mutasi] = await connection.query(
            `SELECT MAX(id_mutasi) as id_mutasi FROM tb_mutasistock`
        );
        if (cek_mutasi[0].id_mutasi === null) {
            var id_mutasi = "MT-" + "00000001";
        } else {
            const get_last2 = cek_mutasi[0].id_mutasi;
            const data_2 = get_last2.toString().slice(-8);
            const hasil = parseInt(data_2) + 1;
            var id_mutasi = "MT-" + String(hasil).padStart(8, "0");
        }

        const [cek_po] = await connection.query(
            `SELECT MAX(idpo) as idpo FROM tb_purchaseorder`
        );
        if (cek_po[0].idpo === null) {
            var idpo = tahun + "0001";
        } else {
            const get_last2 = cek_po[0].idpo;
            const data_2 = get_last2.toString().slice(-4);
            const hasil = parseInt(data_2) + 1;
            var idpo = tahun + String(hasil).padStart(4, "0");
        }

        const [cek_act] = await connection.query(
            `SELECT MAX(id_act) as id_act FROM tb_purchaseorder`
        );
        if (cek_act[0].id_act === null) {
            var id_act = "0001";
        } else {
            const get_last2 = cek_act[0].id_act;
            const data_2 = get_last2.toString().slice(-4);
            const hasil = parseInt(data_2) + 1;
            var id_act = String(hasil).padStart(4, "0");
        }

        const id_area = id_ware[0].id_area
        const variasi = data.variasitransfer
        var idponext = parseInt(idpo) + parseInt(1);

        const [get_products] = await connection.query(
            `SELECT produk FROM tb_produk WHERE id_produk='${data.idproduk_lama}'`
        );

        const [get_products_new] = await connection.query(
            `SELECT produk FROM tb_produk WHERE id_produk='${data.idproduk_baru}'`
        );

        for (let index = 0; index < variasi.length; index++) {

            if (variasi[index].stok_baru != 0) {
                var qty_transfer = variasi[index].stok_baru;

                // cek stock Variasi produk lama
                var [get_var] = await connection.query(
                    `SELECT id_produk,idpo,id_ware,size,qty,id_act,users FROM tb_variation WHERE id_produk='${data.idproduk_lama}' AND id_ware='${data.gudang_pengirim}' AND size='${variasi[index].size}' AND qty > '0' ORDER BY idpo ASC`
                );
                var [get_var_sum] = await connection.query(
                    `SELECT SUM(qty) as totalqty FROM tb_variation WHERE id_produk='${data.idproduk_lama}' AND id_ware='${data.gudang_pengirim}' AND size='${variasi[index].size}' AND qty > '0' ORDER BY idpo ASC`
                );
                // end

                var totalqty = get_var_sum[0].totalqty ? get_var_sum[0].totalqty : 0;
                var qty_baru = parseInt(totalqty) - parseInt(qty_transfer);

                var [get_warehouse] = await connection.query(
                    `SELECT warehouse FROM tb_warehouse WHERE id_ware='${data.gudang_pengirim}'`
                );

                var [get_warehouse_new] = await connection.query(
                    `SELECT warehouse FROM tb_warehouse WHERE id_ware='${data.gudang_tujuan}'`
                );

                for (let i = 0; i < get_var.length; i++) {
                    var get_qty = get_var[i].qty;
                    var qty_baru_single = parseInt(get_qty) - parseInt(qty_transfer);

                    // cek harga Variasi produk lama
                    var [get_modal] = await connection.query(
                        `SELECT m_price FROM tb_purchaseorder WHERE id_produk='${data.idproduk_lama}' AND id_ware="${data.gudang_pengirim}" ORDER BY id DESC LIMIT 1`
                    );
                    // end
                    console.log("qty_baru:", qty_baru);

                    if (i === (get_var.length - 1)) {

                        // update Variasi produk lama
                        await connection.query(
                            `UPDATE tb_variation SET qty='${qty_baru}',updated_at='${tanggal}' WHERE id_produk='${data.idproduk_lama}' AND id_ware='${data.gudang_pengirim}' AND size='${variasi[index].size}' AND idpo='${get_var[i].idpo}'`
                        );
                        var idpolama = get_var[i].idpo;
                        // end
                    } else {
                        await connection.query(
                            `UPDATE tb_variation SET qty='0',updated_at='${tanggal}' WHERE id_produk='${data.idproduk_lama}' AND id_ware='${data.gudang_pengirim}' AND size='${variasi[index].size}' AND idpo='${get_var[i].idpo}'`
                        );
                    }

                    if (i === 0) {
                        total_qty = parseInt(total_qty) + parseInt(qty_transfer);

                        // Add Variasi
                        await connection.query(
                            `INSERT INTO tb_variation (tanggal, id_produk, idpo, id_area, id_ware, size, qty, id_act, users, created_at, updated_at)
                            VALUES ('${tanggal_skrg}','${data.idproduk_baru}','${idpo}','${id_area}','${data.gudang_tujuan}','${variasi[index].size}','${qty_transfer}','${id_act}','${data.users}','${tanggal}','${tanggal}')`
                        );

                        // Add Variasi Order
                        await connection.query(
                            `INSERT INTO tb_variationorder (tanggal, id_produk, idpo, id_sup, id_area, id_ware, size, qty, id_act, tipe_order, users, created_at, updated_at)
                            VALUES ('${tanggal_skrg}','${data.idproduk_baru}','${idpo}','${data.gudang_tujuan}','${id_area}','${data.gudang_tujuan}','${variasi[index].size}','${qty_transfer}','${id_act}','DEFECT IN','${data.users}','${tanggal}','${tanggal}')`
                        );

                        // Update Variation Old QTY
                        await connection.query(
                            `INSERT INTO tb_mutasistock
                            (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
                            VALUES ('${id_mutasi}','${tanggal_skrg}','DEFECT PRODUCT','${data.gudang_pengirim}','-','${data.idproduk_lama}','${get_products[0].produk}','${idpo}','${variasi[index].size}','-${qty_transfer}','Barang Gudang','${get_warehouse[0].warehouse}','DEFECT OUT','${data.users}','${tanggal}','${tanggal}')`
                        );

                        await connection.query(
                            `INSERT INTO tb_mutasistock
                            (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
                            VALUES ('${id_mutasi}','${tanggal_skrg}','DEFECT PRODUCT','${data.gudang_tujuan}','-','${data.idproduk_baru}','${get_products_new[0].produk}','${idpo}','${variasi[index].size}','${qty_transfer}','Barang Gudang','${get_warehouse_new[0].warehouse}','DEFECT IN','${data.users}','${tanggal}','${tanggal}')`
                        );
                    }
                    total_modal = parseInt(total_modal) + (parseInt(get_modal[0].m_price) * parseInt(qty_transfer));
                }
            }
        }

        // var hasil_m_price = parseInt(total_modal) / parseInt(total_qty);
        var hasil_total_amount = parseInt(total_qty) * (parseInt(total_modal) / parseInt(total_qty));
        // Add PO Transfer Gudang Pengiriim
        await connection.query(
            `INSERT INTO tb_purchaseorder
            (idpo, tanggal_receive, id_sup, id_produk, id_ware, qty, m_price, total_amount, tipe_order, id_act, users, created_at, updated_at)
            VALUES ('${idpo}','${tanggal_skrg}','${data.gudang_pengirim}','${data.idproduk_baru}','${data.gudang_tujuan}','${total_qty}','${get_modal[0].m_price}','${hasil_total_amount}','DEFECT IN','${id_act}','${data.users}','${tanggal}','${tanggal}')`
        );

        await connection.query(
            `INSERT INTO tb_defect
            (tanggal_receive, id_act, idpo_old, id_produk_old, id_ware_old, idpo_new, id_produk_new, id_ware_new, qty, m_price, total_amount, users, created_at, updated_at)
            VALUES ('${tanggal_skrg}','${id_act}','${idpolama}','${data.idproduk_lama}','${data.gudang_pengirim}','${idpo}','${data.idproduk_baru}','${data.gudang_tujuan}','${total_qty}','${get_modal[0].m_price}','${hasil_total_amount}','${data.users}','${tanggal}','${tanggal}')`
        );

        await connection.commit();
        await connection.release();
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const editPo_defect = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    const id_act_edit = body.id_act;
    const idpo_old = body.idpo;
    const idpo_new = body.idpo_new;
    const id_produk_old = body.idproduk;
    const id_produk_new = body.idproduk_new;
    const m_price = body.m_price;
    const id_ware_old = body.id_ware;
    const id_ware_new = body.id_ware_new;
    const users = body.users;
    const data = body.data;

    const [cek_po] = await connection.query(
        `SELECT MAX(idpo) as idpo FROM tb_purchaseorder`
    );
    if (cek_po[0].idpo === null) {
        var idpo = tahun + "0001";
    } else {
        const get_last2 = cek_po[0].idpo;
        const data_2 = get_last2.toString().slice(-4);
        const hasil = parseInt(data_2) + 1;
        var idpo = tahun + String(hasil).padStart(4, "0");
    }

    const [cek_act] = await connection.query(
        `SELECT MAX(id_act) as id_act FROM tb_purchaseorder`
    );
    if (cek_act[0].id_act === null) {
        var id_act = "0001";
    } else {
        const get_last2 = cek_act[0].id_act;
        const data_2 = get_last2.toString().slice(-4);
        const hasil = parseInt(data_2) + 1;
        var id_act = String(hasil).padStart(4, "0");
    }

    const [cek_mutasi] = await connection.query(
        `SELECT MAX(id_mutasi) as id_mutasi FROM tb_mutasistock`
    );
    if (cek_mutasi[0].id_mutasi === null) {
        var id_mutasi = "MT-" + "00000001";
    } else {
        const get_last2 = cek_mutasi[0].id_mutasi;
        const data_2 = get_last2.toString().slice(-8);
        const hasil = parseInt(data_2) + 1;
        var id_mutasi = "MT-" + String(hasil).padStart(8, "0");
    }

    try {
        await connection.beginTransaction();

        var [getdefect] = await connection.query(
            `SELECT id_act,idpo_old,id_produk_old,id_ware_old,idpo_new,id_produk_new,id_ware_new,qty,m_price FROM tb_defect WHERE id_act='${id_act_edit}'`
        );

        const [getproducts] = await connection.query(
            `SELECT produk FROM tb_produk WHERE id_produk='${id_produk_new}'`
        );

        const [getwarehouse] = await connection.query(
            `SELECT warehouse FROM tb_warehouse WHERE id_ware='${id_ware_old}'`
        );

        var variasi = data.variasirestock;
        var totalqty = 0;

        for (let index = 0; index < variasi.length; index++) {
            totalqty = parseInt(totalqty) + parseInt(variasi[index].stok_baru);
            var stock_edit = parseInt(variasi[index].stok_lama) - parseInt(variasi[index].stok_baru);

            var [get_var_sum_old] = await connection.query(
                `SELECT size,qty,idpo FROM tb_variation WHERE id_produk='${id_produk_old}' AND id_ware='${id_ware_old}' AND size='${variasi[index].size}' AND idpo='${idpo_old}' ORDER BY idpo ASC`
            );
            for (let xx = 0; xx < get_var_sum_old.length; xx++) {
                await connection.query(
                    `UPDATE tb_variation SET qty='${parseInt(get_var_sum_old[xx].qty) + parseInt(stock_edit)}',updated_at='${tanggal}' WHERE idpo='${get_var_sum_old[xx].idpo}' AND size='${variasi[index].size}'`
                );
            }
            await connection.query(
                `UPDATE tb_variation SET qty='${variasi[index].stok_baru}',updated_at='${tanggal}' WHERE id_act='${id_act_edit}' AND size='${variasi[index].size}'`
            );

            await connection.query(
                `UPDATE tb_variationorder SET qty='${variasi[index].stok_baru}',tipe_order='EDIT DEFECT',users='${users}',updated_at='${tanggal}' WHERE id_act='${id_act_edit}' AND size='${variasi[index].size}'`
            );

            // Update Variation Old QTY
            await connection.query(
                `INSERT INTO tb_mutasistock
            (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
            VALUES ('${id_mutasi}','${tanggal_skrg}','EDIT DEFECT','${id_ware_new}','-','${id_produk_old}','${getproducts[0].produk}','${idpo_old}','${variasi[index].size}','${variasi[index].stok_baru}','Barang Gudang','${getwarehouse[0].warehouse}','EDIT DEFECT','${users}','${tanggal}','${tanggal}')`
            );
        }

        var total_amount = parseInt(totalqty) * parseInt(getdefect[0].m_price);
        await connection.query(
            `UPDATE tb_purchaseorder SET qty='${totalqty}',m_price='${getdefect[0].m_price}',total_amount='${total_amount}',tipe_order='EDIT DEFECT',users='${users}',updated_at='${tanggal}' WHERE id_act='${id_act_edit}'`
        );

        await connection.query(
            `UPDATE tb_defect SET qty='${totalqty}',m_price='${getdefect[0].m_price}',total_amount='${total_amount}',users='${users}',updated_at='${tanggal}' WHERE id_act='${id_act_edit}'`
        );

        await connection.commit();
        await connection.release();

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const deleteItemdefect = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    const [cek_po] = await connection.query(
        `SELECT MAX(idpo) as idpo FROM tb_purchaseorder`
    );
    if (cek_po[0].idpo === null) {
        var idpo = tahun + "0001";
    } else {
        const get_last2 = cek_po[0].idpo;
        const data_2 = get_last2.toString().slice(-4);
        const hasil = parseInt(data_2) + 1;
        var idpo = tahun + String(hasil).padStart(4, "0");
    }

    const [cek_act] = await connection.query(
        `SELECT MAX(id_act) as id_act FROM tb_purchaseorder`
    );
    if (cek_act[0].id_act === null) {
        var id_act = "0001";
    } else {
        const get_last2 = cek_act[0].id_act;
        const data_2 = get_last2.toString().slice(-4);
        const hasil = parseInt(data_2) + 1;
        var id_act = String(hasil).padStart(4, "0");
    }

    const [cek_mutasi] = await connection.query(
        `SELECT MAX(id_mutasi) as id_mutasi FROM tb_mutasistock`
    );
    if (cek_mutasi[0].id_mutasi === null) {
        var id_mutasi = "MT-" + "00000001";
    } else {
        const get_last2 = cek_mutasi[0].id_mutasi;
        const data_2 = get_last2.toString().slice(-8);
        const hasil = parseInt(data_2) + 1;
        var id_mutasi = "MT-" + String(hasil).padStart(8, "0");
    }

    try {
        await connection.beginTransaction();

        var [getdefect] = await connection.query(
            `SELECT id_act,idpo_old,id_produk_old,id_ware_old,idpo_new,id_produk_new,id_ware_new,qty,m_price FROM tb_defect WHERE id_act='${body.id_act}'`
        );

        var [getpo] = await connection.query(
            `SELECT tb_variationorder.*,tb_purchaseorder.id_sup,tb_purchaseorder.qty AS totalqty,tb_purchaseorder.m_price FROM tb_variationorder LEFT JOIN tb_purchaseorder ON tb_variationorder.id_act = tb_purchaseorder.id_act WHERE tb_variationorder.id_act='${body.id_act}' ORDER BY tb_variationorder.id ASC`
        );

        var [getpo_order] = await connection.query(
            `SELECT tb_variationorder.qty,tb_variationorder.id_sup,tb_variationorder.idpo FROM tb_variationorder LEFT JOIN tb_purchaseorder ON tb_variationorder.id_act = tb_purchaseorder.id_act WHERE tb_variationorder.id_act='${body.id_act}' ORDER BY tb_variationorder.id ASC`
        );

        const [getproducts] = await connection.query(
            `SELECT produk FROM tb_produk WHERE id_produk='${getdefect[0].id_produk_old}'`
        );

        const [getwarehouse] = await connection.query(
            `SELECT warehouse FROM tb_warehouse WHERE id_ware='${getdefect[0].id_ware_old}'`
        );

        var totalqty = 0;
        for (let index = 0; index < getpo.length; index++) {
            totalqty = totalqty + getpo[index].qty;

            var [get_var_sum_old] = await connection.query(
                `SELECT size,qty,idpo FROM tb_variation WHERE id_produk='${getdefect[0].id_produk_old}' AND id_ware='${getdefect[0].id_ware_old}' AND size='${getpo[index].size}' AND idpo='${getdefect[0].idpo_old}' ORDER BY idpo ASC`
            );
            for (let xx = 0; xx < get_var_sum_old.length; xx++) {
                await connection.query(
                    `UPDATE tb_variation SET qty='${parseInt(getpo_order[index].qty) + parseInt(get_var_sum_old[xx].qty)}',updated_at='${tanggal}' WHERE idpo='${get_var_sum_old[xx].idpo}' AND size='${getpo[index].size}'`
                );

                console.log("sample=", getpo_order[index].qty, "+", get_var_sum_old[xx].qty);
                console.log("hasil=", parseInt(getpo_order[index].qty) + parseInt(get_var_sum_old[xx].qty));
            }
            await connection.query(
                `UPDATE tb_variation SET qty='0',updated_at='${tanggal}' WHERE id_act='${body.id_act}' AND size='${getpo[index].size}'`
            );


            await connection.query(
                `UPDATE tb_variationorder SET qty='0',tipe_order='CANCEL DEFECT',updated_at='${tanggal}' WHERE id_act='${body.id_act}'`
            );

            await connection.query(
                `UPDATE tb_purchaseorder SET qty='${totalqty}',m_price='${getpo[index].m_price}',total_amount='0',tipe_order='CANCEL DEFECT',updated_at='${tanggal}' WHERE id_act='${body.id_act}'`
            );

            // Update Variation Old QTY
            await connection.query(
                `INSERT INTO tb_mutasistock
            (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
            VALUES ('${id_mutasi}','${tanggal_skrg}','CANCEL DEFECT','${getdefect[0].id_ware_new}','-','${getdefect[0].id_produk_old}','${getproducts[0].produk}','${getdefect[0].idpo_old}','${getpo[index].size}','${getpo[index].qty}','Barang Gudang','${getwarehouse[0].warehouse}','CANCEL DEFECT','${body.users}','${tanggal}','${tanggal}')`
            );

            await connection.query(
                `DELETE FROM tb_defect WHERE id_act='${body.id_act}'`
            );
        }

        await connection.commit();
        await connection.release();

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const get_Sizepodefect = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [data_getsize] = await connection.query(
            `SELECT *,SUM(qty)as qty FROM tb_variationorder WHERE id_act='${body.id_act}' AND (tipe_order='DEFECT IN' OR tipe_order='EDIT DEFECT') AND qty > 0 GROUP BY size`
        );

        console.log(body);
        console.log(data_getsize);

        await connection.commit();
        await connection.release();
        return data_getsize;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getsizereturmodel = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    try {
        await connection.beginTransaction();

        const [data_sizereturmodel] = await connection.query(
            `SELECT *,SUM(qty)as qty FROM tb_variation WHERE id_produk='${body.idproduct}' AND id_ware='${body.idware}' GROUP BY size`
        );

        const [harga_baru] = await connection.query(
            `SELECT r_price FROM tb_produk WHERE id_produk='${body.idproduct}' AND id_ware='${body.idware}'`
        );
        for (let zz = 0; zz < harga_baru.length; zz++) {
            var hasil_hargabaru = harga_baru[zz].r_price;
        }

        const [harga_lama] = await connection.query(
            `SELECT r_price FROM tb_produk WHERE id_produk='${body.id_produk_old}' AND id_ware='${body.id_ware_old}'`
        );
        for (let zx = 0; zx < harga_lama.length; zx++) {
            var hasil_hargalama = harga_lama[zx].r_price;
        }

        var selisihharga = parseInt(hasil_hargabaru) - parseInt(hasil_hargalama);

        if (selisihharga < 0) {
            var statusselisih = "no";
        } else {
            var statusselisih = "yes";
        }


        await connection.commit();
        await connection.release();

        return {
            data_sizereturmodel,
            selisihharga,
            statusselisih,
        };

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getproduktukarmodel = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");
    const query = body.query;
    const warehouse = body.id_ware;

    try {
        await connection.beginTransaction();

        if (warehouse === "all") {
            if (query != "all") {

            } else {
                var [get_product] = await connection.query(
                    `SELECT * FROM tb_produk GROUP BY id_produk ORDER BY id DESC`
                );
            }
        } else {
            if (query != "all") {

            } else {
                var [get_product] = await connection.query(
                    `SELECT * FROM tb_produk WHERE id_ware='${warehouse}' GROUP BY id_produk ORDER BY id DESC`
                );
            }
        }

        await connection.commit();
        await connection.release();

        return get_product;

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const tukermodel = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    const id_pesanan = body.id_pesanan;
    const id_produk_old = body.id_produk_old;
    const id_produk_new = body.id_produk_new;
    const id_ware_old = body.id_ware_old;
    const id_ware_new = body.id_ware_new;
    const size_old = body.size_old;
    const size_new = body.size_new;
    const qty_retur = body.qty_retur;
    const selisih_nominal = body.selisih;
    const users = body.users;

    const [get_produk_old] = await connection.query(
        `SELECT * FROM tb_produk WHERE id_produk='${id_produk_old}'`
    );

    const [get_produk_new] = await connection.query(
        `SELECT * FROM tb_produk WHERE id_produk='${id_produk_new}'`
    );

    const [cek_mutasi] = await connection.query(
        `SELECT MAX(id_mutasi) as id_mutasi FROM tb_mutasistock`
    );
    if (cek_mutasi[0].id_mutasi === null) {
        var id_mutasi = "MT-" + "00000001";
    } else {
        const get_last2 = cek_mutasi[0].id_mutasi;
        const data_2 = get_last2.toString().slice(-8);
        const hasil = parseInt(data_2) + 1;
        var id_mutasi = "MT-" + String(hasil).padStart(8, "0");
    }

    try {
        await connection.beginTransaction();

        const [cek_produk_lama] = await connection.query(
            `SELECT r_price FROM tb_produk WHERE id_produk='${id_produk_old}' AND id_ware='${body.id_ware_old}' GROUP BY id_produk`
        );

        const [cek_produk_baru] = await connection.query(
            `SELECT r_price FROM tb_produk WHERE id_produk='${id_produk_new}' AND id_ware='${body.id_ware_new}' GROUP BY id_produk`
        );

        var [data_invoice] = await connection.query(
            `SELECT amount FROM tb_invoice WHERE id_pesanan='${body.id_pesanan}'`
        );
        for (let zx = 0; zx < data_invoice.length; zx++) {
            var hasil_invoice = data_invoice[zx].amount;
        }

        var [data_order_lama] = await connection.query(
            `SELECT diskon_item,subtotal,qty,selling_price FROM tb_order WHERE id_pesanan='${body.id_pesanan}' AND id_produk='${body.id_produk_old}'`
        );
        for (let zz = 0; zz < data_order_lama.length; zz++) {
            var data_order_lama_sellingprice = parseInt(data_order_lama[zz].selling_price) * parseInt(body.qty_retur);
            var kurang_produk_lama = parseInt(hasil_invoice) - parseInt(data_order_lama_sellingprice);
        }

        for (let zx = 0; zx < cek_produk_baru.length; zx++) {
            var plus_produk_baru = parseInt(cek_produk_baru[zx].r_price) * parseInt(body.qty_retur);
        }

        if (cek_produk_baru[0].r_price < cek_produk_lama[0].r_price) {
            return "Kurang";
        } else {
            // Proses Penambahan Barang Retur
            const [get_produk_grup] = await connection.query(
                `SELECT * FROM tb_order WHERE id_pesanan='${id_pesanan}' AND id_produk='${id_produk_old}' AND  size='${size_old}' GROUP BY id_produk,size`
            );

            const tanggal_order_get = get_produk_grup[0].tanggal_order;
            const id_pesanan_get = get_produk_grup[0].id_pesanan;
            const id_brand_get = get_produk_grup[0].id_brand;
            const id_store_get = get_produk_grup[0].id_store;
            const id_produk_get = get_produk_grup[0].id_produk;
            const produk_get = get_produk_grup[0].produk;
            const img_get = get_produk_grup[0].img;
            const quality_get = get_produk_grup[0].quality;
            const harga_jual = get_produk_grup[0].selling_price;
            const diskon_item = get_produk_grup[0].diskon_item;
            const idpo = get_produk_grup[0].idpo;



            // cek stock Variasi
            const [get_var] = await connection.query(
                `SELECT * FROM tb_variation WHERE id_produk='${id_produk_new}' AND id_ware='${id_ware_new}' AND  size='${size_new}' AND qty > '0' GROUP BY size ORDER BY idpo ASC`
            );
            // End cek stock Variasi

            const qty_sales = qty_retur;

            for (let i = 0; i < get_var.length; i++) {
                var get_qty = get_var[i].qty;
                var qty_baru = parseInt(get_qty) - parseInt(qty_sales);

                var [get_modal] = await connection.query(
                    `SELECT m_price FROM tb_purchaseorder WHERE idpo='${get_var[i].idpo}' AND id_produk='${id_produk_new}'`
                );

                var [get_produkss] = await connection.query(
                    `SELECT * FROM tb_produk WHERE id_produk='${id_produk_new}'`
                );

                if (qty_baru >= 0) {
                    await connection.query(
                        `INSERT INTO tb_order (tanggal_order, id_pesanan, id_store, id_produk, source, img, produk, id_brand, id_ware, idpo, quality, size, qty, m_price, selling_price, diskon_item, subtotal, users, created_at, updated_at) 
                    VALUES ('${tanggal_order_get}','${id_pesanan_get}','${id_store_get}','${id_produk_new}','Barang Gudang','${get_produkss[0].img}','${get_produkss[0].produk}','${get_produkss[0].id_brand}','${get_var[i].id_ware}','${get_var[i].idpo}','${get_produkss[0].quality}','${get_var[i].size}','${qty_sales}','${get_modal[0].m_price}','${cek_produk_baru[0].r_price}','${diskon_item}','${parseInt(cek_produk_baru[0].r_price) * parseInt(qty_sales)}','${users}','${tanggal}','${tanggal}')`
                    );

                    //  Update Variation Old QTY
                    await connection.query(
                        `UPDATE tb_variation SET qty='${qty_baru}',updated_at='${tanggal}' WHERE id_produk='${id_produk_new}' AND id_ware='${get_var[i].id_ware}' AND size='${get_var[i].size}' AND idpo='${get_var[i].idpo}'`
                    );
                    //

                } else {
                    if (qty_baru < 0) {
                        var qty_sisa = 0;
                    }

                    await connection.query(
                        `INSERT INTO tb_order (tanggal_order, id_pesanan, id_store, id_produk, source, img, produk, id_brand, id_ware, idpo, quality, size, qty, m_price, selling_price, diskon_item, subtotal, users, created_at, updated_at) 
                    VALUES ('${tanggal_order_get}','${id_pesanan_get}','${id_store_get}','${id_produk_new}','Barang Gudang','${get_produkss[0].img}','${get_produkss[0].produk}','${get_produkss[0].id_brand}','${get_var[i].id_ware}','${get_var[i].idpo}','${get_produkss[0].quality}','${get_var[i].size
                        }','${get_var[i].qty}','${get_modal[0].m_price}','${cek_produk_baru[0].r_price}','${diskon_item}','${parseInt(cek_produk_baru[0].r_price) * parseInt(get_var[i].qty)}','${users}','${tanggal}','${tanggal}')`
                    );

                    //  Update Variation Old QTY
                    await connection.query(
                        `UPDATE tb_variation SET qty='${qty_sisa}',updated_at='${tanggal}' WHERE id_produk='${id_produk_new}' AND id_ware='${get_var[i].id_ware}' AND size='${get_var[i].size}' AND idpo='${get_var[i].idpo}'`
                    );
                    //
                    qty_sales = parseInt(qty_sales) - parseInt(get_var[i].qty);

                }
                await connection.query(
                    `INSERT INTO tb_mutasistock
                (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
                VALUES ('${id_mutasi}','${tanggal_skrg}','${id_pesanan_get}','${body.id_ware_new}','${id_store_get}','${body.id_produk_new}','${get_produkss[0].produk}','${get_var[i].idpo}','${body.size_new}','${qty_retur}','Barang Gudang','${body.id_ware_old}','CHANGE PRODUCT IN','${body.users}','${tanggal}','${tanggal}')`
                );
            }
            // End Proses Retur

            // Proses Pengembalian Barang Retur Gudang
            const [get_dataorder] = await connection.query(
                `SELECT * FROM tb_order WHERE id_pesanan='${id_pesanan}' AND id_produk='${id_produk_old}' AND size='${size_old}' AND source='Barang Gudang' ORDER BY idpo ASC`
            );

            var qty_sisa = 0;

            for (let x = 0; x < get_dataorder.length; x++) {

                if (get_dataorder[x].source === "Barang Gudang") {
                    qty_sisa = parseInt(qty_retur) - parseInt(get_dataorder[x].qty);
                    sisa_qty_order = parseInt(get_dataorder[x].qty) - parseInt(qty_retur);

                    if (qty_sisa > 0) {
                        var [get_qty_old] = await connection.query(
                            `SELECT * FROM tb_variation WHERE id_produk='${id_produk_old}' AND id_ware='${id_ware_old}' AND size='${size_old}' AND idpo='${get_dataorder[x].idpo}'`
                        );

                        //  Update Variation Old QTY
                        await connection.query(
                            `UPDATE tb_variation SET qty='${parseInt(get_qty_old[0].qty) + parseInt(get_dataorder[x].qty)}',updated_at='${tanggal}' WHERE id_produk='${id_produk_old}' AND id_ware='${id_ware_old}' AND size='${size_old}' AND idpo='${get_dataorder[x].idpo}'`
                        );
                        //

                        if (sisa_qty_order > 0) {
                            await connection.query(
                                `UPDATE tb_order SET qty='${sisa_qty_order}',subtotal='${parseInt(get_dataorder[x].selling_price) * parseInt(sisa_qty_order)}',updated_at='${tanggal}' WHERE id='${get_dataorder[x].id}'`
                            );
                        } else {
                            await connection.query(
                                `DELETE FROM tb_order WHERE id='${get_dataorder[x].id}'`
                            );
                        }

                        qty_retur = parseInt(qty_retur) - parseInt(get_dataorder[x].qty);
                    } else {
                        var [get_qty_old] = await connection.query(
                            `SELECT * FROM tb_variation WHERE id_produk='${id_produk_old}' AND id_ware='${id_ware_old}' AND size='${size_old}' AND idpo='${get_dataorder[x].idpo}'`
                        );

                        //  Update Variation Old QTY
                        await connection.query(
                            `UPDATE tb_variation SET qty='${parseInt(get_qty_old[0].qty) + parseInt(qty_retur)}',updated_at='${tanggal}' WHERE id_produk='${id_produk_old}' AND id_ware='${id_ware_old}' AND size='${size_old}' AND idpo='${get_dataorder[x].idpo}'`
                        );
                        //

                        if (sisa_qty_order > 0) {
                            await connection.query(
                                `UPDATE tb_order SET qty='${sisa_qty_order}',subtotal='${parseInt(get_dataorder[x].selling_price) * parseInt(sisa_qty_order)}',updated_at='${tanggal}' WHERE id='${get_dataorder[x].id}'`
                            );
                        } else {
                            await connection.query(
                                `DELETE FROM tb_order WHERE id='${get_dataorder[x].id}'`
                            );
                        }
                    }

                    await connection.query(
                        `INSERT INTO tb_mutasistock
                    (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
                    VALUES ('${id_mutasi}','${tanggal_skrg}','${id_pesanan_get}','${body.id_ware_old}','${id_store_get}','${body.id_produk_old}','${get_dataorder[x].produk}','${get_dataorder[x].idpo}','${body.size_old}','-${qty_retur}','Barang Gudang','${body.id_ware_new}','CHANGE PRODUCT OUT','${body.users}','${tanggal}','${tanggal}')`
                    );
                }

            }
            await connection.query(
                `UPDATE tb_invoice SET amount='${parseInt(kurang_produk_lama) + parseInt(plus_produk_baru)}',total_amount='${parseInt(kurang_produk_lama) + parseInt(plus_produk_baru)}',selisih='${selisih_nominal}',updated_at='${tanggal}' WHERE id_pesanan='${id_pesanan_get}'`
            );

            await connection.query(
                `INSERT INTO tb_retur_model (tanggal_retur, id_pesanan, id_ware_old, id_produk_old, produk_old, size_lama_old, id_ware_new, id_produk_new, produk_new, size_new, qty_retur, selisih_nominal, keterangan, source, id_store, users, created_at, updated_at) 
            VALUES ('${tanggal_skrg}','${id_pesanan_get}','${id_ware_old}','${id_produk_old}','${get_produk_old[0].produk}','${size_old}','${id_ware_new}','${id_produk_new}','${get_produk_new[0].produk}','${size_new}','${qty_retur}','${selisih_nominal}','TUKAR MODEL','Barang Gudang','${id_store_get}','${users}','${tanggal}','${tanggal}')`
            );
        }

        await connection.commit();
        await connection.release();

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

const getreturmodel = async (body) => {
    const connection = await dbPool.getConnection();

    const tanggal = body.tanggal;
    const myArray = tanggal.split(" to ");

    if (tanggal.length > 10) {
        var tanggal_start = myArray[0];
        var tanggal_end = myArray[1];
    } else {
        var tanggal_start = tanggal;
        var tanggal_end = tanggal;
    }
    console.log(body);

    try {
        await connection.beginTransaction();
        if (body.datechange === "dateinput") {
            if (body.query === "all") {
                if (body.store === "all") {
                    var [getreturmodel] = await connection.query(
                        `SELECT tb_retur_model.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_retur_model LEFT JOIN tb_store ON tb_retur_model.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur_model.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_retur_model.id DESC`
                    );
                } else if (body.store === "all_area") {
                    var [getreturmodel] = await connection.query(
                        `SELECT tb_retur_model.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_retur_model LEFT JOIN tb_store ON tb_retur_model.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur_model.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_store.id_area='${body.area}' AND tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_retur_model.id DESC`

                    );
                } else {
                    var [getreturmodel] = await connection.query(
                        `SELECT tb_retur_model.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_retur_model LEFT JOIN tb_store ON tb_retur_model.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur_model.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_store.id_store='${body.store}' AND tb_mutasistock.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_retur_model.id DESC`
                    );
                }
            } else {
                if (body.store === "all") {
                    var [getreturmodel] = await connection.query(
                        `SELECT tb_retur_model.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_retur_model LEFT JOIN tb_store ON tb_retur_model.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur_model.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_retur_model.id_pesanan LIKE '%${body.query}%' OR tb_retur_model.id_produk_new LIKE '%${body.query}%' OR tb_retur_model.produk_new LIKE '%${body.query}%') ORDER BY tb_retur_model.id DESC`
                    );
                } else if (body.store === "all_area") {
                    var [getreturmodel] = await connection.query(
                        `SELECT tb_retur_model.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_retur_model LEFT JOIN tb_store ON tb_retur_model.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur_model.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_retur_model.id_pesanan LIKE '%${body.query}%' OR tb_retur_model.id_produk_new LIKE '%${body.query}%' OR tb_retur_model.produk_new LIKE '%${body.query}%') AND tb_store.id_area='${body.area}' ORDER BY tb_retur_model.id DESC`
                    );
                } else {
                    var [getreturmodel] = await connection.query(
                        `SELECT tb_retur_model.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_retur_model LEFT JOIN tb_store ON tb_retur_model.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur_model.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_retur_model.id_pesanan LIKE '%${body.query}%' OR tb_retur_model.id_produk_new LIKE '%${body.query}%' OR tb_retur_model.produk_new LIKE '%${body.query}%') AND tb_store.id_store='${body.store}' ORDER BY tb_retur_model.id DESC`
                    );
                }
            }
        } else {
            if (body.query === "all") {
                if (body.store === "all") {
                    var [getreturmodel] = await connection.query(
                        `SELECT tb_retur_model.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_retur_model LEFT JOIN tb_store ON tb_retur_model.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur_model.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_retur_model.tanggal_retur BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_retur_model.id DESC`
                    );
                } else if (body.store === "all") {
                    var [getreturmodel] = await connection.query(
                        `SELECT tb_retur_model.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_retur_model LEFT JOIN tb_store ON tb_retur_model.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur_model.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_store.id_area='${body.area}' AND tb_retur_model.tanggal_retur BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_retur_model.id DESC`

                    );
                } else {
                    var [getreturmodel] = await connection.query(
                        `SELECT tb_retur_model.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_retur_model LEFT JOIN tb_store ON tb_retur_model.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur_model.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND tb_store.id_store='${body.store}' AND tb_retur_model.tanggal_retur BETWEEN '${tanggal_start}' AND '${tanggal_end}' ORDER BY tb_retur_model.id DESC`
                    );
                }
            } else {
                if (body.store === "all") {
                    var [getreturmodel] = await connection.query(
                        `SELECT tb_retur_model.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_retur_model LEFT JOIN tb_store ON tb_retur_model.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur_model.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_retur_model.id_pesanan LIKE '%${body.query}%' OR tb_retur_model.id_produk_new LIKE '%${body.query}%' OR tb_retur_model.produk_new LIKE '%${body.query}%') ORDER BY tb_retur_model.id DESC`
                    );
                } else if (body.store === "all") {
                    var [getreturmodel] = await connection.query(
                        `SELECT tb_retur_model.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_retur_model LEFT JOIN tb_store ON tb_retur_model.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur_model.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_retur_model.id_pesanan LIKE '%${body.query}%' OR tb_retur_model.id_produk_new LIKE '%${body.query}%' OR tb_retur_model.produk_new LIKE '%${body.query}%') AND tb_store.id_area='${body.area}' ORDER BY tb_retur_model.id DESC`
                    );
                } else {
                    var [getreturmodel] = await connection.query(
                        `SELECT tb_retur_model.*,tb_store.store,tb_mutasistock.tanggal as tanggal_input FROM tb_retur_model LEFT JOIN tb_store ON tb_retur_model.id_store = tb_store.id_store LEFT JOIN tb_mutasistock ON tb_retur_model.id_pesanan = tb_mutasistock.id_pesanan WHERE (tb_mutasistock.mutasi='SALES ONLINE' OR tb_mutasistock.mutasi='SALES RETAIL') AND (tb_retur_model.id_pesanan LIKE '%${body.query}%' OR tb_retur_model.id_produk_new LIKE '%${body.query}%' OR tb_retur_model.produk_new LIKE '%${body.query}%') AND tb_store.id_store='${body.store}' ORDER BY tb_retur_model.id DESC`
                    );
                }
            }
        }

        await connection.commit();
        await connection.release();

        return getreturmodel;

    } catch (error) {
        console.log(error);
        await connection.release();
    }
};


const edithargamodalsales = async (body) => {
    const connection = await dbPool.getConnection();
    // Variabel tanggal jika diperlukan, namun saat ini tidak dipakai
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
    const tahun = date.format(new Date(), "YY");

    try {
        // Mulai transaksi
        await connection.beginTransaction();

        console.log("Data yang diterima:", body);

        // Gunakan parameterized query untuk menghindari SQL injection
        const [result] = await connection.query(
            "UPDATE tb_order SET m_price = ? WHERE id_produk = ? AND id_ware = ? AND id_pesanan = ?",
            [body.harga, body.id_produk, body.id_ware, body.id_pesanan]
        );

        // Commit transaksi jika berhasil
        await connection.commit();

        // Return hasil ke frontend
        return {
            success: true,
            message: "Harga berhasil diperbarui",
            result: result,
        };
    } catch (error) {
        // Rollback transaksi jika terjadi error
        await connection.rollback();
        console.error("Error saat mengupdate harga:", error);

        // Return error ke frontend
        return {
            success: false,
            message: "Gagal memperbarui harga",
            error: error.message,
        };
    } finally {
        // Pastikan koneksi selalu dilepas
        connection.release();
    }
};

const notabarang = async (body) => {
    const connection = await dbPool.getConnection();

    const query = body.Query;
    const store = body.Store;
    const supplier = body.Filter_Supplier;
    const status = body.Filter_Status;
    const payment = body.Filter_Payment;
    const dates = body.date;

    let tanggal_start, tanggal_end;

    if (dates.length > 10) {
        const myArray = dates.split(" to ");
        tanggal_start = myArray[0];
        tanggal_end = myArray[1];
    } else {
        tanggal_start = dates;
        tanggal_end = dates;
    }

    try {
        await connection.beginTransaction();

        let baseQuery = `SELECT * FROM tb_notabarang WHERE tanggal_upload BETWEEN ? AND ? AND status_pesanan NOT IN ('REFUND', 'CANCEL', 'RETUR')`;
        const queryParams = [tanggal_start, tanggal_end];

        if (query && query !== "all") {
            baseQuery += ` AND (
                produk LIKE ? OR
                deskripsi LIKE ? OR
                id_nota LIKE ?
            )`;
            queryParams.push(`%${query}%`, `%${query}%`, `%${query}%`);
        }

        if (store && store !== "all") {
            baseQuery += ` AND deskripsi LIKE ?`;
            queryParams.push(`%${store}%`);
        }

        if (supplier && supplier !== "all") {
            baseQuery += ` AND id_sup = ?`;
            queryParams.push(supplier);
        }

        if (status && status !== "all") {
            baseQuery += ` AND status_pesanan = ?`;
            queryParams.push(status);
        }

        if (payment && payment !== "all") {
            baseQuery += ` AND payment = ?`;
            queryParams.push(payment);
        }

        baseQuery += ` ORDER BY id DESC`;

        const [rows] = await connection.query(baseQuery, queryParams);
        console.log(rows);

        await connection.commit();
        await connection.release();

        return { data_notabarang: rows };
    } catch (error) {
        console.error(error);
        await connection.rollback();
        await connection.release();
        throw error;
    }
};

const getstore = async (body) => {
    const connection = await dbPool.getConnection();
    const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    try {
        await connection.beginTransaction();

        const [data_store] = await connection.query(
            `SELECT * FROM tb_store  ORDER BY id DESC`
        );

        await connection.commit();
        await connection.release();

        return data_store;
    } catch (error) {
        console.log(error);
        await connection.release();
    }
};

module.exports = {
    getProduk,
    addProduk,
    editProduk,
    deleteProduk,
    getSizesales,
    getHistoriposelected,
    repeatStok,
    getHargabeliso,
    getHistorisoselected,
    stockOpname,
    transferStok,
    print_Stockopname,
    getPo,
    getHistoripo,
    get_Sizepo,
    editPo,
    deleteItem,
    deletePo,
    getHistoriso,
    getSo,
    getProdukbarcode,
    getIdpo,
    getSizebarcode,
    getStore_sales,
    getMutation,
    get_Asset,
    getHistoripoasset,
    settlementStock,
    getWarehouse_sales,
    getRetur,
    getRefund,
    getStore_sales_online,
    getWarehouse_sales_online,
    getNamaware,
    getWarehousebarcode,
    getStore_dashboard,
    get_upprice,
    getHistoripotransfer,
    getPotransfer,
    getuserpo,
    getusertransfer,
    getProdukdisplay,
    getstoredisplay,
    addDisplay,
    deleteDisplay,
    cariwares,
    getwarehousetransfer,
    cariwaresretur,
    getusersales,
    getdeleteorder,
    editstockopname,
    deleteitemso,
    edittransfer,
    deleteitempo,
    getpodefect,
    transferStokdefect,
    editPo_defect,
    deleteItemdefect,
    get_Sizepodefect,
    getsizereturmodel,
    getproduktukarmodel,
    tukermodel,
    getreturmodel,
    edithargamodalsales,
    notabarang,
    getstore,
};
