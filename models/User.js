const client = require("../db");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

async function adminRegister(req, res) {
  try {
    const { name, department, username, password } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = await client.query(`
      INSERT INTO admins (name, department, username, password)
      VALUES ('${name}', '${department}', '${username}', '${hashedPassword}')
      RETURNING *`);

    const admin = result.rows[0];
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      "your-secret-key"
    );

    res.status(201).json({
      success: true,
      token,
      admin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
}

async function adminLogin(req, res) {
  try {
    const { username, password } = req.body;

    const result = await client.query(
      `SELECT * FROM admins WHERE username = '${username}'`
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, msg: "Admin not found" });
    } else {
      const admin = result.rows[0];
      const match = await bcrypt.compare(password, admin.password);

      if (match) {
        const token = jwt.sign(
          { id: admin.id, username: admin.username },
          "your-secret-key"
        );

        res.status(200).json({ success: true, token, admin });
      } else {
        res.status(401).json({ success: false, msg: "Wrong password!" });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
}

async function viewProducts(req, res) {
  try {
    const { page = 1, limit = 10, search } = req.query;

    let query = "SELECT * FROM products";
    if (search) {
      query += ` WHERE name ILIKE '%${search}%'`;
    }

    query += ` ORDER BY id LIMIT ${limit} OFFSET ${(page - 1) * limit}`;

    const result = await client.query(query);

    res.status(200).json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
}

async function addProduct(req, res) {
  try {
    const { name, price, discount, image, active } = req.body;

    const result = await client.query(`
      INSERT INTO products (name, price, discount, image, active)
      VALUES ('${name}', ${price}, ${discount}, '${image}', ${active})
      RETURNING *`);

    const product = result.rows[0];

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
}

async function updateProduct(req, res) {
  try {
    const { name, price, discount, image, active } = req.body;
    const productId = req.params.id;

    const result = await client.query(`
      UPDATE products
      SET name = '${name}', price = ${price}, discount = ${discount}, image = '${image}', active = ${active}
      WHERE id = ${productId}
      RETURNING *`);

    const product = result.rows[0];

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
}

async function deleteProduct(req, res) {
  try {
    const productId = req.params.id;

    const result = await client.query(`
      DELETE FROM products
      WHERE id = ${productId}
      RETURNING *`);

    const product = result.rows[0];

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
}

async function viewOrders(req, res) {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = "SELECT * FROM orders";
    if (status) {
      query += ` WHERE status = '${status}'`;
    }

    query += ` ORDER BY id LIMIT ${limit} OFFSET ${(page - 1) * limit}`;

    const result = await client.query(query);

    res.status(200).json({
      success: true,
      orders: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
}

async function changeOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const result = await client.query(`
      UPDATE orders
      SET status = '${status}'
      WHERE id = ${orderId}
      RETURNING *`);

    const order = result.rows[0];

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
}

module.exports = {
  adminRegister,
  adminLogin,
  viewProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  viewOrders,
  changeOrderStatus,
};
