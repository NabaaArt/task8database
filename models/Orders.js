const client = require("../db");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

async function userRegister(req, res) {
  try {
    const { name, username, password, phone } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = await client.query(`
        INSERT INTO users (name, username, password, phone)
        VALUES ('${name}', '${username}', '${hashedPassword}', '${phone}')
        RETURNING *`);

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, username: user.username },
      "your-secret-key"
    );

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
}

async function userLogin(req, res) {
  try {
    const { username, password } = req.body;

    const result = await client.query(
      `SELECT * FROM users WHERE username = '${username}'`
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, msg: "User not found" });
    } else {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        const token = jwt.sign(
          { id: user.id, username: user.username },
          "your-secret-key"
        );

        res.status(200).json({ success: true, token, user });
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
async function placeOrder(req, res) {
  try {
    const { items, userID, address } = req.body;

    const result = await client.query(`
        INSERT INTO orders (items, userID, address, status)
        VALUES ('${items}', ${userID}, '${address}', 'PENDING')
        RETURNING *`);

    const order = result.rows[0];

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
}

module.exports = {
  userRegister,
  userLogin,
  viewProducts,
  placeOrder,
};
