const dbPool = require("../config/database");

const date = require("date-and-time");
const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
const { generateFromEmail } = require("unique-username-generator");

// karyawan
const getKaryawan = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const datas = [];

    const [data_karyawan] = await connection.query(
      `SELECT * FROM tb_karyawan WHERE username != 'SUPERADMIN'`
    );

    for (let index = 0; index < data_karyawan.length; index++) {
      var [data_store] = await connection.query(
        `SELECT * FROM tb_store`
      );
      if (data_store[0].id_store === "SUPER-ADMIN") {
        datas.push({
          id: data_karyawan[index].id,
          username: data_karyawan[index].username,
          password: data_karyawan[index].password,
          name: data_karyawan[index].name,
          tlp: data_karyawan[index].tlp,
          domisili: data_karyawan[index].domisili,
          role: data_karyawan[index].role,
          id_store: data_karyawan[index].id_store,
          status_account: data_karyawan[index].status_account,
          created_at: data_karyawan[index].created_at,
          updated_at: data_karyawan[index].updated_at,
          store: data_karyawan[index].id_store,
          akses: data_karyawan[index].akses,
        });
      } else if (data_store[0].id_store === "HEAD-AREA") {
        datas.push({
          id: data_karyawan[index].id,
          username: data_karyawan[index].username,
          password: data_karyawan[index].password,
          name: data_karyawan[index].name,
          tlp: data_karyawan[index].tlp,
          domisili: data_karyawan[index].domisili,
          role: data_karyawan[index].role,
          id_store: data_karyawan[index].id_store,
          status_account: data_karyawan[index].status_account,
          created_at: data_karyawan[index].created_at,
          updated_at: data_karyawan[index].updated_at,
          store: data_karyawan[index].id_area,
          akses: data_karyawan[index].akses,
        });
      } else {
        var [data_store] = await connection.query(
          `SELECT * FROM tb_store WHERE id_store='${data_karyawan[index].id_store}'`
        );
        datas.push({
          id: data_karyawan[index].id,
          username: data_karyawan[index].username,
          password: data_karyawan[index].password,
          name: data_karyawan[index].name,
          tlp: data_karyawan[index].tlp,
          domisili: data_karyawan[index].domisili,
          role: data_karyawan[index].role,
          id_store: data_karyawan[index].id_store,
          status_account: data_karyawan[index].status_account,
          created_at: data_karyawan[index].created_at,
          updated_at: data_karyawan[index].updated_at,
          store: data_store,
          akses: data_karyawan[index].akses,
        });
      }

    }
    // console.log(datas.stor)
    await connection.commit();
    await connection.release();

    return datas;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const getStore = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [data_store] = await connection.query(
      `SELECT * FROM tb_store`
    );

    await connection.commit();
    await connection.release();

    return data_store;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const getRoles = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [data_roles] = await connection.query(
      `SELECT * FROM tb_roles`
    );

    await connection.commit();
    await connection.release();

    return data_roles;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const addKaryawan = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    function genRandonString(length) {
      var chars = body.name;
      var charLength = chars.length;
      var result = "";
      for (var i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charLength));
      }
      return result;
    }

    const dataName = genRandonString(8);
    const username = generateFromEmail(dataName.replace(/\s/g, ""), 4);

    if (body.role === "SUPER-ADMIN") {
      await connection.query(
        `INSERT INTO tb_karyawan
      (username, password, name, tlp, domisili, role, id_store, akses, status_account, created_at, updated_at)
      VALUES ('${username}','123456789','${body.name}','${body.tlp}','${body.domisili}','${body.role}','${body.store}','${body.store}','NONACTIVE','${tanggal}','${tanggal}')`
      );
    } else if (body.role === "HEAD-AREA") {
      var [data_area] = await connection.query(
        `SELECT * FROM tb_area WHERE id_area='${body.store}'`
      );
      await connection.query(
        `INSERT INTO tb_karyawan
      (username, password, name, tlp, domisili, role, id_store, akses, status_account, created_at, updated_at)
      VALUES ('${username}','123456789','${body.name}','${body.tlp}','${body.domisili}','${body.role}','${body.store}','${data_area[0].kota}','NONACTIVE','${tanggal}','${tanggal}')`
      );
    } else if (body.role === "HEAD-WAREHOUSE") {
      var [data_ware] = await connection.query(
        `SELECT * FROM tb_warehouse WHERE id_ware='${body.store}'`
      );
      await connection.query(
        `INSERT INTO tb_karyawan
      (username, password, name, tlp, domisili, role, id_store, akses, status_account, created_at, updated_at)
      VALUES ('${username}','123456789','${body.name}','${body.tlp}','${body.domisili}','${body.role}','${body.store}','${data_ware[0].warehouse}','NONACTIVE','${tanggal}','${tanggal}')`
      );
    } else if (body.role === "GUEST") {
      var [data_ware] = await connection.query(
        `SELECT * FROM tb_warehouse WHERE id_ware='${body.store}'`
      );
      await connection.query(
        `INSERT INTO tb_karyawan
      (username, password, name, tlp, domisili, role, id_store, akses, status_account, created_at, updated_at)
      VALUES ('${username}','123456789','${body.name}','${body.tlp}','${body.domisili}','${body.role}','${body.store}','${body.store}','NONACTIVE','${tanggal}','${tanggal}')`
      );
    }
    else {
      await connection.query(
        `INSERT INTO tb_karyawan
      (username, password, name, tlp, domisili, role, id_store, akses, status_account, created_at, updated_at)
      VALUES ('${username}','123456789','${body.name}','${body.tlp}','${body.domisili}','${body.role}','${body.store}','${body.store}','NONACTIVE','${tanggal}','${tanggal}')`
      );
    }

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const editKaryawan = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    if (body.data.edit_role === "SUPER-ADMIN") {
      await connection.query(
        `UPDATE tb_karyawan SET username='${body.data.edit_username}',password='${body.data.edit_password}',name='${body.data.edit_name}',tlp='${body.data.edit_tlp}',domisili='${body.data.edit_domisili}',role='${body.data.edit_role}',id_store='${body.data.edit_store}',akses='${body.data.edit_store}',updated_at='${tanggal}' WHERE id='${body.id}'`
      );
    } else if (body.data.edit_role === "HEAD-AREA") {
      var [data_area] = await connection.query(
        `SELECT * FROM tb_area WHERE id_area='${body.data.edit_store}'`
      );
      await connection.query(
        `UPDATE tb_karyawan SET username='${body.data.edit_username}',password='${body.data.edit_password}',name='${body.data.edit_name}',tlp='${body.data.edit_tlp}',domisili='${body.data.edit_domisili}',role='${body.data.edit_role}',id_store='${body.data.edit_store}',akses='${data_area[0].kota}',updated_at='${tanggal}' WHERE id='${body.id}'`
      );
    } else if (body.data.edit_role === "HEAD-WAREHOUSE") {
      var [data_ware] = await connection.query(
        `SELECT * FROM tb_warehouse WHERE id_ware='${body.data.edit_store}'`
      );
      await connection.query(
        `UPDATE tb_karyawan SET username='${body.data.edit_username}',password='${body.data.edit_password}',name='${body.data.edit_name}',tlp='${body.data.edit_tlp}',domisili='${body.data.edit_domisili}',role='${body.data.edit_role}',id_store='${body.data.edit_store}',akses='${data_ware[0].warehouse}',updated_at='${tanggal}' WHERE id='${body.id}'`
      );
    } else {
      await connection.query(
        `UPDATE tb_karyawan SET username='${body.data.edit_username}',password='${body.data.edit_password}',name='${body.data.edit_name}',tlp='${body.data.edit_tlp}',domisili='${body.data.edit_domisili}',role='${body.data.edit_role}',id_store='${body.data.edit_store}',akses='${body.data.edit_store}',updated_at='${tanggal}' WHERE id='${body.id}'`
      );
    }

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const updateAkun = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE tb_karyawan SET status_account='${body.status}' WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const deleteAkun = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM tb_karyawan WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

// reseller
const getReseller = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    // const datas = [];

    const [data_reseller] = await connection.query(
      `SELECT * FROM tb_reseller ORDER BY id DESC`
    );

    await connection.commit();
    await connection.release();

    return data_reseller;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const addReseller = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [cek_reseller] = await connection.query(
      `SELECT MAX(id_reseller) as id_reseller FROM tb_reseller`
    );
    if (cek_reseller[0].id_reseller === null) {
      var IDRES = "RES-0001";
    } else {
      const get_last2 = cek_reseller[0].id_reseller.split("-");
      const data_2 = parseInt(get_last2[1]) + 1;
      var IDRES = "RES-" + String(data_2).padStart(4, "0");
    }

    await connection.query(
      `INSERT INTO tb_reseller
      (id_reseller, nama, created_at, updated_at)
      VALUES ('${IDRES}','${body.nama}','${tanggal}','${tanggal}')`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const editReseller = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE tb_reseller SET nama='${body.data.edit_nama}',updated_at='${tanggal}' WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const deleteReseller = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM tb_reseller WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

// supplier
const getSupplier = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    // const datas = [];

    const [data_supplier] = await connection.query(
      `SELECT * FROM tb_supplier ORDER BY id DESC`
    );

    await connection.commit();
    await connection.release();

    return data_supplier;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const addSupplier = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [cek_supplier] = await connection.query(
      `SELECT MAX(id_sup) as id_sup FROM tb_supplier`
    );
    if (cek_supplier[0].id_sup === null) {
      var IDSUP = "SUP-0001";
    } else {
      const get_last2 = cek_supplier[0].id_sup.split("-");
      const data_2 = parseInt(get_last2[1]) + 1;
      var IDSUP = "SUP-" + String(data_2).padStart(4, "0");
    }

    await connection.query(
      `INSERT INTO tb_supplier
      (id_sup, supplier, contact, created_at, updated_at)
      VALUES ('${IDSUP}','${body.supplier}','${body.contact}','${tanggal}','${tanggal}')`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const editSupplier = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE tb_supplier SET supplier='${body.data.edit_supplier}',contact='${body.data.edit_contact}',updated_at='${tanggal}' WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const deleteSupplier = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM tb_supplier WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

// category
const getCategory = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [data_category] = await connection.query(
      `SELECT * FROM tb_category ORDER BY id DESC`
    );

    await connection.commit();
    await connection.release();

    return data_category;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const addCategory = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [cek_category] = await connection.query(
      `SELECT MAX(id_category) as id_category FROM tb_category`
    );
    if (cek_category[0].id_category === null) {
      var IDCAT = "CAT-0001";
    } else {
      const get_last2 = cek_category[0].id_category.split("-");
      const data_2 = parseInt(get_last2[1]) + 1;
      var IDCAT = "CAT-" + String(data_2).padStart(4, "0");
    }

    await connection.query(
      `INSERT INTO tb_category
      (id_category, category, created_at, updated_at)
      VALUES ('${IDCAT}','${body.category}','${tanggal}','${tanggal}')`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const editCategory = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE tb_category SET category='${body.data.edit_category}',updated_at='${tanggal}' WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const deleteCategory = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM tb_category WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

// brand
const getBrand = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [data_brand] = await connection.query(
      `SELECT * FROM tb_brand  ORDER BY id DESC`
    );

    await connection.commit();
    await connection.release();

    return data_brand;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const addBrand = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [cek_brand] = await connection.query(
      `SELECT MAX(id_brand) as id_brand FROM tb_brand`
    );
    if (cek_brand[0].id_brand === null) {
      var id_brand = "BRN-0001";
    } else {
      const get_last2 = cek_brand[0].id_brand.split("-");
      const data_2 = parseInt(get_last2[1]) + 1;
      var id_brand = "BRN-" + String(data_2).padStart(4, "0");
    }

    await connection.query(
      `INSERT INTO tb_brand
      (id_brand, brand, img, created_at, updated_at)
      VALUES ('${id_brand}','${body.brand}','NULL','${tanggal}','${tanggal}')`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const editBrand = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE tb_brand SET brand='${body.data.edit_brand}',updated_at='${tanggal}' WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const deleteBrand = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM tb_brand WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

// store
const getStores = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const datas = [];

    const [data_stores] = await connection.query(
      `SELECT * FROM tb_store`
    );

    for (let index = 0; index < data_stores.length; index++) {
      const [data_area] = await connection.query(
        `SELECT * FROM tb_area WHERE id_area='${data_stores[index].id_area}'`
      );

      datas.push({
        id: data_stores[index].id,
        id_store: data_stores[index].id_store,
        id_ware: data_stores[index].id_ware,
        id_area: data_stores[index].id_area,
        store: data_stores[index].store,
        channel: data_stores[index].channel,
        address: data_stores[index].address,
        created_at: data_stores[index].created_at,
        updated_at: data_stores[index].updated_at,
      });
    }

    await connection.commit();
    await connection.release();

    return datas;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const addStore = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [cek_store] = await connection.query(
      `SELECT MAX(id_store) as id_store FROM tb_store`
    );
    if (cek_store[0].id_store === null) {
      var id_store = "STR-0001";
    } else {
      const get_last2 = cek_store[0].id_store.split("-");
      const data_2 = parseInt(get_last2[1]) + 1;
      var id_store = "STR-" + String(data_2).padStart(4, "0");
    }

    await connection.query(
      `INSERT INTO tb_store
      (id_store, id_ware, id_area, store, channel, address, created_at, updated_at)
      VALUES ('${id_store}','${body.id_ware}','${body.id_area}','${body.store}','${body.channel}','${body.alamat}','${tanggal}','${tanggal}')`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const getstore_Area = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [data_area] = await connection.query(
      `SELECT * FROM tb_area ORDER BY id ASC`
    );

    await connection.commit();
    await connection.release();

    return data_area;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const editStore = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE tb_store SET id_ware='${body.data.edit_id_ware}',id_area='${body.data.edit_id_area}',store='${body.data.edit_store}',channel='${body.data.edit_channel}',address='${body.data.edit_alamat}',updated_at='${tanggal}' WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const deleteStore = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM tb_store WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const getstore_Warehouse = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [data_warehouse] = await connection.query(
      `SELECT * FROM tb_warehouse ORDER BY id ASC`
    );

    await connection.commit();
    await connection.release();

    return data_warehouse;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

// warehouse
const getWarehouse = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [data_warehouse] = await connection.query(
      `SELECT * FROM tb_warehouse WHERE id_ware != 'EXTERNAL' ORDER BY id DESC`
    );

    await connection.commit();
    await connection.release();

    return data_warehouse;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const getwarehouse_product = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [data_warehouse] = await connection.query(
      `SELECT * FROM tb_warehouse WHERE id_ware != 'EXTERNAL' ORDER BY id DESC`
    );

    await connection.commit();
    await connection.release();

    return data_warehouse;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const getwarehousedisplayproduct = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [data_warehouse] = await connection.query(
      `SELECT * FROM tb_warehouse WHERE id_ware != 'EXTERNAL'  ORDER BY id DESC`
    );

    await connection.commit();
    await connection.release();

    return data_warehouse;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const getWarehouseselected = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [data_role] = await connection.query(
      `SELECT * FROM tb_karyawan WHERE role='${body.role}'`
    );

    if (body.role === 'SUPER-ADMIN') {
      var [data_ware] = await connection.query(
        `SELECT * FROM tb_warehouse`
      );
    }
    else if (body.role === 'HEAD-AREA') {
      var [data_ware] = await connection.query(
        `SELECT * FROM tb_warehouse WHERE id_area='${body.store}'`
      );
    }
    else {
      var [list_data_role] = await connection.query(
        `SELECT * FROM tb_karyawan WHERE role='${body.role}' AND id_store='${body.store}'`
      );
      var [data_ware] = await connection.query(
        `SELECT * FROM tb_warehouse WHERE id_ware='${list_data_role[0].id_store}'`
      );
    }

    // console.log(list_data_role)
    // console.log(data_ware)

    await connection.commit();
    await connection.release();

    return data_ware;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const addWarehouse = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [cek_warehouse] = await connection.query(
      `SELECT MAX(id_ware) as id_ware FROM tb_warehouse`
    );
    if (cek_warehouse[0].id_ware === null) {
      var id_ware = "WARE-0001";
    } else {
      const get_last2 = cek_warehouse[0].id_ware.split("-");
      const data_2 = parseInt(get_last2[1]) + 1;
      var id_ware = "WARE-" + String(data_2).padStart(4, "0");
    }

    await connection.query(
      `INSERT INTO tb_warehouse
      (id_ware, id_area, warehouse, address, created_at, updated_at)
      VALUES ('${id_ware}','${body.id_area}','${body.warehouse}','${body.alamat}','${tanggal}','${tanggal}')`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const editWarehouse = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE tb_warehouse SET id_area='${body.data.edit_id_area}',warehouse='${body.data.edit_warehouse}',address='${body.data.edit_alamat}',updated_at='${tanggal}' WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const deleteWarehouse = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM tb_warehouse WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

// area
// const getArea = async (body) => {
//   const connection = await dbPool.getConnection();
//   try {
//     await connection.beginTransaction();

//     const [data_area] = await connection.query(
//       `SELECT * FROM tb_area ORDER BY id DESC`
//     );

//     await connection.commit();
//     await connection.release();

//     return data_area;
//   } catch (error) {
//     console.log(error);
//     await connection.release();
//   }
// };

const login = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();
    var username = body.data.username;
    var password = body.data.password;

    const [cek_divisi] = await connection.query(
      `SELECT tb_karyawan.*,tb_store.channel FROM tb_karyawan LEFT JOIN tb_store ON tb_karyawan.id_store = tb_store.id_store WHERE tb_karyawan.username='${username}' AND tb_karyawan.password='${password}'`
    );
    if (cek_divisi.length > 0) {
      if (cek_divisi[0].username === username && cek_divisi[0].password === password) {
        if (cek_divisi[0].status_account === 'NONACTIVE') {
          var hasil = 'NONACTIVE';
        } else {
          var hasil = cek_divisi;
        }
      } else {
        var hasil = 'Wrong';
      }
    } else {
      var hasil = 'Failed';
    }
    await connection.commit();
    await connection.release();

    return hasil;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const getDashboard = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  console.log(body);

  try {
    await connection.beginTransaction();

    const store = body.store;
    const roles = body.role;
    const tanggal = body.date;
    const myArray = tanggal.split(" to ");

    if (tanggal.length > 10) {
      var tanggal_start = myArray[0];
      var tanggal_end = myArray[1];
    } else {
      var tanggal_start = tanggal;
      var tanggal_end = tanggal;
    }

    var id_area = body.area;

    const [get_area] = await connection.query(
      `SELECT tb_area.id_area,tb_store.id_area FROM tb_area LEFT JOIN tb_store ON tb_area.id_area = tb_store.id_area WHERE tb_area.id_area='${id_area}' GROUP BY tb_store.id_area`
    );

    if (body.area === 'SUPER-ADMIN') {
      var getstores = "-";
    } else if (body.area === 'HEAD-AREA') {
      var getstores = "-";
    } else {
      var [caristore] = await connection.query(
        `SELECT id_store FROM tb_store WHERE id_store='${body.area}' GROUP BY id_store`
      );
      for (let xxx = 0; xxx < caristore.length; xxx++) {
        var getstores = caristore[xxx].id_store;
      }
    }

    if (body.store === "all_area") {
      var area_ware = body.area.split('-')[0];
      if (area_ware == "WARE") {
        var [data_get_ware] = await connection.query(
          `SELECT id_area FROM tb_warehouse WHERE id_ware='${body.area}' GROUP BY id_area`
        );
        var output_area_ware = data_get_ware[0].id_area
      } else if (area_ware == "AREA") {
        var output_area_ware = body.area
      }
    }

    if (store === "all") {

      if (body.area === "SUPER-ADMIN") {

        var [discount] = await connection.query(
          `SELECT SUM(diskon_item) as total_diskon FROM tb_order WHERE tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [top_10_reseller] = await connection.query(
          `SELECT tb_order.qty,SUM(qty) as total,tb_invoice.reseller FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE (tb_invoice.type_customer='Reseller' OR tb_invoice.type_customer='Grosir') AND tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_invoice.reseller ORDER BY total DESC LIMIT 10`
        );

        var [top_10_produk] = await connection.query(
          `SELECT *,SUM(qty) as qty FROM tb_order WHERE tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY id_produk ORDER BY qty DESC LIMIT 20`
        );

        var [top_brand] = await connection.query(`
            SELECT 
              tb_order.id_brand,
              tb_brand.brand,
              SUM(tb_order.qty) AS total_qty
            FROM 
              tb_order
            LEFT JOIN 
              tb_brand ON tb_order.id_brand = tb_brand.id_brand
            WHERE 
              tb_order.tanggal_order BETWEEN ? AND ?
            GROUP BY 
              tb_order.id_brand, tb_brand.brand
            ORDER BY 
              total_qty DESC
            LIMIT 20
          `, [tanggal_start, tanggal_end]);


        var [total_qty] = await connection.query(
          `SELECT *,SUM(qty) as qty FROM tb_order WHERE tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [gross_sale] = await connection.query(
          `SELECT *,SUM(total_amount) as total_amount FROM tb_invoice WHERE sales_channel='OFFLINE STORE' AND payment='PAID' AND status_pesanan != 'CANCEL' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [gross_sale_online] = await connection.query(
          `SELECT *,SUM(total_amount) as total_amount FROM tb_invoice WHERE sales_channel != 'OFFLINE STORE' AND payment='PAID' AND status_pesanan != 'CANCEL' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        if (roles === "SUPER-ADMIN" || roles === "HEAD-AREA") {
          var [expense] = await connection.query(
            `SELECT *,SUM(total_amount) as total_amount FROM tb_expense WHERE tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
          );
        } else {
          var [expense] = await connection.query(
            `SELECT *,SUM(total_amount) as total_amount FROM tb_expense WHERE id_store != 'ALL-STORE' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
          );
        }

        var [transactions] = await connection.query(
          `SELECT * FROM tb_invoice WHERE payment='PAID' AND status_pesanan != 'CANCEL' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [produkgudangsold] = await connection.query(
          `SELECT tb_order.*,SUM(qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Gudang' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [produkextsold] = await connection.query(
          `SELECT tb_order.*,SUM(qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Luar' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [costgudang] = await connection.query(
          `SELECT tb_order.*,SUM(m_price*qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Gudang' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [costluar] = await connection.query(
          `SELECT tb_order.*,SUM(m_price*qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Luar' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [cancel_sales] = await connection.query(
          `SELECT * FROM tb_invoice WHERE status_pesanan != 'CANCEL' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [paid] = await connection.query(
          `SELECT tb_order.*,SUM(subtotal) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.status_pesanan != 'CANCEL' AND tb_invoice.payment='PAID' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [pending] = await connection.query(
          `SELECT tb_order.*,SUM(subtotal) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.status_pesanan != 'CANCEL' AND tb_invoice.payment='PENDING' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [cash] = await connection.query(
          `SELECT bank,id_invoice,SUM(total_payment) as cash FROM tb_payment WHERE bank='CASH' AND tanggal_pembayaran BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [bca] = await connection.query(
          `SELECT bank,id_invoice,SUM(total_payment) as bca FROM tb_payment WHERE bank='DEBIT' AND tanggal_pembayaran BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [qris] = await connection.query(
          `SELECT bank,id_invoice,SUM(total_payment) as qris FROM tb_payment WHERE bank='QRIS' AND tanggal_pembayaran BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );


      } else {
        var [discount] = await connection.query(
          `SELECT *,SUM(diskon_item) as total_diskon FROM tb_order WHERE id_store='${body.area}' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [top_10_reseller] = await connection.query(
          `SELECT tb_order.qty,SUM(qty) as total,tb_invoice.reseller FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_order.id_store='${body.area}' AND (tb_invoice.type_customer='Reseller' OR tb_invoice.type_customer='Grosir') AND tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_invoice.reseller ORDER BY total DESC LIMIT 10`
        );

        var [top_10_produk] = await connection.query(
          `SELECT *,SUM(qty) as qty FROM tb_order WHERE id_store='${body.area}' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY id_produk ORDER BY qty DESC LIMIT 20`
        );

        var [top_brand] = await connection.query(`
          SELECT 
            tb_order.id_brand,
            tb_brand.brand,
            SUM(tb_order.qty) AS total_qty
          FROM 
            tb_order
          LEFT JOIN 
            tb_brand ON tb_order.id_brand = tb_brand.id_brand
          WHERE 
            tb_order.tanggal_order BETWEEN ? AND ?
            AND tb_order.id_store = ?
          GROUP BY 
            tb_order.id_brand, tb_brand.brand
          ORDER BY 
            total_qty DESC
          LIMIT 20
        `, [tanggal_start, tanggal_end, body.area]);


        var [total_qty] = await connection.query(
          `SELECT *,SUM(qty) as qty FROM tb_order WHERE id_store='${body.area}' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [gross_sale] = await connection.query(
          `SELECT *,SUM(total_amount) as total_amount FROM tb_invoice WHERE customer='${body.area}' AND sales_channel='OFFLINE STORE' AND payment='PAID' AND status_pesanan != 'CANCEL' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [gross_sale_online] = await connection.query(
          `SELECT *,SUM(total_amount) as total_amount FROM tb_invoice WHERE customer='${body.area}' AND sales_channel != 'OFFLINE STORE' AND payment='PAID' AND status_pesanan != 'CANCEL' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        if (roles === "SUPER-ADMIN" || roles === "HEAD-AREA") {
          var [expense] = await connection.query(
            `SELECT *,SUM(total_amount) as total_amount FROM tb_expense WHERE id_store='${body.area}' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
          );
        } else {
          var [expense] = await connection.query(
            `SELECT *,SUM(total_amount) as total_amount FROM tb_expense WHERE id_store='${body.area}' AND id_store != 'ALL-STORE' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
          );
        }

        var [transactions] = await connection.query(
          `SELECT * FROM tb_invoice WHERE customer='${body.area}' AND payment='PAID' AND status_pesanan != 'CANCEL' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [produkgudangsold] = await connection.query(
          `SELECT tb_order.*,SUM(qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.customer='${body.area}' AND tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Gudang' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [produkextsold] = await connection.query(
          `SELECT tb_order.*,SUM(qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.customer='${body.area}' AND tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Luar' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [costgudang] = await connection.query(
          `SELECT tb_order.*,SUM(m_price*qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.customer='${body.area}' AND tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Gudang' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [costluar] = await connection.query(
          `SELECT tb_order.*,SUM(m_price*qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.customer='${body.area}' AND tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Luar' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [cancel_sales] = await connection.query(
          `SELECT * FROM tb_invoice WHERE customer='${body.area}' AND status_pesanan != 'CANCEL' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [paid] = await connection.query(
          `SELECT tb_order.*,SUM(subtotal) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.customer='${body.area}' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_invoice.payment='PAID' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [pending] = await connection.query(
          `SELECT tb_order.*,SUM(subtotal) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.customer='${body.area}' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_invoice.payment='PENDING' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [cash] = await connection.query(
          `SELECT bank,id_invoice,SUM(total_payment) as cash FROM tb_payment WHERE id_store='${body.store}' AND bank='CASH' AND tanggal_pembayaran BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [bca] = await connection.query(
          `SELECT bank,id_invoice,SUM(total_payment) as bca FROM tb_payment WHERE id_store='${body.store}' AND bank='DEBIT' AND tanggal_pembayaran BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );

        var [qris] = await connection.query(
          `SELECT bank,id_invoice,SUM(total_payment) as qris FROM tb_payment WHERE id_store='${body.store}' AND bank='QRIS' AND tanggal_pembayaran BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );
      }


    } else if (store === "all_area") {

      var [discount] = await connection.query(
        `SELECT *,SUM(diskon_item) as total_diskon FROM tb_order LEFT JOIN tb_store ON tb_order.id_store = tb_store.id_store WHERE tb_store.id_area='${output_area_ware}' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [top_10_reseller] = await connection.query(
        `SELECT SUM(qty) as total,reseller FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan LEFT JOIN tb_store ON tb_order.id_store = tb_store.id_store WHERE tb_store.id_area='${output_area_ware}' AND sales_channel='OFFLINE STORE' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY reseller ORDER BY total DESC LIMIT 10`
      );

      var [top_10_produk] = await connection.query(
        `SELECT *,SUM(qty) as qty FROM tb_order LEFT JOIN tb_store ON tb_order.id_store = tb_store.id_store WHERE tb_store.id_area='${output_area_ware}' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY id_produk ORDER BY qty DESC LIMIT 20`
      );

      var [top_brand] = await connection.query(`
          SELECT 
            tb_order.id_brand,
            tb_brand.brand,
            SUM(tb_order.qty) AS total_qty
          FROM 
            tb_order
          LEFT JOIN 
            tb_brand ON tb_order.id_brand = tb_brand.id_brand
          LEFT JOIN 
            tb_store ON tb_order.id_store = tb_store.id_store
          WHERE 
            tb_order.tanggal_order BETWEEN ? AND ?
            AND tb_store.id_area = ?
          GROUP BY 
            tb_order.id_brand, tb_brand.brand
          ORDER BY 
            total_qty DESC
          LIMIT 20
        `, [tanggal_start, tanggal_end, output_area_ware]);

      var [total_qty] = await connection.query(
        `SELECT tb_order.*,SUM(qty) as qty,tb_store.id_area FROM tb_order LEFT JOIN tb_store ON tb_order.id_store = tb_store.id_store WHERE tb_store.id_area='${output_area_ware}' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [gross_sale] = await connection.query(
        `SELECT tb_invoice.*,SUM(total_amount) as total_amount,tb_store.id_area FROM tb_invoice LEFT JOIN tb_store ON tb_invoice.customer = tb_store.id_store WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_store.id_area='${output_area_ware}' AND tb_invoice.sales_channel='OFFLINE STORE' AND tb_invoice.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [gross_sale_online] = await connection.query(
        `SELECT tb_invoice.*,SUM(total_amount) as total_amount,tb_store.id_area FROM tb_invoice LEFT JOIN tb_store ON tb_invoice.customer = tb_store.id_store WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_store.id_area='${output_area_ware}' AND tb_invoice.sales_channel != 'OFFLINE STORE' AND tb_invoice.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      if (roles === "SUPER-ADMIN" || roles === "HEAD-AREA") {
        var [expense] = await connection.query(
          `SELECT tb_expense.*,SUM(total_amount) as total_amount,tb_store.id_area FROM tb_expense LEFT JOIN tb_store ON tb_expense.id_store = tb_store.id_store WHERE tb_store.id_area='${output_area_ware}' AND tb_expense.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );
      } else {
        var [expense] = await connection.query(
          `SELECT tb_expense.*,SUM(total_amount) as total_amount,tb_store.id_area FROM tb_expense LEFT JOIN tb_store ON tb_expense.id_store = tb_store.id_store WHERE tb_expense.id_store != 'ALL-STORE' AND tb_store.id_area='${output_area_ware}' AND tb_expense.tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );
      }


      var [transactions] = await connection.query(
        `SELECT tb_store.*,tb_invoice.* FROM tb_store LEFT JOIN tb_invoice ON tb_store.id_store = tb_invoice.customer WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_store.id_area='${output_area_ware}' AND tb_invoice.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [produkgudangsold] = await connection.query(
        `SELECT tb_order.*,SUM(qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan LEFT JOIN tb_store ON tb_invoice.customer = tb_store.id_store WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Gudang' AND tb_store.id_area='${output_area_ware}' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [produkextsold] = await connection.query(
        `SELECT tb_order.*,SUM(qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan LEFT JOIN tb_store ON tb_invoice.customer = tb_store.id_store WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Luar' AND tb_store.id_area='${output_area_ware}' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [costgudang] = await connection.query(
        `SELECT tb_order.*,SUM(m_price*qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan LEFT JOIN tb_store ON tb_invoice.customer = tb_store.id_store WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Gudang' AND tb_store.id_area='${output_area_ware}' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [costluar] = await connection.query(
        `SELECT tb_order.*,SUM(m_price*qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan LEFT JOIN tb_store ON tb_invoice.customer = tb_store.id_store WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Luar' AND tb_store.id_area='${output_area_ware}' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [cancel_sales] = await connection.query(
        `SELECT tb_invoice.*,tb_store.id_area FROM tb_invoice LEFT JOIN tb_store ON tb_invoice.customer = tb_store.id_store WHERE tb_invoice.status_pesanan='CANCEL' AND tb_store.id_area='${output_area_ware}' AND tb_invoice.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [paid] = await connection.query(
        `SELECT tb_order.*,SUM(subtotal) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan LEFT JOIN tb_store ON tb_invoice.customer = tb_store.id_store WHERE tb_invoice.status_pesanan != 'CANCEL' AND tb_invoice.payment='PAID' AND tb_store.id_area='${output_area_ware}' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [pending] = await connection.query(
        `SELECT tb_order.*,SUM(subtotal) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan LEFT JOIN tb_store ON tb_invoice.customer = tb_store.id_store WHERE tb_invoice.status_pesanan != 'CANCEL' AND tb_invoice.payment='PENDING' AND tb_store.id_area='${output_area_ware}' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [cash] = await connection.query(
        `SELECT bank,id_invoice,SUM(total_payment) as cash FROM tb_payment WHERE id_area='${output_area_ware}' AND bank='CASH' AND tanggal_pembayaran BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [bca] = await connection.query(
        `SELECT bank,id_invoice,SUM(total_payment) as bca FROM tb_payment WHERE id_area='${output_area_ware}' AND bank='DEBIT' AND tanggal_pembayaran BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [qris] = await connection.query(
        `SELECT bank,id_invoice,SUM(total_payment) as qris FROM tb_payment WHERE id_area='${output_area_ware}' AND bank='QRIS' AND tanggal_pembayaran BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );
    } else {

      var [discount] = await connection.query(
        `SELECT *,SUM(diskon_item) as total_diskon FROM tb_order WHERE id_store='${store}' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [top_10_reseller] = await connection.query(
        `SELECT tb_order.qty,SUM(qty) as total,tb_invoice.reseller FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_order.id_store='${store}' AND (tb_invoice.type_customer='Reseller' OR tb_invoice.type_customer='Grosir') AND tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY tb_invoice.reseller ORDER BY tb_order.qty DESC LIMIT 10`
      );

      var [top_10_produk] = await connection.query(
        `SELECT *,SUM(qty) as qty FROM tb_order WHERE id_store='${store}' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}' GROUP BY id_produk ORDER BY qty DESC LIMIT 20`
      );

      var [top_brand] = await connection.query(`
          SELECT 
            tb_order.id_brand,
            tb_brand.brand,
            SUM(tb_order.qty) AS total_qty
          FROM 
            tb_order
          LEFT JOIN 
            tb_brand ON tb_order.id_brand = tb_brand.id_brand
          LEFT JOIN 
            tb_store ON tb_order.id_store = tb_store.id_store
          WHERE 
            tb_order.tanggal_order BETWEEN ? AND ?
            AND tb_store.id_store = ?
          GROUP BY 
            tb_order.id_brand, tb_brand.brand
          ORDER BY 
            total_qty DESC
          LIMIT 20
        `, [tanggal_start, tanggal_end, store]);

      var [total_qty] = await connection.query(
        `SELECT *,SUM(qty) as qty FROM tb_order WHERE id_store='${store}' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [gross_sale] = await connection.query(
        `SELECT *,SUM(total_amount) as total_amount FROM tb_invoice WHERE sales_channel='OFFLINE STORE' AND payment='PAID' AND status_pesanan != 'CANCEL' AND customer='${store}' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [gross_sale_online] = await connection.query(
        `SELECT *,SUM(total_amount) as total_amount FROM tb_invoice WHERE sales_channel != 'OFFLINE STORE' AND  payment='PAID' AND status_pesanan != 'CANCEL' AND customer='${store}' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      if (roles === "SUPER-ADMIN" || roles === "HEAD-AREA") {
        var [expense] = await connection.query(
          `SELECT *,SUM(total_amount) as total_amount FROM tb_expense WHERE id_store='${store}' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );
      } else {
        var [expense] = await connection.query(
          `SELECT *,SUM(total_amount) as total_amount FROM tb_expense WHERE id_store='${store}' AND id_store != 'ALL-STORE' AND tanggal BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
        );
      }

      var [transactions] = await connection.query(
        `SELECT * FROM tb_invoice WHERE payment='PAID' AND status_pesanan != 'CANCEL' AND customer='${store}' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [produkgudangsold] = await connection.query(
        `SELECT tb_order.*,SUM(qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Gudang' AND tb_order.id_store='${store}' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [produkextsold] = await connection.query(
        `SELECT tb_order.*,SUM(qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Luar' AND tb_order.id_store='${store}' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [costgudang] = await connection.query(
        `SELECT tb_order.*,SUM(m_price*qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Gudang' AND tb_order.id_store='${store}' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [costluar] = await connection.query(
        `SELECT tb_order.*,SUM(m_price*qty) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.payment='PAID' AND tb_invoice.status_pesanan != 'CANCEL' AND tb_order.source='Barang Luar' AND tb_order.id_store='${store}' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [cancel_sales] = await connection.query(
        `SELECT * FROM tb_invoice WHERE status_pesanan != 'CANCEL' AND tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [paid] = await connection.query(
        `SELECT tb_order.*,SUM(subtotal) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.status_pesanan != 'CANCEL' AND tb_invoice.payment='PAID' AND tb_order.id_store='${store}' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [pending] = await connection.query(
        `SELECT tb_order.*,SUM(subtotal) as total,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_pesanan WHERE tb_invoice.status_pesanan != 'CANCEL' AND tb_invoice.payment='PENDING' AND tb_order.id_store='${store}' AND tb_order.tanggal_order BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [cash] = await connection.query(
        `SELECT bank,id_invoice,SUM(total_payment) as cash FROM tb_payment WHERE id_store='${body.store}' AND bank='CASH' AND tanggal_pembayaran BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [bca] = await connection.query(
        `SELECT bank,id_invoice,SUM(total_payment) as bca FROM tb_payment WHERE id_store='${body.store}' AND bank='DEBIT' AND tanggal_pembayaran BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );

      var [qris] = await connection.query(
        `SELECT bank,id_invoice,SUM(total_payment) as qris FROM tb_payment WHERE id_store='${body.store}' AND bank='QRIS' AND tanggal_pembayaran BETWEEN '${tanggal_start}' AND '${tanggal_end}'`
      );
    }

    var total_modal = parseInt(costgudang[0].total ? costgudang[0].total : 0) + parseInt(costluar[0].total ? costluar[0].total : 0);
    var marginawal = (parseInt(gross_sale[0].total_amount ? gross_sale[0].total_amount : 0) + parseInt(gross_sale_online[0].total_amount ? gross_sale_online[0].total_amount : 0)) - parseInt(total_modal ? total_modal : 0);
    var totalpembayaran = parseInt(cash[0].cash ? cash[0].cash : 0) + parseInt(bca[0].bca ? bca[0].bca : 0) + parseInt(qris[0].qris ? qris[0].qris : 0);
    var pendapatanbersih = (parseInt(gross_sale[0].total_amount ? gross_sale[0].total_amount : 0) + parseInt(gross_sale_online[0].total_amount ? gross_sale_online[0].total_amount : 0)) - parseInt(expense[0].total_amount ? expense[0].total_amount : 0) - parseInt(discount[0].total_diskon ? discount[0].total_diskon : 0);
    var total_profit = parseInt(pendapatanbersih ? pendapatanbersih : 0) - parseInt(total_modal ? total_modal : 0);
    var netsales = parseInt(pendapatanbersih);
    var profit_bersih = parseInt(total_profit ? total_profit : 0);

    await connection.commit();
    await connection.release();
    return {
      gross_sale: parseInt(gross_sale[0].total_amount ? gross_sale[0].total_amount : 0),
      gross_sale_online: gross_sale_online[0].total_amount ? gross_sale_online[0].total_amount : 0,
      expense: expense[0].total_amount ? expense[0].total_amount : 0,
      margin: (parseInt(gross_sale[0].total_amount) - parseInt(total_modal ? total_modal : 0)) - parseInt(expense[0].total_amount ? expense[0].total_amount : 0),
      transactions: transactions.length,
      produkgudangsold: produkgudangsold[0].total ? produkgudangsold[0].total : 0,
      produkextsold: produkextsold[0].total ? produkextsold[0].total : 0,
      total_gross_sales: (parseInt(gross_sale[0].total_amount ? gross_sale[0].total_amount : 0) + parseInt(gross_sale_online[0].total_amount ? gross_sale_online[0].total_amount : 0)),

      costgudang: costgudang[0].total ? costgudang[0].total : 0,
      costluar: costluar[0].total ? costluar[0].total : 0,
      pendapatanbersih: netsales,

      profit: profit_bersih,
      cancel_sales: cancel_sales.length,

      paid: paid[0].total ? paid[0].total : 0,
      pending: pending[0].total ? pending[0].total : 0,

      cash: cash[0].cash ? cash[0].cash : 0,
      bca: bca[0].bca ? bca[0].bca : 0,
      qris: qris[0].qris ? qris[0].qris : 0,
      totalpembayaran: totalpembayaran ? totalpembayaran : 0,
      hasil_qty: total_qty[0].qty ? total_qty[0].qty : 0,
      list_top_10_produk: top_10_produk,
      list_top_10_reseller: top_10_reseller,
      total_discount: discount[0].total_diskon ? discount[0].total_diskon : 0,
      today: tanggal_start,
      top_brand: top_brand ? top_brand : 0,
    };


  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const getstorekaryawan = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    const datas = [];
    await connection.beginTransaction();

    if (body.role === "ALL") {
      var [data_store] = await connection.query(
        `SELECT * FROM tb_store`
      );
      datas.push({
        id_store: "-",
        store: "-",
      });
    } else if (body.role === "SUPER-ADMIN") {
      var [data_store] = await connection.query(
        `SELECT * FROM tb_store`
      );
      datas.push({
        id_store: "SUPER-ADMIN",
        store: "SUPER-ADMIN",
      });
    } else if (body.role === "HEAD-AREA") {
      var [data_store] = await connection.query(
        `SELECT * FROM tb_warehouse GROUP BY id_area`
      );
      for (let x = 0; x < data_store.length; x++) {
        var [data_area] = await connection.query(
          `SELECT * FROM tb_area WHERE id_area='${data_store[x].id_area}' GROUP BY id_area,kota`
        );
        datas.push({
          id_store: data_area[0].id_area,
          store: data_area[0].kota,
        });
      }
    } else if (body.role === "HEAD-WAREHOUSE") {
      var [data_ware] = await connection.query(
        `SELECT * FROM tb_warehouse GROUP BY id_ware`
      );
      for (let x = 0; x < data_ware.length; x++) {
        datas.push({
          id_store: data_ware[x].id_ware,
          store: data_ware[x].warehouse,
        });
      }
    } else {
      var [data_store] = await connection.query(
        `SELECT * FROM tb_store`
      );
      for (let x = 0; x < data_store.length; x++) {
        datas.push({
          id_store: data_store[x].id_store,
          store: data_store[x].store,
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

const getstorekaryawanedit = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    const datas = [];
    await connection.beginTransaction();

    if (body.role === "SUPER-ADMIN") {
      var [data_store] = await connection.query(
        `SELECT * FROM tb_roles WHERE role="SUPER-ADMIN"`
      );
      datas.push({
        id_store: data_store[0].role,
        store: data_store[0].role,
      });
    } else if (body.role === "HEAD-AREA") {
      if (body.edit_store === "") {
        var [data_store] = await connection.query(
          `SELECT * FROM tb_warehouse GROUP BY id_area`
        );
        for (let x = 0; x < data_store.length; x++) {
          var [data_area] = await connection.query(
            `SELECT * FROM tb_area GROUP BY id_area,kota`
          );
          datas.push({
            id_store: data_area[x].id_area,
            store: data_area[x].kota,
          });
        }
      } else {
        var [data_store] = await connection.query(
          `SELECT * FROM tb_warehouse WHERE id_area='${body.edit_store}' GROUP BY id_area`
        );
        for (let x = 0; x < data_store.length; x++) {
          var [data_area] = await connection.query(
            `SELECT * FROM tb_area WHERE id_area='${data_store[x].id_area}' GROUP BY id_area,kota`
          );
          datas.push({
            id_store: data_area[x].id_area,
            store: data_area[x].kota,
          });
        }
      }
    } else if (body.role === "HEAD-WAREHOUSE") {
      if (body.edit_store === "") {
        var [data_ware] = await connection.query(
          `SELECT * FROM tb_warehouse GROUP BY id_ware`
        );
        for (let x = 0; x < data_ware.length; x++) {
          datas.push({
            id_store: data_ware[x].id_ware,
            store: data_ware[x].warehouse,
          });
        }
      } else {
        var [data_ware] = await connection.query(
          `SELECT * FROM tb_warehouse WHERE id_ware='${body.edit_store}' GROUP BY id_ware`
        );
        for (let x = 0; x < data_ware.length; x++) {
          datas.push({
            id_store: data_ware[x].id_ware,
            store: data_ware[x].warehouse,
          });
        }
      }
    } else {
      if (body.edit_store === "") {
        var [data_store] = await connection.query(
          `SELECT * FROM tb_store`
        );
        for (let x = 0; x < data_store.length; x++) {
          datas.push({
            id_store: data_store[x].id_store,
            store: data_store[x].store,
          });
        }
      } else {
        var [data_store] = await connection.query(
          `SELECT * FROM tb_store WHERE id_store='${body.edit_store}'`
        );
        for (let x = 0; x < data_store.length; x++) {
          datas.push({
            id_store: data_store[x].id_store,
            store: data_store[x].store,
          });
        }
      }
    }

    // console.log(data_store)

    await connection.commit();
    await connection.release();

    return datas;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const updatePassword = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE tb_karyawan SET password='${body.password}',updated_at='${tanggal}' WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const getarea = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [data_area] = await connection.query(
      `SELECT * FROM tb_area`
    );
    // console.log(data_area)
    await connection.commit();
    await connection.release();

    return data_area
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const editarea = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();
    var new_m_price = body.new_m_price.replace(/\D/g, "");
    var new_g_price = body.new_g_price.replace(/\D/g, "");
    var new_r_price = body.new_r_price.replace(/\D/g, "");
    var new_n_price = body.new_n_price.replace(/\D/g, "");
    await connection.query(
      `UPDATE tb_area SET m_price='${new_m_price}',g_price='${new_g_price}',r_price='${new_r_price}',n_price='${new_n_price}',updated_at='${tanggal}' WHERE id='${body.id}'`
    );

    await connection.commit();
    await connection.release();
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const getstoreexpense = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
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
        `SELECT * FROM tb_store WHERE id_store='${body.area}'`
      );
    }

    await connection.commit();
    await connection.release();
    return data_store;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const getprintsales = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    const datas = [];
    await connection.beginTransaction();

    const [data_print] = await connection.query(
      // `SELECT *,SUM(subtotal) as subtotal FROM tb_order WHERE id_pesanan='${body.id_invoice}'`
      `SELECT tb_order.*,tb_invoice.* FROM tb_order LEFT JOIN tb_invoice ON tb_order.id_pesanan = tb_invoice.id_invoice WHERE tb_order.id_pesanan='${body.id_invoice}'`
    );
    for (let index = 0; index < data_print.length; index++) {
      var [data_store] = await connection.query(
        `SELECT store,address FROM tb_store WHERE id_store='${data_print[index].id_store}'`
      );

      var [cash] = await connection.query(
        `SELECT bank,id_invoice,SUM(total_payment) as cash FROM tb_payment WHERE bank='CASH' AND id_invoice='${data_print[index].id_invoice}'`
      );

      var [bca] = await connection.query(
        `SELECT bank,id_invoice,SUM(total_payment) as bca FROM tb_payment WHERE bank='DEBIT' AND id_invoice='${data_print[index].id_invoice}'`
      );

      datas.push({
        store: data_store[0].store,
        address: data_store[0].address,
        tanggal: data_print[index].tanggal_order,
        payment: "PAID",
        qty: "1",
        grandtotal: data_print[index].total_amount,
        bca: bca[0].bca,
        cash: cash[0].cash,
        qris: "0",
        timestamp: data_print[index].created_at,
        users: data_print[index].users,
        reseller: data_print[index].reseller,
        date: data_print[index].tanggal_order,
      });
    }
    console.log(data_print)

    await connection.commit();
    await connection.release();

    return {
      datas,
      data_print
    };

  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const login_on_enter = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();
    var username = body.username;
    var password = body.password;

    const [cek_divisi] = await connection.query(
      `SELECT tb_karyawan.*,tb_store.channel FROM tb_karyawan LEFT JOIN tb_store ON tb_karyawan.id_store = tb_store.id_store WHERE tb_karyawan.username='${username}' AND tb_karyawan.password='${password}'`
    );
    if (cek_divisi.length > 0) {
      if (cek_divisi[0].username === username && cek_divisi[0].password === password) {
        if (cek_divisi[0].status_account === 'NONACTIVE') {
          var hasil = 'NONACTIVE';
        } else {
          var hasil = cek_divisi;
        }
      } else {
        var hasil = 'Wrong';
      }
    } else {
      var hasil = 'Failed';
    }
    await connection.commit();
    await connection.release();

    return hasil;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const getlistbelanja = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    const [hasil] = await connection.query(
      `SELECT 
        tb_list.tanggal_order,
        tb_list.id_pesanan,
        tb_list.batas_kirim,
        tb_list.cod,
        tb_list.jasa_kirim,
        tb_list_detail.produk,
        tb_list_detail.qty,
        tb_list_detail.acc,
        tb_list_detail.id_ware,
        tb_list_detail.id_store as store,
        tb_list_detail.size,
        tb_list_detail.status,
        tb_list_detail.m_price,
        tb_list_detail.resi
      FROM tb_list
      LEFT JOIN tb_list_detail ON tb_list.id_pesanan = tb_list_detail.id_pesanan
      ORDER BY tb_list_detail.tanggal_order ASC,tb_list_detail.id_ware DESC,tb_list_detail.id_pesanan DESC`
    );

    // Additional queries for total qty today and before today
    const todayOnly = date.format(new Date(), "YYYY-MM-DD");

    const [sumToday] = await connection.query(
      `SELECT SUM(tb_list_detail.qty) as total_today
       FROM tb_list
       LEFT JOIN tb_list_detail ON tb_list.id_pesanan = tb_list_detail.id_pesanan
       WHERE DATE(tb_list.tanggal_order) = ? AND tb_list_detail.size NOT LIKE '%DOUBLE BOX%'`, [todayOnly]
    );

    const [sumBeforeToday] = await connection.query(
      `SELECT SUM(tb_list_detail.qty) as total_before
       FROM tb_list
       LEFT JOIN tb_list_detail ON tb_list.id_pesanan = tb_list_detail.id_pesanan
       WHERE DATE(tb_list.tanggal_order) < ? AND tb_list_detail.size NOT LIKE '%DOUBLE BOX%'`, [todayOnly]
    );

    // New: Query for total qty regardless of date
    const [sumTotal] = await connection.query(
      `SELECT SUM(tb_list_detail.qty) as total_all
       FROM tb_list
       LEFT JOIN tb_list_detail ON tb_list.id_pesanan = tb_list_detail.id_pesanan
       WHERE tb_list_detail.size NOT LIKE '%DOUBLE BOX%'`
    );

    const [sumReady] = await connection.query(
      `SELECT SUM(tb_list_detail.qty) as total_all
       FROM tb_list
       LEFT JOIN tb_list_detail ON tb_list.id_pesanan = tb_list_detail.id_pesanan
       WHERE tb_list_detail.status = 'READY' AND tb_list_detail.size NOT LIKE '%DOUBLE BOX%'`
    );

    await connection.commit();
    await connection.release();

    return {
      hasil,
      today: sumToday[0].total_today || 0,
      yesterday: sumBeforeToday[0].total_before || 0,
      totalqty: sumTotal[0].total_all || 0,
      ready: sumReady[0].total_all || 0,
    };
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const inputlistbelanja = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    // console.dir(body, { depth: null, colors: true });

    for (const item of body) {
      // Check for existing id_pesanan in tb_list
      const [existing] = await connection.query(
        `SELECT id_pesanan FROM tb_list WHERE id_pesanan = ?`,
        [item.id_pesanan]
      );
      if (existing.length > 0) {
        console.log("Skipping existing id_pesanan:", item.id_pesanan);
        continue;
      }
      // Insert into tb_list
      await connection.query(
        `INSERT INTO tb_list 
          (tanggal_order, batas_kirim, cod, jasa_kirim, id_pesanan, id_store, amount, users, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.tanggal_order,
          item.batas_kirim,
          item.cod,
          item.jasa_kirim,
          item.id_pesanan,
          item.id_store,
          item.amount,
          item.users,
          tanggal,
          tanggal,
        ]
      );

      // Insert into tb_list_detail
      for (const detail of item.data) {
        // Ambil semua parameter dari tb_parameter
        const [params] = await connection.query("SELECT parameter FROM tb_parameter");
        let cleanedProduct = detail.produk;
        for (const p of params) {
          const regex = new RegExp(p.parameter, 'gi'); // case insensitive
          cleanedProduct = cleanedProduct.replace(regex, '').trim();
        }
        await connection.query(
          `INSERT INTO tb_list_detail 
            (tanggal_order, id_pesanan, id_store, id_produk, source, img, id_ware, produk, size, qty, m_price, selling_price, subtotal, users, acc, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.tanggal_order,
            item.id_pesanan,
            item.id_store,
            detail.id_produk,
            detail.source,
            detail.img,
            null,
            cleanedProduct,
            detail.size,
            detail.qty,
            detail.m_price,
            detail.selling_price,
            detail.selling_price, // subtotal = selling_price * 1
            item.users,
            detail.acc,
            tanggal,
            tanggal,
          ]
        );
      }
    }

    await connection.commit();
    await connection.release();

    const hasil = { success: true, message: "Data inserted successfully" };
    return hasil;
  } catch (error) {
    console.log(error);
    await connection.release();
  }
};

const updatesupplier = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE tb_list_detail SET id_ware = ? WHERE produk = ?`,
      [body.id_ware, body.produk]
    );

    await connection.commit();
    await connection.release();

    return { result: "success" };
  } catch (error) {
    console.log(error);
    await connection.rollback();
    await connection.release();
    return { result: "error", message: error.message };
  }
};

const updatestatus = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE tb_list_detail SET status = ? WHERE produk = ? AND id_pesanan = ?`,
      [body.status, body.produk, body.id_pesanan]
    );

    await connection.commit();
    await connection.release();

    return { result: "success" };
  } catch (error) {
    console.log(error);
    await connection.rollback();
    await connection.release();
    return { result: "error", message: error.message };
  }
};

const updatemprice_listbelanja = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE tb_list_detail SET m_price = ? WHERE produk = ? AND id_pesanan = ?`,
      [body.m_price, body.produk, body.id_pesanan]
    );

    await connection.commit();
    await connection.release();

    return { result: "success" };
  } catch (error) {
    console.log(error);
    await connection.rollback();
    await connection.release();
    return { result: "error", message: error.message };
  }
};

const updateacc_listbelanja = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE tb_list_detail SET acc = ? WHERE produk = ? AND id_pesanan = ?`,
      [body.acc, body.produk, body.id_pesanan]
    );

    await connection.commit();
    await connection.release();

    return { result: "success" };
  } catch (error) {
    console.log(error);
    await connection.rollback();
    await connection.release();
    return { result: "error", message: error.message };
  }
};

const updateresi = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE tb_list_detail SET resi = ? WHERE produk = ? AND id_pesanan = ?`,
      [body.resi, body.produk, body.id_pesanan]
    );

    await connection.commit();
    await connection.release();

    return { result: "success" };
  } catch (error) {
    console.log(error);
    await connection.rollback();
    await connection.release();
    return { result: "error", message: error.message };
  }
};

const deletemassal_listbelanja = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
  try {
    await connection.beginTransaction();

    // Delete multiple items
    for (const item of body) {
      await connection.query(
        `DELETE FROM tb_list_detail WHERE id_pesanan = ? AND produk = ?`,
        [item.id_pesanan, item.produk]
      );

      await connection.query(
        `DELETE FROM tb_list WHERE id_pesanan = ?`,
        [item.id_pesanan]
      );
    }

    await connection.commit();
    await connection.release();

    return { result: "success" };
  } catch (error) {
    console.log(error);
    await connection.rollback();
    await connection.release();
    return { result: "error", message: error.message };
  }
};

const addparameter = async (body) => {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert each parameter into tb_parameter
    for (const param of body.parameters) {
      await connection.query(
        "INSERT INTO tb_parameter (parameter) VALUES (?)",
        [param.parameter]
      );
    }

    await connection.commit();
    await connection.release();

    return { result: "success" };

  } catch (error) {
    console.log(error);
    await connection.rollback();
    await connection.release();
    return { result: "error", message: error.message };
  }
};

const getparameter = async (body) => {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    const [getparameter] = await connection.query(
      `SELECT * FROM tb_parameter ORDER BY id DESC`
    );

    await connection.commit();
    await connection.release();

    return getparameter;

  } catch (error) {
    console.log(error);
    await connection.rollback();
    await connection.release();
    return { result: "error", message: error.message };
  }
};

const editparameter = async (body) => {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    // Update each parameter in tb_parameter
    for (const param of body.parameters) {
      await connection.query(
        `UPDATE tb_parameter SET parameter = ? WHERE id = ?`,
        [param.parameter, param.id]
      );
    }

    const [getparameter] = await connection.query(
      `SELECT * FROM tb_parameter ORDER BY id DESC`
    );

    await connection.commit();
    await connection.release();

    return getparameter;
  } catch (error) {
    console.log(error);
    await connection.rollback();
    await connection.release();
    return { result: "error", message: error.message };
  }
};

const deleteparameter = async (body) => {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query("DELETE FROM tb_parameter WHERE id = ?", [body.id]);

    const [getparameter] = await connection.query("SELECT * FROM tb_parameter ORDER BY id DESC");
    await connection.commit();
    await connection.release();

    return getparameter;
  } catch (error) {
    console.log(error);
    await connection.rollback();
    await connection.release();
    return { result: "error", message: error.message };
  }
};

const insertmassal = async (body) => {
  const connection = await dbPool.getConnection();
  const tanggal = date.format(new Date(), "YYYY-MM-DD HH:mm:ss");
  const tanggal_skrg = date.format(new Date(), "YYYY-MM-DD");
  try {
    await connection.beginTransaction();

    console.log("body insert", body);

    // Prepare id_invoice initial value
    const [cek_invoice] = await connection.query(
      `SELECT MAX(id_invoice) as id_invoice FROM tb_invoice`
    );
    let last_invoice_number = 1;
    if (cek_invoice[0].id_invoice) {
      const data_2 = cek_invoice[0].id_invoice.toString().slice(-9);
      last_invoice_number = parseInt(data_2) + 1;
    }

    // Prepare id_nota initial value
    const [cek_nota] = await connection.query(
      `SELECT MAX(id_nota) as id_nota FROM tb_notabarang`
    );
    let last_nota_number = 1;
    if (cek_nota[0].id_nota) {
      const last = cek_nota[0].id_nota.toString().slice(-7);
      last_nota_number = parseInt(last) + 1;
    }

    // Start new logic: Insert for each item in body
    for (const item of body) {
      // Ambil data dari tb_list
      const [listRows] = await connection.query(
        `SELECT * FROM tb_list WHERE id_pesanan = ?`,
        [item.id_pesanan]
      );

      if (listRows.length === 0) {
        console.log("Data tb_list tidak ditemukan untuk id_pesanan:", item.id_pesanan);
        continue;
      }

      const listData = listRows[0];

      // Ambil detail dari tb_list_detail
      const [detailRows] = await connection.query(
        `SELECT * FROM tb_list_detail WHERE id_pesanan = ?`,
        [item.id_pesanan]
      );

      // Generate unique id_invoice for this iteration
      const id_invoice = "INV-" + String(last_invoice_number++).padStart(9, "0");

      // Insert ke tb_invoice
      await connection.query(
        `INSERT INTO tb_invoice (
            tanggal_order, batas_kirim, cod, jasa_kirim, tanggal_update, id_invoice, id_pesanan,
            customer, type_customer, sales_channel, amount, diskon_nota, biaya_lainnya,
            total_amount, selisih, status_pesanan, payment, reseller, users,created_at,updated_at
          ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, 'SHOPEE', 'SHOPEE', ?, 0, 0, ?, 0, 'DIKIRIM', 'PAID', '-', 'ADMIN',?,?)`,
        [
          tanggal_skrg,
          listData.batas_kirim,
          listData.cod,
          listData.jasa_kirim,
          id_invoice,
          listData.id_pesanan,
          listData.id_store,
          listData.amount,
          listData.amount,
          tanggal,
          tanggal
        ]
      );

      // Generate unique id_nota for this iteration
      const curr_id_nota = "EXT-" + String(last_nota_number++).padStart(7, "0");

      // Insert setiap item detail ke tb_order, tb_notabarang, tb_mutasistock
      for (const detail of detailRows) {
        // Get supplier info
        let get_supp = [];
        if (detail.id_ware) {
          [get_supp] = await connection.query(
            `SELECT * FROM tb_supplier WHERE id_sup=?`, [detail.id_ware]
          );
        }
        // Generate id_mutasi
        const id_mutasi = 'MT-' + String(Math.floor(Math.random() * 100000000)).padStart(8, "0");

        const [cek_warehouse] = await connection.query(
          `SELECT id_store FROM tb_store WHERE ip = ?`,
          [detail.id_store]
        );

        const [cek_supplier] = await connection.query(
          `SELECT id_sup FROM tb_supplier WHERE supplier = ?`,
          [detail.id_ware]
        );

        await connection.query(
          `INSERT INTO tb_order (
      tanggal_order, id_pesanan, id_store, id_brand, id_produk, source, img,
      id_ware, idpo, quality, produk, size, qty, m_price, selling_price,
      diskon_item, subtotal, users, acc, created_at, updated_at
    ) VALUES (?, ?, ?, '-', ?, ?, ?, ?, ?, '-', ?, ?, ?, ?, ?, 0, ?, 'ADMIN', ?, ?, ?)`,
          [
            tanggal_skrg,
            detail.id_pesanan,
            cek_warehouse[0].id_store,
            curr_id_nota,
            detail.source,
            detail.img,
            "EXTERNAL",
            curr_id_nota,
            detail.produk,
            detail.size,
            detail.qty,
            detail.m_price,
            detail.selling_price,
            detail.subtotal,
            detail.acc, // <== INI HARUS ADA jika ingin isi acc
            tanggal,
            tanggal
          ]
        );

        await connection.query(
          `INSERT INTO tb_notabarang
      (id_nota, id_ware, id_brand, id_category, id_sup, tanggal_upload, produk, size, qty, deskripsi, quality, status_pesanan, m_price, selling_price, payment, img, users, created_at, updated_at)
      VALUES (?, 'EXTERNAL', '-', '-', ?, ?, ?, ?, ?, ?, '-', 'SEDANG DIKIRIM', ?, ?, ?, 'box.png', ?, ?, ?)`,
          [
            curr_id_nota,
            cek_supplier[0].id_sup,
            tanggal_skrg,
            detail.produk,
            detail.size,
            detail.qty,
            `${detail.id_pesanan} - ${listData.id_store} -SALES`,
            detail.m_price,
            detail.m_price,
            'PAID',
            'ADMIN',
            tanggal,
            tanggal
          ]
        );

        await connection.query(
          `INSERT INTO tb_mutasistock
      (id_mutasi, tanggal, id_pesanan, id_ware, id_store, id_produk, produk, id_po, size, qty, source, id_sup, mutasi, users, created_at, updated_at)
      VALUES (?, ?, ?, 'EXTERNAL', ?, ?, ?, ?, ?, ?, 'Barang Luar', ?, 'SALES ONLINE', ?, ?, ?)`,
          [
            id_mutasi,
            tanggal_skrg,
            detail.id_pesanan,
            cek_warehouse[0].id_store,
            curr_id_nota,
            detail.produk,
            curr_id_nota,
            detail.size,
            detail.qty,
            get_supp[0]?.supplier || '-',
            'ADMIN',
            tanggal,
            tanggal
          ]
        );
      }
    }
    // Hapus data dari tb_list_detail dan tb_list berdasarkan id_pesanan dari body
    const idList = body.map(item => item.id_pesanan);
    if (idList.length > 0) {
      await connection.query(
        `DELETE FROM tb_list_detail WHERE id_pesanan IN (${idList.map(() => '?').join(',')})`,
        idList
      );
      await connection.query(
        `DELETE FROM tb_list WHERE id_pesanan IN (${idList.map(() => '?').join(',')})`,
        idList
      );
    }
    // End new logic

    await connection.commit();
    await connection.release();

    return {
      "result": "success",
      "message": "Data berhasil diproses",
    };
  } catch (error) {
    console.log(error);
    await connection.rollback();
    await connection.release();
    return { result: "error", message: error.message };
  }
};

module.exports = {
  getKaryawan,
  getStore,
  getRoles,
  addKaryawan,
  editKaryawan,
  updateAkun,
  deleteAkun,
  getReseller,
  addReseller,
  editReseller,
  deleteReseller,
  getSupplier,
  addSupplier,
  editSupplier,
  deleteSupplier,
  getCategory,
  addCategory,
  editCategory,
  deleteCategory,
  getBrand,
  addBrand,
  editBrand,
  deleteBrand,
  getStores,
  addStore,
  getstore_Area,
  editStore,
  deleteStore,
  getstore_Warehouse,
  getWarehouse,
  addWarehouse,
  editWarehouse,
  deleteWarehouse,
  // getArea,
  login,
  getDashboard,
  getstorekaryawan,
  updatePassword,
  getstorekaryawanedit,
  getWarehouseselected,
  getarea,
  editarea,
  getwarehouse_product,
  getstoreexpense,
  getwarehousedisplayproduct,
  getprintsales,
  login_on_enter,
  getlistbelanja,
  inputlistbelanja,
  updatesupplier,
  updatemprice_listbelanja,
  updateacc_listbelanja,
  updateresi,
  updatestatus,
  deletemassal_listbelanja,
  addparameter,
  getparameter,
  editparameter,
  deleteparameter,
  insertmassal,
};
