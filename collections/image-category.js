const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/jwtTokenVerify");
const router = express.Router();

const imageCategoryRoute = (imgageCategoryCollection) => {
  // get api

  router.get("/api/admin/get-image-category", async (req, res) => {
    try {
      const getImageCategory = imgageCategoryCollection.find();
      const result = await getImageCategory.toArray();
      res.status(200).send({
        list_data: result,
        message: "Successful",
      });
    } catch (error) {
      res.status(500).send({ error: "Image category data can not fetch" });
    }
  });

  // POST API
  router.post(
    "/api/admin/insert-update-image-category",
    verifyJWT,
    async (req, res) => {
      const { _id, cat_id, cat_img, cat_name } = req.body;

      const data = {
        cat_id: typeof cat_id === "number" ? cat_id : null,
        cat_img: typeof cat_img === "string" ? cat_img : null,
        cat_name: typeof cat_name === "string" ? cat_name : null,
      };

      if (
        data.cat_id === null ||
        data.cat_img === null ||
        data.cat_name === null
      ) {
        return res
          .status(400)
          .send({ error: "Invalid or missing required fields" });
      }
      try {
        if (_id) {
          const updateDocId = new ObjectId(_id);
          const result = await imgageCategoryCollection.updateOne(
            {
              _id: updateDocId,
            },
            {
              $set: data,
            },
          );
          if (result.matchedCount === 0) {
            return res.status(404).send({ error: "No data modified" });
          }
          res
            .status(201)
            .send({ message: "Update Successful", id: result.modifiedCount });
        } else {
          const result = await imgageCategoryCollection.insertOne(data);
          res
            .status(201)
            .send({ message: "Successful", id: result.insertedId });
        }
      } catch (error) {
        res
          .status(500)
          .send({ error: "Failed to create or update image category" });
      }
    },
  );

  return router;
};

module.exports = imageCategoryRoute;
