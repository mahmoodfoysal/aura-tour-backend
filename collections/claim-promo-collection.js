const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/jwtTokenVerify");
const router = express.Router();

const claimPromoRoute = (claimPromoCollection) => {
  //   post api
  router.post(
    "/api/penguin/insert-update-clain-promo-list",
    verifyJWT,
    async (req, res) => {
      const { _id, email } = req.body;

      const data = {
        email: typeof email === "string" ? email : null,
      };
      if (!data.email) {
        return res
          .status(404)
          .send({ error: "Invalid or missing required fields" });
      }
      try {
        if (_id) {
          const claimId = new ObjectId(_id);
          data.modifiedAt = new Date();
          const result = await claimPromoCollection.updateOne(
            {
              _id: claimId,
            },
            {
              $set: data,
            },
          );
          if (result.modifiedCount === 0) {
            return res.status(400).send({ message: "No data modified" });
          }
          res.status(201).send({ message: "Update Successful", id: _id });
        } else {
          data.createdAt = new Date();
          const result = await claimPromoCollection.insertOne(data);
          res.status(201).send({
            status: 201,
            message: "Successful",
            id: result.insertedId,
          });
        }
      } catch (error) {
        res.status(500).send({ error: "Failed to create or update" });
      }
    },
  );

  return router;
};

module.exports = claimPromoRoute;
