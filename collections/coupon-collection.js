const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/jwtTokenVerify");
const router = express.Router();

const couponRoute = (couponCollection) => {
  // get api
  router.get(
    "/api/tourism/admin/get-coupon-list",
    verifyJWT,
    async (req, res) => {
      const getCouponList = couponCollection.find();
      const result = await getCouponList.toArray();
      res.send({
        list_data: result,
        message: "Successful",
      });
    },
  );

  // filter with email
  router.get(
    "/api/tourism/get-coupon-list/:email",
    verifyJWT,
    async (req, res) => {
      try {
        const { email } = req.params;

        const getCouponList = couponCollection.find({ email: email }); // filter here
        const result = await getCouponList.toArray();

        res.send({
          list_data: result,
          message: "Successful",
        });
      } catch (error) {
        res.status(500).send({
          message: "Error fetching coupon list",
          error: error.message,
        });
      }
    },
  );

  // check coupon is valid or not
  router.get(
    "/api/tourism/get-match-coupon-list/:email/:coupon_code",
    verifyJWT,
    async (req, res) => {
      const email = req.params.email;
      const coupon_code = req.params.coupon_code;
      const query = { email: email, coupon_code: coupon_code };
      const result = await couponCollection.findOne(query);
      let is_valid = false;
      if (result?.coupon_code === coupon_code) {
        is_valid = true;
      }
      res.json({
        is_valid: is_valid,
        _id: result?._id,
        email: result?.email,
        coupon_code: result?.coupon_code,
        message: "Successful",
        per_dis_amt: result?.per_dis_amt,
        operator: result?.operator,
        appliedAt: result?.appliedAt,
      });
    },
  );

  //   post api
  router.post(
    "/api/tourism/admin/insert-update-coupon-list",
    verifyJWT,
    async (req, res) => {
      const {
        _id,
        coupon_code,
        email,
        flag = 0,
        per_dis_amt,
        operator,
        user_info,
      } = req.body;

      const data = {
        coupon_code: typeof coupon_code === "string" ? coupon_code : null,
        email: typeof email === "string" ? email : null,
        flag: typeof flag === "number" ? flag : null,
        per_dis_amt: typeof per_dis_amt === "string" ? per_dis_amt : null,
        operator: typeof operator === "string" ? operator : null,
        user_info: typeof user_info === "string" ? user_info : null,
      };
      if (
        !data.coupon_code ||
        !data.email ||
        !data.operator ||
        !data.per_dis_amt ||
        !data.user_info
      ) {
        return res
          .status(404)
          .send({ error: "Invalid or missing required fields" });
      }
      try {
        if (_id) {
          const cuponID = new ObjectId(_id);
          data.modifiedAt = new Date();
          const result = await couponCollection.updateOne(
            {
              _id: cuponID,
            },
            {
              $set: data,
            },
          );
          if (result.modifiedCount === 0) {
            return res.status(400).send({ message: "No data modified" });
          }
          res
            .status(201)
            .send({ message: "Update Successful", id: _id, status: 201 });
        } else {
          data.createdAt = new Date();
          const result = await couponCollection.insertOne(data);
          res.status(200).send({
            message: "Successful",
            id: result.insertedId,
            status: 200,
          });
        }
      } catch (error) {
        res.status(500).send({ error: "Failed to create or update" });
      }
    },
  );

  // flag update
  router.patch(
    "/api/tourism/update-coupon-list/:id/:email",
    verifyJWT,
    async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const { flag } = req.body;
        const updateDoc = {
          $set: { flag: 1, appliedAt: new Date() },
        };

        const result = await couponCollection.updateOne(filter, updateDoc);
        res.status(200).send({
          message: "Successful",
        });
      } catch (error) {
        res.status(500).send({ message: "An error occurred while applied." });
      }
    },
  );

  // delete api
  router.delete(
    "/api/tourism/delete-coupon-list/:id",
    verifyJWT,
    async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await couponCollection.deleteOne(filter);
      res.status(200).send({
        status: 200,
        message: "Successful",
        deletedCount: result?.deletedCount,
      });
    },
  );

  return router;
};

module.exports = couponRoute;
