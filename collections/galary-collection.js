const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/jwtTokenVerify");
const router = express.Router();

const galaryRoute = (galaryCollection) => {
  // get api
  router.get(
    "/api/tourism/get-galary-photo-list",

    async (req, res) => {
      const getCouponList = galaryCollection.find();
      const result = await getCouponList.toArray();
      res.send({
        list_data: result,
        message: "Successful",
      });
    },
  );

  //   post api
  router.post(
    "/api/tourism/admin/insert-update-galary-photo-list",
    verifyJWT,
    async (req, res) => {
      const { _id, title, poster_image, more_image, status, user_info } =
        req.body;

      const data = {
        title: typeof title === "string" ? title : null,
        poster_image: typeof poster_image === "string" ? poster_image : null,
        more_image:
          Array.isArray(more_image) &&
          more_image.every((img) => typeof img === "string")
            ? more_image
            : null,
        status: typeof status === "number" ? status : null,
        category: typeof category === "string" ? category : null,
        user_info: typeof user_info === "string" ? user_info : null,
      };
      if (
        !data.title ||
        !data.poster_image ||
        !data.more_image ||
        !data.category ||
        !data.user_info ||
        data.status === null
      ) {
        return res
          .status(400)
          .send({ error: "Invalid or missing required fields" });
      }
      try {
        if (_id) {
          const cuponID = new ObjectId(_id);
          data.modifiedAt = new Date();
          const result = await galaryCollection.updateOne(
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
          const result = await galaryCollection.insertOne(data);
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

  // patch
  router.patch(
    "/api/tourism/update-image-status/:id",
    verifyJWT,
    async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const { status, user_info } = req.body;
        const updateDoc = {
          $set: { status, user_info, modifiedAt: new Date() },
        };

        const result = await galaryCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Not found" });
        }

        res.status(200).send({
          status: 200,
          id: id,
          status_code: status,
          message: status === 1 ? "Active successful" : "Inactive successful",
        });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ message: "An error occurred while updating the status." });
      }
    },
  );

  // delete api
  router.delete(
    "/api/tourism/delete-galary-image-list/:id",
    verifyJWT,
    async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await galaryCollection.deleteOne(filter);
      res.status(200).send({
        status: 200,
        message: "Successful",
        deletedCount: result?.deletedCount,
      });
    },
  );

  return router;
};

module.exports = galaryRoute;
