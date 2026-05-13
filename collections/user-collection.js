const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/jwtTokenVerify");
const router = express.Router();

const userRoute = (userCollection) => {
  router.get(
    "/api/tourism/get-user-list/:email",
    verifyJWT,
    async (req, res) => {
      try {
        const email = req.params.email;

        if (!email) {
          return res.status(400).send({
            status: 400,
            message: "Email parameter is required",
          });
        }

        const query = { email: email };
        const result = await userCollection.find(query).toArray();

        res.status(200).send({
          status: 200,
          list_data: result,
          message: "Successful",
        });
      } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).send({
          status: 500,
          error: " Data could not be fetched",
        });
      }
    },
  );

  //   post api
  router.post(
    "/api/tourism/insert-update-user-list",
    verifyJWT,
    async (req, res) => {
      const {
        _id,
        full_name,
        email,
        address,
        phone_no,
        passport_no,
        user_info,
        flag,
      } = req.body;

      const data = {
        full_name: typeof full_name === "string" ? full_name : null,
        email: typeof email === "string" ? email : null,
        address: typeof address === "string" ? address : null,
        user_info: typeof user_info === "string" ? user_info : null,
        phone_no: typeof phone_no === "number" ? phone_no : null,
        passport_no: typeof passport_no === "string" ? passport_no : null,
      };
      if (typeof flag === "number") {
        data.flag = flag;
      }
      if (!data.full_name || !data.email) {
        return res
          .status(404)
          .send({ error: "Invalid or missing required fields" });
      }
      try {
        if (_id) {
          const userId = new ObjectId(_id);
          data.modifiedAt = new Date();
          const result = await userCollection.updateOne(
            {
              _id: userId,
            },
            {
              $set: data,
            },
          );
          if (result.modifiedCount === 0) {
            return res
              .status(400)
              .send({ message: "No data modified", status: 400 });
          }
          res
            .status(201)
            .send({ message: "Update Successful", id: _id, status: 201 });
        } else {
          data.createdAt = new Date();
          data.flag = 0;
          const result = await userCollection.insertOne(data);
          res.status(201).send({
            status: 201,
            message: "Successful",
            id: result.insertedId,
            status: 201,
          });
        }
      } catch (error) {
        res.status(500).send({ error: "Failed to create or update" });
      }
    },
  );

  // flag update
  router.patch(
    "/api/tourism/update-user-list/:id/:email",
    verifyJWT,
    async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        // const { flag } = req.body;
        const updateDoc = {
          $set: { flag: 1, appliedAt: new Date() },
        };

        const result = await userCollection.updateOne(filter, updateDoc);
        res.status(200).send({
          status: 200,
          message: "Successful",
        });
      } catch (error) {
        res.status(500).send({ message: "An error occurred while applied." });
      }
    },
  );

  return router;
};

module.exports = userRoute;
