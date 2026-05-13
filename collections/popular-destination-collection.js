const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/jwtTokenVerify");
const router = express.Router();

const popularDestinationRoute = (popularDestinationCollection) => {
  // get api
  router.get("/api/tourism/get-popular-dest-list", async (req, res) => {
    try {
      const getProducts = popularDestinationCollection.find();
      const result = await getProducts.toArray();
      res.status(200).send({
        list_data: result,
        message: "Successful",
      });
    } catch (error) {
      res.status(500).send({ error: "Data can not fetch" });
    }
  });

  // post api
  router.post(
    "/api/admin/insert-update-popular-dest-list",
    verifyJWT,
    async (req, res) => {
      const {
        _id,
        pop_id,
        name,
        location,
        image,
        moreImage,
        price,
        rating,
        badge,
        shortDescription,
        longDescription,
        status,
        discount,
        bestTimeToVisit,
        nearbyAttractions,
        itinerary,
      } = req.body;

      const data = {
        pop_id: typeof pop_id === "number" ? pop_id : null,
        name: typeof name === "string" ? name : null,
        location: typeof location === "string" ? location : null,
        image: typeof image === "string" ? image : null,
        moreImage:
          Array.isArray(moreImage) &&
          moreImage.every((img) => typeof img === "string")
            ? moreImage
            : [],
        price: typeof price === "number" ? price : null,
        rating: typeof rating === "number" ? rating : null,
        badge: typeof badge === "string" ? badge : null,
        shortDescription:
          typeof shortDescription === "string" ? shortDescription : null,
        longDescription:
          typeof longDescription === "string" ? longDescription : null,
        status: typeof status === "number" ? status : null,
        discount:
          typeof discount === "number"
            ? discount
            : typeof discount === "string"
              ? discount
              : null,
        bestTimeToVisit:
          typeof bestTimeToVisit === "string" ? bestTimeToVisit : null,
        nearbyAttractions:
          Array.isArray(nearbyAttractions) &&
          nearbyAttractions.every((item) => typeof item === "string")
            ? nearbyAttractions
            : [],
        itinerary:
          Array.isArray(itinerary) &&
          itinerary.every(
            (item) =>
              typeof item === "object" &&
              item !== null &&
              typeof item.day === "number" &&
              typeof item.title === "string" &&
              Array.isArray(item.activities) &&
              item.activities.every((activity) => typeof activity === "string"),
          )
            ? itinerary
            : [],
      };

      if (
        data.pop_id === null ||
        !data.name ||
        !data.location ||
        !data.image ||
        data.price === null ||
        data.status === null
      ) {
        return res
          .status(400)
          .send({ error: "Invalid or missing required fields", status: 400 });
      }

      try {
        if (_id) {
          const updateDocId = new ObjectId(_id);
          data.modifiedAt = new Date();
          const result = await popularDestinationCollection.updateOne(
            {
              _id: updateDocId,
            },
            {
              $set: data,
            },
          );
          if (result.modifiedCount === 0) {
            return res
              .status(404)
              .send({ error: "No data modified", status: 404 });
          }
          res
            .status(201)
            .send({ message: "Update Successful", id: _id, status: 201 });
        } else {
          data.createdAt = new Date();
          const result = await popularDestinationCollection.insertOne(data);
          res.status(200).send({
            message: "Successful",
            id: result.insertedId,
            status: 200,
          });
        }
      } catch (error) {
        res
          .status(500)
          .send({ error: "Failed to create or update", status: 500 });
      }
    },
  );

  // delete api
  router.delete(
    "/api/admin/delete-popular-dest-list/:id",
    verifyJWT,
    async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await popularDestinationCollection.deleteOne(query);
      res.status(200).send({
        status: 200,
        message: "Product delete successful",
        deletedCount: result?.deletedCount,
      });
    },
  );

  // update popular-dest status

  router.patch(
    "/api/admin/update-popular-dest-status/:id",
    verifyJWT,
    async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const { status, user_info } = req.body;
        const updateDoc = {
          $set: { status, user_info, modifiedAt: new Date() },
        };

        const result = await popularDestinationCollection.updateOne(
          filter,
          updateDoc,
        );

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

  // get single products
  router.get("/api/tourism/get-popular-dest-list/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const query = {
        _id: new ObjectId(id),
      };

      const result = await popularDestinationCollection.findOne(query);

      if (!result) {
        return res.status(404).send({
          message: "Product not found",
        });
      }

      res.status(200).send({
        details_data: result,
        message: "Successful",
      });
    } catch (error) {
      res.status(500).send({
        error: "Failed to fetch",
      });
    }
  });

  return router;
};

module.exports = popularDestinationRoute;
