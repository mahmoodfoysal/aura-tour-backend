const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/jwtTokenVerify");
const router = express.Router();

const adminRoute = (adminCollection) => {
  // get admin check
  router.get("/admin/get-admin-list/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await adminCollection.findOne(query);
    let isAdmin = false;
    if (
      user?.role === "Admin" ||
      user?.role === "Super Admin" ||
      user?.role === "Manager"
    ) {
      isAdmin = true;
    }
    res.json({
      admin: isAdmin,
      role_id: user?.role_id,
      role: user?.role,
      email: user?.email,
      message: "Successful",
    });
  });

  // get admin list
  router.get(
    "/api/admin/get-admin-list/:email",
    verifyJWT,
    async (req, res) => {
      const getAdmin = adminCollection.find();
      const result = await getAdmin.toArray();
      res.status(200).send({
        status: 200,
        list_data: result,
        message: "Successful",
      });
    },
  );
  // get all admin
  router.get("/api/admin/get-admin-list/", verifyJWT, async (req, res) => {
    const getAdmin = adminCollection.find();
    const result = await getAdmin.toArray();
    res.status(200).send({
      status: 200,
      list_data: result,
      message: "Successful",
    });
  });

  // post api
  router.post("/api/admin/insert-update-admin", verifyJWT, async (req, res) => {
    const { _id, email, role, role_id, user_info } = req.body;

    const data = {
      email: typeof email === "string" ? email : null,
      role: typeof role === "string" ? role : null,
      role_id: typeof role_id === "number" ? role_id : null,
      user_info: typeof user_info === "string" ? user_info : null,
    };
    if (!email || !role || !role_id || !user_info) {
      return res
        .status(404)
        .send({ error: "Invalid or missing required fields", status: 404 });
    }
    try {
      if (_id) {
        const adminId = new ObjectId(_id);
        data.modifiedAt = new Date();
        const result = await adminCollection.updateOne(
          {
            _id: adminId,
          },
          {
            $set: data,
          },
        );
        if (result.modifiedCount === 0) {
          return res.status(400).send({ message: "No data modified" });
        }
        res
          .status(200)
          .send({ message: "Update Successful", id: _id, status: 200 });
      } else {
        data.createdAt = new Date();
        const result = await adminCollection.insertOne(data);
        res
          .status(201)
          .send({ message: "Successful", id: result.insertedId, status: 201 });
      }
    } catch (error) {
      res.status(500).send({ error: "Internal Server Error", status: 500 });
    }
  });

  // delete admin list
  router.delete(
    "/api/admin/delete-admin-list/:id",
    verifyJWT,
    async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await adminCollection.deleteOne(filter);
      res.status(200).send({
        message: "Successful",
        deletedCount: result?.deletedCount,
        status: 200,
      });
    },
  );

  return router;
};

module.exports = adminRoute;
