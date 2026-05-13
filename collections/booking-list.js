const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/jwtTokenVerify");
const router = express.Router();

const bookingRoute = (bookingCollection) => {
  // ================= GET =================
  router.get("/api/tourism/get-booking-list", verifyJWT, async (req, res) => {
    try {
      const result = await bookingCollection.find().toArray();
      res.status(200).send({
        status: 200,
        list_data: result,
        message: "Successful",
      });
    } catch (error) {
      res.status(500).send({ error: "Order data can not fetch" });
    }
  });

  // customer order history

  router.get(
    "/api/tourism/get-booking-list/:email",
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
        const result = await bookingCollection.find(query).toArray();

        res.status(200).send({
          status: 200,
          list_data: result,
          message: "Successful",
        });
      } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).send({
          status: 500,
          error: "Order data could not be fetched",
        });
      }
    },
  );

  // ================= INSERT / UPDATE =================
  router.post(
    "/api/tourism/insert-update-order-list",
    verifyJWT,
    async (req, res) => {
      try {
        const {
          _id,
          full_name,
          email,
          phone_no,
          emergency_no,
          full_address,
          country,
          passport_no,
          joining_date,
          payment_method,
          person,
          card_name,
          card_number,
          expire_date,
          cvc,
          mobile_bank_no,
          transaction_no,
          sub_total,
          tax_total,
          service_charge,
          grand_total,
          order_status,
          package_info,
        } = req.body;

        // ================= PACKAGE INFO VALIDATION =================
        if (typeof package_info !== "object" || package_info === null) {
          return res.status(400).send({
            error: "package_info must be an object",
          });
        }

        // ================= MAIN DATA =================

        const generateOrderId = () => {
          const prefix = "BK-";
          const randomNumber = Math.floor(
            1000000000 + Math.random() * 9000000000,
          );
          return `${prefix}${randomNumber}`;
        };

        const data = {
          full_name: typeof full_name === "string" ? full_name : null,
          email: typeof email === "string" ? email : null,
          phone_no: typeof phone_no === "string" ? phone_no : null,
          emergency_no: typeof emergency_no === "string" ? emergency_no : null,
          full_address: typeof full_address === "string" ? full_address : null,
          country: typeof country === "string" ? country : null,
          passport_no: typeof passport_no === "string" ? passport_no : null,
          joining_date: typeof joining_date === "string" ? joining_date : null,
          payment_method:
            typeof payment_method === "string" ? payment_method : null,
          person: typeof person === "number" ? person : null,

          card_name: typeof card_name === "string" ? card_name : null,
          card_number: typeof card_number === "number" ? card_number : null,
          expire_date: typeof expire_date === "string" ? expire_date : null,
          cvc: typeof cvc === "number" ? cvc : null,
          mobile_bank_no:
            typeof mobile_bank_no === "string" ? mobile_bank_no : null,
          transaction_no:
            typeof transaction_no === "string" ? transaction_no : null,

          sub_total: typeof sub_total === "number" ? sub_total : 0,
          tax_total: typeof tax_total === "number" ? tax_total : 0,
          service_charge:
            typeof service_charge === "number" ? service_charge : 0,
          grand_total: typeof grand_total === "number" ? grand_total : 0,

          order_status: typeof order_status === "string" ? order_status : null,
          package_info: typeof package_info === "object" ? package_info : {},
        };

        // ================= REQUIRED FIELD CHECK =================
        if (
          !data.full_name ||
          !data.email ||
          !data.phone_no ||
          !data.emergency_no ||
          !data.full_address ||
          !data.country ||
          !data.payment_method ||
          data.person === null ||
          data.sub_total === 0 ||
          data.tax_total === null ||
          data.service_charge === null ||
          data.grand_total === 0 ||
          !data.order_status ||
          !data.package_info ||
          Object.keys(data.package_info).length === 0
        ) {
          return res.status(400).send({
            error: "Invalid or missing required fields",
          });
        }

        // ================= UPDATE =================
        if (_id) {
          data.modifiedAt = new Date();
          const result = await bookingCollection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: data },
          );

          if (result.modifiedCount === 0) {
            return res.status(404).send({
              error: "No data modified",
            });
          }

          return res.status(200).send({
            status: 200,
            message: "Update Successful",
            id: _id,
          });
        }

        // ================= INSERT =================
        data.createdAt = new Date();
        if (!data.order_id) {
          data.order_id = generateOrderId();
        }
        const result = await bookingCollection.insertOne(data);

        res.status(201).send({
          status: 201,
          message: "Order Created Successfully",
          id: result.insertedId,
        });
      } catch (error) {
        res.status(500).send({
          error: "Failed to insert/update",
        });
      }
    },
  );

  // ================= DELETE =================
  router.delete(
    "/api/admin/delete-booking-list/:id",
    verifyJWT,
    async (req, res) => {
      try {
        const result = await bookingCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        res.status(200).send({
          status: 200,
          message: "Order delete successful",
          deletedCount: result.deletedCount,
        });
      } catch (error) {
        res.status(500).send({ error: "Delete failed" });
      }
    },
  );

  // ================= UPDATE STATUS =================
  router.patch(
    "/api/admin/update-booking-status/:id",
    verifyJWT,
    async (req, res) => {
      try {
        const { order_status, user_info } = req.body;

        const result = await bookingCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          {
            $set: {
              order_status: order_status,
              user_info: user_info,
              modifiedAt: new Date(),
            },
          },
        );

        res.status(200).send({
          status: 200,
          message: "Order status updated",
          id: result.insertedId,
        });
      } catch (error) {
        res.status(500).send({ error: "Status update failed" });
      }
    },
  );

  return router;
};

module.exports = bookingRoute;
